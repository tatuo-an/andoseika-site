import { NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

// レスキュー便シート: A=ID, B=タイトル, C=説明文, D=残数, E=期限日, F=商品ID, G=有効(1/0), H=LINE通知済み(1/0)

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
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: "レスキュー便!A:H",
    });
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
    const items = (res.data.values ?? [])
      .filter((r) => r[0] && r[6] === "1" && r[4] >= today)
      .map((r) => ({
        id: r[0],
        title: r[1] ?? "",
        description: r[2] ?? "",
        stock: r[3] ? parseInt(r[3], 10) : null,
        deadline: r[4] ?? "",
        productId: r[5] ?? "",
        notified: r[7] === "1",
      }));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
