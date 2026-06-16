import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { google } from "googleapis";
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

    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `complaints/${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      token: process.env.COMPLAINT_READ_WRITE_TOKEN,
    });

    // シート記録（失敗しても URL は返す）
    try {
      const sheetsAuth = new google.auth.JWT({
        email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      const sheets = google.sheets({ version: "v4", auth: sheetsAuth });
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
