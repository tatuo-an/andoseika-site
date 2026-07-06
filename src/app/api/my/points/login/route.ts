import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { getTier, TIERS } from "@/lib/tiers";
import { claimOnceOrVoid } from "@/lib/pointsDedup";

export const dynamic = "force-dynamic";

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

    // 複数タブ・連打による同時リクエストでも二重付与されないよう、追記後に再確認して勝者のみ確定させる
    const { earned } = await claimOnceOrVoid({
      email,
      type: "login",
      dedupKey: today,
      points: loginPt,
      memoPrefix: "ログインボーナス",
    });

    return NextResponse.json({ earned, points: earned ? loginPt : undefined });
  } catch {
    return NextResponse.json({ earned: false });
  }
}
