import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// 管理者ごとに5秒間のクールダウン（連打防止）
const cooldown = new Map<string, number>();
const COOLDOWN_MS = 5000;

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const SYSTEM_PROMPT = `あなたは農家「安藤青果（&YOU）」の商品説明文を書くアシスタントです。
管理者から提供された商品情報だけを参照し、一般のお客様向けに自然で親しみやすい日本語の商品説明を1段落（150〜250文字程度）で生成してください。

【厳守事項】
- 提供された情報に書かれていない事実（産地、内容量、重量、個数、品種、栽培方法、農薬使用、収穫日、味・甘さの度合い等）を絶対に作らない・推測しない
- 「最高級」「絶対」「日本一」「無農薬」「有機」「非加熱」などの根拠が必要な表現を勝手に追加しない
- 医療効果・健康効果を断定しない
- 法律上の根拠が必要な表示（特定栄養成分の効能等）を追加しない
- 大げさな広告表現を避ける
- 安藤青果らしい、親しみやすく誠実な口調にする
- 提供された情報が不足する場合は、無理に書き上げず、JSON形式で {"insufficient": true, "missing": ["不足項目1", "不足項目2"]} を返す

【出力形式】
本文だけを書いてください（前置き・補足・コードブロック禁止）。情報不足の場合のみ上記JSONを返してください。`;

export async function POST(req: NextRequest) {
  if (!client) {
    return NextResponse.json({ error: "AI機能が設定されていません（ANTHROPIC_API_KEY 未設定）" }, { status: 503 });
  }

  const session = await auth();
  const email = session?.user?.email;
  if (!email || !isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const last = cooldown.get(email) ?? 0;
  if (Date.now() - last < COOLDOWN_MS) {
    return NextResponse.json({ error: "短時間に連続して実行できません。少し時間を空けてください。" }, { status: 429 });
  }
  cooldown.set(email, Date.now());

  let body: { family?: string; variations?: string[]; category?: string; badges?: string[]; current?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const family = (body.family ?? "").trim();
  const variations = (body.variations ?? []).filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim());
  const category = (body.category ?? "").trim();
  const badges = (body.badges ?? []).filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim());
  const current = (body.current ?? "").trim();

  // 最低限、商品名 or バリエーション名がないと生成不可
  if (!family && variations.length === 0) {
    return NextResponse.json({
      insufficient: true,
      missing: ["商品名（ファミリー名）"],
    });
  }

  const productInfo: string[] = [];
  if (family) productInfo.push(`商品名（ファミリー）: ${family}`);
  if (variations.length > 0) productInfo.push(`バリエーション: ${variations.join(" / ")}`);
  if (category) productInfo.push(`カテゴリー: ${category}`);
  if (badges.length > 0) productInfo.push(`バッジ・属性: ${badges.join(", ")}`);
  if (current) productInfo.push(`現在入力されている商品説明（参考、書き換える場合は整理）:\n${current}`);

  const userMessage = `以下の商品情報をもとに、商品説明文の下書きを1段落で書いてください。

${productInfo.join("\n")}`;

  try {
    const res = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    // 情報不足 JSON の検出
    if (text.startsWith("{") && text.includes("insufficient")) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.insufficient) {
          return NextResponse.json({ insufficient: true, missing: parsed.missing ?? [] });
        }
      } catch { /* fall through to return as text */ }
    }

    return NextResponse.json({ draft: text });
  } catch (err) {
    console.error("[ai-draft-description] error", err);
    return NextResponse.json({ error: "AI生成に失敗しました。しばらくしてお試しください。" }, { status: 500 });
  }
}
