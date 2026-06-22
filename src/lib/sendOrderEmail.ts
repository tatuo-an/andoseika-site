import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type OrderEmailParams = {
  to: string;
  customerName: string;
  orderNumber: string;
  productNames: string;
  amount: string;
  estimatedDate: string;
  address: string;
};

export async function sendOrderConfirmationEmail(params: OrderEmailParams) {
  const { to, customerName, orderNumber, productNames, amount, estimatedDate, address } = params;

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <!-- ヘッダー -->
    <div style="background:#4a7c59;padding:32px 40px;text-align:center;">
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0 0 6px;">&YOU</p>
      <h1 style="color:#fff;font-size:22px;margin:0;font-weight:bold;">ご注文ありがとうございます</h1>
    </div>

    <!-- 本文 -->
    <div style="padding:36px 40px;">
      <p style="color:#44403c;font-size:15px;margin:0 0 24px;">
        ${customerName} 様<br><br>
        この度はご注文いただきありがとうございます。<br>
        以下の内容でご注文を受け付けました。
      </p>

      <!-- 注文情報 -->
      <div style="background:#f5f5f0;border-radius:12px;padding:24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#78716c;font-size:13px;width:120px;">注文番号</td>
            <td style="padding:8px 0;color:#1c1917;font-size:13px;font-weight:bold;">${orderNumber}</td>
          </tr>
          <tr style="border-top:1px solid #e7e5e4;">
            <td style="padding:8px 0;color:#78716c;font-size:13px;">商品</td>
            <td style="padding:8px 0;color:#1c1917;font-size:13px;">${productNames}</td>
          </tr>
          <tr style="border-top:1px solid #e7e5e4;">
            <td style="padding:8px 0;color:#78716c;font-size:13px;">合計金額</td>
            <td style="padding:8px 0;color:#1c1917;font-size:13px;font-weight:bold;">¥${parseInt(amount).toLocaleString()}（税込）</td>
          </tr>
          ${estimatedDate ? `
          <tr style="border-top:1px solid #e7e5e4;">
            <td style="padding:8px 0;color:#78716c;font-size:13px;">お届け予定</td>
            <td style="padding:8px 0;color:#4a7c59;font-size:13px;font-weight:bold;">${estimatedDate}</td>
          </tr>` : ""}
          ${address ? `
          <tr style="border-top:1px solid #e7e5e4;">
            <td style="padding:8px 0;color:#78716c;font-size:13px;">お届け先</td>
            <td style="padding:8px 0;color:#1c1917;font-size:13px;">${address}</td>
          </tr>` : ""}
        </table>
      </div>

      <p style="color:#78716c;font-size:13px;line-height:1.8;margin:0 0 24px;">
        発送の準備ができましたら、改めてご連絡いたします。<br>
        ご不明な点がございましたら、お気軽にご連絡ください。
      </p>

      <!-- サイトリンク -->
      <div style="text-align:center;margin-bottom:8px;">
        <a href="https://ando-seika.vercel.app/mypage/orders"
           style="display:inline-block;background:#4a7c59;color:#fff;font-size:14px;font-weight:bold;padding:14px 32px;border-radius:100px;text-decoration:none;">
          注文履歴を確認する
        </a>
      </div>
    </div>

    <!-- フッター -->
    <div style="background:#f5f5f0;padding:24px 40px;text-align:center;border-top:1px solid #e7e5e4;">
      <p style="color:#a8a29e;font-size:12px;margin:0 0 4px;">&YOU 安藤青果</p>
      <p style="color:#a8a29e;font-size:12px;margin:0;">鳥取県倉吉市・北栄町</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  if (!resend) return;
  await resend.emails.send({
    from: "安藤青果 <onboarding@resend.dev>",
    replyTo: "imamura0510@gmail.com",
    to,
    subject: `【安藤青果】ご注文ありがとうございます（${orderNumber}）`,
    html,
  });
}
