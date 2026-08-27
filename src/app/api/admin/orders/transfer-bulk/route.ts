import { NextRequest, NextResponse } from "next/server";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const ORDER_SHEET = "注文管理";

function getSheets() {
  const authClient = new googleAuth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return sheetsApi({ version: "v4", auth: authClient });
}

const PEAR_SHEET = "（予約）梨";
const PEAR_EXTRA_HEADERS = ["転記日", "売上No"];

// 梨（新甘泉・二十世紀）注文の判定。王秋・あたごは現時点未対応のため対象に含めない。
function isPearOrder(name: string): boolean {
  if (!/梨|なし/.test(name)) return false;
  return /新甘泉|しんかんせん|二十世紀|20世紀|にじっせいき/.test(name);
}

function classifySheet(productName: string): string {
  if (productName.includes("洗い")) return "（予約）洗い";
  if (productName.includes("根付き")) return "（予約）根付";
  if (productName.includes("メロン")) return "（予約）メロン";
  if (isPearOrder(productName)) return PEAR_SHEET;
  return "売上データ";
}

function pearPrefix(name: string): string {
  if (/新甘泉|しんかんせん/.test(name)) return "I";
  if (/二十世紀|20世紀|にじっせいき/.test(name)) return "J";
  return "";
}

// 梨専用のフルコード決定ルール（ando-seika-gas の CSV取込ロジックに準拠）。
// 訳あり品は固定2kgパック（プレフィックス+"2"+WS/WM）、正品は商品名中の重量をそのまま使う。
function pearFullCode(name: string): string {
  const prefix = pearPrefix(name);
  if (!prefix) return "";
  if (/訳あり|わけあり/.test(name)) {
    const size = /中/.test(name) ? "WM" : "WS"; // 小/中の指定がなければ小(WS)がデフォルト
    return `${prefix}2${size}`;
  }
  const kgMatch = name.match(/(\d+)\s*kg/i);
  const weight = kgMatch ? kgMatch[1] : "3"; // 重量が読み取れなければ3kgデフォルト
  return `${prefix}${weight}`;
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

function splitAddress(addr: string): { zip: string; pref: string; city: string; street: string } {
  if (!addr) return { zip: "", pref: "", city: "", street: "" };
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
  const { city, street } = splitCityStreet(s);
  return { zip, pref, city, street };
}

const DESIGNATED_CITIES_B = [
  "札幌市", "仙台市", "さいたま市", "千葉市", "横浜市", "川崎市", "相模原市",
  "新潟市", "静岡市", "浜松市", "名古屋市", "京都市", "大阪市", "堺市",
  "神戸市", "岡山市", "広島市", "北九州市", "福岡市", "熊本市",
];

function splitCityStreet(input: string): { city: string; street: string } {
  if (!input) return { city: "", street: "" };
  const trimmed = input.trim();
  for (const dc of DESIGNATED_CITIES_B) {
    if (trimmed.startsWith(dc)) {
      const rest = trimmed.slice(dc.length);
      const wardMatch = rest.match(/^([^\s]+?区)\s*(.*)$/);
      if (wardMatch) return { city: dc + wardMatch[1], street: wardMatch[2].trim() };
      return { city: dc, street: rest.trim() };
    }
  }
  const districtMatch = trimmed.match(/^([^\s]+?郡[^\s]+?[町村])\s*(.*)$/);
  if (districtMatch) return { city: districtMatch[1], street: districtMatch[2].trim() };
  const cityMatch = trimmed.match(/^([^\s]+?[市区町村])\s*(.*)$/);
  if (cityMatch) return { city: cityMatch[1], street: cityMatch[2].trim() };
  return { city: trimmed, street: "" };
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
    range: `${ORDER_SHEET}!A:R`,
  });
  const orderRows = orderRes.data.values ?? [];

  // 商品マスタも1回だけ読み込み
  const productMaster = await loadProductMaster(salesSheetId);
  const custName = "自社サイト";
  const custCode = "X"; // 自社サイトは固定で "X"

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

  // シートごとの「次の追記行」と「次の No.」をキャッシュ
  const nextRowCache = new Map<string, number>();
  const nextNoCache = new Map<string, number>();
  async function getNextRowAndNo(sheetName: string): Promise<{ row: number; no: number }> {
    if (nextRowCache.has(sheetName) && nextNoCache.has(sheetName)) {
      return { row: nextRowCache.get(sheetName)!, no: nextNoCache.get(sheetName)! };
    }
    const colA = await sheets.spreadsheets.values.get({
      spreadsheetId: salesSheetId,
      range: `${sheetName}!A:A`,
    });
    const rows = colA.data.values ?? [];
    const row = rows.length + 1;
    let no = 1;
    for (const r of rows.slice(1)) {
      const n = parseInt(String(r[0] ?? ""), 10);
      if (!isNaN(n) && n >= no) no = n + 1;
    }
    nextRowCache.set(sheetName, row);
    nextNoCache.set(sheetName, no);
    return { row, no };
  }

  // 「（予約）梨」シートのヘッダーを確保する。存在しない/空の場合は
  // 「売上データ」と同じ列構成＋「転記日」「売上No」を末尾に加えて新規作成する。
  let pearHeadersCache: string[] | null = null;
  async function ensurePearHeaders(): Promise<string[]> {
    if (pearHeadersCache) return pearHeadersCache;
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: salesSheetId,
      range: `${PEAR_SHEET}!1:1`,
    }).catch(() => null);
    const existingHeaders = (existing?.data.values?.[0] ?? []).map((v) => String(v)).filter(Boolean);
    if (existingHeaders.length > 0) {
      pearHeadersCache = existingHeaders;
      return existingHeaders;
    }

    const salesHeadersRes = await sheets.spreadsheets.values.get({
      spreadsheetId: salesSheetId,
      range: "売上データ!1:1",
    });
    const salesHeaders = (salesHeadersRes.data.values?.[0] ?? []).map((v) => String(v));
    const newHeaders = [...salesHeaders, ...PEAR_EXTRA_HEADERS];

    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: salesSheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: PEAR_SHEET } } }] },
      });
    } catch {
      // シートが既に存在する場合はエラーになるが無視してよい
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId: salesSheetId,
      range: `${PEAR_SHEET}!A1:${columnIndexToLetter(newHeaders.length)}1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [newHeaders] },
    });
    pearHeadersCache = newHeaders;
    return newHeaders;
  }

  // 予約No（N0001形式）と次の書き込み行をキャッシュしながら採番する。
  let pearNextRow: number | null = null;
  let pearNextNoNum: number | null = null;
  async function getNextPearRowAndNo(): Promise<{ row: number; no: string }> {
    if (pearNextRow === null || pearNextNoNum === null) {
      const colA = await sheets.spreadsheets.values.get({
        spreadsheetId: salesSheetId,
        range: `${PEAR_SHEET}!A:A`,
      }).catch(() => null);
      const rows = colA?.data.values ?? [];
      pearNextRow = rows.length + 1;
      let maxN = 0;
      for (const r of rows.slice(1)) {
        const m = String(r[0] ?? "").match(/^N(\d+)$/);
        if (m) {
          const n = parseInt(m[1], 10);
          if (n > maxN) maxN = n;
        }
      }
      pearNextNoNum = maxN + 1;
    }
    const row = pearNextRow;
    const no = `N${String(pearNextNoNum).padStart(4, "0")}`;
    pearNextRow += 1;
    pearNextNoNum += 1;
    return { row, no };
  }

  // 「（予約）梨」シート内に同じ注文番号の行が既にないか確認する（重複防止）。
  // バッチ内で複数件処理する場合に備え、一度読み込んだ結果はSetにキャッシュして使い回す。
  let pearExistingOrderNumbers: Set<string> | null = null;
  async function pearOrderAlreadyExists(headers: string[], orderNumberToCheck: string): Promise<boolean> {
    if (pearExistingOrderNumbers === null) {
      const colIdx = headers.indexOf("注文番号");
      pearExistingOrderNumbers = new Set();
      if (colIdx >= 0) {
        const colLetter = columnIndexToLetter(colIdx + 1);
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: salesSheetId,
          range: `${PEAR_SHEET}!${colLetter}:${colLetter}`,
        }).catch(() => null);
        const values = res?.data.values ?? [];
        for (const r of values.slice(1)) {
          const v = String(r[0] ?? "").trim();
          if (v) pearExistingOrderNumbers.add(v);
        }
      }
    }
    return pearExistingOrderNumbers.has(orderNumberToCheck);
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
    const { zip, pref, city: cityVal, street: streetVal } = splitAddress(fullAddress);

    const saleDateRaw = createdAt.split(/[ \t]/)[0];
    const saleDate = normalizeDate(saleDateRaw, new Date().getFullYear());
    const saleMonth = normalizeMonth(saleDate);
    const fallbackYear = saleDate ? parseInt(saleDate.slice(0, 4), 10) : new Date().getFullYear();

    // 梨（新甘泉・二十世紀）専用の振り分け（ando-seika-gas の CSV取込ロジックに準拠）。
    // 通常品とはフルコード決定・No採番・発送方法の取得元が異なるため別処理にしている。
    if (targetSheet === PEAR_SHEET) {
      const pearHeaders = await ensurePearHeaders();

      const alreadyRegistered = await pearOrderAlreadyExists(pearHeaders, orderNumber);
      if (alreadyRegistered && !force) {
        results.push({ orderNumber, status: "skipped", message: `${PEAR_SHEET}に登録済み` });
        continue;
      }

      const fullCode = pearFullCode(rawProductName);
      const masterEntry = fullCode && productMaster[fullCode] ? productMaster[fullCode] : null;
      const productName = masterEntry?.["商品名"] || cleanedName;
      const categoryVal = masterEntry?.["商品カテゴリ"] || "";
      const specVal = masterEntry?.["規格表示"] || "";
      const weightVal = masterEntry?.["重量kg"] || "";
      const shipMethodFromMaster = masterEntry?.["発送方法"] || "";

      // 数量に応じた箱サイズ自動アップグレードは未実装のため、仕様の代替案どおり
      // 数量分を1件（数量1）ずつの行に分けて登録する（発送方法は商品マスタの値をそのまま使う）。
      const unitAmount = qty > 0 ? Math.round(amount / qty) : amount;
      const unitCount = Math.max(1, qty);
      let transferError: string | null = null;

      for (let i = 0; i < unitCount; i++) {
        const { row: nextRow, no: nextNo } = await getNextPearRowAndNo();
        const weightDisplay = specVal || (weightVal ? `${weightVal}kg` : "");
        const contentWithNo = weightDisplay
          ? `${nextNo} ${productName} ${weightDisplay}`
          : `${nextNo} ${productName}`;

        const valueMap: Record<string, string | number> = {
          "No": nextNo, "No.": nextNo,
          "販売日": saleDate, "販売月": saleMonth, "販売先コード": custCode, "販売先名": custName, "販売先": custName,
          "フルコード": fullCode, "商品カテゴリ": categoryVal, "商品名": productName, "規格表示": specVal, "重量kg": weightVal, "内容品": contentWithNo,
          "数量": 1, "販売価格": unitAmount, "発送予定日": "", "発送月": "", "発送方法": shipMethodFromMaster,
          "時間指定": desiredTime, "購入者名": customerName, "入力者": "サイト", "備考": `[CSV:${orderNumber}]`,
          "登録タイムスタンプ": ts, "注文番号": orderNumber, "受注番号": sessionId, "取込元": custName,
          "郵便番号": zip, "都道府県": pref, "市区町村": cityVal, "町・番地": streetVal, "建物名": "",
          "配送先住所": fullAddress, "電話番号": phone,
          "配送希望日": desiredDate ? normalizeDate(desiredDate, fallbackYear) : "",
          "ステータス": "予約中",
          "転記日": "", "売上No": "",
        };
        const newRow = pearHeaders.map((h) => valueMap[h] ?? "");

        try {
          await sheets.spreadsheets.values.update({
            spreadsheetId: salesSheetId,
            range: `${PEAR_SHEET}!A${nextRow}:${columnIndexToLetter(pearHeaders.length)}${nextRow}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [newRow] },
          });
        } catch (err) {
          console.error(`[bulk-transfer] ${orderNumber} 失敗（梨・${i + 1}/${unitCount}件目）`, err);
          transferError = String(err);
          break;
        }
      }

      if (transferError) {
        results.push({ orderNumber, status: "error", message: transferError });
      } else {
        const transferLog = `転記済 ${ts.split(" ")[0]} ${PEAR_SHEET}`;
        logUpdates.push({
          range: `${ORDER_SHEET}!P${rowIndex + 1}:P${rowIndex + 1}`,
          values: [[transferLog]],
        });
        results.push({ orderNumber, status: "transferred", targetSheet: PEAR_SHEET, productName, qty, amount });
      }
      continue;
    }

    // R列（発送方法）に「送料（クリックポスト）」等の明細名がそのまま入っている。
    // 旧データ（R列導入前）向けに、念のため商品名からの抽出もフォールバックとして残す。
    const shipMethodSource = String(row[17] ?? "").trim();
    let shipMethodRaw = "";
    const shipMethodMatch = (shipMethodSource || rawProductName).match(/送料[（(]([^）)]+)[）)]/);
    if (shipMethodMatch) shipMethodRaw = shipMethodMatch[1];
    else if (shipMethodSource) shipMethodRaw = shipMethodSource.replace(/^送料\s*/, "");
    const shipMethod = normalizeShipMethod(shipMethodRaw);

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

    const { row: nextRow, no: nextNo } = await getNextRowAndNo(targetSheet);
    // 内容品は「No. + 商品名 + 重量（規格表示）」
    const weightDisplay = specVal || (weightVal ? `${weightVal}kg` : "");
    const contentWithNo = weightDisplay
      ? `${nextNo} ${productName} ${weightDisplay}`
      : `${nextNo} ${productName}`;

    const valueMap: Record<string, string | number> = {
      "No": nextNo, "No.": nextNo,
      "販売日": saleDate, "販売月": saleMonth, "販売先コード": custCode, "販売先名": custName, "販売先": custName,
      "フルコード": fullCode, "商品カテゴリ": categoryVal, "商品名": productName, "規格表示": specVal, "重量kg": weightVal, "内容品": contentWithNo,
      "数量": qty, "販売価格": amount, "発送予定日": shipDate, "発送月": shipMonth, "発送方法": shipMethod,
      "時間指定": desiredTime, "購入者名": customerName, "入力者": "サイト", "備考": `[CSV:${orderNumber}]`,
      "登録タイムスタンプ": ts, "注文番号": orderNumber, "受注番号": sessionId, "取込元": custName,
      "郵便番号": zip, "都道府県": pref, "市区町村": cityVal, "町・番地": streetVal, "建物名": "",
      "配送先住所": fullAddress, "電話番号": phone,
      "配送希望日": desiredDate ? normalizeDate(desiredDate, fallbackYear) : "",
    };

    const newRow = headers.map((h) => valueMap[h] ?? "");

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: salesSheetId,
        range: `${targetSheet}!A${nextRow}:${columnIndexToLetter(headers.length)}${nextRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [newRow] },
      });
      nextRowCache.set(targetSheet, nextRow + 1);
      nextNoCache.set(targetSheet, nextNo + 1);

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
