import { isMailerConfigured, sendMail } from "@/lib/mailer";

type BookingNotificationParams = {
  startTime: string;
};

const EXPERIENCE_URL = "https://ando-seika.com/experience";
const MEETING_ADDRESS = "〒689-2105\n鳥取県東伯郡北栄町下神1049-695付近";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildBookingConfirmationMessage({ startTime }: BookingNotificationParams): string {
  return [
    "ご予約ありがとうございます😊",
    `当日は${startTime}に、ゴルフプラザ・ニューストライプ付近へ集合をお願いいたします。`,
    MEETING_ADDRESS,
    "また、事前にこちらの注意事項をご確認ください。",
    EXPERIENCE_URL,
    "当日はお気をつけてお越しください🐝",
  ].join("\n");
}

export async function sendBookingLineNotification(lineUserId: string, params: BookingNotificationParams): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{ type: "text", text: buildBookingConfirmationMessage(params) }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`LINE push failed (${res.status}): ${detail}`);
  }
}

export async function sendBookingEmailNotification(email: string, params: BookingNotificationParams): Promise<boolean> {
  if (!email || email.endsWith("@line.user") || !isMailerConfigured()) return false;

  const text = buildBookingConfirmationMessage(params);
  const html = text
    .split("\n")
    .map((line) => line === EXPERIENCE_URL
      ? `<a href="${EXPERIENCE_URL}">${EXPERIENCE_URL}</a>`
      : escapeHtml(line))
    .join("<br>");

  await sendMail({
    to: email,
    subject: "【安藤青果】体験予約を受け付けました",
    html: `<p>${html}</p>`,
  });
  return true;
}
