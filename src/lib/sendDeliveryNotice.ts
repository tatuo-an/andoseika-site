import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type DeliveryNoticeParams = {
  customerName: string;
  cycleLabel: string;       // 例: "春便り 2026"
  trackingNumber?: string;
  carrier?: string;         // 例: "ヤマト運輸"
  baseUrl: string;
};

function buildLines(p: DeliveryNoticeParams): string[] {
  const lines = [
    `🌿 ${p.customerName} 様`,
    "",
    `${p.cycleLabel}（旬の詰め合わせ）を発送いたしました。`,
    "",
  ];
  if (p.trackingNumber) {
    lines.push(`追跡番号：${p.trackingNumber}`);
    if (p.carrier) lines.push(`配送業者：${p.carrier}`);
    lines.push("");
  }
  lines.push("お受け取りまでもうしばらくお待ちください。");
  lines.push("");
  lines.push(`配送状況：${p.baseUrl}/mypage/supporter`);
  return lines;
}

export async function sendDeliveryLine(lineUserId: string, params: DeliveryNoticeParams): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");
  const text = buildLines(params).join("\n");
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: lineUserId, messages: [{ type: "text", text }] }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`LINE push failed (${res.status}): ${errText}`);
  }
}

export async function sendDeliveryEmail(to: string, params: DeliveryNoticeParams): Promise<void> {
  if (!resend) return;
  const lines = buildLines(params);
  const html = `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#4a7c59;padding:32px 40px;text-align:center;">
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0 0 6px;">&YOU 安藤青果</p>
      <h1 style="color:#fff;font-size:20px;margin:0;font-weight:bold;">詰め合わせを発送しました</h1>
    </div>
    <div style="padding:36px 40px;color:#44403c;font-size:14px;line-height:1.8;">
      ${lines.map((l) => (l ? `<p style="margin:0 0 8px;">${l}</p>` : '<p style="margin:0 0 8px;">&nbsp;</p>')).join("")}
      <div style="text-align:center;margin-top:24px;">
        <a href="${params.baseUrl}/mypage/supporter" style="display:inline-block;background:#4a7c59;color:#fff;font-size:14px;font-weight:bold;padding:14px 32px;border-radius:100px;text-decoration:none;">配送状況を確認する</a>
      </div>
    </div>
    <div style="background:#f5f5f0;padding:24px 40px;text-align:center;border-top:1px solid #e7e5e4;">
      <p style="color:#a8a29e;font-size:12px;margin:0 0 4px;">&YOU 安藤青果</p>
      <p style="color:#a8a29e;font-size:12px;margin:0;">鳥取県倉吉市・北栄町</p>
    </div>
  </div>
</body>
</html>`.trim();

  await resend.emails.send({
    from: "安藤青果 <onboarding@resend.dev>",
    replyTo: "imamura0510@gmail.com",
    to,
    subject: `【安藤青果】${params.cycleLabel} 発送のお知らせ`,
    html,
  });
}
