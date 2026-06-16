import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

function normalizePhone(p: string): string {
  if (!p) return p;
  const digits = p.replace(/\D/g, "");
  if (digits.length === 10 && !digits.startsWith("0")) return "0" + digits;
  if (digits.length === 10 || digits.length === 11) return digits;
  return p;
}

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
  complaint: string;
  estimatedDate: string;
};

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
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
    range: "注文管理!A:O",
  });
  const rows = res.data.values ?? [];

  const orders: Order[] = rows
    .filter((r) => r[0] && r[0] !== "注文番号")
    .map((r) => ({
      orderNumber: r[0] ?? "",
      createdAt: r[1] ?? "",
      name: r[2] ?? "",
      email: r[3] ?? "",
      phone: normalizePhone(r[4] ?? ""),
      address: r[5] ?? "",
      productNames: r[6] ?? "",
      amount: parseInt(r[7] ?? "0", 10) || 0,
      status: r[8] ?? "paid",
      sessionId: r[9] ?? "",
      desiredDate: r[10] ?? "",
      desiredTime: r[11] ?? "",
      complaint: r[12] ?? "",
      estimatedDate: r[14] ?? "",
    }))
    .reverse();

  return NextResponse.json({ orders });
}
