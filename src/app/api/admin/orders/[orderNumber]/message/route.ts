import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

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

export async function GET(_: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { orderNumber } = await params;
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: "注文メッセージ!A:E",
  }).catch(() => ({ data: { values: [] } }));

  const messages = ((res.data.values ?? []) as string[][])
    .filter((r) => r[0] === orderNumber)
    .map((r) => ({ orderNumber: r[0], senderType: r[1], senderName: r[2], message: r[3], sentAt: r[4] }));

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { orderNumber } = await params;
  const { message } = await req.json() as { message: string };
  if (!message?.trim()) return NextResponse.json({ error: "Empty" }, { status: 400 });

  const sheets = getSheets();
  const sentAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: "注文メッセージ!A:E",
    valueInputOption: "RAW",
    requestBody: { values: [[orderNumber, "admin", "安藤青果", message.trim(), sentAt]] },
  });

  return NextResponse.json({ ok: true, sentAt });
}
