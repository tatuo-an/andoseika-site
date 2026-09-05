import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { Zen_Maru_Gothic, Noto_Sans_JP } from "next/font/google";
import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";

const zenMaru = Zen_Maru_Gothic({
    weight: ["500", "700", "900"],
    subsets: ["latin"],
    variable: "--font-zen-maru",
    display: "swap",
});

const notoJp = Noto_Sans_JP({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
    variable: "--font-noto-jp",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        absolute: "うちの子が、毎日のLINEに登場する｜写真1枚でつくるLINEスタンプ",
    },
    description:
        "写真1枚で、その子だけのLINEスタンプを作ります。おためし1,000円から。まずはLINEに写真を1枚送ってください。1個だけ無料で作ってお見せします。鳥取で農業と養蜂をやっている安藤が、1件ずつ手で仕上げます。",
    openGraph: {
        title: "うちの子が、毎日のLINEに登場する｜写真1枚でつくるLINEスタンプ",
        description:
            "写真1枚で、その子だけのLINEスタンプ。おためし1,000円から。まずはLINEに写真を1枚送ってください。1個だけ無料で作ってお見せします。",
        images: [
            {
                url: "/images/stamp/hero-bg.png",
                width: 1672,
                height: 941,
                alt: "写真から作ったLINEスタンプ",
            },
        ],
    },
};

/* ------------------------------------------------------------------ */
/* 事実・定数                                                          */
/* ------------------------------------------------------------------ */

const LINE_ADD_FRIEND_URL = "https://lin.ee/WfeFzfF";
const LINE_OFFICIAL_ID = "@500ngbml";
const LINE_STORE_AUTHOR_URL = "https://line.me/S/shop/sticker/author/1272517";
const THREADS_URL = "https://www.threads.com/@tacchan_nooen";
const X_URL = "https://x.com/tacchannooen";

const CTA_LABEL = "LINEで写真を1枚送ってみる";
const CTA_SUB = "1個だけ無料で作ってお見せします";

const KYOUKAN = [
    "既製のスタンプじゃ、うちの子の顔にならない",
    "写真をそのまま送るのは、ちょっと",
    "描いてもらうのは高そう",
];

const STYLES: { id: string; name: string; desc: string }[] = [
    { id: "yurukawa", name: "ゆるカワ", desc: "線も色も少ない、脱力系" },
    { id: "suisai", name: "水彩・手描き", desc: "やさしい絵本のような" },
    { id: "kaodeka", name: "顔デカ似顔絵", desc: "特徴をぎゅっと似顔絵に" },
    { id: "doubutsu", name: "動物化", desc: "そっくりな動物キャラに" },
    { id: "amecomi", name: "アメコミ風", desc: "元気いっぱい、ポップ" },
    { id: "shonen-manga", name: "少年マンガ風", desc: "動きのある、勢いのある線" },
    { id: "showa", name: "昭和レトロ", desc: "どこか懐かしい、味のある" },
    { id: "senga-bw", name: "線画・白黒", desc: "シンプルで飽きのこない" },
    { id: "moe", name: "萌え系", desc: "大きな瞳とやわらかい色" },
];

const SOLD: { src: string; alt: string; name: string }[] = [
    { src: "/images/stamp/bee/01.png", alt: "ミツバチのLINEスタンプ", name: "ミツバチ" },
    { src: "/images/stamp/creatures/kumamushi/01.png", alt: "クマムシのLINEスタンプ", name: "クマムシ" },
    { src: "/images/stamp/creatures/uparuparu/01.png", alt: "ウーパールーパーのLINEスタンプ", name: "ウーパールーパー" },
    { src: "/images/stamp/creatures/hashibirokou/01.png", alt: "ハシビロコウのLINEスタンプ", name: "ハシビロコウ" },
];

