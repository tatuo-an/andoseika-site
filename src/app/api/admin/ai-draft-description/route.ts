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

const BASE_RULES = `【厳守事項】
- 提供された情報に書かれていない事実（産地、内容量、重量、個数、品種、栽培方法、農薬使用、収穫日、味・甘さの度合い等）を絶対に作らない・推測しない
- 「最高級」「絶対」「日本一」「無農薬」「有機」「非加熱」などの根拠が必要な表現を勝手に追加しない
- 医療効果・健康効果を断定しない
- 法律上の根拠が必要な表示（特定栄養成分の効能等）を追加しない
- 大げさな広告表現を避ける
- 安藤青果らしい、親しみやすく誠実な口調にする
- 提供された情報が不足する場合は、無理に書き上げず、JSON形式で {"insufficient": true, "missing": ["不足項目1", "不足項目2"]} を返す

【出力形式】
本文だけを書いてください（前置き・補足・コードブロック禁止）。情報不足の場合のみ上記JSONを返してください。`;

const FIELD_GUIDANCE: Record<string, { intro: string; length: string }> = {
  description: {
    intro: "商品説明文を1段落で書いてください。",
    length: "150〜250文字程度",
  },
  feature: {
    intro: "この商品の特徴を箇条書きまたは短い文章で書いてください。",
    length: "80〜180文字程度",
  },
  sizeNote: {
    intro: "個数・本数・サイズに関する補足説明を書いてください（提供された情報から読み取れる範囲のみ）。",
    length: "50〜120文字程度",
  },
  storage: {
    intro: "一般的な保存方法を簡潔に書いてください。商品名・カテゴリーから無難に推測できる範囲のみで、断定的な保存温度や日数は書かない。",
    length: "50〜120文字程度",
  },
  recommended: {
    intro: "おすすめの食べ方・調理例を1〜2例書いてください。商品名から自然に想像できる範囲のみ。具体的な配合量や調理時間は書かない。",
    length: "80〜180文字程度",
  },
  notes: {
    intro: "購入前に知っておくべき一般的な注意事項を書いてください（アレルゲンや栄養成分には触れない）。",
    length: "50〜150文字程度",
  },
  handling: {
    intro: "到着後の取り扱いに関する一般的な案内を書いてください。",
    length: "50〜150文字程度",
  },
  imperfect: {
    intro: "訳あり商品としての説明（規格外の理由、お得感など）を書いてください。実際の状態を断定しない。",
    length: "80〜180文字程度",
  },
};

const FIELD_MAX_TOKENS: Record<string, number> = {
  description: 600,
  feature: 400,
  sizeNote: 300,
  storage: 300,
  recommended: 400,
  notes: 350,
  handling: 350,
  imperfect: 400,
};

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

  let body: {
    family?: string;
    variations?: string[];
    category?: string;
    badges?: string[];
    current?: string;
    field?: string;
    fieldLabel?: string;
    contextDescription?: string;
  };
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
  const field = (body.field ?? "description").trim();
  const fieldLabel = (body.fieldLabel ?? "商品説明").trim();
  const contextDescription = (body.contextDescription ?? "").trim();

  if (!family && variations.length === 0) {
    return NextResponse.json({
      insufficient: true,
      missing: ["商品名（ファミリー名）"],
    });
  }

  const guidance = FIELD_GUIDANCE[field] ?? {
    intro: `${fieldLabel}を書いてください。`,
    length: "100〜200文字程度",
  };

  const systemPrompt = `あなたは農家「安藤青果（&YOU）」の商品説明文を書くアシスタントです。
管理者から提供された商品情報だけを参照し、一般のお客様向けに自然で親しみやすい日本語の「${fieldLabel}」を生成してください。
${guidance.intro}
目安の長さ：${guidance.length}。

${BASE_RULES}`;

  const productInfo: string[] = [];
  if (family) productInfo.push(`商品名（ファミリー）: ${family}`);
  if (variations.length > 0) productInfo.push(`バリエーション: ${variations.join(" / ")}`);
  if (category) productInfo.push(`カテゴリー: ${category}`);
  if (badges.length > 0) productInfo.push(`バッジ・属性: ${badges.join(", ")}`);
  if (contextDescription && field !== "description") {
    productInfo.push(`商品説明（文脈参考）:\n${contextDescription}`);
  }
  if (current) productInfo.push(`現在入力されている${fieldLabel}（参考、書き換える場合は整理）:\n${current}`);

  const userMessage = `以下の商品情報をもとに、「${fieldLabel}」の下書きを書いてください。

${productInfo.join("\n")}`;

  try {
    const res = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: FIELD_MAX_TOKENS[field] ?? 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (text.startsWith("{") && text.includes("insufficient")) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.insufficient) {
          return NextResponse.json({ insufficient: true, missing: parsed.missing ?? [] });
        }
      } catch { /* fall through */ }
    }

    return NextResponse.json({ draft: text });
  } catch (err) {
    console.error("[ai-draft-description] error", err);
    return NextResponse.json({ error: "AI生成に失敗しました。しばらくしてお試しください。" }, { status: 500 });
  }
}
