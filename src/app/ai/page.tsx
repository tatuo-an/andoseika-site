import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileStickyCta } from "@/components/ai/MobileStickyCta";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    Camera,
    Check,
    MessageCircle,
    PlayCircle,
    Phone,
    CheckCircle2,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        absolute:
            "SNS運用代行・公式LINE構築 AND U｜写真を送るだけ、あとはこちらで回します",
    },
    description:
        "鳥取の店舗向けSNS運用代行・公式LINE構築。写真を送るだけで、投稿とLINE配信をこちらが毎日回します。実測29.2万表示の実績あり。AND U（アンドユー）の無料相談で、今の状況をお聞かせください。",
    openGraph: {
        title: "SNS運用代行・公式LINE構築 AND U｜写真を送るだけ、あとはこちらで回します",
        description:
            "鳥取の店舗向けSNS運用代行・公式LINE構築。写真を送るだけで、投稿とLINE配信をこちらが毎日回します。実測29.2万表示の実績あり。",
        images: [
            {
                url: "/images/about/founders.jpg",
                width: 1024,
                height: 1024,
                alt: "AND U運営責任者 安藤匡志",
            },
        ],
    },
};

const LECTURE_PLAYLIST_URL =
    "https://www.youtube.com/playlist?list=PLROQFcuDUc6U";

const LECTURE_VIDEOS: { title: string; youtubeId: string }[] = [
    {
        title: "地方の中小企業がAIを導入する前にやること｜仕組み化診断",
        youtubeId: "6JpXlc3bswQ",
    },
    {
        title: "毎朝の発信をAIで自動化した仕組み｜ネタ1つ出口4つ",
        youtubeId: "h9fN6wL74m8",
    },
    {
        title: "経理をAIで半自動化した実例｜仕訳・採算・帳簿点検",
        youtubeId: "Sjf_RqeOf9Q",
    },
    {
        title: "AI導入の最初の一週間｜紙に1つ書き出すだけ",
        youtubeId: "a65M6BFtZ4c",
    },
    {
        title: "仕入れと廃棄を見える化した話｜勘から数字へ",
        youtubeId: "Y-hOqWcvXLc",
    },
    {
        title: "毎朝の会議をAIとやる仕組み｜台帳と日誌で回す",
        youtubeId: "nw3DXT_VJwk",
    },
    {
        title: "AI導入で失敗する3つのパターン｜自社の反省録",
        youtubeId: "oa_zmCN2b9c",
    },
    {
        title: "AIの道具代は結局いくら？｜缶コーヒー数本分の実例",
        youtubeId: "mYRqAoJs4jU",
    },
    {
        title: "請求書づくりをAIで半自動化した話｜LINE注文の仕組み",
        youtubeId: "r6eWJvozBRw",
    },
    {
        title: "仕組み化診断から伴走支援まで｜全10回まとめ",
        youtubeId: "nerm49aKmx8",
    },
];

const [FIRST_LECTURE_VIDEO, ...REST_LECTURE_VIDEOS] = LECTURE_VIDEOS;

const HERO_TAGS = ["鳥取の店舗向け", "写真を送るだけ", "SNS投稿とLINE配信まで"];

const WORRY_ITEMS = [
    "営業が終わってから、今日の投稿を考える気力が残っていない",
    "何を書けば読まれるのか、正直よく分からない",
    "フォロワーは増えたのに、お店に来る人は増えていない",
    "写真は撮っているのに、投稿しないまま溜まっていく",
];

const PLAN_STEPS = [
    {
        step: "STEP 1",
        text: "無料相談（60分）。今の状態と、任せたい範囲を聞かせてください。",
    },
    {
        step: "STEP 2",
        text: "初期構築（2週間目安）。SNSアカウントの設計と、公式LINEの土台をつくります。",
    },
    {
        step: "STEP 3",
        text: "月額運用スタート。あとは写真を送っていただくだけの毎日になります。",
    },
];

