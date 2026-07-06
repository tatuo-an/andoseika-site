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

function todayMMDD(): string {
  const d = new Date();
  const m = String(d.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric" }).replace(/[^0-9]/g, "")).padStart(2, "0");
  const day = String(d.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", day: "numeric" }).replace(/[^0-9]/g, "")).padStart(2, "0");
  return `${m}/${day}`;
}

function todayJST(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

function thisYear(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }).slice(0, 4);
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = session.user.email;
  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  try {
    // Get profile: birthday (D) and tier (E, F)
    const profileRes = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${PROFILE_SHEET}!A:F` });
    const profileRows = profileRes.data.values ?? [];
    const profileRow = profileRows.find((r) => r[0] === email && r[1] === "__profile__");
    const birthday = profileRow?.[3] ?? "";
    const tier = profileRow?.[4] ?? "";
    const tierExpiry = profileRow?.[5] ?? "";

    if (!birthday) return NextResponse.json({ earned: false, reason: "no_birthday" });

    const today = todayMMDD();
    if (birthday !== today) return NextResponse.json({ earned: false, reason: "not_today" });

    const todayStr = todayJST();
    const activeTier = (tier && tierExpiry && tierExpiry >= todayStr) ? getTier(tier) : "free";
    const birthdayPt = TIERS[activeTier].birthdayPt;

    if (birthdayPt === 0) return NextResponse.json({ earned: false, reason: "no_birthday_bonus_for_tier" });

    // 複数タブ・連打による同時リクエストでも二重付与されないよう、追記後に再確認して勝者のみ確定させる
    const year = thisYear();
    const { earned } = await claimOnceOrVoid({
      email,
      type: "birthday",
      dedupKey: year,
      points: birthdayPt,
      memoPrefix: "誕生日ボーナス",
    });

    return NextResponse.json({ earned, points: earned ? birthdayPt : undefined, reason: earned ? undefined : "already_earned" });
  } catch {
    return NextResponse.json({ earned: false });
  }
}
