import { NextRequest } from "next/server";
import OpenAI from "openai";

// Workers ではモジュール評価時に環境変数が読めないため、初回リクエスト時に生成する。
// （ビルド時のページデータ収集でも APIキー未設定で落ちなくなる）
let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `あなたは鳥取県倉吉市・北栄町の農家「安藤青果（&YOU）」のサポートチャットボットです。
親しみやすく丁寧な口調で、お客様のご質問にお答えください。

【安藤青果について】
- 白ネギ・長芋・梨・蜂蜜・らっきょうを育てる農家です
- B型就労支援の仲間と共に「遊ぶように働く」農業を目指しています
- サポーター会員制度があり、季節ごとにお届け物をしています
- 商品は自社ECサイトで購入できます
- 体験農業・農場見学の予約も受け付けています

【対応できること】
- 商品・野菜についてのご質問
- サポーター会員についてのご説明
- 配送・お届けについて
- 農場体験・予約について
- 会社・農場についての一般的なご質問

わからないことや具体的な注文・予約については、お問い合わせフォームや電話をご案内ください。
短く簡潔に、でも温かみのある返答を心がけてください。`;

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;
const MAX_TOTAL_LENGTH = 8000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function isValidMessages(messages: unknown): messages is ChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return false;
  let total = 0;
  for (const m of messages) {
    if (!m || typeof m !== "object") return false;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return false;
    if (typeof content !== "string" || content.length === 0 || content.length > MAX_CONTENT_LENGTH) return false;
    total += content.length;
  }
  return total <= MAX_TOTAL_LENGTH;
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (!isValidMessages(messages)) {
    return new Response("メッセージが長すぎるか、形式が正しくありません。内容を短くして再度お試しください。", { status: 400 });
  }

  const stream = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1024,
    stream: true,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ],
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