const FAQ_ITEMS = [
    {
        q: "契約の縛りはありますか",
        a: "月額プランは3ヶ月を1つの区切りとしています。3ヶ月経過したあとは、いつでも解約いただけます。",
    },
    {
        q: "SNSアカウントを持っていなくても頼めますか",
        a: "はい。新規開設からお受けします。その場合のみ初期設定費＋3万円をいただきます。開設直後のアカウントは慎重に扱う必要があるため、最初の1週間はこちらが手動で丁寧に運用します。",
    },
    {
        q: "買い切りの場合、納品後の費用はかかりますか",
        a: "毎月の費用はかかりません。不具合対応や修正のご依頼があった場合だけ、都度お見積りで別途料金をいただきます。",
    },
    {
        q: "写真はスマホで撮ったものでいいですか",
        a: "はい。スマホで撮った写真を送っていただければ十分です。",
    },
    {
        q: "効果はいつから出ますか",
        a: "正直にお伝えすると、この事業は始まったばかりで、長期の実績はまだこれから作るところです。目安として2〜3ヶ月は見てください。毎月の数字報告で、経過はすべてそのままお見せします。",
    },
    {
        q: "解約したら、SNSアカウントや公式LINEはどうなりますか",
        a: "すべてお店のものとしてお渡しします。当方が持ち続けることはありません。",
    },
    {
        q: "対応地域はどこまでですか",
        a: "鳥取近隣のお店を優先していますが、オンラインでのやり取りで全国どこからでもご相談いただけます。",
    },
];

const PLAN_TABLE_HEADERS: {
    key: "light" | "standard" | "full";
    name: string;
    price: string;
    featured?: boolean;
}[] = [
    { key: "light", name: "ライト", price: "3万円" },
    { key: "standard", name: "スタンダード", price: "5万円", featured: true },
    { key: "full", name: "おまかせフル", price: "10万円" },
];

type PlanRow = { label: string; light: boolean; standard: boolean; full: boolean };

const CAN_DO_ROWS: PlanRow[] = [
    { label: "毎日の投稿代行（1日2投稿）", light: true, standard: true, full: true },
    { label: "公式LINE配信", light: false, standard: true, full: true },
    { label: "月1数字報告", light: false, standard: true, full: true },
    { label: "コメント対応", light: false, standard: false, full: true },
    { label: "キャンペーン企画", light: false, standard: false, full: true },
];

const TARGET_SNS_ROWS: PlanRow[] = [
    { label: "Facebook", light: true, standard: true, full: true },
    { label: "Instagram", light: true, standard: true, full: true },
    { label: "Threads", light: true, standard: true, full: true },
    { label: "X", light: false, standard: true, full: true },
    { label: "YouTube", light: false, standard: true, full: true },
    { label: "ブログ（noteなど）", light: false, standard: false, full: true },
    { label: "TikTok・LinkedIn（ご希望で）", light: false, standard: false, full: true },
];

function BigCta({ label = "無料相談に申し込む" }: { label?: string }) {
    return (
        <div className="text-center">
            <Link
                href="/contact/personal?subject=sns-line"
                className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
                {label}
                <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </div>
    );
}

function TextLinkCta({
    text,
    href = "/contact/personal?subject=sns-line",
}: {
    text: string;
    href?: string;
}) {
    return (
        <div className="text-center">
            <Link
                href={href}
                className="inline-flex items-center gap-1 text-sm font-bold text-stone-800 hover:text-primary transition-colors"
            >
                {text}
                <ArrowRight className="h-3.5 w-3.5" />
            </Link>
        </div>
    );
}

