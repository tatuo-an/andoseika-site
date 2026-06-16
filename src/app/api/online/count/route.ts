import { NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const TTL_MS = 3 * 60 * 1000;

export async function GET() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: "オンライン!A:B",
  });
  const rows: string[][] = (res.data.values ?? []) as string[][];
  const now = Date.now();
  const count = rows.filter((r) => r[0] && now - parseInt(r[0], 10) < TTL_MS).length;
  return NextResponse.json({ online: count });
}
