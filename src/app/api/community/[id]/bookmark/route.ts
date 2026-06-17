import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// 料理投稿シート: A=投稿ID, B=メール, C=表示名, D=商品名, E=投稿画像URL, F=本文, G=投稿日時, H=いいねメールリスト, I=保存メールリスト

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

const ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET = "料理投稿";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const email = session.user.email;

  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: ID, range: `${SHEET}!A:I` });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === id);
  if (rowIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bookmarkEmails = rows[rowIndex][8] ? rows[rowIndex][8].split(",").filter(Boolean) : [];
  const alreadySaved = bookmarkEmails.includes(email);
  const newBookmarks = alreadySaved
    ? bookmarkEmails.filter((e: string) => e !== email)
    : [...bookmarkEmails, email];

  await sheets.spreadsheets.values.update({
    spreadsheetId: ID,
    range: `${SHEET}!I${rowIndex + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [[newBookmarks.join(",")]] },
  });

  return NextResponse.json({ ok: true, saved: !alreadySaved, saveCount: newBookmarks.length });
}