const FLOW: { n: string; title: string; text: string; highlight?: boolean }[] = [
    {
        n: "1",
        title: "写真を1枚、LINEで送る",
        text: "公式LINEを友だち追加して、トークに写真を1枚。顔がはっきり写っているものが1枚あれば足ります。",
    },
    {
        n: "2",
        title: "1個だけ、無料で作ってお見せします",
        text: "受け取った写真から、スタンプを1個だけ作って送り返します。ここまでお金はかかりません。気に入らなければ、そこで終わりで大丈夫です。",
        highlight: true,
    },
    {
        n: "3",
        title: "気に入ったら、選んだ個数の制作へ",
        text: "8個・16個・24個から選び、タッチとセリフを決めて仕上げます。ここから費用がかかります。お支払いは、完成品を見ていただいたあと、LINEへ申請する前です。",
    },
    {
        n: "4",
        title: "LINEの審査を待つ",
        text: "できあがったスタンプをLINEに申請します。審査に数日〜1週間ほど。ここは待つだけです。",
    },
    {
        n: "5",
        title: "完成。家族のトークに登場します",
        text: "審査が通るとLINEストアに並びます。使う方それぞれにご購入いただければ、その日から使えます。",
    },
];

const PLANS: {
    id: string;
    name: string;
    lead: string;
    price: string;
    priceNote: string;
    rows?: { count: string; price: string }[];
    points: string[];
    bonus?: string;
    recommended?: boolean;
}[] = [
    {
        id: "trial",
        name: "おためし",
        lead: "無料の1個を見たあと、まず8個そろえてみる方へ",
        price: "1,000",
        priceNote: "円 / 静止スタンプ8個",
        points: [
            "タッチは「ゆるカワ」固定",
            "セリフは定番8種（おはよう・おやすみ・ありがとう・お疲れ様です・よろしくお願いします・OK！・がんばって・帰るよ）",
            "修正なし／お一人1回まで",
        ],
    },
    {
        id: "custom",
        name: "カスタム",
        lead: "タッチもセリフも自分で決める",
        price: "2,000",
        priceNote: "円〜 / 静止スタンプ",
        rows: [
            { count: "8個", price: "2,000円" },
            { count: "16個", price: "3,000円" },
            { count: "24個", price: "4,000円" },
        ],
        points: ["9つのタッチから選べます", "セリフは自由に決められます", "修正1回つき"],
        bonus: "おまけ：LINEアイコン用の丸画像1枚＋おうちで印刷できるシール台紙PDF",
        recommended: true,
    },
    {
        id: "animated",
        name: "動くスタンプ",
        lead: "ぴょこぴょこ動かしたい方へ",
        price: "3,500",
        priceNote: "円〜 / 動くスタンプ",
        rows: [
            { count: "8個", price: "3,500円" },
            { count: "16個", price: "5,000円" },
            { count: "24個", price: "6,500円" },
        ],
        points: ["9つのタッチから選べます", "セリフは自由に決められます", "修正1回つき"],
        bonus: "おまけ：丸画像1枚＋シール台紙PDF＋トーク背景画像1枚",
    },
];

const HONEST = [
    {
        t: "完成したあと、LINEストアでのご購入が別に必要です",
        d: "静止スタンプ190円〜、動くスタンプ250円ほど。LINEが決めている価格で、うちの収入にはなりません。ご家族で使う場合は、使う方おひとりずつのご購入が必要です。",
    },
    {
        t: "LINEの審査に数日〜1週間かかります",
        d: "長いと2週間ほどかかることもあります。この時間はこちらでは短くできません。",
    },
    {
        t: "完全に他人から見えない状態にはできません",
        d: "検索に出てこない設定で申請しますが、購入用のURLを知っている人は見ることができます。ここだけは仕組み上どうにもなりません。",
    },
    {
        t: "写真はご家族・ご自身・ペットのものだけでお願いします",
        d: "お子さんの写真は保護者の方からお送りください。お預かりした写真はスタンプ制作にだけ使い、納品から30日を目安に削除します。第三者へお渡しすることはありません。作例としてお見せしたい場合は、その都度あらためて許可をいただきます。",
    },
];

