import { Resend } from "resend";

/**
 * 統一メール送信ヘルパー（Cloudflare Workers 版）。
 *
 * Vercel 時代は Gmail SMTP（Nodemailer）を優先していたが、Workers は生の TCP を
 * 張れないため SMTP が使えない。送信経路は Resend の API 一本に統一する。
 *
 *   RESEND_API_KEY が設定されていれば Resend で送信、未設定なら何もしない（ベストエフォート）。
 *
 * 環境変数はモジュール評価時ではなく呼び出し時に読む
 * （Workers ではモジュール評価の時点で env が未注入のことがあるため）。
 */

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

const FROM_NAME = "安藤青果";

/** 送信元アドレス。独自ドメインを Resend で検証したら MAIL_FROM に設定する。 */
function fromAddress(): string {
  return process.env.MAIL_FROM || "onboarding@resend.dev";
}

/**
 * 返信先（Reply-To）の解決順：
 *   1. 関数呼び出し時の引数 replyTo
 *   2. 環境変数 MAIL_REPLY_TO
 *   3. ハードコードのフォールバック
 */
function defaultReplyTo(): string {
  return process.env.MAIL_REPLY_TO || "imamura0510@gmail.com";
}

let cached: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY ?? "";
  if (!key) return null;
  if (!cached) cached = new Resend(key);
  return cached;
}

export function isMailerConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY ?? "");
}

export function activeMailerName(): string {
  return isMailerConfigured() ? "resend" : "none";
}

export async function sendMail({ to, subject, html, replyTo }: SendArgs): Promise<void> {
  const resend = getResend();
  if (!resend) return; // 未設定なら何もしない

  await resend.emails.send({
    from: `${FROM_NAME} <${fromAddress()}>`,
    replyTo: replyTo ?? defaultReplyTo(),
    to,
    subject,
    html,
  });
}
