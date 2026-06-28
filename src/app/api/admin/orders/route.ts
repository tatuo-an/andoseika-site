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
  salesTransferLog: string;
  buyerName: string; // 購入者氏名（Q列、Apple Pay 等で送り先と異なる場合あり）
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

  // 注文管理シートと顧客マスタを並列取得（過去注文で Q列が空でも購入者名を補完するため）
  const [ordersRes, customersRes] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: "注文管理!A:Q",
    }),
    sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: "顧客マスタ!A:C",
    }).catch(() => ({ data: { values: [] as string[][] } })),
  ]);

  const rows = ordersRes.data.values ?? [];

  // メール→購入者表示名のマップ（顧客マスタの __profile__ 行から）
  const profileNameByEmail = new Map<string, string>();
  for (const r of customersRes.data.values ?? []) {
    if (r[0] && r[1] === "__profile__" && r[2]) {
      profileNameByEmail.set(String(r[0]), String(r[2]));
    }
  }

  const orders: Order[] = rows
    .filter((r) => r[0] && r[0] !== "注文番号")
    .map((r) => {
      const email = r[3] ?? "";
      const buyerFromQ = r[16] ?? "";
      // Q列が空の場合は顧客マスタの__profile__から購入者名を補完
      const buyerName = buyerFromQ || profileNameByEmail.get(email) || "";
      return {
        orderNumber: r[0] ?? "",
        createdAt: r[1] ?? "",
        name: r[2] ?? "",
        email,
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
        salesTransferLog: r[15] ?? "",
        buyerName,
      };
    })
    .reverse();

  return NextResponse.json({ orders });
}