const FAQ: { q: string; a: string }[] = [
    {
        q: "正直、高くないですか",
        a: "まずはおためし1,000円をご利用ください。静止スタンプ8個で、雰囲気だけ確かめられます。それより前に、1個は無料でお作りします。ごきょうだい分やパパ用ママ用など、2パターン目からは1パターンにつき500円引きです。",
    },
    {
        q: "送った写真は、どう扱われますか",
        a: "スタンプ制作にだけ使い、納品から30日を目安に削除します。ご依頼主さま以外の第三者へお渡しすることはありません。作例として他のお客さまにお見せしたい場合は、その都度あらためて許可をいただいてからにします。",
    },
    {
        q: "知らない人に見られたり、買われたりしませんか",
        a: "LINEストアの検索結果には出てこない設定で申請します。ただし、購入用のURLを直接知っている人は閲覧・購入ができてしまいます。完全に他人から見られない状態にはできません。",
    },
    {
        q: "「1パターン」とは何ですか",
        a: "1パターン＝1人（1匹）を、1セット（8個・16個・24個のいずれか）分のスタンプに仕上げることです。ごきょうだいなど複数人をそれぞれスタンプにする場合は、人数分のパターンとしてお申し込みください。",
    },
    {
        q: "おためしとカスタムは、何が違いますか",
        a: "おためし（1,000円）はタッチが「ゆるカワ」固定、セリフも定番8種の固定で、修正はできません。おまけも付かず、お一人1回までです。カスタム（2,000円〜）は9つのタッチから選べて、セリフも自由に決められ、修正が1回付き、おまけも付きます。",
    },
    {
        q: "犬や猫でも作れますか",
        a: "作れます。ペットの写真からのご依頼も同じ料金です。表情違いが数枚あると、仕上がりの幅が広がります。",
    },
    {
        q: "似ていなかったら、どうなりますか",
        a: "無料でお見せする1個の時点で、似ているかどうかは判断できます。そこで違えば、費用はかからず終わりにできます。カスタムには修正が1回付いていますので、「もう少し目を細く」などお伝えください。おためしプランは修正なしです。2回目以降の修正は、軽微なものでも500円をいただきます。",
    },
];

/* ------------------------------------------------------------------ */
/* 部品                                                                */
/* ------------------------------------------------------------------ */

function Cta({ className = "" }: { className?: string }) {
    return (
        <Link
            href={LINE_ADD_FRIEND_URL}
            className={`inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-[#06C755] px-7 py-4 text-[16px] font-bold text-[#2B2118] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#2B2118] ${className}`}
        >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            {CTA_LABEL}
        </Link>
    );
}

function SectionTitle({
    children,
    sub,
}: {
    children: React.ReactNode;
    sub?: string;
}) {
    return (
        <header className="mb-8 md:mb-8">
            <h2 className="font-[family-name:var(--font-zen-maru)] text-[25px] leading-[1.45] font-bold md:text-[31px]">
                {children}
            </h2>
            {sub ? (
                <p className="mt-4 max-w-[30rem] text-[16px] leading-[1.8] text-[#6B5E52]">
                    {sub}
                </p>
            ) : null}
            <span
                aria-hidden="true"
                className="mt-6 block h-[3px] w-14 rounded-full bg-[#F2A900]"
            />
        </header>
    );
}

/* ヒーローのLINEトーク風モック（CSSとHTMLだけで組む）
   スタンプの「ぽん」は globals.css の .st-pop（300ms・1回・prefers-reduced-motion対応） */
