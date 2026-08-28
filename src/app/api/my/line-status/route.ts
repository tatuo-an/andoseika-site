import { NextResponse } from "next/server";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";
import { workersGoogleAuth } from "@/lib/googleAuth";
import { googleFetch } from "@/lib/googleFetch";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ isLineUser: false, hasLineUserId: false });
  }

  // メールが {sub}@line.user の場合は確実に LINE ログイン
  const isLineSuffix = email.endsWith("@line.user");

  // 顧客マスタ H 列に lineUserId があるかどうか
  let hasLineUserId = false;
  try {
    const authClient = workersGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"]);
    const sheets = sheetsApi({ version: "v4", auth: authClient, fetchImplementation: googleFetch });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: "顧客マスタ!A:H",
    });
    const rows = res.data.values ?? [];
    const row = rows.find((r) => r[0] === email && r[1] === "__profile__");
    hasLineUserId = !!(row?.[7] ?? "").trim();
  } catch {
    // sheet 取得失敗時はメール接尾辞だけで判定
  }

  return NextResponse.json({
    isLineUser: isLineSuffix || hasLineUserId,
    hasLineUserId,
  });
}
