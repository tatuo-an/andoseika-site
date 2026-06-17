import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// 顧客マスタ: A=メール, B=ラベル, C=名前, D=郵便番号, E=都道府県, F=市区町村, G=番地, H=建物名, I=電話番号, J=表示名
const SHEET = "顧客マスタ";

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

  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${SHEET}!A:J` });
  const rows = res.data.values ?? [];
  const row = rows.find((r) => r[0] === session.user!.email);
  return NextResponse.json({ displayName: row?.[9] ?? "" });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { displayName } = await req.json() as { displayName: string };
  const name = (displayName ?? "").trim().slice(0, 50);

  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${SHEET}!A:J` });
  const rows = res.data.values ?? [];

  // 同メールの全行のJ列を更新（住所が複数あっても全部更新）
  const updates = rows
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r[0] === session.user!.email);

  if (updates.length === 0) {
    // 顧客マスタに行がない場合は新規追加
    await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: `${SHEET}!A:J`,
      valueInputOption: "RAW",
      requestBody: { values: [[session.user.email, "", "", "", "", "", "", "", "", name]] },
    });
  } else {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: id,
      requestBody: {
        valueInputOption: "RAW",
        data: updates.map(({ i }) => ({
          range: `${SHEET}!J${i + 1}`,
          values: [[name]],
        })),
      },
    });
  }

  return NextResponse.json({ ok: true, displayName: name });
}
