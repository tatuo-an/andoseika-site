import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// 注文管理: A=注文番号, B=作成日時, C=顧客名, D=メール, E=電話, F=住所, G=商品名,
//           H=金額, I=ステータス, J=セッションID, K=希望配達日, L=希望時間帯,
//           M=問題内容, N=受取完了日時, O=お届け予定日, P=売上転記履歴（新規）
const ORDER_SHEET = "注文管理";
const SALES_TRANSFER_COL = 16; // P列（1始まり）

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

/** 商品名からキーワードで振り分け先シートを決定 */
function classifySheet(productName: string): string {
  if (productName.includes("洗い")) return "（予約）洗い";
  if (productName.includes("根付き")) return "（予約）根付";
  if (productName.includes("メロン")) return "（予約）メロン";
  return "売上データ";
}

/** 商品名から「送料」「サービス料」と（セール価格）等のアノテーションを除く */
function cleanProductName(raw: string): string {
  if (!raw) return "";
  // カンマで区切られた最初のセグメント＝商品本体
  const first = raw.split(",")[0].trim();
  // 末尾の ×数量 と （アノテーション）を除去
  return first
    .replace(/×\s*\d+\s*$/, "")
    .replace(/（セール価格）|（訳あり）|（特価）/g, "")
    .trim();
}

/** 商品名末尾の ×数量 を抽出 */
function extractQty(raw: string): number {
  if (!raw) return 1;
  const first = raw.split(",")[0];
  const m = first.match(/×\s*(\d+)\s*$/);
  return m ? parseInt(m[1], 10) || 1 : 1;
}

/** 住所文字列を分割（郵便番号 / 都道府県 / 残り） */
function splitAddress(addr: string): { zip: string; pref: string; rest: string } {
  if (!addr) return { zip: "", pref: "", rest: "" };
  let s = addr.trim();
  let zip = "";
  let pref = "";

  // 郵便番号（先頭の数字列）
  const zipMatch = s.match(/^〒?\s*(\d{3,4}-?\d{4}|\d{7,8})\s*/);
  if (zipMatch) {
    zip = zipMatch[1].replace("-", "");
    if (zip.length === 7) zip = `${zip.slice(0, 3)}-${zip.slice(3)}`;
    s = s.slice(zipMatch[0].length).trim();
  }

  // 都道府県
  const prefMatch = s.match(/^(東京都|北海道|(?:京都|大阪)府|[一-龥]{2,3}県)/);
  if (prefMatch) {
    pref = prefMatch[1];
    s = s.slice(prefMatch[0].length).trim();
  }

  return { zip, pref, rest: s };
}

