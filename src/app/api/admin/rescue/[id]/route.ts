import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

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

const ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET = "レスキュー便";

// 有効/無効の切り替え
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { active } = await req.json() as { active: boolean };

  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: ID, range: `${SHEET}!A:A` });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === id);
  if (rowIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await sheets.spreadsheets.values.update({
    spreadsheetId: ID,
    range: `${SHEET}!G${rowIndex + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [[active ? "1" : "0"]] },
  });

  return NextResponse.json({ ok: true });
}
