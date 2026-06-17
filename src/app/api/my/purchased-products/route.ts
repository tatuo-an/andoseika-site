import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const a = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth: a });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: "注文管理!A:I",
  });

  const rows = res.data.values ?? [];
  const productSet = new Set<string>();
  for (const r of rows) {
    if (r[3] === session.user.email && r[8] !== "cancelled" && r[6]) {
      // G列の商品名を「,」で分割して個別に登録
      r[6].split(",").forEach((p: string) => {
        const name = p.replace(/×\d+/, "").trim();
        if (name) productSet.add(name);
      });
    }
  }

  return NextResponse.json({ products: Array.from(productSet) });
}
