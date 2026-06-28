import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { google } from "googleapis";
import { getTier } from "@/lib/tiers";
import { sendOrderConfirmationEmail } from "@/lib/sendOrderEmail";
import { sendOrderLineNotification } from "@/lib/sendOrderLine";

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
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  // append の自動テーブル境界判定が列ずれを起こすため、A列の最終行を取って明示的にupdateする
  const a = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "注文管理!A:A",
  });
  const nextRow = (a.data.values?.length ?? 0) + 1;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `注文管理!A${nextRow}:Q${nextRow + values.length - 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

/**
 * 名前の表記を「姓 名」順に正規化する。
 * Apple Pay や海外サービスは「given family」（名 姓）順で氏名を渡してくるため、
 * 日本語名（漢字・かな含む）が「名 姓」の順で入っている場合に反転させる。
 */
function normalizeJapaneseName(name: string): string {
  if (!name) return name;
  const trimmed = name.trim();
  // スペース区切りで2要素のみを対象とする
  const parts = trimmed.split(/[\s　]+/);
  if (parts.length !== 2) return trimmed;
  const [first, second] = parts;
  // 両方が日本語（CJK 漢字 / ひらがな / カタカナ）を含むかチェック
  const jpRegex = /[぀-ヿ㐀-䶿一-鿿]/;
  if (!jpRegex.test(first) || !jpRegex.test(second)) return trimmed;
  // Apple Pay は「名 姓」の順で渡してくる前提で反転 → 「姓 名」
  return `${second} ${first}`;
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
    // 住所の優先順位：
    //   1. payment_intent.shipping（カートで選んだ住所＝事前入力したもの）
    //   2. customer_details.address（Apple Pay 等で Stripe 側が集めた住所）
    //
    // Apple Pay は Apple Wallet の住所を customer_details に入れるため、
    // カートで選択した住所を尊重するには payment_intent.shipping を優先する必要がある。
    const pi = session.payment_intent as Stripe.PaymentIntent | null;
    const piShipping = pi?.shipping;
    const customerAddr = session.customer_details?.address;

    let address = "";
    if (piShipping?.address) {
      const s = piShipping.address;
      address = [s.postal_code, s.state, s.city, s.line1, s.line2].filter(Boolean).join(" ");
    } else if (customerAddr) {
      address = [customerAddr.postal_code, customerAddr.state, customerAddr.city, customerAddr.line1, customerAddr.line2].filter(Boolean).join(" ");
    }

    // 電話番号も同様にカート由来を優先
    const cartPhone = piShipping?.phone ?? "";
    const stripePhone = rawPhone;
    let phoneDigitsFinal = (cartPhone || stripePhone).startsWith("+81")
      ? "0" + (cartPhone || stripePhone).slice(3)
      : (cartPhone || stripePhone);
    const amount = session.amount_total?.toString() ?? "";
    const sessionId = session.id;

    const meta = session.metadata ?? {};
    const piMeta = typeof session.payment_intent === "object" && session.payment_intent !== null
      ? (session.payment_intent as Stripe.PaymentIntent).metadata ?? {}
      : {};
    const desiredDate = piMeta.desiredDeliveryDate ?? meta.desiredDeliveryDate ?? "";
    const desiredTime = piMeta.desiredDeliveryTime ?? meta.desiredDeliveryTime ?? "";
    // 氏名・住所・電話番号の決定優先度：
    //   1. piMeta.shippingName / piShipping.address / piShipping.phone（カート由来）
    //   2. customer_details.name / customer_details.address / customer_details.phone（Apple Pay 等）
    //   3. 顧客マスタの登録住所（メールアドレスで紐付け）
    //   4. 正規化処理
    const userEmailMeta = piMeta.userEmail ?? meta.userEmail ?? email;

    // 顧客マスタの登録住所を取得（必要時のみ使うが先に1回読む）
    let masterPrimary: string[] | null = null;
    if (userEmailMeta) {
      try {
        const sh = await getSheets();
        const res = await sh.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
          range: "顧客マスタ!A:K",
        });
        const rows = res.data.values ?? [];
        const addresses = rows.filter((r) => r[0] === userEmailMeta && r[1] !== "__profile__");
        masterPrimary =
          addresses.find((r) => r[1] === "自分") ||
          addresses.find((r) => r[1] === "デフォルト") ||
          addresses.find((r) => r[1] === "本人") ||
          addresses[0] ||
          null;
      } catch (lookupErr) {
        console.error("[webhook] customer master lookup failed", lookupErr);
      }
    }

    // 氏名
    let shippingName = piMeta.shippingName || "";
    if (!shippingName && masterPrimary) shippingName = String(masterPrimary[2] ?? "").trim();
    if (!shippingName) shippingName = normalizeJapaneseName(name);

    // 住所（既に決定済みの address に対して空ならマスタ参照）
    if (!address && masterPrimary) {
      const mZip = String(masterPrimary[3] ?? "").trim();
      const mPref = String(masterPrimary[4] ?? "").trim();
      const mCity = String(masterPrimary[5] ?? "").trim();
      const mStreet = String(masterPrimary[6] ?? "").trim();
      const mBldg = String(masterPrimary[7] ?? "").trim();
      address = [mZip, mPref, mCity, mStreet, mBldg].filter(Boolean).join(" ");
    }

    // 電話（既に決定済みの phone が空ならマスタ参照）
    if (!phoneDigitsFinal && masterPrimary) {
      const mPhone = String(masterPrimary[8] ?? "").trim();
      if (mPhone) phoneDigitsFinal = mPhone;
    }
    const phone = phoneDigitsFinal ? `'${phoneDigitsFinal}` : "";
    const shipMode = piMeta.shipMode ?? meta.shipMode ?? "";
    const shipValue = piMeta.shipValue ?? meta.shipValue ?? "";

    // お届け予定日: 配達希望日があればそちら優先、なければshipMode/shipValueから計算
    const estimatedDate = desiredDate || calcEstimatedDate(shipMode, shipValue);
    console.log("[webhook] meta:", JSON.stringify(meta));
    console.log("[webhook] shipMode:", shipMode, "shipValue:", shipValue, "estimatedDate:", estimatedDate);

    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 10 });
    // 送料・サービス料・クール便・追加送料・オプション行などは商品名から除外
    const isFeeLine = (desc: string) =>
      /^(送料|サービス料|クール便|追加送料|オプション)/.test(desc.trim());
    const productNames = lineItems.data
      .map((item) => item.description ?? "")
      .filter((desc) => desc && !isFeeLine(desc))
      .join(", ");

    // 購入者名（Apple Pay 等の海外順を正規化）
    const buyerName = name ? normalizeJapaneseName(name) : "";

    try {
      // 注文管理: A=注文番号, B=作成日時, C=送り先氏名, D=メール, E=電話, F=住所,
      //           G=商品名, H=金額, I=ステータス, J=セッションID, K=希望配達日,
      //           L=希望時間帯, M=問題内容, N=受取完了日時, O=お届け予定日,
      //           P=売上転記履歴, Q=購入者氏名
      await appendToOrderSheet([[
        orderNumber, now, shippingName || buyerName, email, phone, address,
        productNames, amount, "paid", sessionId, desiredDate, desiredTime,
        "", "", estimatedDate, "", buyerName,
      ]]);
      console.log("[webhook] order recorded:", orderNumber, sessionId);

      // 注文確認通知（LINE優先、失敗時または未登録時はメールへフォールバック）
      const notifyName = shippingName || name || "お客様";
      const userEmailFromMeta = piMeta.userEmail ?? meta.userEmail ?? "";
      let sentViaLine = false;

      // 1) LINE userId を顧客マスタから探索（NextAuthのemail優先、なければStripeのemail）
      const lookupEmail = userEmailFromMeta || email;
      let lineUserId = "";
      if (lookupEmail) {
        try {
          const sheets = await getSheets();
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
            range: "顧客マスタ!A:H",
          });
          const rows = res.data.values ?? [];
          const row = rows.find((r) => r[0] === lookupEmail && r[1] === "__profile__");
          lineUserId = row?.[7] ?? "";
        } catch (lookupErr) {
          console.error("[webhook] line userId lookup failed", lookupErr);
        }
      }

      // 2) LINE push を試みる
      if (lineUserId) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_URL || "https://andoseika.jp";
          await sendOrderLineNotification({
            lineUserId,
            customerName: notifyName,
            orderNumber,
            productNames,
            amount,
            estimatedDate,
            baseUrl,
          });
          sentViaLine = true;
          console.log("[webhook] LINE notification sent:", orderNumber, lineUserId);
        } catch (lineErr) {
          console.error("[webhook] LINE push failed, falling back to email", lineErr);
        }
      }

      // 3) LINE 未送信ならメール
      if (!sentViaLine && email) {
        try {
          await sendOrderConfirmationEmail({
            to: email,
            customerName: notifyName,
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
