import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

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
const SHEET = "レスキュー便";

// 一覧取得
export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: ID, range: `${SHEET}!A:H` });
  const items = (res.data.values ?? [])
    .filter((r) => r[0])
    .map((r) => ({
      id: r[0], title: r[1] ?? "", description: r[2] ?? "",
      stock: r[3] ?? "", deadline: r[4] ?? "", productId: r[5] ?? "",
      active: r[6] === "1", notified: r[7] === "1",
    }))
    .reverse();
  return NextResponse.json({ items });
}

// 新規追加
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, stock, deadline, productId } = await req.json() as {
    title: string; description: string; stock?: string; deadline: string; productId?: string;
  };
  if (!title || !deadline) return NextResponse.json({ error: "title と deadline は必須です" }, { status: 400 });

  const rescueId = `rescue_${Date.now()}`;
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: ID,
    range: `${SHEET}!A:H`,
    valueInputOption: "RAW",
    requestBody: { values: [[rescueId, title, description ?? "", stock ?? "", deadline, productId ?? "", "1", "0"]] },
  });

  return NextResponse.json({ ok: true, id: rescueId });
}
