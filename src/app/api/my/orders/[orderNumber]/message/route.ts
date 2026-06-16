import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

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

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderNumber } = await params;
  const { message } = await req.json() as { message: string };
  if (!message?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  // 注文の所有者確認
  const orderRes = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: "注文管理!A:D" });
  const row = (orderRes.data.values ?? []).find((r) => r[0] === orderNumber);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row[3] !== session.user.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sentAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  await sheets.spreadsheets.values.append({
    spreadsheetId: id,
    range: "注文メッセージ!A:E",
    valueInputOption: "RAW",
    requestBody: { values: [[orderNumber, "user", session.user.name ?? "お客様", message.trim(), sentAt]] },
  });

  // 問題報告・配送問い合わせの場合は注文管理シートのM列に記録
  const complaintMatch = message.match(/^【(問題報告|配送問い合わせ)】(.+)/);
  if (complaintMatch) {
    const allOrders = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: "注文管理!A:A" });
    const rows = allOrders.data.values ?? [];
    const rowIndex = rows.findIndex((r) => r[0] === orderNumber);
    if (rowIndex !== -1) {
      const label = complaintMatch[1] === "配送問い合わせ" ? `【配送】${complaintMatch[2].split("\n")[0]}` : complaintMatch[2].split("\n")[0];
      await sheets.spreadsheets.values.update({
        spreadsheetId: id,
        range: `注文管理!M${rowIndex + 1}`,
        valueInputOption: "RAW",
        requestBody: { values: [[label]] },
      });
    }
  }

  return NextResponse.json({ ok: true, sentAt });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderNumber } = await params;
  const { sentAt } = await req.json() as { sentAt: string };

  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: "注文メッセージ!A:E" });
  const rows = (res.data.values ?? []) as string[][];
  const rowIndex = rows.findIndex((r) => r[0] === orderNumber && r[1] === "user" && r[4] === sentAt);
  if (rowIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `注文メッセージ!D${rowIndex + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [["__retracted__"]] },
  });

  return NextResponse.json({ ok: true });
}
