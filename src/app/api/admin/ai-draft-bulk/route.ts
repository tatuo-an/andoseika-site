import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const cooldown = new Map<string, number>();
const COOLDOWN_MS = 5000;

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// 各項目の AI への指示と目安長さ
const FIELD_SPECS: Record<string, { label: string; intro: string; length: string }> = {
  description: {
    label: "商品説明",
    intro: "商品全体の魅力を1段落で伝える。",
    length: "150〜250文字",
  },
  feature: {
    label: "特徴",
    intro: "商品の特徴を箇条書きまたは短い文章で。",
    length: "80〜180文字",
  },
  sizeNote: {
    label: "個数・本数・サイズの補足",
    intro: "提供された情報から読み取れる範囲のみ。断定的な本数や重量は書かない。",
    length: "50〜120文字",
  },
  storage: {
    label: "保存方法",
    intro: "商品名・カテゴリーから無難に推測できる範囲のみ。具体的な温度や日数は書かない。",
    length: "50〜120文字",
  },
  recommended: {
    label: "おすすめの食べ方",
    intro: "1〜2例。商品名から自然に想像できる範囲のみ。",
    length: "80〜180文字",
  },
  notes: {
    label: "注意事項",
    intro: "購入前に知っておくべき一般的な注意事項。アレルゲンや栄養成分には触れない。",
    length: "50〜150文字",
  },
  handling: {
    label: "到着後の取り扱い",
    intro: "到着後の一般的な案内。",
    length: "50〜150文字",
  },
  imperfect: {
    label: "訳あり商品の説明",
    intro: "規格外の理由やお得感。実際の状態を断定しない。",
    length: "80〜180文字",
  },
};

const BASE_RULES = `【厳守事項】
- 提供された情報に書かれていない事実（産地、内容量、重量、個数、品種、栽培方法、農薬使用、収穫日、味・甘さの度合い等）を絶対に作らない・推測しない
- 「最高級」「絶対」「日本一」「無農薬」「有機」「非加熱」などの根拠が必要な表現を勝手に追加しない
- 医療効果・健康効果を断定しない
- 法律上の根拠が必要な表示（特定栄養成分の効能等）を追加しない
- 大げさな広告表現を避ける
- 安藤青果らしい、親しみやすく誠実な口調にする
- 同じ内容を複数の項目で繰り返さない（重複防止）`;

type RequestBody = {
  family?: string;
  variations?: string[];
  category?: string;
  badges?: string[];
  currentValues?: Record<string, string>;
  fields?: string[];
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

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const family = (body.family ?? "").trim();
  const variations = (body.variations ?? []).filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim());
  const category = (body.category ?? "").trim();
  const badges = (body.badges ?? []).filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim());
  const currentValues = body.currentValues ?? {};
  const requestedFields = Array.isArray(body.fields)
    ? body.fields.filter((f) => typeof f === "string" && FIELD_SPECS[f])
    : [];

  if (requestedFields.length === 0) {
    return NextResponse.json({ error: "生成する項目が指定されていません" }, { status: 400 });
  }

  if (!family && variations.length === 0) {
    return NextResponse.json({
      insufficient: true,
      missing: ["商品名（ファミリー名）"],
    });
  }

  // フィールドごとの指示を組み立て
  const fieldInstructions = requestedFields
    .map((f) => {
      const spec = FIELD_SPECS[f];
      return `- "${f}"（${spec.label}・目安${spec.length}）：${spec.intro}`;
    })
    .join("\n");

  const systemPrompt = `あなたは農家「安藤青果（&YOU）」の商品情報を書くアシスタントです。
管理者から提供された商品情報だけを参照し、一般のお客様向けに自然で親しみやすい日本語の商品情報を生成してください。

以下の項目を生成してください：
${fieldInstructions}

${BASE_RULES}

【出力形式】
必ず以下の形式のJSON 1つだけを返してください。前置き・補足・コードブロック・マークダウン記法 一切禁止。

{
${requestedFields.map((f) => `  "${f}": "本文"`).join(",\n")}
}

情報不足で書けない場合は次のJSONを返してください：
{"insufficient": true, "missing": ["不足項目名1", "不足項目名2"]}`;

  // 商品情報を整理
  const productInfo: string[] = [];
  if (family) productInfo.push(`商品名（ファミリー）: ${family}`);
  if (variations.length > 0) productInfo.push(`バリエーション: ${variations.join(" / ")}`);
  if (category) productInfo.push(`カテゴリー: ${category}`);
  if (badges.length > 0) productInfo.push(`バッジ・属性: ${badges.join(", ")}`);

  // 既に入力済みの項目があれば文脈として渡す（重複・矛盾を避けるため）
  const existingEntries = Object.entries(currentValues)
    .filter(([k, v]) => FIELD_SPECS[k] && typeof v === "string" && v.trim())
    .map(([k, v]) => `- ${FIELD_SPECS[k].label}（既入力・参考）: ${v.trim()}`);
  if (existingEntries.length > 0) {
    productInfo.push("【既に入力済みの項目（重複を避けるため参考にしてください）】\n" + existingEntries.join("\n"));
  }

  const userMessage = `以下の商品情報をもとに、指定された項目を生成してください。

${productInfo.join("\n")}`;

  try {
    const res = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: Math.min(4000, 400 * requestedFields.length + 500),
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    // JSON抽出（コードブロックや余分な文字がついていても拾う）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "AI出力の解析に失敗しました", raw: text }, { status: 500 });
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: "AI出力のJSON解析に失敗しました", raw: text }, { status: 500 });
    }

    if (parsed.insufficient) {
      return NextResponse.json({
        insufficient: true,
        missing: Array.isArray(parsed.missing) ? parsed.missing : [],
      });
    }

    // 要求した項目だけ抽出して返す
    const drafts: Record<string, string> = {};
    for (const f of requestedFields) {
      const v = parsed[f];
      if (typeof v === "string") drafts[f] = v.trim();
    }

    return NextResponse.json({ drafts });
  } catch (err) {
    console.error("[ai-draft-bulk] error", err);
    return NextResponse.json({ error: "AI生成に失敗しました。しばらくしてお試しください。" }, { status: 500 });
  }
}
