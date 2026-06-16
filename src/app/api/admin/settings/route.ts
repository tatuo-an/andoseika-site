import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

const SHEET = "設定";

async function getSheets() {
  const a = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: a });
}

async function readSettings(): Promise<Record<string, string>> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: `${SHEET}!A:B`,
  });
  const rows = res.data.values ?? [];
  return Object.fromEntries(rows.map((r) => [r[0], r[1] ?? ""]));
}

async function writeSetting(key: string, value: string) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: `${SHEET}!A:A`,
  });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === key);

  if (rowIndex >= 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: `${SHEET}!B${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [[value]] },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: `${SHEET}!A:B`,
      valueInputOption: "RAW",
      requestBody: { values: [[key, value]] },
    });
  }
}

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { key, value } = await req.json();
  await writeSetting(key, value);
  return NextResponse.json({ ok: true });
}
