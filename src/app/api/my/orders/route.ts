import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // ?all=1 のときは全件（/mypage/orders 用）。指定なしはマイページ用に最新5件。
  const all = new URL(req.url).searchParams.get("all") === "1";

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authClient = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth: authClient });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: "注文管理!A:O",
  });

  const rows = res.data.values ?? [];
  const email = session.user.email;

  const orders = rows
    .filter((r) => r[3] === email && r[0])
    .map((r) => ({
      orderNumber: r[0] ?? "",
      createdAt: r[1] ?? "",
      productNames: r[6] ?? "",
      amount: parseInt(r[7] ?? "0", 10) || 0,
      status: r[8] ?? "paid",
      desiredDate: r[10] ?? "",
      estimatedDate: r[14] ?? "",
    }))
    .reverse();

  return NextResponse.json({ orders: all ? orders : orders.slice(0, 5) });
}

