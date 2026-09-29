import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import {
  listLineGroupAutoReplySettings,
  updateLineGroupAutoReplySetting,
} from "@/lib/line-group-auto-reply-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const groups = await listLineGroupAutoReplySettings();
    return NextResponse.json({ groups });
  } catch (err) {
    console.error("[line-group-settings GET]", err);
    return NextResponse.json({ error: "グループ設定を読み込めませんでした" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { groupId?: unknown; autoReplyEnabled?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const groupId = typeof body.groupId === "string" ? body.groupId.trim() : "";
  if (!groupId || typeof body.autoReplyEnabled !== "boolean") {
    return NextResponse.json({ error: "groupId と autoReplyEnabled が必要です" }, { status: 400 });
  }

  try {
    const setting = await updateLineGroupAutoReplySetting(
      groupId,
      body.autoReplyEnabled,
      session?.user?.email || "admin"
    );
    if (!setting) {
      return NextResponse.json({ error: "対象グループが見つかりません" }, { status: 404 });
    }
    return NextResponse.json({ setting });
  } catch (err) {
    console.error("[line-group-settings PATCH]", err);
    return NextResponse.json({ error: "グループ設定を更新できませんでした" }, { status: 500 });
  }
}
