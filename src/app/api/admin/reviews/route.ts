import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { isSameReviewAuthorAndProduct, readReviews, reviewSheets, reviewSpreadsheetId, REVIEW_REWARD_POINTS, REVIEW_SHEET } from "@/lib/productReviews";
import { claimOnceOrVoid } from "@/lib/pointsDedup";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    return NextResponse.json({ reviews: (await readReviews()).reverse() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[admin/reviews] read failed", error);
    return NextResponse.json({ error: "読み込みに失敗しました" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const id = data.id;
  const status = data.status;
  if (typeof id !== "string" || (status !== "approved" && status !== "rejected")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  try {
    const reviews = await readReviews();
    const review = reviews.find(item => item.id === id);
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const firstForProduct = reviews.find(item => isSameReviewAuthorAndProduct(item, review.email, review.productId));
    if (review.status === "duplicate" || firstForProduct?.id !== review.id) {
      return NextResponse.json({ error: "重複したレビューは承認できません" }, { status: 409 });
    }
    await reviewSheets().spreadsheets.values.update({
      spreadsheetId: reviewSpreadsheetId(),
      range: `'${REVIEW_SHEET}'!I${review.rowNumber}:K${review.rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [[status, new Date().toISOString(), session!.user!.email ?? ""]] },
    });
    if (status === "approved") {
      // 承認後に付与する。途中失敗時は同じ承認操作を再実行でき、ポイント履歴側で二重付与を防ぐ。
      const reward = await claimOnceOrVoid({
        email: review.email.trim(),
        type: "review",
        dedupKey: `product=${encodeURIComponent(review.productId)}|`,
        points: REVIEW_REWARD_POINTS,
        memoPrefix: "商品レビュー承認ボーナス",
      });
      return NextResponse.json({ ok: true, pointsAwarded: reward.earned ? REVIEW_REWARD_POINTS : 0 });
    }
    return NextResponse.json({ ok: true, pointsAwarded: 0 });
  } catch (error) {
    console.error("[admin/reviews] update failed", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
