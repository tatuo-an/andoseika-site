import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { cartDetails, shippingAddress, desiredDeliveryDate, desiredDeliveryTime, grandTotal } =
    await req.json();

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

  const authClient = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth: authClient });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: "注文管理!A:L",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        orderNumber, now,
        shippingAddress?.name ?? session?.user?.name ?? "",
        session?.user?.email ?? "",
        shippingAddress?.phone ?? "",
        address,
        productNames,
        String(grandTotal ?? 0),
        "paid",
        "TEST",
        desiredDeliveryDate ?? "",
        desiredDeliveryTime ?? "",
      ]],
    },
  });

  return NextResponse.json({ ok: true, orderNumber });
}
