import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

const SHEET = "チャット履歴";

async function getSheets() {
  const a = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: a });
}

// 直近50件を取得
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ messages: [] });
  }
  const email = session.user.email;

  try {
    const sheets = await getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: `${SHEET}!A:D`,
    });
    const rows = res.data.values ?? [];
    const userRows = rows
      .filter((r) => r[0] === email)
      .slice(-50)
      .map((r) => ({ role: r[2] as "user" | "assistant", content: r[3] ?? "" }));
    return NextResponse.json({ messages: userRows });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}

// メッセージを1件保存
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const email = session.user.email;
  const { role, content } = await req.json();
  const timestamp = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  try {
    const sheets = await getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: `${SHEET}!A:D`,
      valueInputOption: "RAW",
      requestBody: { values: [[email, timestamp, role, content]] },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
