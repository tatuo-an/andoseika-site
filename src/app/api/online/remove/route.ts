import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json() as { sessionId?: string };
  if (!sessionId) return NextResponse.json({ ok: false });

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
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
