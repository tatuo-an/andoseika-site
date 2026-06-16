import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orderNumber } = await params;
  const { status, clearComplaint } = await req.json() as { status: string; clearComplaint?: boolean };

  const authClient = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth: authClient });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: "注文管理!A:L",
  });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === orderNumber);
  if (rowIndex === -1) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const sheetRow = rowIndex + 1;
  const updateData: { range: string; values: string[][] }[] = [
    { range: `注文管理!I${sheetRow}`, values: [[status]] },
  ];
  if (clearComplaint) updateData.push({ range: `注文管理!M${sheetRow}`, values: [[""]] });

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    requestBody: { valueInputOption: "RAW", data: updateData },
  });

  return NextResponse.json({ ok: true });
}
