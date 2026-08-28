import { NextRequest, NextResponse } from "next/server";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";

import { workersGoogleAuth } from "@/lib/googleAuth";
import { googleFetch } from "@/lib/googleFetch";
export const dynamic = "force-dynamic";

const SHEET = "オンライン";
const TTL_MS = 90 * 1000; // 90秒

async function getSheets() {
  const auth = workersGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"]);
  return sheetsApi({ version: "v4", auth, fetchImplementation: googleFetch });
}

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json() as { sessionId?: string };
  if (!sessionId) return NextResponse.json({ error: "missing sessionId" }, { status: 400 });

  const now = Date.now();
  const sheets = await getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${SHEET}!A:B` });
  const rows: string[][] = (res.data.values ?? []) as string[][];

  // 古いエントリを除去し、今のセッションをupsert
  const active = rows.filter((r) => {
    if (!r[0] || !r[1]) return false;
    return now - parseInt(r[0], 10) < TTL_MS;
  });

  const idx = active.findIndex((r) => r[1] === sessionId);
  if (idx >= 0) {
    active[idx][0] = String(now);
  } else {
    active.push([String(now), sessionId]);
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `${SHEET}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: active },
  });

  // 古い行が残っていたらクリア
  const oldLen = rows.length;
  const newLen = active.length;
  if (oldLen > newLen) {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: id,
      range: `${SHEET}!A${newLen + 1}:B${oldLen + 10}`,
    });
  }

  return NextResponse.json({ online: active.length });
}
