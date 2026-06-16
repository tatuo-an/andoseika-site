import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

function getSheets() {
  const a = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: a });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderNumber } = await params;
  const { message } = await req.json() as { message: string };
  if (!message?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  // 注文の所有者確認
  const orderRes = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: "注文管理!A:D" });
  const row = (orderRes.data.values ?? []).find((r) => r[0] === orderNumber);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row[3] !== session.user.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sentAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  await sheets.spreadsheets.values.append({
    spreadsheetId: id,
    range: "注文メッセージ!A:E",
    valueInputOption: "RAW",
    requestBody: { values: [[orderNumber, "user", session.user.name ?? "お客様", message.trim(), sentAt]] },
  });

  return NextResponse.json({ ok: true, sentAt });
}
