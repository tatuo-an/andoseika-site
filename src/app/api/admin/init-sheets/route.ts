import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

const HEADERS: Record<string, string[]> = {
  "注文管理": ["注文番号","作成日時","顧客名","メール","電話","住所","商品名","金額","ステータス","セッションID","希望配達日","希望時間帯"],
  "商品在庫": ["商品ID","バリアント名","在庫数","価格","配送タイプ","非表示","削除済み","次回入荷日","バッジ","ファミリー","画像URL","ファミリー画像","原価","利益率","クール便対応","説明文","クリックポスト最大数","オプション","セール割引率(%)","セール開始日","セール終了日","配送モード","配送設定値","コンパクト最大数","カテゴリー"],
  "体験予約": ["予約ID","メール","名前","電話","体験名","日付","開始時刻","所要分","人数","ステータス","作成日時","料金"],
};

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

async function ensureHeader(sheets: ReturnType<typeof google.sheets>, id: string, sheetName: string, header: string[]) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${sheetName}!A1` });
  const firstCell = res.data.values?.[0]?.[0] ?? "";

  if (firstCell === header[0]) return "already ok";

  const all = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${sheetName}!A:${String.fromCharCode(64 + header.length)}` });
  const existing = all.data.values ?? [];

  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [header, ...existing] },
  });
  return "header added";
}

export async function POST() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sheets = await getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  const results: Record<string, string> = {};
  for (const [sheetName, header] of Object.entries(HEADERS)) {
    try {
      results[sheetName] = await ensureHeader(sheets, id, sheetName, header);
    } catch (e) {
      results[sheetName] = `error: ${e}`;
    }
  }

  return NextResponse.json({ ok: true, results });
}
