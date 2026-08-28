import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";

import { workersGoogleAuth } from "@/lib/googleAuth";
import { googleFetch } from "@/lib/googleFetch";
const POINTS_SHEET = "ポイント履歴";

function getSheets() {
  const a = workersGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"]);
  return sheetsApi({ version: "v4", auth: a, fetchImplementation: googleFetch });
}

// ログインボーナス・誕生日ボーナスのような「1日/1年に1回」のポイント付与を、
// 複数タブや連打による同時リクエストでも二重付与されないようにする。
//
// Google Sheets の values.append は同一スプレッドシートに対して直列に処理される
// ため、追記後に再読込した際の行の並び順は実際の追記順を正しく反映する。
// この性質を利用して「他のリクエストが先に同じ付与を完了していないか」を
// 追記後にもう一度確認し、負けた場合は自分の行を無効化する。
export async function claimOnceOrVoid(params: {
  email: string;
  type: string; // "login" | "birthday" 等
  dedupKey: string; // この期間内で重複とみなすキー（例: 日付 "2026-07-06"）
  points: number;
  memoPrefix: string;
}): Promise<{ earned: boolean }> {
  const { email, type, dedupKey, points, memoPrefix } = params;
  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  // 1. 早期チェック（通常ケースを安く弾く）
  const before = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${POINTS_SHEET}!A:E` });
  const beforeRows = before.data.values ?? [];
  const alreadyExists = beforeRows.some(
    (r) => r[0] === email && r[2] === type && (r[4] ?? "").includes(dedupKey)
  );
  if (alreadyExists) return { earned: false };

  // 2. 自分の分を追記（メモ欄に nonce を埋め込み、後で自分の行を特定できるようにする）
  const nowJST =
    new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }) +
    " " +
    new Date().toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" });
  const memo = `${memoPrefix} (${dedupKey}) [${nonce}]`;
  await sheets.spreadsheets.values.append({
    spreadsheetId: id,
    range: `${POINTS_SHEET}!A:E`,
    valueInputOption: "RAW",
    requestBody: { values: [[email, nowJST, type, points, memo]] },
  });

  // 3. 追記後に再読込し、同じ dedupKey で自分より先に確定した行がないか確認
  const after = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${POINTS_SHEET}!A:E` });
  const afterRows = after.data.values ?? [];
  const matching = afterRows
    .map((r, idx) => ({ r, idx }))
    .filter(({ r }) => r[0] === email && r[2] === type && (r[4] ?? "").includes(dedupKey));

  const myRowIdx = matching.find(({ r }) => (r[4] ?? "").includes(nonce))?.idx;
  const winnerIdx = matching[0]?.idx;

  if (myRowIdx === undefined || winnerIdx === undefined || myRowIdx !== winnerIdx) {
    // 自分より先に確定した行がある＝競合に負けた。自分の行を無効化する。
    if (myRowIdx !== undefined) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: id,
        range: `${POINTS_SHEET}!C${myRowIdx + 1}:E${myRowIdx + 1}`,
        valueInputOption: "RAW",
        requestBody: { values: [["void", 0, `重複防止のため無効化 [${nonce}]`]] },
      });
    }
    return { earned: false };
  }

  return { earned: true };
}
