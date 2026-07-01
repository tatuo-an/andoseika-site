import Image from "next/image";
import Link from "next/link";
import {
    Heart,
    Leaf,
    Gift,
    Truck,
    BookOpen,
    Users,
    ChevronRight,
    Check,
    Star,
    Sparkles,
    Home,
} from "lucide-react";
import { SupporterPlanButton } from "@/components/supporter/SupporterPlanButton";
import { HeroSlideshow } from "@/components/supporter/HeroSlideshow";
import { getSupporterFirstViewVariant } from "@/config/supporter-variants";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { google } from "googleapis";
import { auth } from "@/auth";
import { getTier } from "@/lib/tiers";

const PLAN_LIMITS: Record<string, number> = { minori: 10, partner: 5 };

async function getActiveCounts(): Promise<Record<string, number>> {
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
        const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
        const rows = (res.data.values ?? []).slice(1);
        const counts: Record<string, number> = {};
        for (const r of rows) {
            if (r[1] !== "__profile__") continue;
            const tier = r[4] ?? "";
            const expiry = r[5] ?? "";
            if (tier && expiry >= today) {
                counts[tier] = (counts[tier] ?? 0) + 1;
            }
        }
        return counts;
    } catch {
        return {};
    }
}

type DeliveryEntry = { emoji: string; title: string; month: string; items: string; description: string };
type DeliverySchedule = { spring: DeliveryEntry; autumn: DeliveryEntry };

const DEFAULT_SCHEDULE: DeliverySchedule = {
    spring: { emoji: "🌸", title: "春のお届け", month: "3月ごろ", items: "", description: "旬の農産物・規格外農産物・安藤青果がおすすめする商品から選ぶおまかせセット。" },
    autumn: { emoji: "🍂", title: "秋のお届け", month: "9月ごろ", items: "", description: "旬の農産物・規格外農産物・安藤青果がおすすめする商品から選ぶおまかせセット。" },
};

async function getDeliverySchedule(): Promise<DeliverySchedule> {
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
            range: "設定!A:B",
        });
        const rows = res.data.values ?? [];
        const row = rows.find((r) => r[0] === "delivery_schedule");
        if (row?.[1]) return JSON.parse(row[1]) as DeliverySchedule;
    } catch { /* use default */ }
    return DEFAULT_SCHEDULE;
}

async function getUserActiveTier(email: string): Promise<string> {
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
        const expiry = row?.[5] ?? "";
        const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
        return tier && expiry >= today ? getTier(tier) : "free";
    } catch {
        return "free";
    }
}

export const metadata = {
    title: "農家サポーター制度「住民票」| &YOU 安藤青果",
    description:
        "ただ野菜を買うだけの生活から、農家とつながる、すこやかな暮らしへ。年会費3,000円〜で「親戚の農家」ができる、安藤青果のサポーター制度です。",
};

