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

    return (
        <main className="bg-[#FAFAF9]">
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
                                desc: "年2回、たっちゃんが選んだ旬の味覚をお届け。秋には人気の梨も届きます。農家だから分かる、一番おいしいタイミングで。",
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
                            すべてのプランに年2回の届け物付き。
                            さらに通常のお買い物がいつでも割引になります。
                        </p>
                    </div>

                    {/* Desktop: 3 columns, center one larger */}
                    <div className="grid md:grid-cols-[1fr_1.3fr_1fr] gap-6 md:gap-5 items-stretch">
                        {/* ── ライト（梅） ── */}
                        <PlanCard
                            tier="light"
                            badge="🌱 ライト"
                            rank="梅"
                            price={3000}
                            discount="5%"
                            spring="干し芋＋はちみつスティック"
                            springMethod="クリックポスト"
                            fall="甘酢らっきょう 180g"
                            fallMethod="クリックポスト"
                            popular={false}
                        />

                        {/* ── スタンダード（竹）── */}
                        <PlanCard
                            tier="standard"
                            badge="🎋 スタンダード"
                            rank="竹"
                            price={5000}
                            discount="10%"
                            spring="干し芋＋はちみつスティック"
                            springMethod="クリックポスト"
                            fall="甘酢らっきょう 180g ＋ 訳あり梨 2個"
                            fallMethod="コンパクト便"
                            popular={true}
                        />

                        {/* ── プレミアム（松） ── */}
                        <PlanCard
                            tier="premium"
                            badge="👑 プレミアム"
                            rank="松"
                            price={10000}
                            discount="15%"
                            spring="干し芋＋はちみつスティック"
                            springMethod="クリックポスト"
                            fall="甘酢らっきょう 180g ＋ 梨 3kg箱"
                            fallMethod="宅急便"
                            popular={false}
                            extra="優先予約権付き"
                        />
                    </div>

                    <div className="mt-10 text-center text-sm text-stone-400">
                        ※ 年会費は1年間有効です。届け物の時期は収穫状況により前後する場合があります。
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-100">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">🌸</span>
                                <div>
                                    <p className="font-bold text-stone-900 text-lg">
                                        春のお届け
                                    </p>
                                    <p className="text-sm text-stone-500">
                                        3月ごろ
                                    </p>
                                </div>
                            </div>
                            <p className="text-stone-600 leading-relaxed">
                                干し芋＋はちみつスティック
                                <br />
                                <span className="text-sm text-stone-400">
                                    冬の恵みをギュッと凝縮した、自然の甘さ。
                                </span>
                            </p>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-100">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">🍂</span>
                                <div>
                                    <p className="font-bold text-stone-900 text-lg">
                                        秋のお届け
                                    </p>
                                    <p className="text-sm text-stone-500">
                                        9月ごろ
                                    </p>
                                </div>
                            </div>
                            <p className="text-stone-600 leading-relaxed">
                                甘酢らっきょう＋旬の果物
                                <br />
                                <span className="text-sm text-stone-400">
                                    プランに応じて梨が届きます。秋の味覚をお楽しみに。
                                </span>
                            </p>
                        </div>
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
                        年に2回届く旬の贈り物と、いつでも使える会員割引。
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
                        <Link href="/tokusho" className="underline underline-offset-4 hover:text-white">
                            特定商取引法に基づく表示
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
                                q: "届け物の内容は毎年同じですか？",
                                a: "基本的な構成は同じですが、収穫状況に応じて品種やサイズが変わることがあります。その年の一番おいしいものをお届けします。",
                            },
                            {
                                q: "割引はどうやって使えますか？",
                                a: "サポーター登録後、オンラインショップでのご購入時に自動で割引が適用されます。お買い物のたびにお得になります。",
                            },
                            {
                                q: "届け先を自分以外にできますか？",
                                a: "はい、贈り物としてもご利用いただけます。申し込み時にお届け先を指定できます。ご両親やお世話になった方へのギフトにもおすすめです。",
                            },
                            {
                                q: "途中で解約はできますか？",
                                a: "年会費制のため途中解約による返金はできませんが、翌年の更新は自由です。届け物をすべて受け取ってからのご判断で大丈夫です。",
                            },
                            {
                                q: "プレミアムの「優先予約権」とは？",
                                a: "数量限定の人気商品（新物らっきょう、初物の梨など）を一般販売前に優先的にご予約いただける特典です。",
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
    );
}

/* ══════════════════════ PLAN CARD COMPONENT ══════════════════════ */
function PlanCard({
    tier,
    badge,
    rank,
    price,
    discount,
    spring,
    springMethod,
    fall,
    fallMethod,
    popular,
    extra,
}: {
    tier: "light" | "standard" | "premium";
    badge: string;
    rank: string;
    price: number;
    discount: string;
    spring: string;
    springMethod: string;
    fall: string;
    fallMethod: string;
    popular: boolean;
    extra?: string;
}) {
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
                <p className={`font-bold mb-1 ${popular ? "text-xl" : "text-lg"}`}>
                    {badge}
                </p>
                <p className="text-xs text-stone-400 mb-4">（{rank}）</p>

                <div className="mb-6">
                    <span
                        className={`font-bold text-stone-900 ${
                            popular ? "text-5xl" : "text-4xl"
                        }`}
                    >
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
                            通常のお買い物が
                            <strong className="text-primary">
                                {discount} OFF
                            </strong>
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-stone-700 text-sm">
                            🌸 春：{spring}
                            <br />
                            <span className="text-stone-400 text-xs">
                                （{springMethod}）
                            </span>
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-stone-700 text-sm">
                            🍂 秋：{fall}
                            <br />
                            <span className="text-stone-400 text-xs">
                                （{fallMethod}）
                            </span>
                        </span>
                    </div>
                    {extra && (
                        <div className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-stone-700 text-sm font-bold">
                                {extra}
                            </span>
                        </div>
                    )}
                </div>

                <SupporterPlanButton plan={tier} popular={popular} />
            </div>
        </div>
    );
}