/** 発送月文字列（例：6月） */
function shipMonthFromDate(yyyymmdd: string): string {
  if (!yyyymmdd) return "";
  const m = yyyymmdd.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${parseInt(m[2], 10)}月`;
  const m2 = yyyymmdd.match(/(\d{1,2})月/);
  if (m2) return m2[0];
  return "";
}

/** 注文管理シートから対象注文の行データを取得 */
async function findOrderRow(orderNumber: string): Promise<{ rowIndex: number; row: string[] } | null> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: `${ORDER_SHEET}!A:P`,
  });
  const rows = res.data.values ?? [];
  const idx = rows.findIndex((r) => r[0] === orderNumber);
  if (idx === -1) return null;
  return { rowIndex: idx, row: rows[idx] };
}

/** 売上スプレッドシートの指定シートのヘッダー行を取得 */
async function getSalesSheetHeaders(salesSheetId: string, sheetName: string): Promise<string[] | null> {
  const sheets = getSheets();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: salesSheetId,
      range: `${sheetName}!1:1`,
    });
    return (res.data.values?.[0] ?? []).map((v) => String(v));
  } catch {
    return null;
  }
}

/** 販売先マスタから販売先コードを引く（無ければ空） */
async function lookupCustCode(salesSheetId: string, custName: string): Promise<string> {
  if (!custName) return "";
  const sheets = getSheets();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: salesSheetId,
      range: "販売先マスタ!A:B",
    });
    const rows = res.data.values ?? [];
    for (const r of rows.slice(1)) {
      if (String(r[1] ?? "").trim() === custName) return String(r[0] ?? "");
    }
  } catch { /* 販売先マスタが無くてもOK */ }
  return "";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const salesSheetId = process.env.GOOGLE_SALES_SPREADSHEET_ID;
  if (!salesSheetId) {
    return NextResponse.json({
      error: "売上スプレッドシートIDが未設定です（環境変数 GOOGLE_SALES_SPREADSHEET_ID）",
    }, { status: 500 });
  }

  const { orderNumber } = await params;
  const body = await req.json().catch(() => ({})) as { force?: boolean };

  const found = await findOrderRow(orderNumber);
  if (!found) return NextResponse.json({ error: "注文が見つかりません" }, { status: 404 });

  const { rowIndex, row } = found;

  // 既存転記履歴チェック
  const existingTransfer = row[15] ?? ""; // P列
  if (existingTransfer && !body.force) {
    return NextResponse.json({
      alreadyTransferred: true,
      transferInfo: existingTransfer,
    });
  }

  // 注文データ
  const createdAt = row[1] ?? ""; // YYYY/M/D HH:MM:SS
  const customerName = row[2] ?? "";
  const phone = String(row[4] ?? "").replace(/^'/, ""); // 先頭のシングルクオートを除去
  const fullAddress = row[5] ?? "";
  const rawProductName = row[6] ?? "";
  const amount = parseInt(String(row[7] ?? "0").replace(/[^\d.-]/g, ""), 10) || 0;
  const sessionId = row[9] ?? "";
  const desiredDate = row[10] ?? "";
  const desiredTime = row[11] ?? "";
  const estimatedDate = row[14] ?? "";

  // 派生値
  const productName = cleanProductName(rawProductName);
  const qty = extractQty(rawProductName);
  const targetSheet = classifySheet(rawProductName);
  const { zip, pref, rest } = splitAddress(fullAddress);

  // 販売日：作成日時の日付部分
  const saleDateRaw = createdAt.split(/[ \t]/)[0]; // "2026/6/25"
  const dateMatch = saleDateRaw.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  const saleDate = dateMatch ? `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}` : saleDateRaw;
  const saleMonth = dateMatch ? `${parseInt(dateMatch[2], 10)}月` : "";

  // 発送方法（送料行の中身を簡易抽出：例「送料（コンパクト）」→「コンパクト」）
  let shipMethod = "";
  const shipMethodMatch = rawProductName.match(/送料[（(]([^）)]+)[）)]/);
  if (shipMethodMatch) shipMethod = shipMethodMatch[1];

  // 売上シートのヘッダーを取得
  const headers = await getSalesSheetHeaders(salesSheetId, targetSheet);
  if (!headers || headers.length === 0) {
    return NextResponse.json({
      error: `売上スプレッドシートの「${targetSheet}」シートが読めません。シート存在＆サービスアカウントの編集権限を確認してください`,
    }, { status: 500 });
  }

  // 販売先コード
  const custName = "自社サイト";
  const custCode = await lookupCustCode(salesSheetId, custName);

  // 書き込む値（ヘッダー名 → 値）
  const ts = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const valueMap: Record<string, string | number> = {
    "販売日": saleDate,
    "販売月": saleMonth,
    "販売先コード": custCode,
    "販売先名": custName,
    "販売先": custName,
    "商品名": productName,
    "数量": qty,
    "販売価格": amount,
    "発送予定日": estimatedDate || desiredDate,
    "発送月": shipMonthFromDate(estimatedDate || desiredDate),
    "発送方法": shipMethod,
    "時間指定": desiredTime,
    "購入者名": customerName,
    "入力者": "サイト",
    "備考": `[CSV:${orderNumber}]`,
    "登録タイムスタンプ": ts,
    "注文番号": orderNumber,
    "受注番号": sessionId,
    "取込元": custName,
    "郵便番号": zip,
    "都道府県": pref,
    "市区町村": rest, // 自動分割の限界として市区町村に残り全部を入れる
    "町・番地": "",
    "建物名": "",
    "配送先住所": fullAddress,
    "電話番号": phone,
    "配送希望日": desiredDate,
  };

  // ヘッダー順に1行ぶんの配列を組み立て
  const newRow: (string | number)[] = headers.map((h) => valueMap[h] ?? "");

  // 書き込み
  const sheets = getSheets();
  try {
    // 末尾に追記（A列で最終行を判定）
    const colA = await sheets.spreadsheets.values.get({
      spreadsheetId: salesSheetId,
      range: `${targetSheet}!A:A`,
    });
    const nextRow = (colA.data.values?.length ?? 0) + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: salesSheetId,
      range: `${targetSheet}!A${nextRow}:${columnIndexToLetter(headers.length)}${nextRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [newRow] },
    });
  } catch (err) {
    console.error("[transfer-to-sales] write failed", err);
    return NextResponse.json({
      error: "売上シートへの書き込みに失敗しました",
      detail: String(err),
    }, { status: 500 });
  }

  // 注文管理シートに転記履歴を記録（P列）
  const transferLog = `転記済 ${ts.split(" ")[0]} ${targetSheet}`;
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: `${ORDER_SHEET}!P${rowIndex + 1}:P${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [[transferLog]] },
    });
  } catch (err) {
    console.error("[transfer-to-sales] log update failed", err);
  }

  return NextResponse.json({
    success: true,
    targetSheet,
    productName,
    qty,
    amount,
    transferLog,
  });
}

function columnIndexToLetter(n: number): string {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
