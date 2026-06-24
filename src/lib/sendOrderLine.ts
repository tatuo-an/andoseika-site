/**
 * LINE Messaging API で注文確認 push メッセージを送信する。
 *
 * 前提：
 * - 送信先 lineUserId は LINE Login で取得した sub（Login と Messaging が同一 Provider の場合のみ共通）
 * - ユーザーが Messaging チャネルの公式アカウントを友だち追加済みであること
 * - 友だち未追加・チャネル不一致の場合は 400/403 が返る
 *
 * 失敗時は throw する。呼び出し側でメール送信などフォールバックすること。
 */

type OrderLineParams = {
  lineUserId: string;
  customerName: string;
  orderNumber: string;
  productNames: string;
  amount: string; // 円単位の整数文字列
  estimatedDate: string;
  baseUrl: string; // マイページリンク用
};

export async function sendOrderLineNotification(params: OrderLineParams): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");

  const { lineUserId, customerName, orderNumber, productNames, amount, estimatedDate, baseUrl } = params;

  const lines: string[] = [
    `🌿 ${customerName} 様`,
    "",
    "ご注文ありがとうございます。",
    "下記の内容で受け付けました。",
    "",
    `注文番号：${orderNumber}`,
    `商品：${productNames}`,
    `合計金額：¥${parseInt(amount || "0", 10).toLocaleString()}（税込）`,
  ];
  if (estimatedDate) lines.push(`お届け予定：${estimatedDate}`);
  lines.push("");
  lines.push("発送準備ができ次第、改めてご連絡いたします。");
  lines.push("");
  lines.push(`注文履歴：${baseUrl}/mypage/orders`);

  const body = {
    to: lineUserId,
    messages: [{ type: "text", text: lines.join("\n") }],
  };

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`LINE push failed (${res.status}): ${errText}`);
  }
}
