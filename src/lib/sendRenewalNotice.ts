import { sendMail, isMailerConfigured } from "@/lib/mailer";

type RenewalParams = {
  customerName: string;
  planName: string;
  planPrice: number;
  renewalDate: string;   // YYYY-MM-DD
  daysUntil: number;     // 30 or 7
  baseUrl: string;
};

function buildMessageLines(p: RenewalParams): string[] {
  return [
    `🌿 ${p.customerName} 様`,
    "",
    `現在ご利用中の「${p.planName}」は、${p.daysUntil}日後（${p.renewalDate}）に契約期間が終了します。`,
    `次回更新日に同じプランへ自動更新される場合の年会費は ¥${p.planPrice.toLocaleString()}（税込）です。`,
    "",
    "次回更新を希望されない場合は、契約期間終了の前日までにマイページから自動更新を停止してください。",
    "",
    `マイページ：${p.baseUrl}/mypage/supporter`,
  ];
}

export async function sendRenewalEmail(to: string, params: RenewalParams): Promise<void> {
  if (!isMailerConfigured()) return;

  const lines = buildMessageLines(params);
  const html = `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#4a7c59;padding:32px 40px;text-align:center;">
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0 0 6px;">&YOU 安藤青果</p>
      <h1 style="color:#fff;font-size:20px;margin:0;font-weight:bold;">サポータープラン 更新のご案内</h1>
    </div>
    <div style="padding:36px 40px;color:#44403c;font-size:14px;line-height:1.8;">
      ${lines.map((l) => l ? `<p style="margin:0 0 8px;">${l}</p>` : `<p style="margin:0 0 8px;">&nbsp;</p>`).join("")}
      <div style="text-align:center;margin-top:24px;">
        <a href="${params.baseUrl}/mypage/supporter"
           style="display:inline-block;background:#4a7c59;color:#fff;font-size:14px;font-weight:bold;padding:14px 32px;border-radius:100px;text-decoration:none;">
          マイページで確認する
        </a>
      </div>
    </div>
    <div style="background:#f5f5f0;padding:24px 40px;text-align:center;border-top:1px solid #e7e5e4;">
      <p style="color:#a8a29e;font-size:12px;margin:0 0 4px;">&YOU 安藤青果</p>
      <p style="color:#a8a29e;font-size:12px;margin:0;">鳥取県倉吉市・北栄町</p>
    </div>
  </div>
</body>
</html>`.trim();

  await sendMail({
    to,
    subject: `【安藤青果】サポータープラン更新のご案内（${params.daysUntil}日前）`,
    html,
  });
}

export async function sendRenewalLine(lineUserId: string, params: RenewalParams): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");

  const text = buildMessageLines(params).join("\n");
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ to: lineUserId, messages: [{ type: "text", text }] }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`LINE push failed (${res.status}): ${errText}`);
  }
}
