import { NextRequest, NextResponse } from "next/server";
import { SHIIRE_GROUP_ID } from "@/lib/line-group-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const expected = process.env.LINE_GROUP_PUSH_KEY;
  const authorization = req.headers.get("authorization") ?? "";
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 4900) {
    return NextResponse.json({ ok: false, error: "Invalid text" }, { status: 400 });
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: SHIIRE_GROUP_ID,
      messages: [{ type: "text", text }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`[line-group-push] LINE API ${response.status}: ${detail}`);
    return NextResponse.json({ ok: false, error: "LINE push failed", status: response.status }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
