import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { google } from "googleapis";
import { getTier, TIERS, type TierKey } from "@/lib/tiers";
import { CancelSupporterButton } from "@/components/mypage/CancelSupporterButton";
import { DeliverySeasonSelector } from "@/components/mypage/DeliverySeasonSelector";
import { DeliveryHistory } from "@/components/mypage/DeliveryHistory";

export const dynamic = "force-dynamic";

async function getUserTier(email: string): Promise<{ tier: TierKey; tierExpiry: string; cancelRequestedAt: string }> {
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
      range: "顧客マスタ!A:G",
    });
    const rows = res.data.values ?? [];
    const row = rows.find((r) => r[0] === email && r[1] === "__profile__");
    const tier = row?.[4] ?? "";
    const tierExpiry = row?.[5] ?? "";
    const cancelRequestedAt = row?.[6] ?? "";
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
    const activeTier: TierKey = tier && tierExpiry && tierExpiry >= today ? getTier(tier) : "free";
    return { tier: activeTier, tierExpiry, cancelRequestedAt };
  } catch {
    return { tier: "free", tierExpiry: "", cancelRequestedAt: "" };
  }
}

export default async function MyPageSupporterPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tier, tierExpiry, cancelRequestedAt } = await getUserTier(session.user.email ?? "");
  const tierInfo = TIERS[tier];
  const isCancelled = !!cancelRequestedAt && tier !== "free";
  const nextRenewalDate = tierExpiry; // 契約期間終了日 = 次回更新日

  const TIER_BENEFITS: Record<TierKey, string[]> = {
    free:     ["無料会員登録で、1日1ptのログインボーナス", "通常価格で購入可能", "通常商品を自由に購入できます"],
    mebuking: ["通常商品 3% OFF（セール品除く）", "ログインボーナス 2pt/日", "誕生日ボーナス 500pt", "限定商品を購入可能"],
    minori:   ["通常商品 5% OFF（セール品除く）", "ログインボーナス 3pt/日", "誕生日ボーナス 1,000pt", "限定商品を購入可能", "年1回 旬の小さなお届け（送料込み）"],
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
            </div>

            {tier !== "free" && nextRenewalDate && (
              <div className="border border-stone-100 rounded-xl p-4 mb-4 text-sm space-y-1.5">
                {isCancelled ? (
                  <>
                    <p className="text-stone-800 font-medium">解約受付済み</p>
                    <p className="text-stone-600">特典最終日：<span className="font-medium">{nextRenewalDate}</span></p>
                    <p className="text-stone-600">次回の請求はありません。</p>
                    <p className="text-stone-500 text-xs mt-2">契約終了後は一般会員へ変更されます（アカウント・保有ポイントは維持されます）。</p>
                  </>
                ) : (
                  <>
                    <p className="text-stone-600">契約期間：<span className="font-medium text-stone-800">〜 {nextRenewalDate}</span></p>
                    <p className="text-stone-600">次回更新日：<span className="font-medium text-stone-800">{nextRenewalDate}</span></p>
                    <p className="text-stone-600">次回請求額：<span className="font-medium text-stone-800">¥{tierInfo.price.toLocaleString()}（年会費・1年ごとに自動更新）</span></p>
                    <p className="text-stone-500 text-xs mt-2">次回更新日の前日までに自動更新を停止すると、次年度の年会費は請求されません。</p>
                  </>
                )}
              </div>
            )}

            <ul className="space-y-2">
              {TIER_BENEFITS[tier].map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-stone-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* 実りサポーター：春便り／秋便り選択 */}
          {tier === "minori" && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">詰め合わせのお届け時期</p>
              <DeliverySeasonSelector />
            </div>
          )}

          {/* 詰め合わせ発送履歴（実り・パートナーのみ） */}
          {(tier === "minori" || tier === "partner") && <DeliveryHistory />}

          {/* アクション */}
          <div className="space-y-3">
            <Link
              href="/supporter#plans"
              className="block w-full py-4 rounded-2xl bg-primary text-white font-bold text-center hover:bg-primary/90 transition-colors shadow-sm"
            >
              {tier === "free" ? "サポータープランを見る" : "プランを変更する"}
            </Link>

            {tier !== "free" && !isCancelled && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-sm font-bold text-stone-700 mb-1">次回の自動更新を停止する</p>
                <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                  自動更新を停止しても、現在の契約期間終了（{nextRenewalDate || "—"}）までサポーター特典をご利用いただけます。次回更新日以降の年会費は請求されません。
                </p>
                <CancelSupporterButton tierName={tierInfo.name} redirectTo="/mypage/supporter" />
                <p className="text-[11px] text-stone-400 mt-3">
                  マイページから停止できない場合は、
                  <Link href="/contact/personal" className="text-primary hover:underline">お問い合わせフォーム</Link>
                  からも受け付けます。
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
