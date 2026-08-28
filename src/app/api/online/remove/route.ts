import { NextRequest, NextResponse } from "next/server";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";

import { workersGoogleAuth } from "@/lib/googleAuth";
import { googleFetch } from "@/lib/googleFetch";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json() as { sessionId?: string };
  if (!sessionId) return NextResponse.json({ ok: false });

  const auth = workersGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"]);
  const sheets = sheetsApi({ version: "v4", auth, fetchImplementation: googleFetch });
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: "オンライン!A:B" });
  const rows: string[][] = (res.data.values ?? []) as string[][];
  const filtered = rows.filter((r) => r[1] !== sessionId);

  if (filtered.length === rows.length) return NextResponse.json({ ok: true });

  if (filtered.length === 0) {
    await sheets.spreadsheets.values.clear({ spreadsheetId: id, range: "オンライン!A:B" });
  } else {
    await sheets.spreadsheets.values.update({
      spreadsheetId: id,
      range: "オンライン!A1",
      valueInputOption: "RAW",
      requestBody: { values: filtered },
    });
    if (rows.length > filtered.length) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: id,
        range: `オンライン!A${filtered.length + 1}:B${rows.length + 5}`,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
