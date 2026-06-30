import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { family, productId, description, stock, deadline } = await req.json() as {
    family: string; productId: string; description?: string; stock?: number | null; deadline?: string;
  };

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "LINE_CHANNEL_ACCESS_TOKEN not set" }, { status: 500 });

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://andoseika.jp";
  const productUrl = productId ? `${baseUrl}/products/${productId}` : `${baseUrl}/products`;

  const deadlineLabel = deadline
    ? deadline.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1年$2月$3日")
    : "";

  const lines = [
    "🚨 畑から緊急のお知らせ",
    "",
    `📦 ${family}`,
    "",
    ...(description ? [description, ""] : []),
    ...(stock != null && stock >= 0 ? [`残り約 ${stock} 点`] : []),
    ...(deadlineLabel ? [`${deadlineLabel} まで数量限定で販売中`] : []),
    "",
    `🛒 購入・詳細はこちら\n${productUrl}`,
  ];

  const lineRes = await fetch("https://api.line.me/v2/bot/message/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages: [{ type: "text", text: lines.join("\n") }] }),
  });

  if (!lineRes.ok) {
    const err = await lineRes.text().catch(() => "");
    return NextResponse.json({ error: `LINE broadcast failed: ${err}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
