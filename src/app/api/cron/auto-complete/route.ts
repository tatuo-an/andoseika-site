import { NextRequest, NextResponse } from "next/server";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const a = new googleAuth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = sheetsApi({ version: "v4", auth: a });
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: "注文管理!A:R" });
  const rows = (res.data.values ?? []) as string[][];

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * ONE_DAY;
  const updates: { range: string; values: string[][] }[] = [];
  let autoDelivered = 0;
  let autoCompleted = 0;

  rows.forEach((row, i) => {
    if (row[0] === "注文番号") return;
    const status = row[8];
    const complaint = row[12] ?? "";

    if (status === "shipping") {
      // 発送済みのままお客様が受取完了ボタンを押さない注文を、発送から7日で自動的に受取完了にする。
      // 発送日時（R列）が無い過去の注文は、代わりに注文日時（B列）を起点として扱う。
      if (complaint) return;
      const baseAt = row[17] || row[1] || "";
      if (!baseAt) return;
      const baseMs = new Date(baseAt).getTime();
      if (isNaN(baseMs)) return;
      if (now - baseMs >= SEVEN_DAYS) {
        const nowJst = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
        updates.push({ range: `注文管理!I${i + 1}`, values: [["delivered"]] });
        updates.push({ range: `注文管理!N${i + 1}`, values: [[nowJst]] });
        autoDelivered++;
      }
      return;
    }

    const deliveredAt = row[13] ?? "";
    if (status !== "delivered") return;
    if (complaint) return;
    if (!deliveredAt) return;
    const deliveredMs = new Date(deliveredAt).getTime();
    if (isNaN(deliveredMs)) return;
    if (now - deliveredMs >= ONE_DAY) {
      updates.push({ range: `注文管理!I${i + 1}`, values: [["completed"]] });
      autoCompleted++;
    }
  });

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: id,
      requestBody: { valueInputOption: "RAW", data: updates },
    });
  }

  return NextResponse.json({ autoDelivered, autoCompleted, completed: autoCompleted });
}
