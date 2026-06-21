import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

export async function POST(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const authClient = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth: authClient });
    const SHEET = "顧客マスタ";

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: `${SHEET}!A:F`,
    });
    const rows = res.data.values ?? [];
    const rowIndex = rows.findIndex(
      (r) => r[0] === session.user!.email && r[1] === "__profile__"
    );

    if (rowIndex === -1) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const existing = rows[rowIndex];
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: `${SHEET}!A${rowIndex + 1}:F${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[existing[0], "__profile__", existing[2] ?? "", existing[3] ?? "", "", ""]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[cancel-tier]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
