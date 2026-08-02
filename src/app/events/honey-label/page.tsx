import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";
import {
    Flower2,
    ArrowRight,
    Check,
    X,
    Users,
    Award,
    Camera,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
    title: "みんなでつくる、安藤青果のはちみつラベル｜手描きラベル作品募集",
    description:
        "花・ミツバチ・はちみつを自由に描こう！あなたの作品が、安藤青果の限定はちみつラベルになるかもしれません。応募期間 2026年8月10日〜8月30日。公式LINEから応募できます。",
};

const LINE_FRIEND_URL = "https://lin.ee/xzQv9l5";

function LineCTA({ label = "公式LINEから応募する", variant = "green" }: { label?: string; variant?: "green" | "white" }) {
    const colorClass =
        variant === "white"
            ? "bg-white text-primary hover:bg-stone-100"
            : "bg-[#06C755] text-white hover:bg-[#05b34c]";
    return (
        <a
            href={LINE_FRIEND_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg ${colorClass}`}
        >
            {label}
            <ArrowRight className="h-5 w-5" />
        </a>
    );
}

function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
    return (
        <div className="text-center mb-10">
            {eyebrow && (
                <p className="text-xs font-bold tracking-[0.2em] text-amber-700 mb-2">{eyebrow}</p>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading">{title}</h2>
        </div>
    );
}

const HONEY_TYPES = [
    { name: "百花蜜", desc: "様々な花の香りが楽しめる、奥深い味わい" },
    { name: "アカシア", desc: "クセが少なく、上品な甘さ" },
    { name: "トチ", desc: "フローラルな香りと柔らかな甘み" },
];

const DIVISIONS = [
    { name: "こども部門", desc: "中学生以下" },
    { name: "一般部門", desc: "高校生〜64歳" },
    { name: "シニア部門", desc: "65歳以上" },
];

const HOW_TO_APPLY = [
    "作品写真",
    "ペンネーム",
    "応募部門",
    "選んだはちみつ",
    "応募要項への同意文",
];

const RULES_OK = [
    "本人が描いた未発表作品",
    "紙・画材自由",
    "正方形を意識した構図",
    "文字あり・なし、どちらも可",
];

const RULES_NG = [
    "AI生成画像",
    "既存キャラクター",
    "企業ロゴ",
    "模写",
    "写真トレース",
    "その他、権利侵害にあたる作品",
];

const HONEY_AWARDS = ["百花蜜賞", "アカシア賞", "トチ賞"];
const DIVISION_AWARDS = ["こども部門特別賞", "一般部門特別賞", "シニア部門特別賞"];

export default function HoneyLabelEventPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#FBF8F1]">
            <Header />

            <main className="flex-1">
                {/* 1. ファーストビュー */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-[#FBF8F1] to-[#FBF8F1]" />
                    <div className="absolute -top-10 -right-10 text-amber-200/60">
                        <Flower2 className="w-56 h-56" strokeWidth={0.8} />
                    </div>
                    <div className="relative container mx-auto px-4 md:px-6 py-20 md:py-28 text-center max-w-3xl">
                        <p className="inline-block text-xs font-bold tracking-[0.2em] text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
                            手描きラベル作品募集
                        </p>
                        <h1 className="text-3xl md:text-5xl font-bold text-stone-900 font-heading leading-relaxed md:leading-relaxed mb-6">
                            みんなでつくる、
                            <br />
                            安藤青果のはちみつラベル
                        </h1>
                        <p className="text-lg md:text-xl text-stone-700 leading-relaxed mb-3">
                            花・ミツバチ・はちみつを自由に描こう！
                        </p>
                        <p className="text-base md:text-lg text-stone-600 leading-relaxed mb-10">
                            あなたの作品が、
                            <br className="md:hidden" />
                            限定はちみつラベルになるかもしれません。
                        </p>

                        <div className="inline-flex flex-col items-center gap-1 bg-white border border-amber-200 rounded-2xl px-6 py-3 mb-10 shadow-sm">
                            <span className="text-xs font-bold text-stone-400">募集期間</span>
                            <span className="text-stone-900 font-bold">2026年8月10日〜8月30日 23:59</span>
                        </div>

                        <div>
                            <LineCTA />
                        </div>
                    </div>
                </section>

                {/* 2. 企画について */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <SectionHeading eyebrow="About" title="企画について" />
                        <div className="bg-[#FBF8F1] rounded-3xl p-8 md:p-10 text-stone-700 leading-loose space-y-4">
                            <p>
                                安藤青果では、お客さまと一緒につくる商品づくりとして、手描きはちみつラベル募集企画を開催します。
                            </p>
                            <p>
                                応募作品の中から選ばれた作品は、限定ラベル商品として販売予定です。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. 募集テーマ */}
                <section className="py-16 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <SectionHeading eyebrow="Theme" title="募集テーマ" />
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-bold text-stone-900 mb-8">
                                花・ミツバチ・はちみつを自由に描こう！
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {["花だけ", "ミツバチだけ", "はちみつだけ"].map((t) => (
                                    <span
                                        key={t}
                                        className="bg-white border border-amber-200 text-stone-700 text-sm font-medium px-5 py-2.5 rounded-full shadow-sm"
                                    >
                                        {t}でも応募可能
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. 対象商品 */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                        <SectionHeading eyebrow="Honey" title="対象商品" />
                        <p className="text-center text-stone-600 mb-10">
                            応募時に、描きたい蜜種を1つ選んでいただきます。
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {HONEY_TYPES.map((h) => (
                                <div
                                    key={h.name}
                                    className="bg-[#FBF8F1] border border-amber-100 rounded-2xl p-6 text-center"
                                >
                                    <div className="text-3xl mb-3">🍯</div>
                                    <h3 className="font-bold text-stone-900 mb-1">{h.name} 150g</h3>
                                    <p className="text-xs text-stone-500 leading-relaxed">{h.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. 応募資格・部門 */}
                <section className="py-16 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <SectionHeading eyebrow="Entry" title="応募資格・部門" />
                        <p className="text-center text-stone-700 mb-10">
                            公式LINE友だちなら、どなたでも応募できます。
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                            {DIVISIONS.map((d) => (
                                <div key={d.name} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                                    <Users className="w-6 h-6 text-primary mx-auto mb-3" />
                                    <h3 className="font-bold text-stone-900 mb-1">{d.name}</h3>
                                    <p className="text-xs text-stone-500">{d.desc}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-sm text-stone-500">
                            ※18歳未満の方は、保護者の同意が必須です。
                        </p>
                    </div>
                </section>

                {/* 6. 応募方法 */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <SectionHeading eyebrow="How to apply" title="応募方法" />
                        <p className="text-center text-stone-700 mb-10">
                            公式LINEのトークへ、以下の項目を送信してください。
                        </p>
                        <ol className="space-y-3">
                            {HOW_TO_APPLY.map((item, i) => (
                                <li
                                    key={item}
                                    className="flex items-center gap-4 bg-[#FBF8F1] rounded-xl px-5 py-4"
                                >
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <span className="text-stone-800 font-medium">{item}</span>
                                </li>
                            ))}
                        </ol>
                        <div className="text-center mt-10">
                            <LineCTA />
                        </div>
                    </div>
                </section>

                {/* 7. 作品ルール */}
                <section className="py-16 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                        <SectionHeading eyebrow="Rules" title="作品ルール" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border border-emerald-100 rounded-2xl p-6 md:p-8">
                                <h3 className="flex items-center gap-2 font-bold text-emerald-700 mb-4">
                                    <Check className="w-5 h-5" />
                                    OK
                                </h3>
                                <ul className="space-y-2.5 text-sm text-stone-700">
                                    {RULES_OK.map((r) => (
                                        <li key={r} className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white border border-red-100 rounded-2xl p-6 md:p-8">
                                <h3 className="flex items-center gap-2 font-bold text-red-500 mb-4">
                                    <X className="w-5 h-5" />
                                    NG
                                </h3>
                                <ul className="space-y-2.5 text-sm text-stone-700">
                                    {RULES_NG.map((r) => (
                                        <li key={r} className="flex items-start gap-2">
                                            <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 8. 選考方法 */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <SectionHeading eyebrow="Judging" title="選考方法" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <div className="bg-[#FBF8F1] rounded-2xl p-6">
                                <h3 className="font-bold text-stone-900 mb-3">はちみつ賞</h3>
                                <p className="text-xs text-stone-500 mb-4">蜜種ごとに1作品を選出</p>
                                <ul className="space-y-1.5 text-sm text-stone-700">
                                    {HONEY_AWARDS.map((a) => (
                                        <li key={a} className="flex items-center gap-2">
                                            <Award className="w-4 h-4 text-amber-500" />
                                            {a}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-[#FBF8F1] rounded-2xl p-6">
                                <h3 className="font-bold text-stone-900 mb-3">部門特別賞</h3>
                                <p className="text-xs text-stone-500 mb-4">部門ごとに選出</p>
                                <ul className="space-y-1.5 text-sm text-stone-700">
                                    {DIVISION_AWARDS.map((a) => (
                                        <li key={a} className="flex items-center gap-2">
                                            <Award className="w-4 h-4 text-primary" />
                                            {a}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <p className="text-center text-sm text-stone-500">最大6名が受賞予定です。</p>
                    </div>
                </section>

                {/* 9. 賞品 */}
                <section className="py-16 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <SectionHeading eyebrow="Prize" title="賞品" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                                <Sparkles className="w-6 h-6 text-amber-500 mb-3" />
                                <h3 className="font-bold text-stone-900 mb-2">はちみつ賞</h3>
                                <p className="text-sm text-stone-600 leading-relaxed">
                                    受賞3作品の限定ラベル150g、3種セット
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                                <Sparkles className="w-6 h-6 text-primary mb-3" />
                                <h3 className="font-bold text-stone-900 mb-2">部門特別賞</h3>
                                <p className="text-sm text-stone-600 leading-relaxed">
                                    応募時に選んだ150gはちみつ 1個
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 10. 受賞作品の商品化 */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <SectionHeading eyebrow="After the award" title="受賞作品の商品化" />
                        <div className="bg-[#FBF8F1] rounded-3xl p-8 md:p-10 text-stone-700 leading-loose space-y-4">
                            <p>はちみつ賞を受賞した作品は、限定ラベルとして使用させていただきます。</p>
                            <p>商品化にあたっては、事前に作者ご本人（未成年の場合は保護者）へ確認いたします。</p>
                            <p className="font-medium text-stone-900">著作権は応募者に残ります。</p>
                        </div>
                    </div>
                </section>

                {/* 11. 応募要項詳細 */}
                <section className="py-16 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <SectionHeading eyebrow="Guidelines" title="応募要項詳細" />
                        <div className="space-y-3">
                            <details className="group bg-white rounded-2xl shadow-sm overflow-hidden">
                                <summary className="flex items-center gap-3 px-6 py-4 font-bold text-stone-900 cursor-pointer list-none">
                                    <Camera className="w-4 h-4 text-primary flex-shrink-0" />
                                    写真条件
                                </summary>
                                <div className="px-6 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
                                    作品全体がはっきり写るよう、明るい場所で撮影してください。影や反射で見えにくい写真は選考対象外となる場合があります。
                                </div>
                            </details>
                            <details className="group bg-white rounded-2xl shadow-sm overflow-hidden">
                                <summary className="flex items-center gap-3 px-6 py-4 font-bold text-stone-900 cursor-pointer list-none">
                                    <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                                    個人情報
                                </summary>
                                <div className="px-6 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
                                    応募時にお預かりする情報は、本企画の運営・選考・当選者への連絡・商品化に関する確認のみに使用します。
                                </div>
                            </details>
                            <details className="group bg-white rounded-2xl shadow-sm overflow-hidden">
                                <summary className="flex items-center gap-3 px-6 py-4 font-bold text-stone-900 cursor-pointer list-none">
                                    <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                                    著作権
                                </summary>
                                <div className="px-6 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
                                    応募作品の著作権は応募者ご本人に帰属します。安藤青果が権利を譲り受けることはありません。
                                </div>
                            </details>
                            <details className="group bg-white rounded-2xl shadow-sm overflow-hidden">
                                <summary className="flex items-center gap-3 px-6 py-4 font-bold text-stone-900 cursor-pointer list-none">
                                    <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                                    利用許諾
                                </summary>
                                <div className="px-6 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
                                    応募いただくことで、受賞作品を商品ラベル・告知・販促物等に使用することへご同意いただいたものとみなします（商品化前に改めて本人確認は行います）。
                                </div>
                            </details>
                            <details className="group bg-white rounded-2xl shadow-sm overflow-hidden">
                                <summary className="flex items-center gap-3 px-6 py-4 font-bold text-stone-900 cursor-pointer list-none">
                                    <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                                    注意事項
                                </summary>
                                <div className="px-6 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
                                    応募内容に不備がある場合や、作品ルールに反する場合は、選考対象外とさせていただくことがあります。あらかじめご了承ください。
                                </div>
                            </details>
                        </div>
                    </div>
                </section>

                {/* 12. CTA */}
                <section className="py-20 md:py-24 bg-primary text-white text-center">
                    <div className="container mx-auto px-4 max-w-2xl">
                        <h2 className="text-2xl md:text-3xl font-bold font-heading leading-relaxed mb-10">
                            あなたの作品で、
                            <br />
                            安藤青果のはちみつラベルを
                            <br className="md:hidden" />
                            一緒につくりませんか？
                        </h2>
                        <LineCTA variant="white" />
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
