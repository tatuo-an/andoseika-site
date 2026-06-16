import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { Readable } from "stream";

export const runtime = "nodejs";

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
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    const a = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
    const drive = google.drive({ version: "v3", auth: a });

    const uploaded = await drive.files.create({
      requestBody: {
        name: `complaint_${Date.now()}`,
        mimeType: file.type,
      },
      media: {
        mimeType: file.type,
        body: readable,
      },
      fields: "id",
    });

    const fileId = uploaded.data.id;
    if (!fileId) throw new Error("No file ID returned");

    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });

    const url = `https://drive.google.com/file/d/${fileId}/view`;
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error("upload-image error:", e);
    return NextResponse.json({ error: "アップロードに失敗しました", detail: String(e) }, { status: 500 });
  }
}
