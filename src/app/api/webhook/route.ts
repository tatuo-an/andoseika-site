import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { google } from "googleapis";
import { getTier } from "@/lib/tiers";
import { sendOrderConfirmationEmail } from "@/lib/sendOrderEmail";

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
    range: "注文管理!A:O",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

function calcEstimatedDate(shipMode: string, shipValue: string): string {
  if (!shipMode || !shipValue) return "";
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));

  if (shipMode === "days") {
    const [minStr, maxStr] = shipValue.split("-");
    const minDays = parseInt(minStr ?? "", 10);
    const maxDays = parseInt(maxStr ?? "", 10);
    if (isNaN(minDays) && isNaN(maxDays)) return "";
    const fmt = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
    if (!isNaN(minDays) && !isNaN(maxDays)) {
      const from = new Date(now); from.setDate(from.getDate() + minDays);
      const to = new Date(now); to.setDate(to.getDate() + maxDays);
      return `${fmt(from)}〜${fmt(to)}頃`;
    }
    const days = !isNaN(minDays) ? minDays : maxDays;
    const d = new Date(now); d.setDate(d.getDate() + days);
    return `${fmt(d)}頃`;
  }

  if (shipMode === "weekdays") {
    const WD_MAP: Record<string, number> = { 日: 0, 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6 };
    const targetWDs = shipValue.split(",").map(s => WD_MAP[s.trim()]).filter(n => n !== undefined) as number[];
    if (targetWDs.length === 0) return "";
    const todayWD = now.getDay();
    // 翌発送曜日を探す（今日は除く、次の発送日）
    let minDiff = 7;
    for (const wd of targetWDs) {
      let diff = wd - todayWD;
      if (diff <= 0) diff += 7;
      if (diff < minDiff) minDiff = diff;
    }
    const shipDate = new Date(now); shipDate.setDate(shipDate.getDate() + minDiff);
    // 発送翌日〜翌々日をお届け予定とする
    const from = new Date(shipDate); from.setDate(from.getDate() + 1);
    const to = new Date(shipDate); to.setDate(to.getDate() + 2);
    const fmt = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
    return `${fmt(from)}〜${fmt(to)}頃`;
  }

  return "";
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
    const phoneDigits = rawPhone.startsWith("+81") ? "0" + rawPhone.slice(3) : rawPhone;
    const phone = phoneDigits ? `'${phoneDigits}` : "";
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
    const shipMode = piMeta.shipMode ?? meta.shipMode ?? "";
    const shipValue = piMeta.shipValue ?? meta.shipValue ?? "";

    // お届け予定日: 配達希望日があればそちら優先、なければshipMode/shipValueから計算
    const estimatedDate = desiredDate || calcEstimatedDate(shipMode, shipValue);
    console.log("[webhook] meta:", JSON.stringify(meta));
    console.log("[webhook] shipMode:", shipMode, "shipValue:", shipValue, "estimatedDate:", estimatedDate);

    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 10 });
    const productNames = lineItems.data.map((item) => item.description).join(", ");

    try {
      // 新シート「注文管理」: A=注文番号, B=作成日時, C=顧客名, D=メール, E=電話, F=住所, G=商品名, H=金額, I=ステータス, J=セッションID, K=希望配達日, L=希望時間帯, M=問題内容, N=受取完了日時, O=お届け予定日
      await appendToOrderSheet([[
        orderNumber, now, shippingName || name, email, phone, address,
        productNames, amount, "paid", sessionId, desiredDate, desiredTime,
        "", "", estimatedDate,
      ]]);
      console.log("[webhook] order recorded:", orderNumber, sessionId);

      // 注文確認メール送信
      if (email) {
        try {
          await sendOrderConfirmationEmail({
            to: email,
            customerName: shippingName || name || "お客様",
            orderNumber,
            productNames,
            amount,
            estimatedDate,
            address,
          });
        } catch (mailErr) {
          console.error("[webhook] failed to send order email", mailErr);
        }
      }

      // ポイント消費記録
      const pointsUsed = parseInt(piMeta.pointsUsed ?? "0", 10);
      if (pointsUsed > 0 && email) {
        const sheets = await getSheets();
        const nowJST = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }) + " " +
          new Date().toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" });
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
          range: "ポイント履歴!A:E",
          valueInputOption: "RAW",
          requestBody: { values: [[email, nowJST, "use", -pointsUsed, `注文${orderNumber}でのポイント利用`]] },
        });
      }
    } catch (err) {
      console.error("[webhook] failed to write to sheet", err);
    }

    // サポーター決済の場合: tier を顧客マスタに書き込む
    if (meta.source === "ando-seika-supporter") {
      const tierKey = getTier(meta.plan ?? piMeta.plan);
      const userEmail = meta.userEmail ?? piMeta.userEmail ?? session.customer_details?.email ?? "";
      if (userEmail && tierKey !== "free") {
        try {
          const sheets = await getSheets();
          const SHEET = "顧客マスタ";
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
            range: `${SHEET}!A:F`,
          });
          const rows = res.data.values ?? [];
          const rowIndex = rows.findIndex((r) => r[0] === userEmail && r[1] === "__profile__");

          // Expiry = 1 year from now (JST)
          const expDate = new Date();
          expDate.setFullYear(expDate.getFullYear() + 1);
          const tierExpiry = expDate.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });

          if (rowIndex === -1) {
            await sheets.spreadsheets.values.append({
              spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
              range: `${SHEET}!A:F`,
              valueInputOption: "RAW",
              requestBody: { values: [[userEmail, "__profile__", "", "", tierKey, tierExpiry]] },
            });
          } else {
            const existing = rows[rowIndex];
            await sheets.spreadsheets.values.update({
              spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
              range: `${SHEET}!A${rowIndex + 1}:F${rowIndex + 1}`,
              valueInputOption: "RAW",
              requestBody: { values: [[userEmail, "__profile__", existing[2] ?? "", existing[3] ?? "", tierKey, tierExpiry]] },
            });
          }
          console.log("[webhook] tier updated:", userEmail, tierKey, tierExpiry);
        } catch (err) {
          console.error("[webhook] failed to update tier", err);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
