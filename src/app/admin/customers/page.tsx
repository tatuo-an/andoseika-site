import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { google } from "googleapis";
import Link from "next/link";
import { ArrowLeft, User, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

type Customer = {
  email: string;
  displayName: string;
  addresses: { label: string; name: string; postalCode: string; prefecture: string; city: string; street: string; building: string; phone: string }[];
};

async function getCustomers(): Promise<Customer[]> {
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
    range: "顧客マスタ!A:I",
  });
  const rows = (res.data.values ?? []).slice(1).filter((r) => r[0]);

  const map = new Map<string, Customer>();
  for (const r of rows) {
    const email = r[0] as string;
    if (!map.has(email)) map.set(email, { email, displayName: "", addresses: [] });
    const customer = map.get(email)!;

    if (r[1] === "__profile__") {
      customer.displayName = r[2] ?? "";
    } else {
      const c = r[2] ?? "";
      const isLegacy = /^\d{3}-?\d{4}$/.test(c);
      if (isLegacy) {
        customer.addresses.push({ label: "デフォルト", name: r[1] ?? "", postalCode: r[2] ?? "", prefecture: r[3] ?? "", city: r[4] ?? "", street: r[5] ?? "", building: r[6] ?? "", phone: r[7] ?? "" });
      } else {
        customer.addresses.push({ label: r[1] ?? "", name: r[2] ?? "", postalCode: r[3] ?? "", prefecture: r[4] ?? "", city: r[5] ?? "", street: r[6] ?? "", building: r[7] ?? "", phone: r[8] ?? "" });
      }
    }
  }
  return Array.from(map.values());
}

export default async function CustomersPage() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) redirect("/");

  const customers = await getCustomers();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/admin" className="text-stone-400 hover:text-stone-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-stone-900">顧客一覧</h1>
            <span className="text-sm text-stone-400">{customers.length}人</span>
          </div>

          <div className="space-y-4">
            {customers.map((c) => (
              <div key={c.email} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                {/* ヘッダー */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-900">{c.displayName || <span className="text-stone-400 font-normal">（未設定）</span>}</p>
                    <p className="text-xs text-stone-400 truncate">{c.email}</p>
                  </div>
                  <span className="text-xs text-stone-400 shrink-0">{c.addresses.length}件の住所</span>
                </div>

                {/* 住所一覧 */}
                {c.addresses.length === 0 ? (
                  <p className="px-5 py-3 text-sm text-stone-400">住所なし</p>
                ) : (
                  <div className="divide-y divide-stone-50">
                    {c.addresses.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 px-5 py-3">
                        <MapPin className="w-3.5 h-3.5 text-stone-300 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {a.name && <span className="text-xs font-medium text-stone-700">{a.name}</span>}
                            {a.phone && <span className="text-xs text-stone-400">{a.phone}</span>}
                          </div>
                          <p className="text-sm text-stone-700">
                            {[a.postalCode && `〒${a.postalCode}`, a.prefecture, a.city, a.street, a.building].filter(Boolean).join(" ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {customers.length === 0 && (
              <div className="text-center py-16 text-stone-400">顧客データがありません</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
