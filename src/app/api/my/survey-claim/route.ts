import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const POINTS_SHEET = "ポイント履歴";
const SURVEY_POINTS = 200;

function getSheets() {
  const a = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: a });
}

// 受取完了後アンケート回答フォームの最後に表示される合言葉を入力してもらい、
// 正しければその場で1アカウント1回まで200ptを付与する。
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = session.user.email;
  const { password } = await req.json() as { password?: string };
  const correctPassword = process.env.SURVEY_PASSWORD;

  if (!correctPassword) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 500 });
  }
  if (!password || password.trim().toLowerCase() !== correctPassword.trim().toLowerCase()) {
    return NextResponse.json({ ok: false, reason: "wrong_password" });
  }

  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${POINTS_SHEET}!A:C` });
    const rows = (res.data.values ?? []) as string[][];
    const alreadyClaimed = rows.some((r) => r[0] === email && r[2] === "survey");
    if (alreadyClaimed) {
      return NextResponse.json({ ok: false, reason: "already_claimed" });
    }

    const nowJst =
      new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }) +
      " " +
      new Date().toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" });

    await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: `${POINTS_SHEET}!A:E`,
      valueInputOption: "RAW",
      requestBody: { values: [[email, nowJst, "survey", String(SURVEY_POINTS), "受取完了後アンケート回答ボーナス"]] },
    });

    return NextResponse.json({ ok: true, points: SURVEY_POINTS });
  } catch (err) {
    console.error("[survey-claim]", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}
