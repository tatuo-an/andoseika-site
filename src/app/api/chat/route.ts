import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const stream = await client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
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
