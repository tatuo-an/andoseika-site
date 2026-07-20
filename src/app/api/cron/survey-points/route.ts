import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

// 受取完了後アンケートの回答シート列構成（Googleフォームの質問順と一致させること）：
// A=タイムスタンプ, B=メールアドレス, C=商品満足度, D=サイト体験, E=購入のきっかけ,
// F=サイトの改善点, G=商品・価格への要望, H=今後やってほしいこと, I=推薦度(NPS), J=自由記述
const RESPONSES_SHEET = "アンケート回答";
const POINTS_SHEET = "ポイント履歴";
const SURVEY_POINTS = 200;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const a = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth: a });
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  const [responsesRes, pointsRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${RESPONSES_SHEET}!A:B` }).catch(() => ({ data: { values: [] } })),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${POINTS_SHEET}!A:E` }),
  ]);

  const responseRows = (responsesRes.data.values ?? []) as string[][];
  const pointsRows = (pointsRes.data.values ?? []) as string[][];

  // 既にアンケートポイントを受け取ったメールアドレス（1アカウント1回まで）
  const alreadyAwarded = new Set(
    pointsRows.filter((r) => r[2] === "survey").map((r) => r[0])
  );

  const nowJst = () =>
    new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }) +
    " " +
    new Date().toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" });

  const newlyAwarded: string[] = [];
  const appendValues: string[][] = [];

  for (const row of responseRows) {
    if (row[0] === "タイムスタンプ") continue; // Googleフォームのヘッダー行
    // メールアドレスは大文字小文字を区別した完全一致で扱う（他のポイント系APIと同じ規約）
    const email = (row[1] ?? "").trim();
    if (!email || !email.includes("@")) continue;
    if (alreadyAwarded.has(email)) continue;
    if (newlyAwarded.includes(email)) continue; // 同一実行内での重複回答

    appendValues.push([email, nowJst(), "survey", String(SURVEY_POINTS), "受取完了後アンケート回答ボーナス"]);
    newlyAwarded.push(email);
  }

  if (appendValues.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: `${POINTS_SHEET}!A:E`,
      valueInputOption: "RAW",
      requestBody: { values: appendValues },
    });
  }

  return NextResponse.json({ awarded: newlyAwarded.length });
}
