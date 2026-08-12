import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// 一時デバッグ用：LINE push APIの生レスポンスを確認する（原因調査後に削除すること）
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== process.env.LINE_CHANNEL_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const to = req.nextUrl.searchParams.get("to");
  if (!to) {
    return NextResponse.json({ error: "missing to" }, { status: 400 });
  }

  const tokenPresent = !!process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const tokenLength = process.env.LINE_CHANNEL_ACCESS_TOKEN?.length ?? 0;

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to, messages: [{ type: "text", text: "【デバッグテスト】この通知が届いていれば送信機能は正常です" }] }),
  });
  const bodyText = await res.text();

  return NextResponse.json({
    tokenPresent,
    tokenLength,
    status: res.status,
    ok: res.ok,
    body: bodyText,
  });
}
