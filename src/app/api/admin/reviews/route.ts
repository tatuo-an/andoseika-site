import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { readReviews, reviewSheets, reviewSpreadsheetId, REVIEW_SHEET } from "@/lib/productReviews";

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
    const review = (await readReviews()).find(item => item.id === id);
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await reviewSheets().spreadsheets.values.update({
      spreadsheetId: reviewSpreadsheetId(),
      range: `'${REVIEW_SHEET}'!I${review.rowNumber}:K${review.rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [[status, new Date().toISOString(), session!.user!.email ?? ""]] },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/reviews] update failed", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
