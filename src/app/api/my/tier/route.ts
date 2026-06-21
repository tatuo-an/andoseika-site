import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { getTier, type TierKey } from "@/lib/tiers";

export const dynamic = "force-dynamic";

const SHEET = "顧客マスタ";

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

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ tier: "free" as TierKey });

  try {
    const sheets = getSheets();
    const id = process.env.GOOGLE_SPREADSHEET_ID!;
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${SHEET}!A:F` });
    const rows = res.data.values ?? [];
    const row = rows.find((r) => r[0] === session.user!.email && r[1] === "__profile__");

    const tier = row?.[4] ?? "";
    const tierExpiry = row?.[5] ?? "";
    const now = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
    const activeTier: TierKey = (tier && tierExpiry && tierExpiry >= now) ? getTier(tier) : "free";

    return NextResponse.json({ tier: activeTier, tierExpiry });
  } catch {
    return NextResponse.json({ tier: "free" as TierKey });
  }
}
