import nodemailer from "nodemailer";
import { Resend } from "resend";

/**
 * 統一メール送信ヘルパー。
 *
 * 優先順位：
 *   1. GMAIL_USER + GMAIL_APP_PASSWORD が設定されていれば Gmail SMTP（Nodemailer）
 *   2. RESEND_API_KEY が設定されていれば Resend
 *   3. どちらも未設定なら何もしない（ベストエフォート）
 */

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

const gmailUser = process.env.GMAIL_USER ?? "";
const gmailPass = process.env.GMAIL_APP_PASSWORD ?? "";
const resendKey = process.env.RESEND_API_KEY ?? "";

const gmailTransporter = gmailUser && gmailPass
  ? nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    })
  : null;

const resend = !gmailTransporter && resendKey ? new Resend(resendKey) : null;

export function isMailerConfigured(): boolean {
  return !!gmailTransporter || !!resend;
}

export function activeMailerName(): string {
  if (gmailTransporter) return "gmail";
  if (resend) return "resend";
  return "none";
}

const FROM_NAME = "安藤青果";
const FROM_GMAIL = gmailUser;
const FROM_RESEND = "onboarding@resend.dev";
/**
 * 返信先（Reply-To）の解決順：
 *   1. 関数呼び出し時の引数 replyTo
 *   2. 環境変数 MAIL_REPLY_TO
 *   3. GMAIL_USER（送信元と同じにするのが自然）
 *   4. ハードコードのフォールバック
 */
const REPLY_TO_DEFAULT = process.env.MAIL_REPLY_TO || gmailUser || "imamura0510@gmail.com";

export async function sendMail({ to, subject, html, replyTo }: SendArgs): Promise<void> {
  if (gmailTransporter) {
    await gmailTransporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_GMAIL}>`,
      to,
      subject,
      html,
      replyTo: replyTo ?? REPLY_TO_DEFAULT,
    });
    return;
  }
  if (resend) {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_RESEND}>`,
      replyTo: replyTo ?? REPLY_TO_DEFAULT,
      to,
      subject,
      html,
    });
    return;
  }
  // 未設定なら何もしない
}
