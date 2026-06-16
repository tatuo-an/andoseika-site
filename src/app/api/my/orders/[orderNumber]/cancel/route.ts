import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export async function POST(_: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderNumber } = await params;
  const a = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth: a });
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: "注文管理!A:L" });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === orderNumber);
  if (rowIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const row = rows[rowIndex];
  if (row[3] !== session.user.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (row[8] !== "paid") return NextResponse.json({ error: "Cannot cancel" }, { status: 400 });

  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `注文管理!I${rowIndex + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [["cancelled"]] },
  });

  return NextResponse.json({ ok: true });
}
