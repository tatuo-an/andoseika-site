import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { Header } from "@/components/layout/Header";
import { google } from "googleapis";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrdersClient } from "./OrdersClient";
import type { Order } from "@/app/api/admin/orders/route";

function normalizePhone(p: string): string {
  if (!p) return p;
  const digits = p.replace(/\D/g, "");
  if (digits.length === 10 && !digits.startsWith("0")) return "0" + digits;
  if (digits.length === 10 || digits.length === 11) return digits;
  return p;
}

async function getOrders(): Promise<Order[]> {
  try {
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
      range: "注文管理!A:Q",
    });
    const rows = res.data.values ?? [];
    return rows
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
        salesTransferLog: r[15] ?? "",
        buyerName: r[16] ?? "",
      }))
      .reverse();
  } catch {
    return [];
  }
}

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    redirect("/login");
  }

  const orders = await getOrders();

  const countAll = orders.length;
  const countActive = orders.filter((o) => o.status === "paid" || o.status === "shipping").length;
  const countDone = orders.filter((o) => o.status === "delivered").length;
  const countCancelled = orders.filter((o) => o.status === "cancelled").length;
  const countComplaints = orders.filter((o) => o.complaint).length;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-stone-400 hover:text-stone-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-stone-900">注文管理</h1>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: "すべて",     count: countAll,        color: "text-stone-700" },
            { label: "取引中",     count: countActive,     color: "text-yellow-700" },
            { label: "完了",       count: countDone,       color: "text-green-700" },
            { label: "キャンセル", count: countCancelled,  color: "text-stone-400" },
            { label: "クレーム",   count: countComplaints, color: "text-orange-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-stone-200 px-4 py-3 text-center shadow-sm">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <OrdersClient initialOrders={orders} />
      </main>
    </div>
  );
}
