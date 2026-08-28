import { NextResponse } from "next/server";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";

import { workersGoogleAuth } from "@/lib/googleAuth";
import { googleFetch } from "@/lib/googleFetch";
export const dynamic = "force-dynamic";

const TTL_MS = 90 * 1000;

export async function GET() {
  const auth = workersGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"]);
  const sheets = sheetsApi({ version: "v4", auth, fetchImplementation: googleFetch });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: "オンライン!A:B",
  });
  const rows: string[][] = (res.data.values ?? []) as string[][];
  const now = Date.now();
  const count = rows.filter((r) => r[0] && now - parseInt(r[0], 10) < TTL_MS).length;
  return NextResponse.json({ online: count });
}
