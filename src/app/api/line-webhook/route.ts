import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { google } from "googleapis";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `あなたは鳥取県倉吉市・北栄町の農家「安藤青果（&YOU）」のLINEサポートスタッフです。
親しみやすく丁寧な口調で、お客様のご質問にお答えください。

【安藤青果について】
- 白ネギ・長芋・梨・蜂蜜・らっきょうを育てる農家です
- B型就労支援の仲間と共に「遊ぶように働く」農業を目指しています
- サポーター会員制度があり、季節ごとにお届け物をしています
- 商品は自社ECサイト（https://andoseika.jp）で購入できます
- 体験農業・農場見学の予約も受け付けています

【対応できること】
- 商品・野菜についてのご質問
- サポーター会員についてのご説明
- 配送・お届けについて
- 農場体験・予約について
- 会社・農場についての一般的なご質問

わからないことや具体的な注文・予約については、お問い合わせフォームや電話をご案内ください。
短く簡潔に、でも温かみのある返答を心がけてください。LINEなので改行を適度に使い、読みやすくしてください。`;

async function getBotKeyword(): Promise<string> {
  try {
    const a = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth: a });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: "設定!A:B",
    });
    const rows = res.data.values ?? [];
    const row = rows.find((r) => r[0] === "line_bot_keyword");
    return row?.[1] ?? "おしえて安藤さん";
  } catch {
    return "おしえて安藤さん";
  }
}

function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha256", process.env.LINE_CHANNEL_SECRET!)
    .update(body)
    .digest("base64");
  return hash === signature;
}

async function replyToLine(replyToken: string, text: string) {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-line-signature") ?? "";

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const data = JSON.parse(body);
  const events = data.events ?? [];

  const triggerKeyword = await getBotKeyword();

  for (const event of events) {
    if (event.type !== "message" || event.message.type !== "text") continue;

    const userText: string = event.message.text;
    const replyToken: string = event.replyToken;

    if (!userText.includes(triggerKeyword)) continue;

    try {
      const response = await client.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 1024,
        thinking: { type: "adaptive" },
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userText }],
      });

      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");

      await replyToLine(replyToken, text);
    } catch {
      await replyToLine(replyToken, "申し訳ありません、少し時間をおいてから再度お試しください🙏");
    }
  }

  return NextResponse.json({ ok: true });
}
