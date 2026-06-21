import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const SHEET = "ポイント履歴";
const LOGIN_POINTS = 10;

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
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }); // "2025-06-21"
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
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${SHEET}!A:E` });
    const rows = res.data.values ?? [];
    const today = todayJST();

    const alreadyToday = rows.some(
      (r) => r[0] === email && r[2] === "login" && (r[1] ?? "").startsWith(today)
    );
    if (alreadyToday) return NextResponse.json({ earned: false });

    await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: `${SHEET}!A:E`,
      valueInputOption: "RAW",
      requestBody: { values: [[email, nowJST(), "login", LOGIN_POINTS, "ログインボーナス"]] },
    });

    return NextResponse.json({ earned: true, points: LOGIN_POINTS });
  } catch {
    return NextResponse.json({ earned: false });
  }
}
