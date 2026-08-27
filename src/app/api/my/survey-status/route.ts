import { NextResponse } from "next/server";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const POINTS_SHEET = "ポイント履歴";

function getSheets() {
  const a = new googleAuth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return sheetsApi({ version: "v4", auth: a });
}

// 受取完了後アンケートに既に回答済み（ポイント付与済み）かどうかを返す
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ answered: false });

  const email = session.user.email;
  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${POINTS_SHEET}!A:C` });
    const rows = (res.data.values ?? []) as string[][];
    const answered = rows.some((r) => r[0] === email && r[2] === "survey");
    return NextResponse.json({ answered });
  } catch {
    return NextResponse.json({ answered: false });
  }
}
