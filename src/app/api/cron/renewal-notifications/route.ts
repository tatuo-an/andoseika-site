import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { TIERS, getTier } from "@/lib/tiers";
import { sendRenewalEmail, sendRenewalLine } from "@/lib/sendRenewalNotice";

export const dynamic = "force-dynamic";

const SHEET = "顧客マスタ";
// 顧客マスタ: A=email, B=__profile__, C=display, D=name, E=tier, F=tierExpiry,
//             G=cancelRequestedAt, H=lineUserId, I=notifiedRenewals

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

function todayJST(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

function diffDays(targetYMD: string, baseYMD: string): number {
  const t = new Date(targetYMD + "T00:00:00+09:00").getTime();
  const b = new Date(baseYMD + "T00:00:00+09:00").getTime();
  return Math.round((t - b) / (1000 * 60 * 60 * 24));
}

function alreadyNotified(notifiedField: string, kind: "30d" | "7d", todayYMD: string): boolean {
  // 形式: "30d:YYYY-MM-DD;7d:YYYY-MM-DD"
  return notifiedField.includes(`${kind}:${todayYMD}`);
}

function appendNotified(notifiedField: string, kind: "30d" | "7d", todayYMD: string): string {
  const tag = `${kind}:${todayYMD}`;
  if (notifiedField.includes(tag)) return notifiedField;
  return notifiedField ? `${notifiedField};${tag}` : tag;
}

export async function GET(req: NextRequest) {
  // Vercel Cron 認証（CRON_SECRET 環境変数があれば検証）
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const sheets = getSheets();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
  const today = todayJST();
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://andoseika.jp";

  let scanned = 0;
  let sent30 = 0;
  let sent7 = 0;
  const failures: { email: string; error: string }[] = [];

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET}!A:I`,
    });
    const rows = res.data.values ?? [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r[1] !== "__profile__") continue;

      const email = r[0] ?? "";
      const tier = r[4] ?? "";
      const tierExpiry = r[5] ?? "";
      const cancelRequestedAt = r[6] ?? "";
      const lineUserId = r[7] ?? "";
      const notified = r[8] ?? "";

      if (!email || !tier || !tierExpiry) continue;
      if (cancelRequestedAt) continue; // 解約予約済みは通知しない

      const tierKey = getTier(tier);
      if (tierKey === "free") continue;

      const days = diffDays(tierExpiry, today);
      let kind: "30d" | "7d" | null = null;
      if (days === 30) kind = "30d";
      else if (days === 7) kind = "7d";
      if (!kind) continue;

      scanned++;
      if (alreadyNotified(notified, kind, today)) continue;

      const params = {
        customerName: r[3] || "お客様",
        planName: TIERS[tierKey].name,
        planPrice: TIERS[tierKey].price,
        renewalDate: tierExpiry,
        daysUntil: kind === "30d" ? 30 : 7,
        baseUrl,
      };

      let sentViaLine = false;
      if (lineUserId) {
        try {
          await sendRenewalLine(lineUserId, params);
          sentViaLine = true;
        } catch (lineErr) {
          console.error(`[renewal-cron] LINE failed for ${email}`, lineErr);
        }
      }

      if (!sentViaLine && !email.endsWith("@line.user")) {
        try {
          await sendRenewalEmail(email, params);
        } catch (mailErr) {
          console.error(`[renewal-cron] email failed for ${email}`, mailErr);
          failures.push({ email, error: String(mailErr) });
          continue;
        }
      }

      // I列の通知記録を更新
      const newNotified = appendNotified(notified, kind, today);
      try {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${SHEET}!I${i + 1}:I${i + 1}`,
          valueInputOption: "RAW",
          requestBody: { values: [[newNotified]] },
        });
      } catch (writeErr) {
        console.error(`[renewal-cron] mark notified failed for ${email}`, writeErr);
      }

      if (kind === "30d") sent30++;
      else sent7++;
    }
  } catch (err) {
    console.error("[renewal-cron] fatal error", err);
    return NextResponse.json({ error: "Failed", message: String(err) }, { status: 500 });
  }

  return NextResponse.json({ today, scanned, sent30, sent7, failures });
}
