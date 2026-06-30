import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { sendOrderLineNotification } from "@/lib/sendOrderLine";
import { sendMail } from "@/lib/mailer";

function getSheets() {
  const a = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: a });
}

export async function GET(_: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { orderNumber } = await params;
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: "注文メッセージ!A:E",
  }).catch(() => ({ data: { values: [] } }));

  const messages = ((res.data.values ?? []) as string[][])
    .filter((r) => r[0] === orderNumber)
    .map((r) => ({ orderNumber: r[0], senderType: r[1], senderName: r[2], message: r[3], sentAt: r[4] }));

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { orderNumber } = await params;
  const { message } = await req.json() as { message: string };
  if (!message?.trim()) return NextResponse.json({ error: "Empty" }, { status: 400 });

  const sheets = getSheets();
  const sentAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: "注文メッセージ!A:E",
    valueInputOption: "RAW",
    requestBody: { values: [[orderNumber, "admin", "安藤青果", message.trim(), sentAt]] },
  });

  // 注文情報を取得してLINE/メール通知
  try {
    const orderRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: "注文管理!A:Q",
    });
    const rows = (orderRes.data.values ?? []) as string[][];
    const orderRow = rows.find((r) => r[0] === orderNumber);
    if (orderRow) {
      const customerName = orderRow[2] ?? "";
      const email = orderRow[3] ?? "";
      const productNames = orderRow[6] ?? "";

      // LINE userId 検索
      let lineUserId = "";
      if (email) {
        const masterRes = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
          range: "顧客マスタ!A:H",
        });
        const masterRows = (masterRes.data.values ?? []) as string[][];
        const profileRow = masterRows.find((r) => r[0] === email && r[1] === "__profile__");
        lineUserId = profileRow?.[7] ?? "";
      }

      const baseUrl = process.env.NEXT_PUBLIC_URL || "https://andoseika.jp";
      let sentViaLine = false;
      if (lineUserId) {
        try {
          await sendOrderLineNotification({
            lineUserId,
            customerName: customerName || "お客様",
            orderNumber,
            productNames,
            amount: orderRow[7] ?? "",
            estimatedDate: orderRow[14] ?? "",
            baseUrl,
            customMessage: message.trim(),
          });
          sentViaLine = true;
        } catch (e) {
          console.error("[message] LINE push failed", e);
        }
      }
      if (!sentViaLine && email) {
        await sendMail({
          to: email,
          subject: `【安藤青果】${orderNumber} ご連絡`,
          html: `<p>${(customerName || "お客様")}様</p><p>${message.trim().replace(/\n/g, "<br>")}</p><p>安藤青果 &amp;YOU</p>`,
        }).catch((e) => console.error("[message] email failed", e));
      }
    }
  } catch (e) {
    console.error("[message] notification failed", e);
  }

  return NextResponse.json({ ok: true, sentAt });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { orderNumber } = await params;
  const { sentAt } = await req.json() as { sentAt: string };

  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: "注文メッセージ!A:E" });
  const rows = (res.data.values ?? []) as string[][];
  const rowIndex = rows.findIndex((r) => r[0] === orderNumber && r[1] === "admin" && r[4] === sentAt);
  if (rowIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `注文メッセージ!D${rowIndex + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [["__retracted__"]] },
  });

  return NextResponse.json({ ok: true });
}
