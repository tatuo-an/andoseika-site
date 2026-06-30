import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

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

const ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET = "レスキュー便";

// LINE ブロードキャスト送信
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: ID, range: `${SHEET}!A:H` });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === id);
  if (rowIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const row = rows[rowIndex];
  const title = row[1] ?? "";
  const description = row[2] ?? "";
  const stock = row[3] ?? "";
  const deadline = row[4] ?? "";
  const productId = row[5] ?? "";

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://andoseika.jp";
  const productUrl = productId ? `${baseUrl}/products/${productId}` : `${baseUrl}/products`;

  const deadlineLabel = deadline
    ? deadline.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1年$2月$3日")
    : "";

  const lines = [
    "🚨 畑から緊急のお知らせ",
    "",
    `📦 ${title}`,
    "",
    description,
    "",
    ...(stock ? [`残り約 ${stock} 点`] : []),
    ...(deadlineLabel ? [`${deadlineLabel} まで数量限定で販売中`] : []),
    "",
    `🛒 購入・詳細はこちら\n${productUrl}`,
  ];

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "LINE_CHANNEL_ACCESS_TOKEN not set" }, { status: 500 });

  const lineRes = await fetch("https://api.line.me/v2/bot/message/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages: [{ type: "text", text: lines.join("\n") }] }),
  });

  if (!lineRes.ok) {
    const err = await lineRes.text().catch(() => "");
    return NextResponse.json({ error: `LINE broadcast failed: ${err}` }, { status: 500 });
  }

  // 通知済みフラグを立てる
  await sheets.spreadsheets.values.update({
    spreadsheetId: ID,
    range: `${SHEET}!H${rowIndex + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [["1"]] },
  });

  return NextResponse.json({ ok: true });
}