function TalkMock() {
    return (
        <div className="mx-auto w-full max-w-[320px] rounded-[28px] border border-[#EADFCF] bg-white p-2 shadow-[0_24px_60px_-24px_rgba(43,33,24,0.35)] md:max-w-[360px]">
            <div className="overflow-hidden rounded-[22px] bg-[#EADFCF]">
                {/* トークのヘッダー */}
                <div className="flex items-center gap-2 bg-[#6B5E52] px-4 py-3">
                    <span
                        aria-hidden="true"
                        className="h-6 w-6 rounded-full bg-[#FFF9F0]"
                    />
                    <span className="text-[13px] font-bold text-white">家族</span>
                </div>

                {/* 会話 */}
                <div className="space-y-3 px-3 py-4">
                    <div className="flex items-end gap-2">
                        <span
                            aria-hidden="true"
                            className="h-7 w-7 shrink-0 rounded-full bg-[#FFF9F0]"
                        />
                        <p className="max-w-[74%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-[13px] leading-[1.8] text-[#2B2118]">
                            保育園のお迎え、行っておいたよ
                        </p>
                    </div>

                    <div className="st-pop motion-reduce:animate-none flex justify-end" style={{ animationDelay: "260ms" }}>
                        <Image
                            src="/images/stamp/styles/yurukawa/01.png"
                            alt="「ありがとう」と書かれた、写真から作ったLINEスタンプ"
                            width={320}
                            height={320}
                            sizes="(max-width: 767px) 132px, 148px"
                            priority
                            className="h-auto w-[132px] md:w-[148px]"
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <span
                            aria-hidden="true"
                            className="h-7 w-7 shrink-0 rounded-full bg-[#FFF9F0]"
                        />
                        <p className="max-w-[74%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-[13px] leading-[1.8] text-[#2B2118]">
                            そろそろ寝る時間だね
                        </p>
                    </div>

                    <div className="st-pop motion-reduce:animate-none flex justify-end" style={{ animationDelay: "560ms" }}>
                        <Image
                            src="/images/stamp/styles/yurukawa/08.png"
                            alt="「おやすみ」と書かれた、写真から作ったLINEスタンプ"
                            width={320}
                            height={320}
                            sizes="(max-width: 767px) 132px, 148px"
                            className="h-auto w-[132px] md:w-[148px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* ページ                                                              */
/* ------------------------------------------------------------------ */

export default function StampPage() {
    return (
        <div
            className={`${zenMaru.variable} ${notoJp.variable} font-[family-name:var(--font-noto-jp)] bg-[#FFF9F0] pb-32 text-[#2B2118] md:pb-0`}
        >
            <Header />

            <main>
                {/* 1. ヒーロー ------------------------------------------------ */}
                <section className="px-4 pt-10 pb-16 md:px-8 md:pt-16 md:pb-24">
                    <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-16">
                        <div>
                            <p className="text-[13px] font-bold tracking-[0.14em] text-[#6B5E52]">
                                鳥取のスタンプ工房
                            </p>
                            <h1 className="mt-4 font-[family-name:var(--font-zen-maru)] text-[31px] leading-[1.35] font-black md:text-[39px] lg:text-[49px]">
                                うちの子が、
                                <br />
                                毎日のLINEに
                                <br />
                                <span className="relative inline-block">
                                    <span className="relative z-10">登場する。</span>
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-x-0 bottom-1 z-0 h-3 rounded-sm bg-[#F2A900]/45 md:h-4"
                                    />
                                </span>
                            </h1>
                            <p className="mt-6 max-w-[26em] text-[16px] leading-[1.8] text-[#6B5E52] md:text-[20px]">
                                写真1枚で、その子だけのLINEスタンプ。
                                <br className="hidden md:block" />
                                おためし1,000円から。
                            </p>

                            <div className="mt-8">
                                <Cta />
                                <p className="mt-4 text-[13px] leading-[1.8] text-[#6B5E52]">
                                    {CTA_SUB}
                                </p>
                            </div>
                        </div>

                        <div className="md:pl-4">
                            <TalkMock />
                        </div>
                    </div>
                </section>

                {/* 2. 共感 ---------------------------------------------------- */}
                <section className="bg-white px-4 py-16 md:px-8 md:py-24">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="font-[family-name:var(--font-zen-maru)] text-[25px] leading-[1.45] font-bold md:text-[31px]">
                            思い当たること、ありませんか
                        </h2>
                        <p className="mt-4 text-[16px] leading-[1.8] text-[#6B5E52]">
                            たぶん、一度は思ったことがあるはずです。
                        </p>
                        <ul className="mt-8 space-y-6 md:space-y-8">
                            {KYOUKAN.map((line) => (
                                <li
                                    key={line}
                                    className="border-l-[3px] border-[#F2A900] pl-4 font-[family-name:var(--font-zen-maru)] text-[20px] leading-[1.6] font-bold md:pl-6 md:text-[25px]"
                                >
                                    「{line}」
                                </li>
                            ))}
                        </ul>
                        <p className="mt-8 max-w-[30rem] text-[16px] leading-[1.8] text-[#6B5E52]">
                            スタンプになってしまえば、写真そのものを送らなくてよくなります。もとになるのは、スマホに眠っている1枚だけです。
                        </p>
                    </div>
                </section>

                {/* 3. 証拠（1）9つのタッチ ------------------------------------- */}
                <section className="px-4 py-16 md:px-8 md:py-24">
                    <div className="mx-auto max-w-5xl">
                        <SectionTitle sub="下の9枚は、同じお子さんの写真1枚から作ったものです。掲載の許可をいただいています。">
                            同じ写真から、
                            <br className="md:hidden" />
                            9通りの絵にできます
                        </SectionTitle>

                        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
                            {STYLES.map((s) => (
                                <li
                                    key={s.id}
                                    className="overflow-hidden rounded-2xl border border-[#EADFCF] bg-white"
                                >
                                    <Image
                                        src={`/images/stamp/styles/${s.id}/01.png`}
                                        alt={`${s.name}のタッチで作ったLINEスタンプの作例`}
                                        width={320}
                                        height={320}
                                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 300px"
                                        className="h-auto w-full"
                                    />
                                    <div className="border-t border-[#EADFCF] px-4 py-4">
                                        <p className="font-[family-name:var(--font-zen-maru)] text-[16px] font-bold">
                                            {s.name}
                                        </p>
                                        <p className="mt-2 text-[13px] leading-[1.8] text-[#6B5E52]">
                                            {s.desc}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* 3. 証拠（2）販売中の実物＋数字 ------------------------------- */}
                <section className="bg-white px-4 py-16 md:px-8 md:py-24">
                    <div className="mx-auto max-w-5xl">
                        <SectionTitle sub="同じ手順で作ったスタンプを、自分でもLINEストアに並べています。審査を通った実物です。">
                            うちのスタンプも、
                            <br className="md:hidden" />
                            LINEストアで売っています
                        </SectionTitle>

                        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
                            {SOLD.map((s) => (
                                <li
                                    key={s.src}
                                    className="rounded-2xl border border-[#EADFCF] bg-[#FFF9F0] p-4 text-center"
                                >
                                    <Image
                                        src={s.src}
                                        alt={s.alt}
                                        width={370}
                                        height={320}
                                        sizes="(max-width: 640px) 45vw, 220px"
                                        className="mx-auto h-auto w-full"
                                    />
                                    <p className="mt-2 text-[13px] font-bold text-[#6B5E52]">
                                        {s.name}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        <p className="mt-6 text-[16px] leading-[1.8]">
                            <Link
                                href={LINE_STORE_AUTHOR_URL}
                                className="inline-flex min-h-11 items-center underline decoration-[#F2A900] decoration-2 underline-offset-4 hover:text-[#6B5E52] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2118]"
                            >
                                LINEストアの作者ページを見る
                            </Link>
                        </p>

                        <p className="mt-8 border-t border-[#EADFCF] pt-8 text-[16px] leading-[1.8] text-[#6B5E52] md:text-[20px]">
                            Xのフォロワーは1.5万人（2026年9月時点）。Threadsでは、蜂の投稿が1万いいねを超えたことがあります。
                            <span className="mt-2 flex flex-wrap gap-x-6">
                                <Link
                                    href={X_URL}
                                    className="inline-flex min-h-11 items-center text-[#2B2118] underline decoration-[#F2A900] decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2118]"
                                >
                                    Xのアカウントを見る
                                </Link>
                                <Link
                                    href={THREADS_URL}
                                    className="inline-flex min-h-11 items-center text-[#2B2118] underline decoration-[#F2A900] decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2118]"
                                >
                                    Threadsのアカウントを見る
                                </Link>
                            </span>
                        </p>
                    </div>
                </section>

                {/* 4. 流れ ---------------------------------------------------- */}
                <section className="px-4 py-16 md:px-8 md:py-24">
                    <div className="mx-auto max-w-3xl">
                        <SectionTitle sub="最初の一歩は、写真を1枚送るだけです。">
                            できるまでの5つの段階
                        </SectionTitle>

                        <ol className="space-y-4">
                            {FLOW.map((f) => (
                                <li
                                    key={f.n}
                                    className={
                                        f.highlight
                                            ? "rounded-2xl border-2 border-[#F2A900] bg-white p-6"
                                            : "rounded-2xl border border-[#EADFCF] bg-white/60 p-6"
                                    }
                                >
                                    <div className="flex gap-4">
                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-zen-maru)] text-[16px] font-bold ${
                                                f.highlight
                                                    ? "bg-[#F2A900] text-[#2B2118]"
                                                    : "bg-[#EADFCF] text-[#6B5E52]"
                                            }`}
                                        >
                                            {f.n}
                                        </span>
                                        <div>
                                            <h3
                                                className={`font-[family-name:var(--font-zen-maru)] font-bold ${
                                                    f.highlight
                                                        ? "text-[20px] leading-[1.5] md:text-[25px]"
                                                        : "text-[16px] leading-[1.6] md:text-[20px]"
                                                }`}
                                            >
                                                {f.title}
                                            </h3>
                                            <p className="mt-2 text-[16px] leading-[1.8] text-[#6B5E52]">
                                                {f.text}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* 5. 料金 ---------------------------------------------------- */}
                <section className="bg-white px-4 py-16 md:px-8 md:py-24">
                    <div className="mx-auto max-w-5xl">
                        <SectionTitle sub="1パターン＝1人（1匹）ぶんのセットです。2パターン目からは、1パターンにつき500円引きになります。">
                            料金
                        </SectionTitle>

                        <ul className="grid gap-6 md:grid-cols-3">
                            {PLANS.map((p) => (
                                <li
                                    key={p.id}
                                    className={`relative flex flex-col rounded-2xl bg-[#FFF9F0] p-6 ${
                                        p.recommended
                                            ? "border-2 border-[#F2A900]"
                                            : "border border-[#EADFCF]"
                                    }`}
                                >
                                    {p.recommended ? (
                                        <span className="absolute -top-3 left-6 rounded-full bg-[#F2A900] px-3 py-1 text-[13px] font-bold text-[#2B2118]">
                                            おすすめ
                                        </span>
                                    ) : null}

                                    <h3 className="font-[family-name:var(--font-zen-maru)] text-[20px] font-bold">
                                        {p.name}
                                    </h3>
                                    <p className="mt-2 text-[13px] leading-[1.8] text-[#6B5E52]">
                                        {p.lead}
                                    </p>

                                    <p className="mt-6 flex items-baseline gap-1">
                                        <span className="font-[family-name:var(--font-zen-maru)] text-[39px] leading-none font-black">
                                            {p.price}
                                        </span>
                                        <span className="text-[13px] text-[#6B5E52]">
                                            {p.priceNote}
                                        </span>
                                    </p>
                                    <span
                                        aria-hidden="true"
                                        className="mt-4 block h-[3px] w-10 rounded-full bg-[#F2A900]"
                                    />

                                    {p.rows ? (
                                        <dl className="mt-6 divide-y divide-[#EADFCF] border-y border-[#EADFCF] text-[16px]">
                                            {p.rows.map((r) => (
                                                <div
                                                    key={r.count}
                                                    className="flex items-center justify-between py-2"
                                                >
                                                    <dt className="text-[#6B5E52]">{r.count}</dt>
                                                    <dd className="font-bold">{r.price}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    ) : null}

                                    <ul className="mt-6 space-y-2 text-[16px] leading-[1.8] text-[#6B5E52]">
                                        {p.points.map((pt) => (
                                            <li key={pt} className="flex gap-2">
                                                <span aria-hidden="true" className="text-[#F2A900]">
                                                    ―
                                                </span>
                                                <span>{pt}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {p.bonus ? (
                                        <p className="mt-6 rounded-xl bg-[#F2A900]/15 px-4 py-3 text-[13px] leading-[1.8]">
                                            {p.bonus}
                                        </p>
                                    ) : null}
                                </li>
                            ))}
                        </ul>

                        {/* 正直に書いておくこと */}
                        <div className="mt-8 rounded-2xl border border-[#EADFCF] bg-[#FFF9F0] p-6 md:p-8">
                            <h3 className="font-[family-name:var(--font-zen-maru)] text-[20px] font-bold md:text-[25px]">
                                先に、正直に書いておきます
                            </h3>
                            <dl className="mt-6 space-y-6">
                                {HONEST.map((h) => (
                                    <div key={h.t}>
                                        <dt className="text-[16px] leading-[1.8] font-bold md:text-[20px]">
                                            {h.t}
                                        </dt>
                                        <dd className="mt-2 text-[16px] leading-[1.8] text-[#6B5E52]">
                                            {h.d}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </section>

                {/* 6. FAQ ----------------------------------------------------- */}
                <section className="px-4 py-16 md:px-8 md:py-24">
                    <div className="mx-auto max-w-3xl">
                        <SectionTitle>よくいただく質問</SectionTitle>

                        <div className="divide-y divide-[#EADFCF] border-y border-[#EADFCF]">
                            {FAQ.map((f) => (
                                <details key={f.q} className="group py-2">
                                    <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-3 text-[16px] leading-[1.8] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2118] md:text-[20px]">
                                        {f.q}
                                        <span
                                            aria-hidden="true"
                                            className="shrink-0 text-[20px] leading-none text-[#6B5E52]"
                                        >
                                            <span className="group-open:hidden">＋</span>
                                            <span className="hidden group-open:inline">－</span>
                                        </span>
                                    </summary>
                                    <p className="pr-8 pb-4 text-[16px] leading-[1.8] text-[#6B5E52]">
                                        {f.a}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. 作っている人 -------------------------------------------- */}
                <section className="bg-white px-4 py-16 md:px-8 md:py-24">
                    <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[240px_1fr] md:gap-12">
                        <Image
                            src="/images/about/founders.jpg"
                            alt="鳥取で農業と養蜂をしている安藤"
                            width={1024}
                            height={1024}
                            sizes="(max-width: 767px) 160px, 240px"
                            className="mx-auto h-auto w-40 rounded-2xl object-cover md:w-full"
                        />
                        <div>
                            <SectionTitle>作っているのは</SectionTitle>
                            <p className="text-[16px] leading-[1.8]">
                                鳥取で農業と養蜂をしている安藤です。畑と巣箱の合間に、1件ずつ手で仕上げています。
                                自分の蜂のスタンプも、同じ手順で作ってLINEストアで売っています。
                            </p>
                            <p className="mt-4 text-[16px] leading-[1.8] text-[#6B5E52]">
                                ふだんは蜂と畑のことを書いています。どんな人間が作っているかは、こちらを見てもらうのが早いです。
                            </p>
                            <p className="mt-6 flex flex-col gap-2 text-[16px] leading-[1.8]">
                                <Link
                                    href={THREADS_URL}
                                    className="inline-flex min-h-11 items-center underline decoration-[#F2A900] decoration-2 underline-offset-4 hover:text-[#6B5E52] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2118]"
                                >
                                    Threadsを見る
                                </Link>
                                <Link
                                    href={LINE_STORE_AUTHOR_URL}
                                    className="inline-flex min-h-11 items-center underline decoration-[#F2A900] decoration-2 underline-offset-4 hover:text-[#6B5E52] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2118]"
                                >
                                    LINEストアの作者ページを見る
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>

                {/* 8. 最終CTA -------------------------------------------------- */}
                <section className="px-4 py-16 md:px-8 md:py-24">
                    <div className="mx-auto max-w-3xl rounded-3xl border border-[#EADFCF] bg-white p-6 text-center md:p-12">
                        <h2 className="font-[family-name:var(--font-zen-maru)] text-[25px] leading-[1.45] font-bold md:text-[31px]">
                            まずは、写真を1枚だけ。
                        </h2>
                        <p className="mx-auto mt-4 max-w-[26em] text-[16px] leading-[1.8] text-[#6B5E52]">
                            {CTA_SUB}。気に入らなければ、そこで終わりで大丈夫です。
                        </p>

                        <div className="mt-8">
                            <Cta className="w-full px-4 md:w-auto md:px-7" />
                        </div>

                        <div className="mt-8 flex flex-col items-center gap-3 border-t border-[#EADFCF] pt-8">
                            <Image
                                src="/images/stamp/line-qr.png"
                                alt="公式LINEの友だち追加QRコード"
                                width={400}
                                height={400}
                                sizes="128px"
                                className="h-auto w-32"
                            />
                            <p className="text-[13px] leading-[1.8] text-[#6B5E52]">
                                LINEでID検索する場合：
                                <span className="ml-1 font-bold text-[#2B2118] select-all">
                                    {LINE_OFFICIAL_ID}
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* 9. 注意・法定 ---------------------------------------------- */}
                <section className="px-4 pb-16 md:px-8 md:pb-24">
                    <div className="mx-auto max-w-3xl text-[13px] leading-[1.8] text-[#6B5E52]">
                        <p>
                            お送りいただく写真は、ご家族・ご自身・ペットのものに限らせてください。お子さんの写真は、保護者の方からお送りください。お預かりした写真はスタンプ制作にだけ使い、納品から30日を目安に削除します。
                        </p>
                        <p className="mt-4">
                            無料でお見せする1個をご覧いただくところまでは、費用はかかりません。キャンセルもここまでは自由です。費用がかかるのは、個数を決めて制作に入ってからで、制作開始後のキャンセルはお受けできません。お支払いは、完成品をご確認いただいたあと、LINEへの申請前です（前払い）。現金・PayPay・銀行振込・楽天ペイに対応しています。万一LINE側の審査に通らなかった場合は、全額返金または作り直しで対応します。
                        </p>
                        <p className="mt-4">
                            <Link
                                href="/tokusho"
                                className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-[#2B2118] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2118]"
                            >
                                特定商取引法に基づく表記
                            </Link>
                        </p>
                    </div>
                </section>
            </main>

            {/* モバイル固定CTA（同じ行き先・同じ文言） */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#EADFCF] bg-[#FFF9F0] px-4 pt-3 pb-4 md:hidden">
                <Cta className="w-full" />
                <p className="mt-2 text-center text-[13px] leading-[1.8] text-[#6B5E52]">
                    {CTA_SUB}
                </p>
            </div>

            <Footer />
        </div>
    );
}
