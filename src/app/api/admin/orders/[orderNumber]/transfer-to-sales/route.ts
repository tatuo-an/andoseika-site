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

/** 商品名から商品マスタのフルコードを判定（GAS の matchToFullCode_ を簡略移植） */
function matchToFullCode(productName: string): string {
  const name = productName;
  if (!name) return "";

  // 予約品（らっきょう系・メロン）
  if (name.includes("根付き") && name.includes("らっきょう")) return "__YOYAKU__";
  if (name.includes("洗い") && name.includes("らっきょう")) return "__YOYAKU__";
  if (name.includes("ペルル") || name.includes("メロン")) return "__YOYAKU__";

  // ねばりっこ
  if (name.includes("ねばりっこ")) {
    if (/10\s*kg/i.test(name)) return "B10";
    if (/5\s*kg/i.test(name)) return "B5";
    if (/3\s*kg/i.test(name)) return "B3";
    if (/2\s*kg/i.test(name)) return "B2";
    return "B1";
  }

  // 甘酢らっきょう
  if (name.includes("甘酢") && name.includes("らっきょう")) {
    const gMatch = name.match(/(\d+)\s*g/i);
    if (gMatch) {
      const g = parseInt(gMatch[1], 10);
      if (g >= 500) return "Z500";
      if (g === 180) {
        if (/[×x]\s*2/.test(name)) return "Z180x2";
        if (/[×x]\s*3/.test(name)) return "Z180x3";
        return "Z180";
      }
    }
    if (/1\s*kg/i.test(name)) return "Z500";
    return "Z180";
  }

  // 長芋・ながいも
  if (/ながいも|長いも|長芋/.test(name)) {
    if (/訳あり|わけあり|【訳|訳長/.test(name)) return "N11";
    if (/10\s*kg/i.test(name)) return "N10";
    if (/5\s*kg/i.test(name)) return "N5";
    if (/3\s*kg/i.test(name)) return "N3";
    if (name.includes("訳")) return "N11";
    return "N1";
  }

  // とっくり芋
  if (name.includes("とっくり")) {
    if (/3\s*kg/i.test(name)) return "T3";
    return "T15";
  }

  // 紅はるか
  if (name.includes("紅はるか") || name.includes("さつまいも") || name.includes("さつま芋")) {
    if (name.includes("土付き") && name.includes("ちびっこ")) return "E1";
    if (name.includes("ちびっこ")) return "E1";
    if (name.includes("土付き")) return "E11";
    if (name.includes("訳あり") || name.includes("わけあり")) return "E155";
    if (/1\.?5\s*kg/i.test(name)) return "E15";
    return "E11";
  }

  // 里芋
  if (name.includes("里芋") || name.includes("さといも") || name.includes("黄金里芋")) return "ST1";

  // むかご
  if (name.includes("むかご")) return "MK";

  // 白ネギ
  if (name.includes("白ネギ") || name.includes("白ねぎ")) {
    if (/5\s*kg/i.test(name)) return "W5";
    if (/3\s*kg/i.test(name)) return "W3";
    return "W1";
  }

  // はちみつ
  if ((name.includes("はちみつ") || name.includes("蜂蜜")) && !name.includes("いちじく")) {
    const isTriple = name.includes("食べ比べ") || /[×x]\s*3/.test(name);
    const isDouble = !isTriple && /[×x]\s*2/.test(name);
    if (isTriple) return "H260x3";
    if (isDouble) return "H260x2";
    if (/260/.test(name)) return "H260";
    if (/150/.test(name)) return "H150";
    return "H260";
  }

  return "";
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

function zeroPad(n: number, len = 2): string {
  return n.toString().padStart(len, "0");
}

/** 日付文字列を YYYY-MM-DD 形式に正規化 */
function normalizeDate(input: string, fallbackYear: number): string {
  if (!input) return "";
  // 2026/6/25 or 2026-6-25
  let m = input.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (m) return `${m[1]}-${zeroPad(parseInt(m[2], 10))}-${zeroPad(parseInt(m[3], 10))}`;
  // 6月29日（年情報なし、引数の fallbackYear を補完）
  m = input.match(/(\d{1,2})月\s*(\d{1,2})日/);
  if (m) return `${fallbackYear}-${zeroPad(parseInt(m[1], 10))}-${zeroPad(parseInt(m[2], 10))}`;
  return "";
}

/** 月表記を YYYY-MM 形式に */
function normalizeMonth(yyyymmdd: string): string {
  if (!yyyymmdd) return "";
  const m = yyyymmdd.match(/^(\d{4})-(\d{1,2})/);
  if (m) return `${m[1]}-${zeroPad(parseInt(m[2], 10))}`;
  return "";
}

/** 配送方法の文字列をマスタの表記に揃える */
function normalizeShipMethod(input: string): string {
  if (!input) return "";
  if (input.includes("コンパクト")) return "宅急便コンパクト";
  if (input.includes("クリックポスト")) return "クリックポスト";
  if (input.includes("クール")) return "クール便";
  const sizeMatch = input.match(/(\d{2,3})\s*サイズ/);
  if (sizeMatch) return `宅急便${sizeMatch[1]}`;
  const sizeOnly = input.match(/^(\d{2,3})$/);
  if (sizeOnly) return `宅急便${sizeOnly[1]}`;
  return input;
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

/** 商品マスタを全件読み込み、フルコード → 商品情報 のマップを返す */
async function loadProductMaster(salesSheetId: string): Promise<Record<string, Record<string, string>>> {
  const sheets = getSheets();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: salesSheetId,
      range: "商品マスタ!A:Z",
    });
    const rows = res.data.values ?? [];
    if (rows.length <= 1) return {};
    const headers = rows[0].map((v) => String(v));
    const fcIdx = headers.indexOf("フルコード");
    if (fcIdx < 0) return {};
    const map: Record<string, Record<string, string>> = {};
    for (let i = 1; i < rows.length; i++) {
      const code = String(rows[i][fcIdx] ?? "").trim();
      if (!code) continue;
      const obj: Record<string, string> = {};
      headers.forEach((h, j) => { obj[h] = String(rows[i][j] ?? ""); });
      map[code] = obj;
    }
    return map;
  } catch {
    return {};
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
  const cleanedName = cleanProductName(rawProductName);
  const qty = extractQty(rawProductName);
  const targetSheet = classifySheet(rawProductName);
  const { zip, pref, rest } = splitAddress(fullAddress);

  // 販売日／販売月：作成日時の日付部分 → YYYY-MM-DD
  const saleDateRaw = createdAt.split(/[ \t]/)[0]; // "2026/6/25"
  const saleDate = normalizeDate(saleDateRaw, new Date().getFullYear());
  const saleMonth = normalizeMonth(saleDate);

  // 発送方法（送料行の中身：例「送料（コンパクト）」→ マスタ表記「宅急便コンパクト」）
  let shipMethodRaw = "";
  const shipMethodMatch = rawProductName.match(/送料[（(]([^）)]+)[）)]/);
  if (shipMethodMatch) shipMethodRaw = shipMethodMatch[1];
  const shipMethod = normalizeShipMethod(shipMethodRaw);

  // 発送予定日：注文管理シート O列の「6月29日〜7月5日頃」から先頭日を抽出 → YYYY-MM-DD
  const fallbackYear = saleDate ? parseInt(saleDate.slice(0, 4), 10) : new Date().getFullYear();
  const shipDate = normalizeDate(estimatedDate || desiredDate, fallbackYear);
  const shipMonth = normalizeMonth(shipDate);

  // 商品マスタとフルコード（CSVと同じ matchToFullCode_ ロジック）
  const fullCode = matchToFullCode(rawProductName);
  const productMaster = await loadProductMaster(salesSheetId);
  const masterEntry = fullCode && productMaster[fullCode] ? productMaster[fullCode] : null;

  // マスタの「商品名」「商品カテゴリ」「規格表示」「重量kg」を優先的に使う
  const productName  = masterEntry?.["商品名"] || cleanedName;
  const categoryVal  = masterEntry?.["商品カテゴリ"] || "";
  const specVal      = masterEntry?.["規格表示"] || "";
  const weightVal    = masterEntry?.["重量kg"] || "";

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
    "フルコード": fullCode,
    "商品カテゴリ": categoryVal,
    "商品名": productName,
    "規格表示": specVal,
    "重量kg": weightVal,
    "数量": qty,
    "販売価格": amount,
    "発送予定日": shipDate,
    "発送月": shipMonth,
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
    "配送希望日": desiredDate ? normalizeDate(desiredDate, fallbackYear) : "",
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
