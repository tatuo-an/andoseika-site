import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { readReviews, reviewSheets, reviewSpreadsheetId, REVIEW_SHEET } from "@/lib/productReviews";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const productId = new URL(request.url).searchParams.get("productId")?.trim() ?? "";
  if (!productId || productId.length > 150) return NextResponse.json({ error: "商品が指定されていません" }, { status: 400 });
  try {
    const reviews = (await readReviews())
      .filter(review => review.productId === productId && review.status === "approved")
      .map(({ id, createdAt, displayName, rating, body }) => ({ id, createdAt, displayName, rating, body }));
    return NextResponse.json({ reviews }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[reviews] read failed", error);
    return NextResponse.json({ error: "レビューを読み込めませんでした" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "ログインしてください" }, { status: 401 });

  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return NextResponse.json({ error: "入力を確認してください" }, { status: 400 }); }
  const productId = typeof data.productId === "string" ? data.productId.trim() : "";
  const orderNumber = typeof data.orderNumber === "string" ? data.orderNumber.trim() : "";
  const displayName = typeof data.displayName === "string" ? data.displayName.trim() : "";
  const body = typeof data.body === "string" ? data.body.trim() : "";
  const rating = Number(data.rating);
  if (!productId || productId.length > 150 || !/^ORD-\d{8}-\d{4}$/.test(orderNumber) ||
      !displayName || displayName.length > 30 || body.length < 10 || body.length > 1000 ||
      !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "注文番号・お名前・評価・本文を確認してください（本文10〜1000文字）" }, { status: 400 });
  }

  try {
    const sheets = reviewSheets();
    const spreadsheetId = reviewSpreadsheetId();
    const [orderResult, reviews] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: "'注文管理'!A2:J" }),
      readReviews(),
    ]);
    const order = (orderResult.data.values ?? []).find(row => row[0] === orderNumber);
    if (!order || String(order[3] ?? "").trim().toLowerCase() !== email || order[8] !== "delivered") {
      return NextResponse.json({ error: "この商品の配達完了済みの注文を確認できませんでした" }, { status: 403 });
    }
    if (reviews.some(review => review.orderNumber === orderNumber && review.productId === productId)) {
      return NextResponse.json({ error: "この注文・商品には既にレビューが投稿されています" }, { status: 409 });
    }
    const checkoutId = String(order[9] ?? "");
    if (!checkoutId.startsWith("cs_")) {
      return NextResponse.json({ error: "この注文の商品情報を確認できませんでした" }, { status: 403 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const checkout = await stripe.checkout.sessions.retrieve(checkoutId);
    const paymentIntentId = typeof checkout.payment_intent === "string"
      ? checkout.payment_intent : checkout.payment_intent?.id;
    if (!paymentIntentId) {
      return NextResponse.json({ error: "決済情報を確認できませんでした" }, { status: 403 });
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const cartItems = paymentIntent.metadata?.cartItems ?? "";
    const purchasedIds = cartItems.split(",").map(part => part.match(/^(.*):(\d+)$/)?.[1]).filter(Boolean);
    if (checkout.payment_status !== "paid" || !purchasedIds.includes(productId)) {
      return NextResponse.json({ error: "この注文で対象商品を購入した記録を確認できませんでした" }, { status: 403 });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${REVIEW_SHEET}'!A:K`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [[crypto.randomUUID(), new Date().toISOString(), productId, orderNumber,
        email, displayName, rating, body, "pending", "", ""]] },
    });
    return NextResponse.json({ message: "レビューを受け付けました。確認後に公開します。" }, { status: 201 });
  } catch (error) {
    console.error("[reviews] submit failed", error);
    return NextResponse.json({ error: "投稿に失敗しました。時間をおいて再度お試しください" }, { status: 500 });
  }
}
