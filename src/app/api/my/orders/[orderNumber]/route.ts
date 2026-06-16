import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

function normalizePhone(p: string): string {
  const digits = (p ?? "").replace(/\D/g, "");
  if (digits.length === 10) return "0" + digits;
  return p ?? "";
}

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

export async function GET(_: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderNumber } = await params;
  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  const [orderRes, msgRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: "注文管理!A:O" }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: "注文メッセージ!A:E" }).catch(() => ({ data: { values: [] } })),
  ]);

  const rows = orderRes.data.values ?? [];
  const row = rows.find((r) => r[0] === orderNumber);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row[3] !== session.user.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const order = {
    orderNumber: row[0], createdAt: row[1], name: row[2], email: row[3],
    phone: normalizePhone(row[4]), address: row[5], productNames: row[6],
    amount: parseInt(row[7] ?? "0", 10) || 0,
    status: row[8] ?? "paid", sessionId: row[9],
    desiredDate: row[10], desiredTime: row[11],
    complaint: row[12] ?? "",
    estimatedDate: row[14] ?? "",
  };

  const msgRows = (msgRes.data.values ?? []) as string[][];
  const messages = msgRows
    .filter((r) => r[0] === orderNumber)
    .map((r) => ({ orderNumber: r[0], senderType: r[1], senderName: r[2], message: r[3], sentAt: r[4] }));

  return NextResponse.json({ order, messages });
}