function PlanCompareTable({ title, rows }: { title: string; rows: PlanRow[] }) {
    return (
        <div className="max-w-md mx-auto overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <p className="border-b border-stone-200 bg-stone-50 px-3 py-2 text-sm font-bold text-stone-700">
                {title}
            </p>
            <table className="w-full table-fixed border-collapse text-sm">
                <thead>
                    <tr>
                        <th scope="col" className="w-[28%] p-1.5 md:p-2 text-left font-normal text-stone-400">
                            {""}
                        </th>
                        {PLAN_TABLE_HEADERS.map((plan) => (
                            <th
                                key={plan.key}
                                scope="col"
                                className={`p-1.5 md:p-2 text-center align-bottom ${
                                    plan.featured
                                        ? "border-x-2 border-t-2 border-primary bg-primary/5"
                                        : ""
                                }`}
                            >
                                {plan.featured && (
                                    <span className="mb-1 inline-block rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                                        おすすめ
                                    </span>
                                )}
                                <p
                                    className={`text-xs sm:text-sm whitespace-nowrap tracking-tight font-bold leading-tight ${
                                        plan.featured ? "text-primary" : "text-stone-700"
                                    }`}
                                >
                                    {plan.name}
                                </p>
                                <p className="text-[11px] font-normal text-stone-500">{plan.price}</p>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={row.label} className="border-t border-stone-100">
                            <th
                                scope="row"
                                className="p-1.5 md:p-2 text-left font-normal leading-snug text-stone-700"
                            >
                                {row.label}
                            </th>
                            <td className="p-1.5 md:p-2 text-center text-stone-700">
                                {row.light ? "○" : <span className="text-stone-300">—</span>}
                            </td>
                            <td
                                className={`p-1.5 md:p-2 text-center font-bold text-primary border-x-2 border-primary bg-primary/5 ${
                                    i === rows.length - 1 ? "border-b-2" : ""
                                }`}
                            >
                                {row.standard ? "○" : <span className="text-stone-300">—</span>}
                            </td>
                            <td className="p-1.5 md:p-2 text-center text-stone-700">
                                {row.full ? "○" : <span className="text-stone-300">—</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function AiConsultingPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1">
                {/* 1. ヒーロー（なぜ：思想＋CTA／写真は右カラム・md以上で2カラム） */}
                <section className="relative py-16 md:py-24 bg-stone-100 overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <div className="max-w-5xl mx-auto grid md:grid-cols-2 md:gap-14 items-center">
                            {/* 左: コピー＋CTA */}
                            <div className="text-center md:text-left space-y-5">
                                <span className="text-stone-500 font-bold tracking-widest uppercase text-sm">
                                    AND U — SNS運用代行 × 公式LINE構築
                                </span>
                                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 leading-[1.2] font-heading">
                                    いいものを作っているのに、知られていない。
                                    <br className="hidden md:block" />
                                    それが一番もったいないと思っています。
                                </h1>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                    {HERO_TAGS.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm font-medium text-stone-600"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <p className="text-stone-700 text-base md:text-lg leading-relaxed">
                                    写真を送るだけ。SNSと公式LINEは、ぜんぶこちらで回します。
                                </p>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    安藤（ANDO）の名前には、最初から「AND」が入っています。あなたのお店と、一緒に。それでAND
                                    Uです。
                                </p>

                                <div className="pt-2">
                                    <div className="flex justify-center md:justify-start">
                                        <Link
                                            href="/contact/personal?subject=sns-line"
                                            className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
                                        >
                                            無料相談に申し込む
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </div>
                                    <p className="text-stone-600 text-sm mt-3">
                                        60分・オンライン可・売り込みはしません
                                    </p>
                                </div>
                            </div>

                            {/* 右: 顔写真＋実績のちいさな予告（md以上）／モバイルはCTAの下に積む */}
                            <div className="mt-10 md:mt-0">
                                <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
                                    <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-stone-100">
                                        <Image
                                            src="/images/about/founders.jpg"
                                            alt="AND U運営責任者 安藤匡志"
                                            fill
                                            priority
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-stone-900">安藤 匡志</p>
                                        <p className="text-sm text-stone-600">
                                            養蜂家 / 鳥取の青果卸「安藤青果」運営責任者
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded-2xl p-4 text-center border border-stone-200 shadow-sm">
                                        <p className="font-heading font-bold text-primary text-2xl">
                                            13,923<span className="text-sm text-stone-700 ml-0.5">人</span>
                                        </p>
                                        <p className="text-sm text-stone-500 mt-1">Xフォロワー</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 text-center border border-stone-200 shadow-sm">
                                        <p className="font-heading font-bold text-primary text-2xl">
                                            1.4万<span className="text-sm text-stone-700 ml-0.5">いいね</span>
                                        </p>
                                        <p className="text-sm text-stone-500 mt-1">Threads最高記録</p>
                                    </div>
                                </div>
                                <p className="text-stone-600 text-sm text-center mt-3">
                                    この運用を、あなたのお店の分まで代行します。
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                <div id="hero-end-sentinel" />

                {/* 2. 悩み共感（店主の生活の言葉） */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading">
                                こんな夜、ありませんか。
                            </h2>
                        </div>

                        <ul className="grid gap-3 md:grid-cols-2">
                            {WORRY_ITEMS.map((item) => (
                                <li
                                    key={item}
                                    className="flex items-start gap-3 bg-stone-50 border border-stone-100 rounded-2xl p-4 md:p-5 text-stone-700 text-base leading-relaxed"
                                >
                                    <Check className="h-5 w-5 text-stone-400 flex-shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <p className="text-stone-700 leading-relaxed mt-8 text-center">
                            どれか一つでも当てはまるなら、この先を読んでください。
                        </p>
                    </div>
                </section>

                {/* 3. 証拠（なに：実演販売。実物のスクショと数字を1本のカードに一体化） */}
                <section className="py-16 md:py-20 bg-stone-50">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading mb-6">
                                まず、自分の店で毎日やっています。
                            </h2>
                            <p className="text-stone-700 leading-relaxed text-left md:text-center">
                                デモではなく実物です。鳥取で農業と養蜂をやっている当方自身が、閉店後の1時間をスマホとにらめっこせずに過ごせる毎日を、先に体験しています。
                            </p>
                        </div>

                        {/* 実物その1: Xでバズった投稿。スクショ→実測値を一体化 */}
                        <div className="mx-auto max-w-md bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                            <div className="p-6 md:p-8 flex justify-center bg-stone-50">
                                <div className="w-full rounded-2xl border-[6px] border-stone-900 shadow-xl overflow-hidden bg-stone-900">
                                    <div className="rounded-xl overflow-hidden bg-white">
                                        <Image
                                            src="/images/ai/x-viral-post.png"
                                            alt="実際のX投稿のスクリーンショット。表示回数29.2万件・リポスト367件・いいね2,000件・ブックマーク229件と表示されている。"
                                            width={1300}
                                            height={570}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 border-t border-stone-100">
                                <p className="text-center text-sm text-stone-500 mb-4">
                                    実際の投稿（2026年7月・X）
                                </p>
                                <p className="text-center text-stone-900 font-bold text-lg">
                                    表示29.2万件・いいね2,000件・リポスト367件
                                </p>
                                <p className="text-stone-700 text-sm md:text-base mt-4 leading-relaxed text-center">
                                    同じ投稿へのリプライも、表示5.2万件・いいね1,031件まで伸びました。1本の話から、こういう反応が生まれます。
                                </p>
                            </div>
                        </div>

                        {/* 実物その2: Threadsでバズった投稿。739人の解説つき */}
                        <div className="mx-auto max-w-md bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mt-8">
                            <div className="p-6 md:p-8 flex justify-center bg-stone-50">
                                <div className="w-[220px] rounded-2xl border-[6px] border-stone-900 shadow-xl overflow-hidden bg-stone-900">
                                    <div className="rounded-xl overflow-hidden bg-white">
                                        <Image
                                            src="/images/ai/threads-14000-likes.png"
                                            alt="実際のThreads投稿のスクリーンショット。いいね1.4万件・コメント157件・リポスト271件と表示されている。"
                                            width={520}
                                            height={565}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 border-t border-stone-100">
                                <p className="text-center text-sm text-stone-500 mb-4">
                                    実際の投稿（2026年8月・Threads）
                                </p>
                                <p className="text-center text-stone-900 font-bold text-lg">
                                    いいね1.4万件・コメント157件・リポスト271件
                                </p>
                                <p className="text-center text-stone-600 text-sm mt-1">
                                    1本の投稿で、ここまで反応がありました。
                                </p>

                                <div className="border-t border-stone-100 mt-6 pt-6 text-center">
                                    <p className="text-stone-600 text-sm mb-2">
                                        この投稿を出したとき、Threadsのフォロワーは
                                    </p>
                                    <p className="font-heading font-bold text-primary text-4xl md:text-5xl">
                                        739<span className="text-lg text-stone-800 ml-1">人</span>
                                    </p>
                                    <p className="text-stone-700 text-sm md:text-base mt-4 leading-relaxed">
                                        フォロワーが少なくても、中身と仕組みがあれば届きます。「うちはフォロワーがいないから」で終わらせなくて大丈夫です。
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 実物その3: Xプロフィール。実測13,923人（画面表示は1.3万）を実物で裏づけ */}
                        <div className="mx-auto max-w-md bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mt-8">
                            <div className="p-6 md:p-8 flex justify-center bg-stone-50">
                                <div className="w-full rounded-2xl border-[6px] border-stone-900 shadow-xl overflow-hidden bg-stone-900">
                                    <div className="rounded-xl overflow-hidden bg-white">
                                        <Image
                                            src="/images/ai/x-profile.png"
                                            alt="実際のXプロフィール画面のスクリーンショット。認証バッジ付きアカウントで、1.3万フォロワーと表示されている。"
                                            width={1214}
                                            height={943}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 border-t border-stone-100 text-center">
                                <p className="font-heading font-bold text-primary text-4xl md:text-5xl">
                                    13,923<span className="text-lg text-stone-800 ml-1">人</span>
                                </p>
                                <p className="text-stone-600 text-sm mt-2">
                                    X（旧Twitter）のフォロワー・2026年8月時点
                                </p>
                            </div>
                        </div>

                        {/* 養蜂の実写（本人が現場をやっている証拠） */}
                        <div className="max-w-sm mx-auto mt-10">
                            <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
                                <Image
                                    src="/images/ai/ando-beekeeping.jpg"
                                    alt="実際に養蜂をしている安藤本人。巣板を持ち上げているところ。"
                                    width={1280}
                                    height={1280}
                                    sizes="384px"
                                    className="w-full h-auto"
                                />
                            </div>
                            <p className="text-center text-sm text-stone-500 mt-2">
                                SNSも、この畑と巣箱を回しながらやっています。
                            </p>
                        </div>

                        <p className="text-stone-700 leading-relaxed mt-10 text-left md:text-center max-w-xl mx-auto">
                            現在、地元のラーメン店と美容室のSNS運用を実際に担当しています。
                        </p>

                        {/* 差し込み予定: クライアント実績データ（本人確認済みの実数字が出たら追記。未検証の間は空欄のまま）
                            例: ○○様（ラーメン店）フォロワー数◯人→◯人／LINE登録者◯人 等。実額・保証表現は禁止 */}

                        <p className="text-center text-stone-500 text-sm mt-8">
                            やり方は、無料相談のときにそのままお見せします。
                        </p>
                    </div>
                </section>

                {/* 4. 何をするか（どうやって） */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                        <div className="text-center mb-8 max-w-2xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading mb-6">
                                写真を送るだけ。あとはこちらで回します。
                            </h2>
                            <p className="text-stone-700 leading-relaxed">
                                SNS投稿代行と公式LINE構築、この2つに絞ってやっています。
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-stone-50 rounded-2xl p-6 md:p-8 border border-stone-100">
                                <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-700 mb-4">
                                    <Camera className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-stone-900 mb-3">SNS投稿代行</h3>
                                <p className="text-sm text-stone-500 mb-1">困り事</p>
                                <p className="text-stone-700 text-sm leading-relaxed mb-3">
                                    投稿する時間も、文章を考える余力もない
                                </p>
                                <p className="text-sm text-stone-500 mb-1">任せられる実作業</p>
                                <p className="text-stone-700 text-sm leading-relaxed">
                                    写真を受け取ってから、文章づくり・投稿までこちらで
                                </p>
                            </div>
                            <div className="bg-stone-50 rounded-2xl p-6 md:p-8 border border-stone-100">
                                <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-700 mb-4">
                                    <MessageCircle className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-stone-900 mb-3">公式LINE構築</h3>
                                <p className="text-sm text-stone-500 mb-1">困り事</p>
                                <p className="text-stone-700 text-sm leading-relaxed mb-3">
                                    フォロワーが増えても、来店やリピートにつながらない
                                </p>
                                <p className="text-sm text-stone-500 mb-1">任せられる実作業</p>
                                <p className="text-stone-700 text-sm leading-relaxed">
                                    公式LINEの設計から、登録してもらう導線、配信まで
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 py-8 border-t border-b border-stone-200 text-center">
                            <p className="font-heading text-lg md:text-xl text-stone-900 leading-relaxed">
                                フォロワーは、<strong>SNS会社のもの</strong>です。
                                <br />
                                LINEの友だちは、<strong>あなたのお店のもの</strong>です。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 5. 料金 */}
                <section className="py-16 md:py-20 bg-stone-100">
                    <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                        <div className="text-center mb-8 max-w-2xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading">
                                料金は、まずは無料相談から。
                            </h2>
                        </div>

                        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-6 md:p-8 mb-10">
                            <p className="text-sm text-stone-500 tracking-wide mb-2">
                                まずはここから・全員の入口
                            </p>
                            <h3 className="font-bold text-stone-900 mb-1">無料相談</h3>
                            <p className="text-2xl font-bold text-stone-900 mb-3">
                                無料<span className="text-sm font-normal text-stone-500">（60分）</span>
                            </p>
                            <p className="text-stone-700 text-sm leading-relaxed mb-5">
                                今のSNSと、目指したいお店の状態を聞かせてください。話した結果、力になれないと分かることもあります。それでも構いません。
                            </p>
                            <Link
                                href="/contact/personal?subject=sns-line"
                                className="inline-flex items-center justify-center w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-full transition-all"
                            >
                                無料相談に申し込む
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>

                        <p className="text-stone-700 text-sm mb-2 text-center">
                            相談のあとは、月額プランからお選びいただけます。
                        </p>
                        <p className="text-stone-900 text-sm font-bold mb-1 text-center">
                            SNSアカウントをすでにお持ちの場合、初期構築費は不要です（月額に含まれています）。
                        </p>
                        <p className="text-stone-600 text-sm mb-4 text-center">
                            新規でアカウント開設が必要な場合のみ、初期設定費＋3万円をいただきます（アカウント開設と、安全に育てるための初週の手動運用まで込み）。
                        </p>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl border border-stone-200 p-6">
                                <p className="text-sm font-bold text-stone-900 mb-1">ライト</p>
                                <p className="text-2xl font-bold text-stone-900 mb-2">
                                    3<span className="text-sm font-normal text-stone-500 ml-1">万円（税込・月額）</span>
                                </p>
                                <p className="text-stone-600 text-sm">投稿代行のみ</p>
                            </div>
                            <div className="bg-primary/5 rounded-2xl border-2 border-primary p-6 relative">
                                <span className="inline-block bg-primary text-white text-sm font-bold px-3 py-1 rounded-full mb-2">
                                    おすすめ
                                </span>
                                <p className="text-sm font-bold text-primary mb-1">スタンダード</p>
                                <p className="text-2xl font-bold text-stone-900 mb-2">
                                    5<span className="text-sm font-normal text-stone-500 ml-1">万円（税込・月額）</span>
                                </p>
                                <p className="text-stone-700 text-sm mb-4">LINE配信＋月1報告つき</p>
                                <Link
                                    href="/contact/personal?subject=sns-line"
                                    className="inline-flex items-center justify-center w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-full text-sm transition-all"
                                >
                                    このプランで申し込む
                                </Link>
                            </div>
                            <div className="bg-white rounded-2xl border border-stone-200 p-6">
                                <p className="text-sm font-bold text-stone-900 mb-1">おまかせフル</p>
                                <p className="text-2xl font-bold text-stone-900 mb-2">
                                    10
                                    <span className="text-sm font-normal text-stone-500 ml-1">万円（税込・月額）</span>
                                </p>
                                <p className="text-stone-600 text-sm">企画・コメント対応まで全部</p>
                            </div>
                        </div>

                        <p className="text-sm font-bold text-stone-500 text-center mt-10 mb-4">
                            プラン比較
                        </p>
                        <div className="space-y-4">
                            <PlanCompareTable title="できること" rows={CAN_DO_ROWS} />
                            <PlanCompareTable title="対象SNS" rows={TARGET_SNS_ROWS} />
                        </div>

                        <p className="text-stone-600 text-sm mt-6 text-center">
                            最初にご協力いただくお店には、モニター特別条件をご用意しています。
                        </p>

                        {/* 買い切り「初期構築おまかせパック」: 月額プランとは別枠 */}
                        <div className="max-w-2xl mx-auto mt-14 pt-10 border-t border-stone-300">
                            <p className="text-center text-sm font-bold text-stone-500 mb-2">
                                月額契約はせず、仕組みだけ作ってほしい方へ
                            </p>
                            <h3 className="text-center text-xl font-bold text-stone-900 font-heading mb-6">
                                初期構築おまかせパック
                            </h3>

                            <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
                                <p className="text-2xl font-bold text-stone-900 mb-2">
                                    10
                                    <span className="text-sm font-normal text-stone-500 ml-1">
                                        万円（税込・買い切り）
                                    </span>
                                </p>
                                <p className="text-stone-700 text-sm leading-relaxed mb-4">
                                    SNSアカウント設計と公式LINE構築を一式で仕上げて納品します。月額契約は不要です。
                                </p>

                                <p className="text-sm font-bold text-stone-500 mb-2">含まれるもの</p>
                                <ul className="space-y-1.5 mb-4">
                                    {[
                                        "SNSアカウントの設計・プロフィール文づくり",
                                        "公式LINEの開設・あいさつ配信・リッチメニュー",
                                        "毎日の投稿が自動で回る仕組みの構築",
                                        "店頭のLINE登録案内の作成",
                                        "初週の投稿づくり",
                                    ].map((text) => (
                                        <li
                                            key={text}
                                            className="flex items-start gap-2 text-stone-700 text-sm leading-relaxed"
                                        >
                                            <span className="text-stone-400 flex-shrink-0">・</span>
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="border-t border-stone-100 pt-3 space-y-2">
                                    <p className="text-stone-600 text-sm leading-relaxed">
                                        作った仕組みは、納品後もずっとお店のものです。
                                    </p>
                                    <p className="text-stone-600 text-sm leading-relaxed">
                                        納品後の不具合対応・修正のご依頼は、都度お見積り（別途料金）になります。
                                    </p>
                                    <p className="text-stone-600 text-sm leading-relaxed">
                                        あとから月3万円の運用サポート（ライトプラン）を追加することもできます。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. 正直告白 */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                        <div className="text-center mb-8 max-w-2xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading mb-6">
                                正直に言うと、どのお店にも向くわけではありません。
                            </h2>
                            <p className="text-stone-700 leading-relaxed">
                                合うお店と、合わないお店があります。ここは飾らずに書きます。
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden">
                                <div className="px-5 py-3 border-b border-stone-200 font-bold text-stone-900 text-sm">
                                    向いていると思うお店
                                </div>
                                <ul className="p-5 space-y-3">
                                    {[
                                        "写真は撮れるけど、文章と投稿が続かない",
                                        "SNSを増やすだけでなく、来店につながる形にしたい",
                                        "公式LINEを育てて、お店自身の資産にしたい",
                                        "効果が出るまで2〜3ヶ月かかることを許容できる",
                                    ].map((text) => (
                                        <li
                                            key={text}
                                            className="flex items-start gap-2 text-stone-700 text-sm leading-relaxed"
                                        >
                                            <span className="text-stone-400 font-bold flex-shrink-0">○</span>
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden">
                                <div className="px-5 py-3 border-b border-stone-200 font-bold text-stone-900 text-sm">
                                    向いていないと思うお店
                                </div>
                                <ul className="p-5 space-y-3">
                                    {[
                                        "今すぐ売上が倍になる魔法を求めている",
                                        "写真を一枚も送れない（現場の材料がない）",
                                        "発信の内容・言葉づかいを一切変えたくない",
                                        "月1回のやり取りすら負担に感じる",
                                    ].map((text) => (
                                        <li
                                            key={text}
                                            className="flex items-start gap-2 text-stone-700 text-sm leading-relaxed"
                                        >
                                            <span className="text-stone-400 font-bold flex-shrink-0">△</span>
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <TextLinkCta
                            text="自分の店が向いているか、無料相談で聞いてみる"
                        />

                        <p className="text-stone-700 leading-relaxed mt-6 text-left md:text-center max-w-2xl mx-auto">
                            当てはまらないと思ったら、無理に申し込む必要はありません。相談だけ受けて、合わないと分かって帰っていただいて構いません。
                        </p>
                    </div>
                </section>

                {/* 7. 進め方 */}
                <section className="py-16 md:py-20 bg-stone-50">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading">
                                始め方は3ステップです。
                            </h2>
                        </div>

                        <ol className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 md:p-8">
                            {PLAN_STEPS.map((item, i) => (
                                <li key={item.step} className="relative pl-14 pb-8 last:pb-0">
                                    {i !== PLAN_STEPS.length - 1 && (
                                        <span className="absolute left-5 top-10 bottom-0 w-px bg-stone-300" />
                                    )}
                                    <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white text-sm font-bold">
                                        {i + 1}
                                    </span>
                                    <p className="text-sm font-bold text-stone-500 mb-1">{item.step}</p>
                                    <p className="text-stone-700 text-base leading-relaxed">{item.text}</p>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-8">
                            <BigCta label="この内容で無料相談を申し込む" />
                        </div>
                    </div>
                </section>

                {/* 8. 無料相談の中身（AIでの仕組み化）＋動画講義 全10回 */}
                <section id="lecture" className="py-16 md:py-20 bg-white scroll-mt-16">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <div className="bg-stone-50 rounded-2xl border border-stone-100 p-6 md:p-10 mb-8">
                            <p className="font-bold text-stone-900 mb-3">
                                無料相談では、AIでの仕組み化もご相談いただけます。
                            </p>
                            <p className="text-stone-700 text-sm md:text-base leading-relaxed mb-6">
                                鳥取の小さな青果卸を経営しながら、実際に手を動かして作ってきた実例です。きれいな成功談だけでなく、うまくいかなかった話もそのままお伝えします。
                            </p>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-white rounded-xl p-3 md:p-4 text-center border border-stone-200">
                                    <p className="text-xl md:text-2xl font-bold text-primary font-heading">
                                        4ヶ月
                                    </p>
                                    <p className="text-sm text-stone-500 mt-1">で仕組み80本以上</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 md:p-4 text-center border border-stone-200">
                                    <p className="text-xl md:text-2xl font-bold text-primary font-heading">
                                        1日
                                    </p>
                                    <p className="text-sm text-stone-500 mt-1">で社内総点検</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 md:p-4 text-center border border-stone-200">
                                    <p className="text-xl md:text-2xl font-bold text-primary font-heading">7つ</p>
                                    <p className="text-sm text-stone-500 mt-1">は作って使わなかった</p>
                                </div>
                            </div>

                            <p className="text-stone-700 text-sm leading-relaxed mb-4">
                                やり方は、現場の仕事を棚卸しして、任せられる仕事を見極め、小さく始めるロードマップをつくる。この3つだけです。業種は問いません。
                            </p>
                            <p className="text-stone-500 text-sm leading-relaxed">
                                ※AIでの仕組み化・伴走支援の料金は、会社の規模やご相談内容によって変わるため、無料相談の中でお伝えします（上のSNS運用代行の料金表とは別です）。
                            </p>
                        </div>

                        <TextLinkCta
                            text="AIでの仕組み化についても、この場で相談できます"
                            href="/contact/personal?subject=ai-consulting"
                        />

                        <div className="text-center mt-14 mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading mb-6">
                                動画講義 全10回（無料・各3〜4分）
                            </h2>
                            <p className="text-stone-700 leading-relaxed">
                                仕組み化診断のやり方と、自社での実例を、10本のショート講義にまとめました。
                                第1回はこの場で見られます。
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
                            <div className="relative aspect-video bg-stone-200">
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${FIRST_LECTURE_VIDEO.youtubeId}`}
                                    title={FIRST_LECTURE_VIDEO.title}
                                    className="absolute inset-0 w-full h-full"
                                    loading="lazy"
                                    allowFullScreen
                                />
                            </div>
                            <div className="p-5">
                                <p className="text-sm text-stone-500 font-bold mb-1">第1回</p>
                                <h3 className="font-bold text-stone-900">{FIRST_LECTURE_VIDEO.title}</h3>
                            </div>
                        </div>

                        <details className="mt-6 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden group">
                            <summary className="cursor-pointer list-none flex items-center justify-between p-4 md:p-5 font-bold text-stone-900 hover:bg-stone-50 transition-colors">
                                <span>第2回〜第10回を見る（9本）</span>
                                <span className="text-stone-500 text-sm group-open:hidden">開く ▼</span>
                                <span className="text-stone-500 text-sm hidden group-open:inline">閉じる ▲</span>
                            </summary>
                            <ol className="divide-y divide-stone-100 border-t border-stone-100">
                                {REST_LECTURE_VIDEOS.map((video, index) => (
                                    <li key={video.youtubeId}>
                                        <a
                                            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 md:p-5 hover:bg-stone-50 transition-colors"
                                        >
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-200 text-stone-700 font-bold text-sm flex items-center justify-center">
                                                {index + 2}
                                            </span>
                                            <span className="flex-1 text-stone-800 text-sm md:text-base">
                                                {video.title}
                                            </span>
                                            <PlayCircle className="h-5 w-5 text-stone-400 flex-shrink-0" />
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </details>

                        <div className="text-center mt-6">
                            <a
                                href={LECTURE_PLAYLIST_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center font-bold text-stone-800 hover:text-stone-600"
                            >
                                ▶ 全10回をまとめて見る
                            </a>
                        </div>

                        <div className="mt-6">
                            <TextLinkCta text="動画を見て、話を聞いてみたくなったら" />
                        </div>

                        <div className="max-w-2xl mx-auto mt-10 space-y-5 text-stone-700 leading-relaxed">
                            <p>「見て終わり」で構いません。まずは知ってもらうためのものです。</p>
                            <p>
                                その上で、自分のお店の話を聞いてほしいと思った方は、無料相談にお申し込みください。今のSNSや仕事の悩みを聞かせてもらうだけでも大丈夫です。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 9. FAQ */}
                <section className="py-16 md:py-20 bg-stone-50">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading">
                                よくある質問
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {FAQ_ITEMS.map((item) => (
                                <div key={item.q}>
                                    <p className="font-bold text-stone-900 mb-2">
                                        <span className="text-stone-500 mr-1">Q.</span>
                                        {item.q}
                                    </p>
                                    <p className="text-stone-700 text-sm leading-relaxed pl-5">
                                        <span className="text-stone-500 mr-1">A.</span>
                                        {item.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 10. 最終CTA */}
                <section className="py-16 md:py-20 bg-primary text-white">
                    <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 font-heading">
                            気になった方は、ご連絡ください
                        </h2>
                        <p className="text-base md:text-lg mb-10 opacity-90 leading-relaxed">
                            スマホからのメッセージでも、電話でも構いません。
                            まずは今のSNSや仕事の悩みを聞かせてください。
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/contact/personal?subject=sns-line"
                                className="inline-flex items-center bg-white text-primary font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg"
                            >
                                無料相談に申し込む
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </div>

                        <div className="mt-8 inline-flex items-center gap-2 text-sm opacity-90">
                            <Phone className="h-4 w-4" />
                            <span>070-8434-8124（月〜土 9:00〜18:00・日祝休）</span>
                        </div>

                        <div className="mt-10 flex items-center justify-center gap-2 text-sm opacity-80">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>契約前提ではありません。まずはお話をお聞かせください。</span>
                        </div>

                        <div className="mt-6">
                            <Link
                                href="/contact/personal?subject=ai-consulting"
                                className="text-sm opacity-75 underline underline-offset-2"
                            >
                                AIでの社内の仕組み化について相談したい方はこちら
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <div id="footer-sentinel" />
            <Footer />
            <MobileStickyCta />
        </div>
    );
}
