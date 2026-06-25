import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const SHEET = "お知らせ";
// A=テキスト, B=リンク（任意）, C=公開（"1" or ""）

function getSheets() {
  const authClient = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: authClient });
}

type Announcement = { text: string; link: string; active: boolean };

// 公開取得（公開フラグONのみ・テキストと任意リンクのみ返す）
export async function GET() {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: `${SHEET}!A:C`,
    });
    const rows = res.data.values ?? [];
    // 1行目はヘッダー想定（無くてもOK）。テキスト列が空の行はスキップ
    const items = rows
      .slice(1)
      .filter((r) => (r[0] ?? "").trim() && r[2] === "1")
      .map((r) => ({ text: String(r[0]).trim(), link: String(r[1] ?? "").trim() }));
    return NextResponse.json({ items });
  } catch {
    // シートが無い等
    return NextResponse.json({ items: [] });
  }
}

// 管理者向け：全件取得（下書き含む）
export async function PUT() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: `${SHEET}!A:C`,
    });
    const rows = res.data.values ?? [];
    const items: Announcement[] = rows.slice(1).map((r) => ({
      text: String(r[0] ?? ""),
      link: String(r[1] ?? ""),
      active: r[2] === "1",
    }));
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[announcements PUT]", err);
    return NextResponse.json({ items: [] });
  }
}

// 管理者向け：一括保存
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: { items?: Announcement[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const items = Array.isArray(body.items) ? body.items : [];

  try {
    const sheets = getSheets();
    const id = process.env.GOOGLE_SPREADSHEET_ID!;

    // ヘッダー行を確実に書く＋データクリア
    await sheets.spreadsheets.values.clear({
      spreadsheetId: id,
      range: `${SHEET}!A1:C1000`,
    });
    const values: (string | number)[][] = [["テキスト", "リンク", "公開"]];
    for (const it of items) {
      const text = String(it.text ?? "").trim();
      if (!text) continue;
      values.push([text, String(it.link ?? "").trim(), it.active ? "1" : ""]);
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId: id,
      range: `${SHEET}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[announcements POST]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
