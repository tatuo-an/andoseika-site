import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";
import { workersGoogleAuth } from "@/lib/googleAuth";
import { googleFetch } from "@/lib/googleFetch";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "5MB以下の画像を送信してください" }, { status: 400 });
    }

    // 任意ファイル種別のアップロード・ホスティングを防ぐため、画像形式のみ許可する
    const ALLOWED_TYPES: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json({ error: "画像ファイル（jpg/png/webp/gif）のみアップロードできます" }, { status: 400 });
    }
    const key = `complaints/${Date.now()}.${ext}`;

    // R2 へ保存（旧 Vercel Blob の put 相当）
    const { env } = getCloudflareContext();
    await env.UPLOADS.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    // 公開URLは R2 のパブリックバケット経由。R2_PUBLIC_URL_BASE は末尾スラッシュ無しで設定する。
    const base = (process.env.R2_PUBLIC_URL_BASE ?? "").replace(/\/$/, "");
    if (!base) {
      return NextResponse.json({ error: "R2_PUBLIC_URL_BASE が未設定です" }, { status: 500 });
    }
    const blob = { url: `${base}/${key}` };

    // シート記録（失敗しても URL は返す）
    try {
      const sheetsAuth = workersGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"]);
      const sheets = sheetsApi({ version: "v4", auth: sheetsAuth, fetchImplementation: googleFetch });
      const uploadedAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: "アップロード画像!A:C",
        valueInputOption: "RAW",
        requestBody: { values: [[blob.url, uploadedAt, session.user.email]] },
      });
    } catch (sheetErr) {
      console.error("sheet logging failed (non-fatal):", sheetErr);
    }

    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    console.error("upload-image error:", e);
    return NextResponse.json({ error: "アップロードに失敗しました", detail: String(e) }, { status: 500 });
  }
}
