import { google } from "googleapis";
import { revalidateTag } from "next/cache";
import { withRetry } from "@/lib/sheetsRetry";

/**
 * 「商品在庫」シートの在庫数を増減する。
 *
 * 列構成（init-sheets の定義に準拠）:
 *   A=商品ID / B=バリアント名 / C=在庫数 / ...
 *
 * 在庫数が空欄の行は「無制限」を意味する（読み取り側で -1 に正規化され、
 * 売り切れ判定から除外される）。無制限の行は増減の対象にしない。
 */

const SHEET = "商品在庫";
const STOCK_COL = "C";

function getSheetsClient() {
  const authClient = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: authClient });
}

/** metadata の cartItems（"id:qty,id:qty"）を解釈する。 */
export function parseCartItems(raw: string | undefined): Map<string, number> {
  const out = new Map<string, number>();
  if (!raw) return out;
  for (const part of raw.split(",")) {
    const [id, qtyStr] = part.split(":");
    const productId = (id ?? "").trim();
    const qty = Number.parseInt(qtyStr ?? "", 10);
    if (!productId || !Number.isFinite(qty) || qty <= 0) continue;
    out.set(productId, (out.get(productId) ?? 0) + qty);
  }
  return out;
}

export type StockCheckResult = {
  ok: boolean;
  /** 在庫が足りなかったもの。ok が false のときだけ入る。 */
  shortages: { productId: string; requested: number; available: number }[];
};

/**
 * 在庫が足りるかを確認する（決済を作る前のチェック用）。
 * 在庫数が空欄＝無制限の行は常に足りている扱い。
 */
export async function checkStock(items: Map<string, number>): Promise<StockCheckResult> {
  if (items.size === 0) return { ok: true, shortages: [] };

  const sheets = getSheetsClient();
  const res = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: `${SHEET}!A:C`,
    }),
  );
  const rows = (res.data.values ?? []) as string[][];

  const shortages: StockCheckResult["shortages"] = [];
  for (const [productId, qty] of items) {
    const row = rows.slice(1).find((r) => (r[0] ?? "").trim() === productId);
    if (!row) continue; // シートに無い商品は判定しない（送料行など）
    const raw = (row[2] ?? "").trim();
    if (raw === "") continue; // 無制限
    const available = Number.parseInt(raw, 10);
    if (!Number.isFinite(available)) continue;
    if (available < qty) {
      shortages.push({ productId, requested: qty, available });
    }
  }
  return { ok: shortages.length === 0, shortages };
}

/**
 * 在庫を増減する。delta が負なら減算（購入）、正なら加算（返金・キャンセル）。
 *
 * 注意: スプレッドシートは行ロックができないため、読み取りから書き込みまでの間に
 * 別の注文が入ると取りこぼす（同時購入の競合）。決済前チェックと併用して
 * 発生確率を下げる方針で、完全な排他は行っていない。
 */
export async function adjustStock(
  items: Map<string, number>,
  direction: "decrement" | "increment",
): Promise<{ updated: number; skipped: string[] }> {
  if (items.size === 0) return { updated: 0, skipped: [] };

  const sheets = getSheetsClient();
  const res = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: `${SHEET}!A:C`,
    }),
  );
  const rows = (res.data.values ?? []) as string[][];

  const updates: { range: string; values: [[number]] }[] = [];
  const skipped: string[] = [];

  for (const [productId, qty] of items) {
    // ヘッダーが1行目なので、配列 index + 2 がシート上の行番号
    const idx = rows.findIndex((r, i) => i > 0 && (r[0] ?? "").trim() === productId);
    if (idx < 0) {
      skipped.push(`${productId}(シートに無し)`);
      continue;
    }
    const raw = (rows[idx][2] ?? "").trim();
    if (raw === "") {
      skipped.push(`${productId}(在庫無制限)`);
      continue;
    }
    const current = Number.parseInt(raw, 10);
    if (!Number.isFinite(current)) {
      skipped.push(`${productId}(在庫数が数値でない: "${raw}")`);
      continue;
    }
    const delta = direction === "decrement" ? -qty : qty;
    // 決済前チェックをすり抜けた同時購入に備え、マイナスにはしない
    const next = Math.max(0, current + delta);
    updates.push({
      range: `${SHEET}!${STOCK_COL}${idx + 1}`,
      values: [[next]],
    });
  }

  if (updates.length > 0) {
    await withRetry(() =>
      sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        requestBody: { valueInputOption: "RAW", data: updates },
      }),
    );
    // 商品一覧の短時間キャッシュを捨てて、在庫表示を即座に追従させる。
    // Next.js 16 の revalidateTag は第2引数（失効プロファイル）が必須。
    try {
      revalidateTag("inventory-sheet", { expire: 0 });
    } catch {
      // リクエスト文脈の外から呼ぶと失敗するが、15秒で自然に期限切れするため致命的ではない
    }
  }

  return { updated: updates.length, skipped };
}
