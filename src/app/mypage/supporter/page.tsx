import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Sprout, Star } from "lucide-react";
import Link from "next/link";
import { google } from "googleapis";
import { getTier, TIERS, type TierKey } from "@/lib/tiers";
import { CancelSupporterButton } from "@/components/mypage/CancelSupporterButton";
import { DeliverySeasonSelector } from "@/components/mypage/DeliverySeasonSelector";
import { DeliveryHistory } from "@/components/mypage/DeliveryHistory";

export const dynamic = "force-dynamic";

// メールアドレスから8桁の住民番号を生成
function generateResidentId(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash) + email.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 100000000).toString().padStart(8, "0");
}

// サポーター歴を「○年○ヶ月」に変換
function calcDuration(from: string): string {
  const start = new Date(from);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const totalMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months}ヶ月`;
  if (months === 0) return `${years}年`;
  return `${years}年${months}ヶ月`;
}

async function fetchUserData(email: string) {
  const authClient = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth: authClient });
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  const [profileRes, pointsRes, deliveryRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: "顧客マスタ!A:G" }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: "ポイント履歴!A:E" }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: "詰め合わせ発送!A:G" }).catch(() => ({ data: { values: [] } })),
  ]);

  const profileRows = profileRes.data.values ?? [];
  const row = profileRows.find((r) => r[0] === email && r[1] === "__profile__");
  const tier = row?.[4] ?? "";
  const tierExpiry = row?.[5] ?? "";
  const cancelRequestedAt = row?.[6] ?? "";
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
  const activeTier: TierKey = tier && tierExpiry && tierExpiry >= today ? getTier(tier) : "free";

  // ポイント合計
  const pointsRows = (pointsRes.data.values ?? []).filter((r) => r[0] === email);
  const pointBalance = pointsRows.reduce((sum, r) => sum + (parseInt(r[3] ?? "0", 10) || 0), 0);

  // 詰め合わせ発送回数
  const deliveryRows = (deliveryRes.data.values ?? []).filter((r) => r[0] === email);
  const deliveryCount = deliveryRows.length;

  // 入村日：tierExpiryから1年前を推定（サポーターの場合のみ）
  const joinDateStr = activeTier !== "free" && tierExpiry
    ? (() => {
        const d = new Date(tierExpiry);
        d.setFullYear(d.getFullYear() - 1);
        return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
      })()
    : null;

  // 次回お届け予定期（実り=年1回、農園=年2回をtierExpiryベースで推定）
  const nextDelivery = activeTier === "partner"
    ? "春・秋（年2回）"
    : activeTier === "minori"
    ? "春または秋（年1回）"
    : null;

  return { activeTier, tierExpiry, cancelRequestedAt, pointBalance, deliveryCount, joinDateStr, nextDelivery };
}

export default async function MyPageSupporterPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const email = session.user.email ?? "";
  const name = session.user.name ?? "";
  const residentId = generateResidentId(email);

  const { activeTier, tierExpiry, cancelRequestedAt, pointBalance, deliveryCount, joinDateStr, nextDelivery } =
    await fetchUserData(email);

  const tierInfo = TIERS[activeTier];
  const isCancelled = !!cancelRequestedAt && activeTier !== "free";
  const isSupporter = activeTier !== "free";
  const duration = joinDateStr ? calcDuration(joinDateStr) : null;

  const TIER_LABEL: Record<TierKey, string> = {
    free: "一般会員",
    mebuking: "芽吹きサポーター",
    minori: "実りサポーター",
    partner: "農園パートナー",
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-lg">

          <div className="flex items-center gap-3 mb-6">
            <Link href="/mypage" className="text-stone-400 hover:text-stone-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-stone-700">サポーター会員</h1>
          </div>

          {/* ── 住民票カード ── */}
          <div className="bg-amber-50 border-2 border-stone-300 rounded-2xl overflow-hidden shadow-md mb-5">

            {/* ヘッダー */}
            <div className="bg-primary px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-[10px] font-bold tracking-widest uppercase">鳥取県倉吉市 &YOU農園</p>
                <p className="text-white text-lg font-bold font-heading tracking-wide">農園住民票</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* 基本情報 */}
            <div className="px-6 py-5 border-b border-stone-200 space-y-3">
              <Row label="住民番号" value={residentId} mono />
              <Row label="氏名" value={name || "—"} />
              <Row label="現在のプラン" value={
                <span className="flex items-center gap-1.5">
                  {isSupporter && <Star className="w-3.5 h-3.5 text-primary fill-primary" />}
                  <span className="font-bold text-stone-900">{TIER_LABEL[activeTier]}</span>
                </span>
              } />
              {isSupporter && joinDateStr && (
                <>
                  <Row label="入村日" value={joinDateStr.replace(/-/g, "年").replace(/-/, "月") + "日"} />
                  {duration && <Row label="サポーター歴" value={duration} />}
                </>
              )}
              {isSupporter && tierExpiry && (
                <Row
                  label={isCancelled ? "特典最終日" : "次回更新日"}
                  value={
                    <span className={isCancelled ? "text-stone-400 line-through" : "text-stone-800"}>
                      {tierExpiry}
                    </span>
                  }
                />
              )}
            </div>

            {/* 実績 */}
            <div className="px-6 py-5 border-b border-stone-200 space-y-3">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">実績・特典</p>
              <Row label="応援ポイント" value={<span className="font-bold text-primary">{pointBalance.toLocaleString()} pt</span>} />
              <Row label="今まで届いた作物" value={deliveryCount > 0 ? `${deliveryCount}回` : "まだ届いていません"} />
              {nextDelivery && <Row label="次のお届け予定" value={nextDelivery} />}
            </div>

            {/* フッター */}
            <div className="bg-stone-100 px-6 py-3 text-center">
              <p className="text-[10px] text-stone-400">この住民票は &YOU農園 が発行します。譲渡・転売はできません。</p>
            </div>
          </div>

          {/* 詰め合わせ春・秋選択（実りサポーターのみ） */}
          {activeTier === "minori" && (
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">詰め合わせのお届け時期</p>
              <DeliverySeasonSelector />
            </div>
          )}

          {/* 発送履歴 */}
          {(activeTier === "minori" || activeTier === "partner") && <DeliveryHistory />}

          {/* アクション */}
          <div className="space-y-3 mt-5">
            <Link
              href="/supporter#plans"
              className="block w-full py-4 rounded-2xl bg-primary text-white font-bold text-center hover:bg-primary/90 transition-colors shadow-sm"
            >
              {!isSupporter ? "サポータープランを見る" : "プランを変更する"}
            </Link>

            {isSupporter && !isCancelled && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-sm font-bold text-stone-700 mb-1">次回の自動更新を停止する</p>
                <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                  停止しても {tierExpiry || "—"} までサポーター特典をご利用いただけます。
                </p>
                <CancelSupporterButton tierName={tierInfo.name} redirectTo="/mypage/supporter" />
                <p className="text-[11px] text-stone-400 mt-3">
                  うまく停止できない場合は
                  <Link href="/contact/personal" className="text-primary hover:underline ml-0.5">お問い合わせ</Link>
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

// ── サブコンポーネント ──

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs text-stone-500 shrink-0 w-28">{label}</span>
      <span className={`text-sm text-stone-800 text-right ${mono ? "font-mono tracking-widest" : ""}`}>{value}</span>
    </div>
  );
}

