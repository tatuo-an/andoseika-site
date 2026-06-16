import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const runtime = "nodejs";

async function getAccessToken(): Promise<string> {
  const jwtClient = new google.auth.JWT(
    process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/drive"],
  );
  const tokens = await jwtClient.authorize();
  if (!tokens.access_token) throw new Error("Failed to get access token");
  return tokens.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "10MB以下の画像を選択してください" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const token = await getAccessToken();

    const boundary = "ando_boundary_" + Date.now();
    const metadata = JSON.stringify({ name: `complaint_${Date.now()}`, mimeType: file.type });
    const bodyParts = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`),
      buffer,
      Buffer.from(`\r\n--${boundary}--`),
    ]);

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: bodyParts,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Drive upload failed (${uploadRes.status}): ${errText}`);
    }

    const { id: fileId } = (await uploadRes.json()) as { id: string };

    const permRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "reader", type: "anyone" }),
      }
    );
    if (!permRes.ok) {
      const permErr = await permRes.text();
      throw new Error(`Permission failed (${permRes.status}): ${permErr}`);
    }

    // シート記録（失敗しても URL は返す）
    try {
      const sheetsAuth = new google.auth.JWT(
        process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        undefined,
        process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        ["https://www.googleapis.com/auth/spreadsheets"],
      );
      const sheets = google.sheets({ version: "v4", auth: sheetsAuth });
      const uploadedAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: "アップロード画像!A:C",
        valueInputOption: "RAW",
        requestBody: { values: [[fileId, uploadedAt, session.user.email]] },
      });
    } catch (sheetErr) {
      console.error("sheet logging failed (non-fatal):", sheetErr);
    }

    return NextResponse.json({ ok: true, url: `https://drive.google.com/file/d/${fileId}/view` });
  } catch (e) {
    console.error("upload-image error:", e);
    return NextResponse.json({ error: "アップロードに失敗しました", detail: String(e) }, { status: 500 });
  }
}
