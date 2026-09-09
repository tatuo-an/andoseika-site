import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { isNegiReminderExcluded } from "@/lib/line-group-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SPREADSHEET_ID = process.env.LINE_ORDER_SPREADSHEET_ID!;
const SHEET_AI_SESSIONS = "AIセッション";

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function pushLineMessage(to: string, text: string) {
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error(`[line-order-reminder] push failed for ${to} (${res.status}): ${errText}`);
    return false;
  }
  return true;
}

async function getLineGroupName(groupId: string) {
  const res = await fetch(`https://api.line.me/v2/bot/group/${groupId}/summary`, {
    headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null) as { groupName?: string } | null;
  return data?.groupName ?? null;
}

// 今週の月曜0時（JST）を返す
function thisWeekMonday(): Date {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const day = now.getDay(); // 0=日
  const diff = day === 0 ? 6 : day - 1; // 月曜からの経過日数
  const monday = new Date(now);
  monday.setDate(monday.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_AI_SESSIONS}!A:D`,
  });
  const rows = res.data.values ?? [];
  const monday = thisWeekMonday();

  let reminded = 0;
  let skipped = 0;
  const results: { key: string; action: string }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const key = rows[i][0];
    if (!key || !key.startsWith("C")) continue; // グループのみ対象（個人はGAS側のリマインドが担当）

    const groupName = await getLineGroupName(key);
    if (isNegiReminderExcluded(key, groupName)) {
      skipped++;
      results.push({ key, action: "skipped (excluded group)" });
      continue;
    }

    const status = rows[i][1] || "";
    const updatedAt = rows[i][3] ? new Date(rows[i][3]) : null;
    const orderedThisWeek = status === "done" && updatedAt && updatedAt >= monday;

    if (orderedThisWeek) {
      skipped++;
      results.push({ key, action: "skipped (already ordered)" });
      continue;
    }

    const ok = await pushLineMessage(
      key,
      "【安藤青果】今週のご注文はお済みですか？\n\nまだの場合は、このグループに欲しい商品と数量を送ってください。"
    );
    reminded += ok ? 1 : 0;
    results.push({ key, action: ok ? "reminded" : "failed" });
  }

  return NextResponse.json({ reminded, skipped, results });
}
