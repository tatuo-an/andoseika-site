import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/\//g, "");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `ORD-${date}-${rand}`;
}

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function appendToOrderSheet(values: string[][]) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: "注文管理!A:M",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

async function appendToLegacySheet(values: string[][]) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: "シート1!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    const orderNumber = generateOrderNumber();

    const name = session.customer_details?.name ?? "";
    const email = session.customer_details?.email ?? "";
    const rawPhone = session.customer_details?.phone ?? "";
    const phone = rawPhone.startsWith("+81") ? "0" + rawPhone.slice(3) : rawPhone;
    const addr = session.customer_details?.address;
    const address = addr
      ? [addr.postal_code, addr.state, addr.city, addr.line1, addr.line2].filter(Boolean).join(" ")
      : (session.payment_intent as Stripe.PaymentIntent)?.shipping
        ? (() => {
            const s = (session.payment_intent as Stripe.PaymentIntent).shipping!.address!;
            return [s.postal_code, s.state, s.city, s.line1, s.line2].filter(Boolean).join(" ");
          })()
        : "";
    const amount = session.amount_total?.toString() ?? "";
    const sessionId = session.id;

    const meta = session.metadata ?? {};
    const piMeta = typeof session.payment_intent === "object" && session.payment_intent !== null
      ? (session.payment_intent as Stripe.PaymentIntent).metadata ?? {}
      : {};
    const desiredDate = piMeta.desiredDeliveryDate ?? meta.desiredDeliveryDate ?? "";
    const desiredTime = piMeta.desiredDeliveryTime ?? meta.desiredDeliveryTime ?? "";
    const shippingName = piMeta.shippingName ?? name;

    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 10 });
    const productNames = lineItems.data.map((item) => item.description).join(", ");

    try {
      // 新シート「注文管理」: A=注文番号, B=作成日時, C=顧客名, D=メール, E=電話, F=住所, G=商品名, H=金額, I=ステータス, J=セッションID, K=希望配達日, L=希望時間帯
      await appendToOrderSheet([[
        orderNumber, now, shippingName || name, email, phone, address,
        productNames, amount, "paid", sessionId, desiredDate, desiredTime,
      ]]);
      // 旧シートにも書き込み（後方互換）
      await appendToLegacySheet([[now, name, email, phone, address, productNames, amount, sessionId]]);
      console.log("[webhook] order recorded:", orderNumber, sessionId);
    } catch (err) {
      console.error("[webhook] failed to write to sheet", err);
    }
  }

  return NextResponse.json({ received: true });
}
