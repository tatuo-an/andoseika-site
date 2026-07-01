import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

export async function POST(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;

  try {
    const authClient = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth: authClient });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    const SHEET = "顧客マスタ";

    // A=email, B=__profile__, C=display, D=name, E=tier, F=tierExpiry, G=cancelRequestedAt
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET}!A:G`,
    });
    const rows = res.data.values ?? [];
    const rowIndex = rows.findIndex(
      (r) => r[0] === email && r[1] === "__profile__"
    );

    const nowJST =
      new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }) +
      " " +
      new Date().toLocaleTimeString("ja-JP", {
        timeZone: "Asia/Tokyo",
        hour: "2-digit",
        minute: "2-digit",
      });

    if (rowIndex !== -1) {
      // tier・tierExpiryをクリア + cancelRequestedAt を設定（cronの更新通知を停止）
      // B列を __deleted__ に書き換えてプロフィール行を無効化する
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET}!B${rowIndex + 1}:G${rowIndex + 1}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [["__deleted__", "", "", "", "", nowJST]],
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delete-account]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
