import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { google } from "googleapis";
import { getTier, TIERS, type TierKey } from "@/lib/tiers";
import { CancelSupporterButton } from "@/components/mypage/CancelSupporterButton";

export const dynamic = "force-dynamic";

async function getUserTier(email: string): Promise<{ tier: TierKey; tierExpiry: string }> {
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
      range: "顧客マスタ!A:F",
    });
    const rows = res.data.values ?? [];
    const row = rows.find((r) => r[0] === email && r[1] === "__profile__");
    const tier = row?.[4] ?? "";
    const tierExpiry = row?.[5] ?? "";
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
    const activeTier: TierKey = tier && tierExpiry && tierExpiry >= today ? getTier(tier) : "free";
    return { tier: activeTier, tierExpiry };
  } catch {
    return { tier: "free", tierExpiry: "" };
  }
}

export default async function MyPageSupporterPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tier, tierExpiry } = await getUserTier(session.user.email ?? "");
  const tierInfo = TIERS[tier];

  const TIER_BENEFITS: Record<TierKey, string[]> = {
    free:     ["ログインボーナス 1pt/日", "通常価格で購入可能", "通常商品を自由に購入できます"],
    mebuking: ["通常商品 3% OFF（セール品除く）", "ログインボーナス 2pt/日", "誕生日ボーナス 500pt", "限定商品を購入可能"],
    minori:   ["通常商品 5% OFF（セール品除く）", "ログインボーナス 3pt/日", "誕生日ボーナス 1,500pt", "限定商品を購入可能"],
    partner:  ["通常商品 8% OFF（セール品除く）", "ログインボーナス 5pt/日", "誕生日ボーナス 2,000pt", "限定商品を購入可能", "年2回 詰め合わせセットをお届け"],
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/mypage" className="text-stone-400 hover:text-stone-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-stone-900">サポーター会員</h1>
          </div>

          {/* 現在のプラン */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">現在のプラン</p>
            <div className="flex items-center gap-3 mb-4">
              {tier !== "free" && <Star className="w-5 h-5 text-primary fill-primary" />}
              <p className="text-xl font-bold text-stone-900">{tierInfo.name}</p>
              {tier !== "free" && tierExpiry && (
                <span className="text-xs text-stone-400 ml-auto">〜 {tierExpiry}</span>
              )}
            </div>
            <ul className="space-y-2">
              {TIER_BENEFITS[tier].map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-stone-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* アクション */}
          <div className="space-y-3">
            <Link
              href="/supporter#plans"
              className="block w-full py-4 rounded-2xl bg-primary text-white font-bold text-center hover:bg-primary/90 transition-colors shadow-sm"
            >
              {tier === "free" ? "サポータープランを見る" : "プランを変更する"}
            </Link>

            {tier !== "free" && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-sm font-bold text-stone-700 mb-1">プランを解約する</p>
                <p className="text-xs text-stone-400 mb-3">解約すると即時に一般会員へ変更されます。</p>
                <CancelSupporterButton tierName={tierInfo.name} redirectTo="/mypage/supporter" />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