/* ──────────────────────────── Helper ──────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
            {children}
        </p>
    );
}

/* ════════════════════════════ PAGE ════════════════════════════ */
export default async function SupporterPage({
    searchParams,
}: {
    searchParams: Promise<{ fv?: string | string[] }>;
}) {
    const { fv } = await searchParams;
    const heroVariant = getSupporterFirstViewVariant(fv);
    const [counts, session, schedule] = await Promise.all([getActiveCounts(), auth(), getDeliverySchedule()]);
    const userEmail = session?.user?.email ?? "";
    const userTier = userEmail ? await getUserActiveTier(userEmail) : "free";

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
        <Header />
        <main className="flex-1">
            {/* ───────── 1. HERO (SLIDESHOW) ───────── */}
            <HeroSlideshow variant={heroVariant} />

            {/* ───────── 2. EMPATHY ───────── */}
            <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50/60 to-white">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                    <SectionLabel>Your Feelings</SectionLabel>
                    <h2 className="text-2xl md:text-4xl font-bold font-heading text-stone-900 mb-12">
                        こんな想い、ありませんか？
                    </h2>

                    <div className="space-y-6">
                        {[
                            {
                                icon: Heart,
                                color: "text-rose-500 bg-rose-50",
                                text: "子どもに安心で美味しい野菜を食べさせたいけど、\nスーパーでは産地も農家さんの顔も分からない…",
                            },
                            {
                                icon: Gift,
                                color: "text-amber-600 bg-amber-50",
                                text: "離れて暮らす両親に、旬の美味しいものを\n届けてあげたい…",
                            },
                            {
                                icon: Users,
                                color: "text-primary bg-primary/10",
                                text: "「顔が見える農家さん」を直接応援したい。\nでも、どうやって繋がればいいか分からない…",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 md:gap-6 p-6 md:p-8 bg-stone-50 rounded-2xl"
                            >
                                <div
                                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${item.color}`}
                                >
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <p className="text-stone-700 text-base md:text-lg leading-relaxed whitespace-pre-line pt-2">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────── 3. CONCEPT ───────── */}
            <section className="py-20 md:py-28 bg-stone-50">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                        <div className="relative rounded-2xl overflow-hidden shadow-lg h-[320px] md:h-[420px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/api/drive-image?id=1pl3qualswHo6y_j7x2gAwpRZYB6dAzgI"
                                alt="安藤青果の野菜セット"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <SectionLabel>Concept</SectionLabel>
                            <h2 className="text-2xl md:text-4xl font-bold font-heading text-stone-900 mb-6 leading-tight">
                                それは単なる定期便ではなく、
                                <br />
                                <span className="text-primary">
                                    「親戚の農家」
                                </span>
                                が
                                <br />
                                できること。
                            </h2>
                            <div className="space-y-4 text-stone-600 leading-relaxed">
                                <p>
                                    私たちが届けるのは、ただの野菜の箱ではありません。
                                </p>
                                <p>
                                    田舎のおじいちゃんが「これ美味いぞ、食べてみぃ」と、
                                    旬の一番おいしいところを詰め込んだ
                                    <strong className="text-stone-800">
                                        温かい仕送り
                                    </strong>
                                    です。
                                </p>
                                <p>
                                    農家のレシピカードと手書きのお手紙を添えて。
                                    あなたの食卓に、鳥取の畑から届きます。
                                </p>
                            </div>
                            <div className="mt-8 p-5 bg-white rounded-xl border border-stone-200">
                                <p className="text-sm text-stone-500 mb-1">
                                    サポーター制度の名前の由来
                                </p>
                                <p className="text-stone-800 font-bold text-lg">
                                    「住民票」
                                    <span className="font-normal text-stone-600 text-base ml-2">
                                        ＝ 安藤青果の「まち」の住民になる
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───────── 4. TATCHAN STORY ───────── */}
            <section className="py-20 md:py-28 bg-gradient-to-b from-white to-amber-50/40">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                        <div className="order-2 md:order-1">
                            <SectionLabel>Our Story</SectionLabel>
                            <h2 className="text-2xl md:text-4xl font-bold font-heading text-stone-900 mb-6 leading-tight">
                                74歳、たっちゃんの挑戦。
                            </h2>
                            <div className="space-y-4 text-stone-600 leading-relaxed">
                                <p>
                                    安藤青果の代表・安藤達夫、通称
                                    <strong className="text-stone-800">
                                        「たっちゃん」
                                    </strong>
                                    。74歳。
                                </p>
                                <p>
                                    鳥取県倉吉市で半世紀以上、土と向き合ってきました。
                                    70歳を過ぎてからオンライン直販を始め、
                                    全国のお客さまに鳥取の旬を届けています。
                                </p>
                                <p>
                                    「ワシの野菜を食べて、美味しいって言ってもらえるのが
                                    一番嬉しい。だから、一番ええものを送りたいんじゃ。」
                                </p>
                                <p>
                                    そんなたっちゃんの想いを、あなたの食卓まで届ける仕組み。
                                    それがこの
                                    <strong className="text-primary">
                                        農家サポーター制度
                                    </strong>
                                    です。
                                </p>
                            </div>
                        </div>
                        <div className="order-1 md:order-2 relative rounded-2xl overflow-hidden shadow-lg h-[320px] md:h-[420px]">
                            <Image
                                src="/images/about/founders.jpg"
                                alt="安藤達夫と安藤匡志"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ───────── Photo Divider ───────── */}
            <div className="relative h-[200px] md:h-[280px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/api/drive-image?id=1amXdXYmMageHtbznP5QTBxvKvoX-0Egc"
                    alt="梨の出荷準備"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-900/30 via-transparent to-stone-100/80" />
            </div>

            {/* ───────── 5. THREE VALUES ───────── */}
            <section className="py-20 md:py-28 bg-gradient-to-b from-stone-50 to-amber-50/30">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <div className="text-center mb-14">
                        <SectionLabel>What You Get</SectionLabel>
                        <h2 className="text-2xl md:text-4xl font-bold font-heading text-stone-900">
                            サポーターに届く、3つの価値
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Truck,
                                title: "土からの鮮度",
                                desc: "収穫から最短で発送。スーパーでは味わえない、畑直送の鮮度をお届けします。旬の一番美味しい瞬間を逃しません。",
                                // 長芋の収穫 (1280x1280)
                                driveId: "1150u3CyLASstZ_qS95Y-Yli-L1sDioKr",
                            },
                            {
                                icon: BookOpen,
                                title: "農家厳選の届け物",
                                desc: "実りサポーターには年1回、農園パートナーには年2回、たっちゃんが選んだ旬の味覚を送料込みでお届け。農家だから分かる、一番おいしいタイミングで。",
                                // 新甘泉の梨・クローズアップ（テキストなし）
                                driveId: "12uK6xxFXHD0XWcLOCh-CKErXWmslUzaU",
                            },
                            {
                                icon: Leaf,
                                title: "応援が生む循環",
                                desc: "あなたのサポートが、障がい者就労支援や地域の農家さんとの連携につながります。食べることが、誰かの笑顔になる。",
                                // アカシアの花と蜜蜂のクローズアップ (1280x1280)
                                driveId: "1TFLTLoZLA0pwC2vU76CM3qbhVBhllclv",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                            >
                                <div className="relative h-[220px] md:h-[240px] overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`/api/drive-image?id=${item.driveId}`}
                                        alt={item.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6 md:p-8">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        <item.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-stone-600 leading-relaxed text-sm">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────── 6. PRICING PLANS ───────── */}
            <section id="plans" className="py-20 md:py-28 bg-gradient-to-b from-amber-50/30 to-white scroll-mt-20">
                <div className="container mx-auto px-4 md:px-6 max-w-6xl">
                    <div className="text-center mb-14">
                        <SectionLabel>Plans</SectionLabel>
                        <h2 className="text-2xl md:text-4xl font-bold font-heading text-stone-900 mb-4">
                            あなたに合ったプランを選べます
                        </h2>
                        <p className="text-stone-500 max-w-xl mx-auto">
                            会員割引、ログインボーナス、サポーター限定商品をご用意。実りサポーターには年1回、農園パートナーには年2回、旬の詰め合わせを送料込みでお届けします。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 items-stretch">
                        {/* ── 一般会員 ── */}
                        <FreePlanCard
                            isLoggedIn={!!userEmail}
                            isCurrent={!!userEmail && userTier === "free"}
                        />

                        {/* ── 芽吹きサポーター ── */}
                        <PlanCard
                            tier="mebuking"
                            badge="🌱 芽吹きサポーター"
                            price={3000}
                            discount="3%"
                            loginPt={2}
                            birthdayPt={500}
                            popular={false}
                            isCurrent={userTier === "mebuking"}
                        />

                        {/* ── 実りサポーター ── */}
                        <PlanCard
                            tier="minori"
                            badge="🌾 実りサポーター"
                            price={5000}
                            discount="5%"
                            loginPt={3}
                            birthdayPt={1000}
                            popular={true}
                            giftDelivery="annual"
                            limit={PLAN_LIMITS.minori}
                            currentCount={counts.minori ?? 0}
                            isCurrent={userTier === "minori"}
                        />

                        {/* ── 農園パートナー ── */}
                        <PlanCard
                            tier="partner"
                            badge="👑 農園パートナー"
                            price={10000}
                            discount="8%"
                            loginPt={5}
                            birthdayPt={2000}
                            popular={false}
                            giftDelivery="biannual"
                            limit={PLAN_LIMITS.partner}
                            currentCount={counts.partner ?? 0}
                            isCurrent={userTier === "partner"}
                        />
                    </div>

                    <div className="mt-10 text-center text-sm text-stone-400 space-y-1">
                        <p>※ 年会費は1年間有効です。届け物の時期は収穫状況により前後する場合があります。</p>
                        <p>※ 詰め合わせの内容はお選びいただけません。天候、収穫量、在庫状況などにより、内容や発送時期を変更する場合があります。</p>
                        <p>※ 割引は通常商品代のみ対象（送料・セール品・農業体験は対象外。セール品には適用されません）。誕生日ボーナスは年1回。ログインボーナスは1日1回。</p>
                        <p className="mt-3">
                            <Link href="/supporter-terms" className="underline hover:text-stone-600">サポーター会員規約</Link>
                            をお読みの上、お申し込みください。
                        </p>
                    </div>
                </div>
            </section>

            {/* ───────── 7. DELIVERY SCHEDULE ───────── */}
            <section className="py-16 md:py-20 bg-gradient-to-b from-stone-50 to-amber-50/20">
                <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                    <div className="text-center mb-10">
                        <SectionLabel>Schedule</SectionLabel>
                        <h2 className="text-2xl md:text-3xl font-bold font-heading text-stone-900">
                            届け物カレンダー
                        </h2>
                    </div>

                    <p className="text-center text-sm text-stone-500 leading-relaxed mb-8">
                        実りサポーターには年1回、農園パートナーには年2回、旬の詰め合わせを送料込みでお届けします。内容は、旬の農産物や安藤青果がおすすめする商品から選ぶおまかせセットです。実りサポーターは加入時に春便り・秋便りのどちらかをお選びいただけます。発送時期は、収穫状況に応じて事前にご案内します。
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(["spring", "autumn"] as const).map((season) => {
                            const entry = schedule[season];
                            return (
                                <div key={season} className="bg-white p-6 md:p-8 rounded-2xl border border-stone-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-3xl">{entry.emoji}</span>
                                        <div>
                                            <p className="font-bold text-stone-900 text-lg">{entry.title}</p>
                                            <p className="text-sm text-stone-500">{entry.month}</p>
                                        </div>
                                    </div>
                                    <p className="text-stone-600 leading-relaxed text-sm">
                                        {entry.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ───────── 8. FINAL CTA ───────── */}
            <section className="py-20 md:py-28 bg-primary text-white">
                <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
                    <Sparkles className="h-10 w-10 mx-auto mb-6 text-white/70" />
                    <h2 className="text-2xl md:text-4xl font-bold font-heading mb-6 leading-tight">
                        あなたも、
                        <br className="md:hidden" />
                        安藤青果の「住民」に
                        <br />
                        なりませんか？
                    </h2>
                    <p className="text-white/80 leading-relaxed mb-10 max-w-lg mx-auto">
                        旬の詰め合わせのお届け（実りサポーターは年1回・農園パートナーは年2回）と、いつでも使える会員割引。
                        <br />
                        鳥取の畑から届く「温かい仕送り」を、
                        <br />
                        あなたの食卓にも。
                    </p>
                    <a
                        href="#plans"
                        className="inline-flex items-center gap-2 bg-white text-primary font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg"
                    >
                        プランを選んで申し込む
                        <ChevronRight className="h-5 w-5" />
                    </a>
                    <p className="mt-6 text-white/50 text-sm">
                        Stripeのセキュアな決済画面で、安全にお支払いいただけます。お申し込み前に
                        <Link href="/tokusho" className="underline underline-offset-4 hover:text-white mx-1">
                            特定商取引法に基づく表示
                        </Link>
                        および
                        <Link href="/supporter-terms" className="underline underline-offset-4 hover:text-white mx-1">
                            サポーター会員規約
                        </Link>
                        をご確認ください。
                    </p>
                </div>
            </section>

            {/* ───────── 9. FAQ ───────── */}
            <section className="py-20 md:py-28 bg-gradient-to-b from-white to-stone-50">
                <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                    <div className="text-center mb-14">
                        <SectionLabel>FAQ</SectionLabel>
                        <h2 className="text-2xl md:text-4xl font-bold font-heading text-stone-900">
                            よくあるご質問
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "ポイントはどうやって貯まりますか？",
                                a: "無料会員登録後、毎日のログインでボーナスポイントが付与されます（一般会員1pt、芽吹き2pt、実り3pt、農園パートナー5pt）。未登録・未ログイン状態ではポイントは付与されません。また、誕生日にはプランに応じたボーナスポイントが年1回付与されます。料理投稿では、初めての投稿で100pt、次回以降は月1回まで50ptをプレゼントします。料理投稿ポイントの付与は、1アカウントにつき月1回までです。重複投稿や、料理と関係のない投稿などはポイント付与の対象外です。",
                            },
                            {
                                q: "割引はどうやって使えますか？",
                                a: "サポーター登録後、カートで自動的に割引が適用されます（通常商品代のみ対象。セール中の商品・送料・農業体験は対象外）。",
                            },
                            {
                                q: "限定商品とは何ですか？",
                                a: "芽吹きサポーター以上の方だけが購入できる特別な商品です。数量限定の人気商品や旬の特選品が対象になります。",
                            },
                            {
                                q: "詰め合わせが届くのは、どのプランですか？",
                                a: "実りサポーターは年1回（春または秋からお選びいただけます）、農園パートナーは年2回（春・秋）、旬の詰め合わせをお届けします。いずれも送料込みのため、発送時に追加料金はかかりません。芽吹きサポーターには詰め合わせの発送はありません。発送時期は、収穫状況に応じて事前にご案内します。",
                            },
                            {
                                q: "詰め合わせの商品は選べますか？",
                                a: "詰め合わせは、発送時期に合わせて安藤青果が選ぶおまかせセットです。商品の種類、品種、内容量、組み合わせはお選びいただけません。収穫状況や在庫状況により内容を決定します。なお、実りサポーターは加入時に春便り・秋便りのどちらでお届けするかをお選びいただけます（マイページから変更可能）。",
                            },
                            {
                                q: "契約期間と自動更新はどうなりますか？",
                                a: "契約期間は入会日から1年間で、終了後は1年ごとに自動更新されます。次回更新日と次回請求額はマイページからご確認いただけます。次回更新日の前日までにマイページから自動更新を停止すると、次年度の年会費は請求されません。",
                            },
                            {
                                q: "途中で解約・返金はできますか？",
                                a: "マイページからいつでも自動更新を停止できます（解約手数料なし）。停止しても現在の契約期間終了までは特典をご利用いただけ、契約終了後に一般会員へ戻ります。アカウントと保有ポイントはそのまま維持されます。年会費お支払い後の利用者都合による途中解約・日割り・月割り返金は承っておりませんが、二重決済・誤請求・本人未承諾の決済・当方都合の提供停止などの場合は確認の上で返金いたします。農園パートナーの年2回の詰め合わせは、解約後も契約期間中に予定された分は引き続き送料込みで発送します。",
                            },
                        ].map((item, i) => (
                            <details
                                key={i}
                                className="group bg-stone-50 rounded-2xl overflow-hidden"
                            >
                                <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-stone-100 transition-colors">
                                    <span className="font-bold text-stone-900 pr-4">
                                        {item.q}
                                    </span>
                                    <ChevronRight className="h-5 w-5 text-stone-400 flex-shrink-0 transition-transform group-open:rotate-90" />
                                </summary>
                                <div className="px-6 pb-6 text-stone-600 leading-relaxed">
                                    {item.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────── 10. BOTTOM CTA ───────── */}
            <section className="py-16 bg-stone-50 border-t border-stone-100">
                <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
                    <p className="text-stone-600 mb-6">
                        ご質問・ご相談はお気軽にどうぞ
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="#plans"
                            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            サポーターに申し込む
                        </a>
                        <a
                            href="https://lin.ee/xzQv9l5"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-[#06C755] text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            LINEで問い合わせる
                        </a>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 bg-white text-stone-700 font-bold px-8 py-4 rounded-full border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all"
                        >
                            <Home className="h-4 w-4" />
                            ホームページへ
                        </Link>
                        <Link
                            href="/contact/personal"
                            className="inline-flex items-center justify-center gap-2 bg-white text-stone-700 font-bold px-8 py-4 rounded-full border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all"
                        >
                            お問い合わせ
                        </Link>
                    </div>
                </div>
            </section>
        </main>
        <Footer />
        </div>
    );
}

/* ══════════════════════ PLAN CARD COMPONENT ══════════════════════ */
/* 一般会員（無料）カード */
function FreePlanCard({
    isLoggedIn,
    isCurrent,
}: {
    isLoggedIn: boolean;
    isCurrent: boolean;
}) {
    return (
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm flex flex-col h-full">
            <div className="bg-white flex-1 p-6 md:p-8 flex flex-col">
                <p className="font-bold text-lg mb-4 text-stone-500">👤 一般会員</p>
                <div className="mb-6">
                    <span className="font-bold text-stone-900 text-4xl">無料</span>
                </div>
                <div className="space-y-3 mb-6 text-stone-400">
                    <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">通常価格で商品を購入できます</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">ログインボーナス 1pt/日を獲得</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">貯めたポイントを商品代に利用できます</span>
                    </div>
                </div>
                <div className="mt-auto">
                    {!isLoggedIn ? (
                        <Link
                            href="/login"
                            className="block w-full py-3.5 rounded-full text-sm text-center font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
                        >
                            無料で会員登録
                        </Link>
                    ) : isCurrent ? (
                        <div
                            aria-disabled="true"
                            className="w-full py-3.5 rounded-full text-sm text-center font-bold bg-stone-100 text-stone-500 cursor-default border border-stone-200"
                        >
                            現在のプラン
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function PlanCard({
    tier,
    badge,
    price,
    discount,
    loginPt,
    birthdayPt,
    popular,
    giftDelivery = "none",
    limit,
    currentCount = 0,
    isCurrent = false,
}: {
    tier: "mebuking" | "minori" | "partner";
    badge: string;
    price: number;
    discount: string;
    loginPt: number;
    birthdayPt: number;
    popular: boolean;
    giftDelivery?: "none" | "annual" | "biannual";
    limit?: number;
    currentCount?: number;
    isCurrent?: boolean;
}) {
    const remaining = limit !== undefined ? limit - currentCount : undefined;
    const isFull = remaining !== undefined && remaining <= 0;

    return (
        <div
            className={`relative rounded-2xl overflow-hidden transition-all flex flex-col h-full ${
                popular
                    ? "border-2 border-primary shadow-2xl"
                    : "border border-stone-200 shadow-sm hover:shadow-md"
            }`}
        >
            {popular && (
                <div className="bg-primary text-white text-center font-bold py-3 flex items-center justify-center gap-2 text-base">
                    <Star className="h-5 w-5 fill-white" />
                    一番人気
                    <Star className="h-5 w-5 fill-white" />
                </div>
            )}
            <div className={`bg-white flex-1 ${popular ? "p-8 md:p-10" : "p-6 md:p-8"}`}>
                <div className="flex items-start justify-between gap-2 mb-4">
                    <p className={`font-bold ${popular ? "text-xl" : "text-lg"}`}>
                        {badge}
                    </p>
                    {remaining !== undefined && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                            isFull
                                ? "bg-stone-100 text-stone-400"
                                : remaining <= 3
                                    ? "bg-red-50 text-red-500 border border-red-200"
                                    : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        }`}>
                            {isFull ? "満員" : `残り${remaining}人`}
                        </span>
                    )}
                </div>

                <div className="mb-6">
                    <span className={`font-bold text-stone-900 ${popular ? "text-5xl" : "text-4xl"}`}>
                        ¥{price.toLocaleString()}
                    </span>
                    <span className="text-stone-500 text-sm ml-1">/ 年</span>
                </div>

                {popular && (
                    <p className="text-primary font-bold text-sm mb-4 bg-primary/5 rounded-lg p-3 text-center">
                        迷ったらコレ！ バランス重視の人気プラン
                    </p>
                )}

                <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-stone-700 text-sm">
                            通常商品が <strong className="text-primary">{discount} OFF</strong>
                            <span className="text-stone-400 text-xs">（セール品除く）</span>
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-stone-700 text-sm">
                            ログインボーナス <strong className="text-primary">{loginPt}pt</strong>/日
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-stone-700 text-sm">
                            誕生日ボーナス <strong className="text-primary">{birthdayPt.toLocaleString()}pt</strong>
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-stone-700 text-sm">限定商品を購入可能</span>
                    </div>
                    {giftDelivery === "annual" && (
                        <div className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-stone-700 text-sm">
                                年1回、旬の小さなお届け<br />
                                <span className="text-stone-400 text-xs">送料込み・追加料金なし</span>
                            </span>
                        </div>
                    )}
                    {giftDelivery === "biannual" && (
                        <div className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-stone-700 text-sm">
                                年2回、旬の詰め合わせをお届け<br />
                                <span className="text-stone-400 text-xs">送料込み・追加料金なし</span>
                            </span>
                        </div>
                    )}
                </div>

                <p className="text-xs text-stone-400 text-center leading-relaxed mb-3">
                    契約期間は1年間で、その後は1年ごとに自動更新されます。<br />
                    マイページから次回更新を停止できます。
                </p>
                {isCurrent ? (
                    <div className="w-full py-3.5 rounded-full text-sm text-center font-bold bg-primary/10 text-primary cursor-default">
                        ✓ 現在のプラン
                    </div>
                ) : (
                    <SupporterPlanButton plan={tier} popular={popular} soldOut={isFull} />
                )}
            </div>
        </div>
    );
}
