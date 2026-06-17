import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const SHEET = "ユーザー設定";
// 列: A=メール, B=表示名

function getSheets() {
  const a = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: a });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${SHEET}!A:B` });
  const rows = res.data.values ?? [];
  const row = rows.find((r) => r[0] === session.user!.email);
  return NextResponse.json({ displayName: row?.[1] ?? "" });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { displayName } = await req.json() as { displayName: string };
  const name = (displayName ?? "").trim().slice(0, 50);

  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${SHEET}!A:B` });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === session.user!.email);

  if (rowIndex === -1) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: `${SHEET}!A:B`,
      valueInputOption: "RAW",
      requestBody: { values: [[session.user.email, name]] },
    });
  } else {
    await sheets.spreadsheets.values.update({
      spreadsheetId: id,
      range: `${SHEET}!B${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [[name]] },
    });
  }

  return NextResponse.json({ ok: true, displayName: name });
}
