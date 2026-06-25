import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const ORDER_SHEET = "注文管理";

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

function classifySheet(productName: string): string {
  if (productName.includes("洗い")) return "（予約）洗い";
  if (productName.includes("根付き")) return "（予約）根付";
  if (productName.includes("メロン")) return "（予約）メロン";
  return "売上データ";
}

function matchToFullCode(name: string): string {
  if (!name) return "";
  if (name.includes("根付き") && name.includes("らっきょう")) return "__YOYAKU__";
  if (name.includes("洗い") && name.includes("らっきょう")) return "__YOYAKU__";
  if (name.includes("ペルル") || name.includes("メロン")) return "__YOYAKU__";
  if (name.includes("ねばりっこ")) {
    if (/10\s*kg/i.test(name)) return "B10";
    if (/5\s*kg/i.test(name)) return "B5";
    if (/3\s*kg/i.test(name)) return "B3";
    if (/2\s*kg/i.test(name)) return "B2";
    return "B1";
  }
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
  if (/ながいも|長いも|長芋/.test(name)) {
    if (/訳あり|わけあり|【訳|訳長/.test(name)) return "N11";
    if (/10\s*kg/i.test(name)) return "N10";
    if (/5\s*kg/i.test(name)) return "N5";
    if (/3\s*kg/i.test(name)) return "N3";
    if (name.includes("訳")) return "N11";
    return "N1";
  }
  if (name.includes("とっくり")) {
    if (/3\s*kg/i.test(name)) return "T3";
    return "T15";
  }
  if (name.includes("紅はるか") || name.includes("さつまいも") || name.includes("さつま芋")) {
    if (name.includes("土付き") && name.includes("ちびっこ")) return "E1";
    if (name.includes("ちびっこ")) return "E1";
    if (name.includes("土付き")) return "E11";
    if (name.includes("訳あり") || name.includes("わけあり")) return "E155";
    if (/1\.?5\s*kg/i.test(name)) return "E15";
    return "E11";
  }
  if (name.includes("里芋") || name.includes("さといも") || name.includes("黄金里芋")) return "ST1";
  if (name.includes("むかご")) return "MK";
  if (name.includes("白ネギ") || name.includes("白ねぎ")) {
    if (/5\s*kg/i.test(name)) return "W5";
    if (/3\s*kg/i.test(name)) return "W3";
    return "W1";
  }
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

function cleanProductName(raw: string): string {
  if (!raw) return "";
  const first = raw.split(",")[0].trim();
  return first
    .replace(/×\s*\d+\s*$/, "")
    .replace(/（セール価格）|（訳あり）|（特価）/g, "")
    .trim();
}

function extractQty(raw: string): number {
  if (!raw) return 1;
  const first = raw.split(",")[0];
  const m = first.match(/×\s*(\d+)\s*$/);
  return m ? parseInt(m[1], 10) || 1 : 1;
}

function splitAddress(addr: string): { zip: string; pref: string; rest: string } {
  if (!addr) return { zip: "", pref: "", rest: "" };
  let s = addr.trim();
  let zip = "";
  let pref = "";
  const zipMatch = s.match(/^〒?\s*(\d{3,4}-?\d{4}|\d{7,8})\s*/);
  if (zipMatch) {
    zip = zipMatch[1].replace("-", "");
    if (zip.length === 7) zip = `${zip.slice(0, 3)}-${zip.slice(3)}`;
    s = s.slice(zipMatch[0].length).trim();
  }
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

function normalizeDate(input: string, fallbackYear: number): string {
  if (!input) return "";
  let m = input.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (m) return `${m[1]}-${zeroPad(parseInt(m[2], 10))}-${zeroPad(parseInt(m[3], 10))}`;
  m = input.match(/(\d{1,2})月\s*(\d{1,2})日/);
  if (m) return `${fallbackYear}-${zeroPad(parseInt(m[1], 10))}-${zeroPad(parseInt(m[2], 10))}`;
  return "";
}

function normalizeMonth(yyyymmdd: string): string {
  if (!yyyymmdd) return "";
  const m = yyyymmdd.match(/^(\d{4})-(\d{1,2})/);
  if (m) return `${m[1]}-${zeroPad(parseInt(m[2], 10))}`;
  return "";
}

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

function columnIndexToLetter(n: number): string {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

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
  } catch { /* OK */ }
  return "";
}

type BulkResult = {
  orderNumber: string;
  status: "transferred" | "skipped" | "error";
  targetSheet?: string;
  productName?: string;
  qty?: number;
  amount?: number;
  message?: string;
};

export async function POST(req: NextRequest) {
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

  const body = await req.json().catch(() => ({})) as { orderNumbers?: string[]; force?: boolean };
  const targetOrders = Array.isArray(body.orderNumbers) ? body.orderNumbers : [];
  const force = body.force === true;

  if (targetOrders.length === 0) {
    return NextResponse.json({ error: "対象の注文が指定されていません" }, { status: 400 });
  }

  const sheets = getSheets();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;

  // 注文管理シートを1回読み込み
  const orderRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${ORDER_SHEET}!A:P`,
  });
  const orderRows = orderRes.data.values ?? [];

  // 商品マスタも1回だけ読み込み
  const productMaster = await loadProductMaster(salesSheetId);
  const custName = "自社サイト";
  const custCode = await lookupCustCode(salesSheetId, custName);

  // シートごとのヘッダーキャッシュ
  const headersCache = new Map<string, string[]>();
  async function getHeaders(sheetName: string): Promise<string[] | null> {
    if (headersCache.has(sheetName)) return headersCache.get(sheetName)!;
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: salesSheetId,
        range: `${sheetName}!1:1`,
      });
      const headers = (res.data.values?.[0] ?? []).map((v) => String(v));
      headersCache.set(sheetName, headers);
      return headers;
    } catch {
      return null;
    }
  }

  // シートごとの「次の追記行」キャッシュ
  const nextRowCache = new Map<string, number>();
  async function getNextRow(sheetName: string): Promise<number> {
    if (nextRowCache.has(sheetName)) return nextRowCache.get(sheetName)!;
    const colA = await sheets.spreadsheets.values.get({
      spreadsheetId: salesSheetId,
      range: `${sheetName}!A:A`,
    });
    const next = (colA.data.values?.length ?? 0) + 1;
    nextRowCache.set(sheetName, next);
    return next;
  }

  const results: BulkResult[] = [];
  const ts = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const logUpdates: { range: string; values: string[][] }[] = [];

  for (const orderNumber of targetOrders) {
    const rowIndex = orderRows.findIndex((r) => r[0] === orderNumber);
    if (rowIndex === -1) {
      results.push({ orderNumber, status: "error", message: "注文が見つかりません" });
      continue;
    }
    const row = orderRows[rowIndex];

    // 既存転記履歴チェック
    const existingTransfer = row[15] ?? "";
    if (existingTransfer && !force) {
      results.push({ orderNumber, status: "skipped", message: existingTransfer });
      continue;
    }

    const createdAt = row[1] ?? "";
    const customerName = row[2] ?? "";
    const phone = String(row[4] ?? "").replace(/^'/, "");
    const fullAddress = row[5] ?? "";
    const rawProductName = row[6] ?? "";
    const amount = parseInt(String(row[7] ?? "0").replace(/[^\d.-]/g, ""), 10) || 0;
    const sessionId = row[9] ?? "";
    const desiredDate = row[10] ?? "";
    const desiredTime = row[11] ?? "";
    const estimatedDate = row[14] ?? "";

    const cleanedName = cleanProductName(rawProductName);
    const qty = extractQty(rawProductName);
    const targetSheet = classifySheet(rawProductName);
    const { zip, pref, rest } = splitAddress(fullAddress);

    const saleDateRaw = createdAt.split(/[ \t]/)[0];
    const saleDate = normalizeDate(saleDateRaw, new Date().getFullYear());
    const saleMonth = normalizeMonth(saleDate);

    let shipMethodRaw = "";
    const shipMethodMatch = rawProductName.match(/送料[（(]([^）)]+)[）)]/);
    if (shipMethodMatch) shipMethodRaw = shipMethodMatch[1];
    const shipMethod = normalizeShipMethod(shipMethodRaw);

    const fallbackYear = saleDate ? parseInt(saleDate.slice(0, 4), 10) : new Date().getFullYear();
    const shipDate = normalizeDate(estimatedDate || desiredDate, fallbackYear);
    const shipMonth = normalizeMonth(shipDate);

    const fullCode = matchToFullCode(rawProductName);
    const masterEntry = fullCode && productMaster[fullCode] ? productMaster[fullCode] : null;
    const productName = masterEntry?.["商品名"] || cleanedName;
    const categoryVal = masterEntry?.["商品カテゴリ"] || "";
    const specVal = masterEntry?.["規格表示"] || "";
    const weightVal = masterEntry?.["重量kg"] || "";

    const headers = await getHeaders(targetSheet);
    if (!headers || headers.length === 0) {
      results.push({ orderNumber, status: "error", message: `「${targetSheet}」シートが読めません` });
      continue;
    }

    const valueMap: Record<string, string | number> = {
      "販売日": saleDate, "販売月": saleMonth, "販売先コード": custCode, "販売先名": custName, "販売先": custName,
      "フルコード": fullCode, "商品カテゴリ": categoryVal, "商品名": productName, "規格表示": specVal, "重量kg": weightVal,
      "数量": qty, "販売価格": amount, "発送予定日": shipDate, "発送月": shipMonth, "発送方法": shipMethod,
      "時間指定": desiredTime, "購入者名": customerName, "入力者": "サイト", "備考": `[CSV:${orderNumber}]`,
      "登録タイムスタンプ": ts, "注文番号": orderNumber, "受注番号": sessionId, "取込元": custName,
      "郵便番号": zip, "都道府県": pref, "市区町村": rest, "町・番地": "", "建物名": "",
      "配送先住所": fullAddress, "電話番号": phone,
      "配送希望日": desiredDate ? normalizeDate(desiredDate, fallbackYear) : "",
    };

    const newRow = headers.map((h) => valueMap[h] ?? "");
    const nextRow = await getNextRow(targetSheet);

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: salesSheetId,
        range: `${targetSheet}!A${nextRow}:${columnIndexToLetter(headers.length)}${nextRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [newRow] },
      });
      nextRowCache.set(targetSheet, nextRow + 1);

      const transferLog = `転記済 ${ts.split(" ")[0]} ${targetSheet}`;
      logUpdates.push({
        range: `${ORDER_SHEET}!P${rowIndex + 1}:P${rowIndex + 1}`,
        values: [[transferLog]],
      });

      results.push({ orderNumber, status: "transferred", targetSheet, productName, qty, amount });
    } catch (err) {
      console.error(`[bulk-transfer] ${orderNumber} 失敗`, err);
      results.push({ orderNumber, status: "error", message: String(err) });
    }
  }

  // 注文管理シートの P列を一括更新
  if (logUpdates.length > 0) {
    try {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: "RAW",
          data: logUpdates,
        },
      });
    } catch (err) {
      console.error("[bulk-transfer] log batch update failed", err);
    }
  }

  const transferredCount = results.filter((r) => r.status === "transferred").length;
  const skippedCount = results.filter((r) => r.status === "skipped").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return NextResponse.json({
    total: results.length,
    transferred: transferredCount,
    skipped: skippedCount,
    error: errorCount,
    results,
  });
}
