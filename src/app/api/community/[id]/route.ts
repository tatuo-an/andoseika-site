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
