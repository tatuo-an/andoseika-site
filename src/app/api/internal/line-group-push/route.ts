import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { SHIIRE_GROUP_ID } from "@/lib/line-group-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PUSH_KEY_SHA256 = "ca144f466f0a07488dd2999a685b46a049cea429631ef4dbf6410709f94a52e0";

function hasValidPushKey(authorization: string) {
  if (!authorization.startsWith("Bearer ")) return false;
  const actual = createHash("sha256").update(authorization.slice(7)).digest();
  const expected = Buffer.from(PUSH_KEY_SHA256, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization") ?? "";
  if (!hasValidPushKey(authorization)) {
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
