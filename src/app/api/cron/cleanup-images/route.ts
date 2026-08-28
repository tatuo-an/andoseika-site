import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";

import { workersGoogleAuth } from "@/lib/googleAuth";
import { googleFetch } from "@/lib/googleFetch";
export const runtime = "nodejs";

/**
 * 画像1件を削除する。
 * 移行期間中はシートに旧 Vercel Blob の URL と新 R2 の URL が混在するため、
 * URL の形を見て振り分ける。R2 に完全移行したら Vercel 側の分岐は削除してよい。
 */
async function deleteImage(url: string): Promise<void> {
  const base = (process.env.R2_PUBLIC_URL_BASE ?? "").replace(/\/$/, "");

  if (base && url.startsWith(base + "/")) {
    const key = url.slice(base.length + 1);
    const { env } = getCloudflareContext();
    await env.UPLOADS.delete(key).catch(() => null);
    return;
  }

  // 旧 Vercel Blob の URL
  await del(url, { token: process.env.COMPLAINT_READ_WRITE_TOKEN }).catch(() => null);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const a = workersGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"]);

  const sheets = sheetsApi({ version: "v4", auth: a, fetchImplementation: googleFetch });
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
      await deleteImage(blobUrl);
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
