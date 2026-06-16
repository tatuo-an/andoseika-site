import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { google } from "googleapis";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const a = new google.auth.JWT({
    email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth: a });
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: "アップロード画像!A:C",
  }).catch(() => ({ data: { values: [] } }));

  const rows = (res.data.values ?? []) as string[][];
  if (rows.length === 0) return NextResponse.json({ deleted: 0 });

  const now = Date.now();
  const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;
  const toDelete: number[] = [];

  for (let i = 0; i < rows.length; i++) {
    const [blobUrl, uploadedAt] = rows[i];
    if (!blobUrl || !uploadedAt) continue;
    const uploadedMs = new Date(uploadedAt).getTime();
    if (isNaN(uploadedMs)) continue;
    if (now - uploadedMs > ONE_MONTH) {
      await del(blobUrl).catch(() => null);
      toDelete.push(i);
    }
  }

  if (toDelete.length === 0) return NextResponse.json({ deleted: 0 });

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: id });
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === "アップロード画像");
  const sheetId = sheet?.properties?.sheetId;

  if (sheetId !== undefined) {
    const requests = toDelete.reverse().map((rowIdx) => ({
      deleteDimension: {
        range: { sheetId, dimension: "ROWS", startIndex: rowIdx, endIndex: rowIdx + 1 },
      },
    }));
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: id,
      requestBody: { requests },
    });
  }

  return NextResponse.json({ deleted: toDelete.length });
}
