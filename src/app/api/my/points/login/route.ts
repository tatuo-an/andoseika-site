import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { getTier, TIERS } from "@/lib/tiers";

export const dynamic = "force-dynamic";

const POINTS_SHEET = "ポイント履歴";
const PROFILE_SHEET = "顧客マスタ";

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

function todayJST(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

function nowJST(): string {
  const d = new Date();
  const date = d.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
  const time = d.toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = session.user.email;
  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  try {
    // Fetch tier
    const profileRes = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${PROFILE_SHEET}!A:F` });
    const profileRows = profileRes.data.values ?? [];
    const profileRow = profileRows.find((r) => r[0] === email && r[1] === "__profile__");
    const tier = profileRow?.[4] ?? "";
    const tierExpiry = profileRow?.[5] ?? "";
    const today = todayJST();
    const activeTier = (tier && tierExpiry && tierExpiry >= today) ? getTier(tier) : "free";
    const loginPt = TIERS[activeTier].loginPt;

    // Check if already earned today
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${POINTS_SHEET}!A:E` });
    const rows = res.data.values ?? [];
    const alreadyToday = rows.some(
      (r) => r[0] === email && r[2] === "login" && (r[1] ?? "").startsWith(today)
    );
    if (alreadyToday) return NextResponse.json({ earned: false });

    await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: `${POINTS_SHEET}!A:E`,
      valueInputOption: "RAW",
      requestBody: { values: [[email, nowJST(), "login", loginPt, "ログインボーナス"]] },
    });

    return NextResponse.json({ earned: true, points: loginPt });
  } catch {
    return NextResponse.json({ earned: false });
  }
}
