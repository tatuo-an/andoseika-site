import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

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

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: "注文管理!A:N" });
  const rows = (res.data.values ?? []) as string[][];

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const updates: { range: string; values: string[][] }[] = [];

  rows.forEach((row, i) => {
    if (row[0] === "注文番号") return;
    const status = row[8];
    const complaint = row[12] ?? "";
    const deliveredAt = row[13] ?? "";
    if (status !== "delivered") return;
    if (complaint) return;
    if (!deliveredAt) return;
    const deliveredMs = new Date(deliveredAt).getTime();
    if (isNaN(deliveredMs)) return;
    if (now - deliveredMs >= ONE_DAY) {
      updates.push({ range: `注文管理!I${i + 1}`, values: [["completed"]] });
    }
  });

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: id,
      requestBody: { valueInputOption: "RAW", data: updates },
    });
  }

  return NextResponse.json({ completed: updates.length });
}
