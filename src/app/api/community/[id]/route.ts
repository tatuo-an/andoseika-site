import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

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
const SHEET = "料理投稿";

function rowToPost(r: string[], myEmail: string) {
  const likeEmails = r[7] ? r[7].split(",").filter(Boolean) : [];
  const bookmarkEmails = r[8] ? r[8].split(",").filter(Boolean) : [];
  return {
    id: r[0] ?? "",
    email: r[1] ?? "",
    displayName: r[2] ?? "",
    productName: r[3] ?? "",
    imageUrl: r[4] ?? "",
    caption: r[5] ?? "",
    createdAt: r[6] ?? "",
    likeCount: likeEmails.length,
    liked: likeEmails.includes(myEmail),
    saved: bookmarkEmails.includes(myEmail),
    isOwner: r[1] === myEmail,
    productFamily: r[9] ?? "",
    productId: r[10] ?? "",
  };
}

// 1件取得 + 同じファミリーの関連投稿
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const myEmail = session?.user?.email ?? "";
  const { id } = await params;

  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: ID, range: `${SHEET}!A:K` });
  const rows = (res.data.values ?? []).filter((r) => r[0]);

  const target = rows.find((r) => r[0] === id);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const post = rowToPost(target, myEmail);
  const related = rows
    .filter((r) => r[0] !== id && r[9] && r[9] === target[9])
    .slice(-4)
    .reverse()
    .map((r) => rowToPost(r, myEmail));

  return NextResponse.json({ post, related });
}

// 編集（投稿者のみ）
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { caption } = await req.json() as { caption: string };

  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: ID, range: `${SHEET}!A:H` });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === id);
  if (rowIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (rows[rowIndex][1] !== session.user.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await sheets.spreadsheets.values.update({
    spreadsheetId: ID,
    range: `${SHEET}!F${rowIndex + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [[caption]] },
  });

  return NextResponse.json({ ok: true });
}

// 削除（投稿者のみ）
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sheets = getSheets();

  const meta = await sheets.spreadsheets.get({ spreadsheetId: ID });
  const sheetId = meta.data.sheets?.find((s) => s.properties?.title === SHEET)?.properties?.sheetId;
  if (sheetId === undefined) return NextResponse.json({ error: "Sheet not found" }, { status: 500 });

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: ID, range: `${SHEET}!A:B` });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === id);
  if (rowIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (rows[rowIndex][1] !== session.user.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: ID,
    requestBody: {
      requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: rowIndex, endIndex: rowIndex + 1 } } }],
    },
  });

  return NextResponse.json({ ok: true });
}
