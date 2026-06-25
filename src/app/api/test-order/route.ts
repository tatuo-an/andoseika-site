import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { cartDetails, shippingAddress, desiredDeliveryDate, desiredDeliveryTime, grandTotal, shipMode, shipValue } =
    await req.json() as { cartDetails: Record<string, { name: string; quantity: number }>; shippingAddress?: { name?: string; postalCode?: string; prefecture?: string; city?: string; street?: string; building?: string; phone?: string }; desiredDeliveryDate?: string; desiredDeliveryTime?: string; grandTotal?: number; shipMode?: string; shipValue?: string };

  const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const date = new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  const orderNumber = `TEST-${date}-${rand}`;

  const productNames = Object.values(cartDetails as Record<string, { name: string; quantity: number }>)
    .map((item) => `${item.name} ×${item.quantity}`)
    .join(", ");

  const address = shippingAddress
    ? `${shippingAddress.postalCode} ${shippingAddress.prefecture}${shippingAddress.city}${shippingAddress.street}${shippingAddress.building ? " " + shippingAddress.building : ""}`
    : "";

  const estimatedDate = (() => {
    if (desiredDeliveryDate) return desiredDeliveryDate;
    if (!shipMode || !shipValue) return "";
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    if (shipMode === "days") {
      const [minStr, maxStr] = shipValue.split("-");
      const minDays = parseInt(minStr ?? "", 10);
      const maxDays = parseInt(maxStr ?? "", 10);
      if (isNaN(minDays) && isNaN(maxDays)) return "";
      const fmt = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
      if (!isNaN(minDays) && !isNaN(maxDays)) {
        const from = new Date(now); from.setDate(from.getDate() + minDays);
        const to = new Date(now); to.setDate(to.getDate() + maxDays);
        return `${fmt(from)}〜${fmt(to)}頃`;
      }
      const days = !isNaN(minDays) ? minDays : maxDays;
      const d = new Date(now); d.setDate(d.getDate() + days);
      return `${fmt(d)}頃`;
    }
    if (shipMode === "weekdays") {
      const WD_MAP: Record<string, number> = { 日: 0, 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6 };
      const targetWDs = shipValue.split(",").map((s: string) => WD_MAP[s.trim()]).filter((n: number | undefined) => n !== undefined) as number[];
      if (targetWDs.length === 0) return "";
      const todayWD = now.getDay();
      let minDiff = 7;
      for (const wd of targetWDs) { let diff = wd - todayWD; if (diff <= 0) diff += 7; if (diff < minDiff) minDiff = diff; }
      const shipDate = new Date(now); shipDate.setDate(shipDate.getDate() + minDiff);
      const from = new Date(shipDate); from.setDate(from.getDate() + 1);
      const to = new Date(shipDate); to.setDate(to.getDate() + 2);
      const fmt = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
      return `${fmt(from)}〜${fmt(to)}頃`;
    }
    return "";
  })();

  const authClient = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth: authClient });
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
  // append の自動テーブル境界判定が列ずれを起こすため、A列の最終行を取って明示的にupdateする
  const a = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "注文管理!A:A",
  });
  const nextRow = (a.data.values?.length ?? 0) + 1;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `注文管理!A${nextRow}:O${nextRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        orderNumber, now,
        shippingAddress?.name ?? session?.user?.name ?? "",
        session?.user?.email ?? "",
        shippingAddress?.phone ? `'${shippingAddress.phone}` : "",
        address,
        productNames,
        String(grandTotal ?? 0),
        "paid",
        "TEST",
        desiredDeliveryDate ?? "",
        desiredDeliveryTime ?? "",
        "", "", estimatedDate,
      ]],
    },
  });

  return NextResponse.json({ ok: true, orderNumber });
}
