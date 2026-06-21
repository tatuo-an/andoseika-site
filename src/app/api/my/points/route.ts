import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const SHEET = "ポイント履歴";

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

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = session.user.email;
  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${SHEET}!A:E` });
    const rows = (res.data.values ?? []).filter((r) => r[0] === email);
    const balance = rows.reduce((sum, r) => sum + (parseInt(r[3] ?? "0", 10) || 0), 0);
    const history = [...rows].reverse().slice(0, 30).map((r) => ({
      date: r[1] ?? "",
      type: r[2] ?? "",
      points: parseInt(r[3] ?? "0", 10),
      memo: r[4] ?? "",
    }));
    return NextResponse.json({ balance, history });
  } catch {
    return NextResponse.json({ balance: 0, history: [] });
  }
}
