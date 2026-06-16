import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

const ADMIN_EMAIL = "imamura0510@gmail.com";

export type Order = {
  orderNumber: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  productNames: string;
  amount: number;
  status: string;
  sessionId: string;
  desiredDate: string;
  desiredTime: string;
};

export async function GET() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    range: "注文管理!A:L",
  });
  const rows = res.data.values ?? [];

  const orders: Order[] = rows
    .filter((r) => r[0] && r[0] !== "注文番号")
    .map((r) => ({
      orderNumber: r[0] ?? "",
      createdAt: r[1] ?? "",
      name: r[2] ?? "",
      email: r[3] ?? "",
      phone: r[4] ?? "",
      address: r[5] ?? "",
      productNames: r[6] ?? "",
      amount: parseInt(r[7] ?? "0", 10) || 0,
      status: r[8] ?? "paid",
      sessionId: r[9] ?? "",
      desiredDate: r[10] ?? "",
      desiredTime: r[11] ?? "",
    }))
    .reverse();

  return NextResponse.json({ orders });
}
