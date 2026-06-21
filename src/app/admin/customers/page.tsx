import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { google } from "googleapis";
import Link from "next/link";
import { ArrowLeft, User, MapPin } from "lucide-react";
import { CopyButton } from "@/components/admin/CopyButton";

export const dynamic = "force-dynamic";

type Customer = {
  email: string;
  displayName: string;
  tier: string;
  tierExpiry: string;
  addresses: { label: string; name: string; postalCode: string; prefecture: string; city: string; street: string; building: string; phone: string; relation: string }[];
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
    range: "顧客マスタ!A:K",
  });
  const rows = (res.data.values ?? []).slice(1).filter((r) => r[0]);

  const map = new Map<string, Customer>();
  for (const r of rows) {
    const email = r[0] as string;
    if (!map.has(email)) map.set(email, { email, displayName: "", tier: "", tierExpiry: "", addresses: [] });
    const customer = map.get(email)!;

    if (r[1] === "__profile__") {
      customer.displayName = r[2] ?? "";
      customer.tier = r[4] ?? "";
      customer.tierExpiry = r[5] ?? "";
    } else {
      const c = r[2] ?? "";
      const isLegacy = /^\d{3}-?\d{4}$/.test(c);
      if (isLegacy) {
        customer.addresses.push({ label: "デフォルト", name: r[1] ?? "", postalCode: r[2] ?? "", prefecture: r[3] ?? "", city: r[4] ?? "", street: r[5] ?? "", building: r[6] ?? "", phone: r[7] ?? "", relation: "" });
      } else {
        customer.addresses.push({ label: r[1] ?? "", name: r[2] ?? "", postalCode: r[3] ?? "", prefecture: r[4] ?? "", city: r[5] ?? "", street: r[6] ?? "", building: r[7] ?? "", phone: r[8] ?? "", relation: r[10] ?? "" });
      }
    }
  }
  return Array.from(map.values());
}

export default async function CustomersPage() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) redirect("/");

  const customers = await getCustomers();
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });

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
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-stone-900">{c.displayName || <span className="text-stone-400 font-normal">（未設定）</span>}</p>
                      {c.tier && c.tierExpiry && c.tierExpiry >= today && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          c.tier === "partner" ? "bg-amber-100 text-amber-700 border border-amber-300" :
                          c.tier === "minori" ? "bg-purple-100 text-purple-700 border border-purple-300" :
                          "bg-emerald-100 text-emerald-700 border border-emerald-300"
                        }`}>
                          {c.tier === "partner" ? "農園パートナー" : c.tier === "minori" ? "実りサポーター" : "芽吹きサポーター"}
                        </span>
                      )}
                    </div>
                    <div className="group flex items-center gap-1">
                      <CopyButton text={c.email} />
                    </div>
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
                            {a.relation === "自分" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300">本人</span>}
                            {a.relation === "家族" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">家族</span>}
                            {a.relation === "友達" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300">友達</span>}
                            {a.label && (
                              <div className="group">
                                <CopyButton text={a.label} className="bg-stone-100 px-1.5 py-0.5 rounded text-[10px]" />
                              </div>
                            )}
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
