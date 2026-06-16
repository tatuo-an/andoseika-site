import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { orderNumber } = await params;
  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: "注文管理!A:M" });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === orderNumber);
  if (rowIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const row = rows[rowIndex];
  const sessionId = row[9];
  if (!sessionId) return NextResponse.json({ error: "セッションIDが見つかりません" }, { status: 400 });

  // Stripe の PaymentIntent を取得して返金
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentIntentId = checkoutSession.payment_intent as string;
  if (!paymentIntentId) return NextResponse.json({ error: "支払い情報が見つかりません" }, { status: 400 });

  const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });

  // ステータスを cancelled に、complaint をクリア
  const sheetRow = rowIndex + 1;
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: id,
    requestBody: {
      valueInputOption: "RAW",
      data: [
        { range: `注文管理!I${sheetRow}`, values: [["cancelled"]] },
        { range: `注文管理!M${sheetRow}`, values: [[""]] },
      ],
    },
  });

  return NextResponse.json({ ok: true, refundId: refund.id });
}
