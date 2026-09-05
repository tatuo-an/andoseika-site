import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import styles from "./ai.module.css";

/* ------------------------------------------------------------------
 * /ai — 鳥取の店舗向けSNS運用代行「AND U」のLP
 *
 * 方向宣言（pro-ui-director）:
 *   ジョブ    = 店主がスマホで3秒で「写真を送るだけで毎日動く」と分かり、LINEで無料相談を申し込む
 *   レジスター = 主:精密 / 副:親愛
 *   パレット  = 地#F7F8F4 面#FFF 文字#18201C サブ#5B6660 アクセント#20583F CTA#06C755 罫線#D9E0DA
 *   タイポ    = サイト既定 Zen Kaku Gothic New。比1.25の段（13/16/20/25/31/39）だけを使う。本文行間1.8
 *   余白      = 8ptグリッド。セクション64(md:96)、要素16/24/32。部品内部は8/4を下位単位として使う
 *   モーション = 160ms ease-out。ヒーロー右カードのフェードイン1回のみ。reduced-motionで無効
 *   シグネチャー = 「送る→出る」の2画面モック
 *   禁じ手    = 売り手の心情ヒーロー／実績カード並列／別商品の同居／アイコン列・絵文字／グラデ
 *
 * 事実はブリーフの台帳と旧版(_old_page_2026-09-05.tsx.bak)の事実文言の範囲のみ。
 * クライアント実績はゼロなので「実績」と書かない。
 * ------------------------------------------------------------------ */

/** 申込先は公式LINE1本。切り替えられるようここ1箇所にまとめる。 */
const LINE_URL = "https://lin.ee/WfeFzfF";
const CTA_LABEL = "LINEで無料相談を申し込む";
const TEL = "070-8434-8124";
const THREADS_URL = "https://www.threads.com/@tacchan_nooen";

export const metadata: Metadata = {
    title: {
        absolute: "SNS運用代行 AND U｜写真を1枚送るだけで、お店のSNSが毎日動く",
    },
    description:
        "鳥取の店舗向けSNS運用代行。写真とひとことを送るだけで、投稿文も画像もこちらで仕上げ、毎日決まった時間に投稿します。公式LINEの配信と月1回の数字報告はスタンダード以上で。月額3万円から、まずは無料相談60分。",
    openGraph: {
        title: "SNS運用代行 AND U｜写真を1枚送るだけで、お店のSNSが毎日動く",
        description:
            "写真とひとことを送るだけ。投稿文も画像もこちらで仕上げて、毎日投稿します。鳥取の店舗向けSNS運用代行、月額3万円から。まずは無料相談60分。",
        images: [
            {
                url: "/images/about/founders.jpg",
                width: 1024,
                height: 1024,
                alt: "AND U 運営責任者 安藤匡志",
            },
        ],
    },
};

/* ---------------------------- データ ---------------------------- */

const TROUBLES: { title: string; note: string }[] = [
    {
        title: "投稿が何か月も止まっている",
        note: "最後の投稿の日付を、お客さんに見られている気がする。",
    },
    {
        title: "自分で投稿していて、手が回らない",
        note: "店を閉めたあと、写真を見ながら文章を考えて、そのまま寝てしまう。",
    },
    {
        title: "公式LINEを作りたいと言いつつ、後回し",
        note: "常連さんに直接届く手段がほしい。でも設定の画面で止まっている。",
    },
];

const STEPS: { no: string; title: string; body: string }[] = [
    {
        no: "01",
        title: "写真とひとことを送る",
        body: "スマホで撮った写真と、ひとことだけ。「今日はこれが入りました」で十分です。送り先はLINEです。",
    },
    {
        no: "02",
        title: "こちらで投稿文と画像を仕上げる",
        body: "お店の言葉づかいに合わせて文章を組み立て、画像を整えます。心配な言い回しは、出す前にご相談します。",
    },
    {
        no: "03",
        title: "毎日決まった時間に投稿する",
        body: "契約のプランに入っている各SNSへ毎日投稿します。公式LINEの配信と月1回の数字報告は、スタンダード以上で承ります。",
    },
];

type Plan = {
    name: string;
    price: string;
    forWhom: string;
    features: string[];
    featured?: boolean;
    limited?: string;
};

const PLANS: Plan[] = [
    {
        name: "ライト",
        price: "3万円",
        forWhom: "まずは止まっている投稿を動かしたいお店",
        features: [
            "Facebook・Instagram・Threadsに毎日投稿",
            "投稿文と画像の制作",
        ],
    },
    {
        name: "スタンダード",
        price: "5万円",
        forWhom: "公式LINEの配信まで任せて、常連さんとの接点を持ちたいお店",
        featured: true,
        features: [
            "ライトの内容すべて",
            "X・YouTubeにも毎日投稿",
            "公式LINEの配信",
            "月1回の数字報告",
        ],
    },
    {
        name: "おまかせフル",
        price: "10万円",
        forWhom: "企画のところまで任せてしまいたいお店",
        limited: "2社まで",
        features: [
            "スタンダードの内容すべて",
            "ブログの執筆",
            "コメントへの対応",
            "キャンペーンなどの企画",
        ],
    },
];

const PRICE_NOTES: string[] = [
    "月額のほかにいただくのは、SNSアカウントの新規開設が必要な場合の＋3万円だけです。それ以外の初期構築費はありません。",
    "新規開設のときは、開設直後のアカウントを慎重に扱う必要があるため、最初の1週間はこちらが手動で丁寧に運用します。",
    "月額プランは3か月を1つの区切りとしています。3か月経過したあとは、いつでも解約いただけます。",
];

const HONEST_NOTES: string[] = [
    "写真は毎日1枚、お店側で撮って送っていただく必要があります。ここだけはこちらで代われません。",
    "効果が出るまでは2〜3か月かかります。翌週から数字が変わる仕事ではありません。",
    "この事業は始まったばかりで、お客さまのお店での長期の実績はまだこれから作るところです。",
];

const FAQ: { q: string; a: string }[] = [
    {
        q: "写真を撮る時間がありません",
        a: "スマホで撮った1枚で十分です。料理を出す前、仕入れが届いたとき、いつも撮っているものをそのまま送ってください。撮り直しや構図の指示はしません。",
    },
    {
        q: "SNSアカウントを持っていなくても頼めますか",
        a: "はい。新規開設からお受けします。その場合のみ初期設定費として＋3万円をいただきます。開設直後のアカウントは慎重に扱う必要があるため、最初の1週間はこちらが手動で丁寧に運用します。",
    },
    {
        q: "何を投稿するか、自分では決められません",
        a: "決めるところからこちらでやります。送っていただいた写真とひとことをもとに投稿の中身を組み立て、月1回の報告で反応の良かったものを次の月に回します（報告はスタンダード以上）。",
    },
    {
        q: "炎上しないか心配です",
        a: "攻めた投稿はしません。お店の日常と商品の話だけを書きます。判断に迷う言い回しは、投稿する前にお店へ確認します。",
    },
    {
        q: "途中でやめられますか",
        a: "月額プランは3か月を1つの区切りとしています。3か月経過したあとは、いつでも解約いただけます。解約後、SNSアカウントも公式LINEもすべてお店のものとしてお渡しします。当方が持ち続けることはありません。",
    },
    {
        q: "うちの業種でも合いますか",
        a: "写真が撮れるお店であれば、業種は問いません。鳥取近隣のお店を優先していますが、オンラインのやり取りで全国どこからでもご相談いただけます。合わないと思ったら、無料相談のときにそうお伝えします。",
    },
];

/* ---------------------------- 部品 ---------------------------- */

function LineCta({ block = false }: { block?: boolean }) {
    return (
        <Link
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${
                block ? "flex w-full" : "inline-flex"
            } min-h-[56px] items-center justify-center rounded-full bg-[#06C755] px-8 text-center text-[16px] font-bold leading-[1.5] text-[#18201C] transition-opacity duration-[160ms] ease-out hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18201C] md:text-[20px]`}
        >
            {CTA_LABEL}
        </Link>
    );
}

/** 本文中のテキストリンク。タップ標的を44px確保する。 */
function TextLink({
    href,
    external = false,
    children,
}: {
    href: string;
    external?: boolean;
    children: React.ReactNode;
}) {
    const cls =
        "inline-flex min-h-[44px] items-center underline underline-offset-4 transition-opacity duration-[160ms] ease-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
    if (external) {
        return (
            <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cls}
            >
                {children}
            </Link>
        );
    }
    return (
        <Link href={href} className={cls}>
            {children}
        </Link>
    );
}

/** 箇条書きの先頭に置く小さな四角。アイコン集は使わない。 */
function Bullet() {
    return (
        <span
            aria-hidden="true"
            /* mt-[9px] は8ptグリッドではなく、16px×行間1.8の1行目の視覚中心に合わせる光学調整 */
            className="mt-[9px] block h-[6px] w-[6px] flex-shrink-0 bg-[#20583F]"
        />
    );
}

function SectionHeading({
    eyebrow,
    children,
}: {
    eyebrow: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-8">
            <p className="mb-4 text-[13px] font-bold tracking-[0.18em] text-[#5B6660]">
                {eyebrow}
            </p>
            <h2 className="text-[20px] font-bold leading-[1.5] text-[#18201C] md:text-[31px]">
                {children}
            </h2>
        </div>
    );
}

/* ---------------------------- ページ ---------------------------- */

export default function SnsAgencyPage() {
    return (
        <div className="flex min-h-screen flex-col bg-[#F7F8F4] font-sans text-[#18201C]">
            <Header />

            <main className="flex-1">
                {/* 1. ヒーロー ─ 主役は「送る→出る」 */}
                <section className="px-4 py-16 md:px-6 md:py-24">
                    <div className="mx-auto max-w-5xl">
                        <p className="text-[13px] font-bold tracking-[0.18em] text-[#5B6660]">
                            鳥取の店舗向け SNS運用代行 AND U
                        </p>
                        <h1 className="mt-4 text-[25px] font-bold leading-[1.5] text-[#18201C] sm:text-[31px] md:text-[39px] md:leading-[1.4]">
                            写真を1枚送るだけで、
                            <br />
                            お店のSNSが毎日動く。
                        </h1>
                        <p className="mt-6 max-w-[34em] text-[16px] leading-[1.8] text-[#5B6660] md:text-[20px]">
                            投稿文も画像も、毎日の投稿も、こちらで回します。
                            <br className="hidden md:block" />
                            まずは無料相談60分から。
                        </p>

                        <div className="mt-8">
                            <LineCta />
                            <p className="mt-4 text-[13px] leading-[1.8] text-[#5B6660]">
                                合わなければ、そう伝えます。
                            </p>
                        </div>

                        {/* 送る → 出る */}
                        <div className="mt-16 grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-8">
                            {/* 送る側 */}
                            <div className="rounded-2xl border border-[#D9E0DA] bg-white p-6">
                                <p className="text-[13px] font-bold text-[#5B6660]">
                                    お店から送るもの（見本）
                                </p>
                                <div className="mt-4 rounded-xl bg-[#F7F8F4] p-4">
                                    <Image
                                        src="/images/ai/ando-beekeeping.jpg"
                                        alt="見本。運営者が養蜂の現場でスマホで撮った写真を、お店から送られてくる写真に見立てたもの。"
                                        width={1280}
                                        height={1280}
                                        sizes="(max-width: 768px) 80vw, 420px"
                                        className="h-auto w-full rounded-lg object-cover"
                                        priority
                                    />
                                    <p className="mt-4 rounded-lg bg-white px-4 py-2 text-[16px] leading-[1.8] text-[#18201C]">
                                        今日の分、いい感じに採れました
                                    </p>
                                </div>
                                <p className="mt-4 text-[13px] leading-[1.8] text-[#5B6660]">
                                    お店がやるのは、ここまでです。※画面は見本で、写真は運営者の養蜂の現場のものです。
                                </p>
                            </div>

                            {/* 矢印 */}
                            <div
                                aria-hidden="true"
                                className="flex justify-center text-[#20583F]"
                            >
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 32 32"
                                    fill="none"
                                    className="rotate-90 md:rotate-0"
                                >
                                    <path
                                        d="M5 16h22M20 9l7 7-7 7"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            {/* 出る側 */}
                            <div
                                className={`${styles.reveal} rounded-2xl border border-[#D9E0DA] bg-white p-6`}
                            >
                                <p className="text-[13px] font-bold text-[#5B6660]">
                                    こちらが仕上げて、毎日投稿（見本）
                                </p>
                                <div className="mt-4 overflow-hidden rounded-xl border border-[#D9E0DA]">
                                    <div className="flex items-center gap-4 px-4 py-2">
                                        <span
                                            aria-hidden="true"
                                            className="block h-8 w-8 flex-shrink-0 rounded-full bg-[#20583F]"
                                        />
                                        <span className="text-[13px] font-bold text-[#18201C]">
                                            お店のアカウント
                                        </span>
                                    </div>
                                    <Image
                                        src="/images/ai/ando-beekeeping.jpg"
                                        alt="見本。同じ運営者の写真が、そのまま投稿の画像として使われたところ。"
                                        width={1280}
                                        height={1280}
                                        sizes="(max-width: 768px) 80vw, 420px"
                                        className="h-auto w-full object-cover"
                                    />
                                    <div className="px-4 py-4">
                                        <p className="text-[16px] leading-[1.8] text-[#18201C]">
                                            今日の分が採れました。この時期のものは、味が濃く出ます。気になる方は、店頭で声をかけてください。
                                        </p>
                                        <p className="mt-4 text-[13px] text-[#5B6660]">
                                            毎日、決まった時間に投稿
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-4 text-[13px] leading-[1.8] text-[#5B6660]">
                                    文章も、画像の整えも、投稿の時間もこちらです。
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. 共感 */}
                <section className="border-t border-[#D9E0DA] bg-white px-4 py-16 md:px-6 md:py-24">
                    <div className="mx-auto max-w-5xl">
                        <SectionHeading eyebrow="よく聞く話">
                            うちのSNS、こうなっていませんか。
                        </SectionHeading>
                        <ul className="grid gap-6 md:grid-cols-3 md:gap-8">
                            {TROUBLES.map((t) => (
                                <li
                                    key={t.title}
                                    className="border-t-2 border-[#20583F] pt-4"
                                >
                                    <h3 className="text-[16px] font-bold leading-[1.8] text-[#18201C] md:text-[20px] md:leading-[1.6]">
                                        {t.title}
                                    </h3>
                                    <p className="mt-4 text-[16px] leading-[1.8] text-[#5B6660]">
                                        {t.note}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* 3. 流れ */}
                <section className="border-t border-[#D9E0DA] px-4 py-16 md:px-6 md:py-24">
                    <div className="mx-auto max-w-5xl">
                        <SectionHeading eyebrow="頼んだあとの流れ">
                            やることは、写真とひとことを送るだけ。
                        </SectionHeading>
                        <ol className="grid gap-6 md:grid-cols-3 md:gap-8">
                            {STEPS.map((s) => (
                                <li
                                    key={s.no}
                                    className="rounded-2xl border border-[#D9E0DA] bg-white p-6"
                                >
                                    <p className="text-[13px] font-bold tracking-[0.18em] text-[#20583F]">
                                        {s.no}
                                    </p>
                                    <h3 className="mt-4 text-[16px] font-bold leading-[1.8] text-[#18201C] md:text-[20px] md:leading-[1.6]">
                                        {s.title}
                                    </h3>
                                    <p className="mt-4 text-[16px] leading-[1.8] text-[#5B6660]">
                                        {s.body}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* 4. 証拠 ─ 主張は1つ、証拠も1つ */}
                <section className="border-t border-[#D9E0DA] bg-white px-4 py-16 md:px-6 md:py-24">
                    <div className="mx-auto max-w-5xl">
                        <SectionHeading eyebrow="なぜ任せられるのか">
                            自分のSNSで毎日やっていることを、
                            <br className="hidden md:block" />
                            そのままお店で使います。
                        </SectionHeading>

                        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-8">
                            <div>
                                <p className="max-w-[34em] text-[16px] leading-[1.8] text-[#5B6660]">
                                    自分のはちみつのアカウントを、毎日更新しています。写真の選び方も、文章の長さも、投稿する時間も、そこで試して残ったやり方です。お店の投稿にも、同じ手順を使います。
                                </p>
                                <p className="mt-6 rounded-xl border border-[#D9E0DA] bg-[#F7F8F4] p-6 text-[16px] leading-[1.8] text-[#18201C]">
                                    Xで表示29.2万件・Threadsでいいね1.4万件・Xフォロワー1.3万人（いずれも実測）
                                </p>
                                <p className="mt-6 max-w-[34em] text-[16px] leading-[1.8] text-[#5B6660]">
                                    正直に書きます。ここに出した数字は、すべて自分のアカウントのものです。お客さまのお店での実績はまだありませんし、同じ数字が出るとお約束もできません。
                                </p>

                                <div className="mt-8 flex items-start gap-4">
                                    <Image
                                        src="/images/ai/ando-beekeeping.jpg"
                                        alt="鳥取で巣箱を見ている安藤。養蜂の現場。"
                                        width={1280}
                                        height={1280}
                                        sizes="96px"
                                        className="h-24 w-24 flex-shrink-0 rounded-xl object-cover"
                                    />
                                    <p className="text-[13px] leading-[1.8] text-[#5B6660]">
                                        朝は畑と巣箱、昼からはSNSの仕事です。現場を持っている人間が書いています。
                                    </p>
                                </div>
                            </div>

                            <figure className="m-0">
                                <Image
                                    src="/images/ai/threads-14000-likes.png"
                                    alt="Threadsの投稿画面。いいねが1.4万件ついている実際の投稿。"
                                    width={520}
                                    height={565}
                                    sizes="(max-width: 768px) 90vw, 320px"
                                    className="h-auto w-full rounded-xl border border-[#D9E0DA]"
                                />
                                <figcaption className="mt-4 text-[13px] leading-[1.8] text-[#5B6660]">
                                    Threadsの実際の投稿（いいね1.4万件）
                                </figcaption>
                            </figure>
                        </div>
                    </div>
                </section>

                {/* 5. 料金 */}
                <section className="border-t border-[#D9E0DA] px-4 py-16 md:px-6 md:py-24">
                    <div className="mx-auto max-w-5xl">
                        <SectionHeading eyebrow="料金">
                            月額だけです。初期構築費はいただきません。
                        </SectionHeading>
                        <p className="mb-8 max-w-[34em] text-[16px] leading-[1.8] text-[#5B6660]">
                            例外は1つだけ。SNSアカウントの新規開設が必要な場合のみ、＋3万円をいただきます。
                        </p>

                        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
                            {PLANS.map((p) => (
                                <div
                                    key={p.name}
                                    className={`flex flex-col rounded-2xl bg-white p-6 ${
                                        p.featured
                                            ? "border-2 border-[#20583F]"
                                            : "border border-[#D9E0DA]"
                                    }`}
                                >
                                    <div className="flex flex-wrap items-center gap-4">
                                        <h3 className="text-[20px] font-bold leading-[1.6] text-[#18201C]">
                                            {p.name}
                                        </h3>
                                        {p.featured && (
                                            <span className="rounded-full bg-[#20583F] px-2 py-1 text-[13px] font-bold text-white">
                                                おすすめ
                                            </span>
                                        )}
                                        {p.limited && (
                                            <span className="rounded-full border border-[#D9E0DA] px-2 py-1 text-[13px] font-bold text-[#5B6660]">
                                                {p.limited}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-4 text-[31px] font-bold leading-none text-[#18201C]">
                                        {p.price}
                                        <span className="ml-1 text-[13px] font-bold text-[#5B6660]">
                                            / 月
                                        </span>
                                    </p>
                                    <p className="mt-4 border-t border-[#D9E0DA] pt-4 text-[13px] leading-[1.8] text-[#5B6660]">
                                        {p.forWhom}
                                    </p>
                                    <ul className="mt-4 space-y-4">
                                        {p.features.map((f) => (
                                            <li
                                                key={f}
                                                className="flex gap-4 text-[16px] leading-[1.8] text-[#18201C]"
                                            >
                                                <Bullet />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 rounded-2xl border border-[#D9E0DA] bg-white p-6">
                            <h3 className="text-[16px] font-bold text-[#18201C]">
                                料金についての補足
                            </h3>
                            <ul className="mt-4 space-y-4">
                                {PRICE_NOTES.map((t) => (
                                    <li
                                        key={t}
                                        className="flex gap-4 text-[16px] leading-[1.8] text-[#5B6660]"
                                    >
                                        <Bullet />
                                        <span>{t}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6 rounded-2xl border border-[#D9E0DA] bg-white p-6">
                            <h3 className="text-[16px] font-bold text-[#18201C]">
                                先に言っておきたいこと
                            </h3>
                            <ul className="mt-4 space-y-4">
                                {HONEST_NOTES.map((t) => (
                                    <li
                                        key={t}
                                        className="flex gap-4 text-[16px] leading-[1.8] text-[#5B6660]"
                                    >
                                        <Bullet />
                                        <span>{t}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 6. FAQ */}
                <section className="border-t border-[#D9E0DA] bg-white px-4 py-16 md:px-6 md:py-24">
                    <div className="mx-auto max-w-3xl">
                        <SectionHeading eyebrow="よくある質問">
                            断る理由になりそうなこと、先に書きます。
                        </SectionHeading>
                        <dl className="divide-y divide-[#D9E0DA] border-t border-[#D9E0DA]">
                            {FAQ.map((item) => (
                                <div key={item.q} className="py-6">
                                    <dt className="text-[16px] font-bold leading-[1.8] text-[#18201C] md:text-[20px] md:leading-[1.6]">
                                        {item.q}
                                    </dt>
                                    <dd className="mt-4 text-[16px] leading-[1.8] text-[#5B6660]">
                                        {item.a}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                {/* 7. 作っている人 */}
                <section className="border-t border-[#D9E0DA] px-4 py-16 md:px-6 md:py-24">
                    <div className="mx-auto max-w-3xl">
                        <SectionHeading eyebrow="作っている人">
                            鳥取で農業と養蜂をやっている安藤です。
                        </SectionHeading>
                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                            <Image
                                src="/images/about/founders.jpg"
                                alt="AND U 運営責任者 安藤匡志"
                                width={1024}
                                height={1024}
                                sizes="(max-width: 768px) 128px, 160px"
                                className="h-32 w-32 flex-shrink-0 rounded-2xl object-cover md:h-40 md:w-40"
                            />
                            <div>
                                <p className="text-[16px] leading-[1.8] text-[#5B6660]">
                                    自分のはちみつのSNSを毎日更新していて、その運用をそのままお店向けに使っています。畑と巣箱の仕事があるので、続かないやり方は自分が先に潰れます。だから、お店にも続く形しか渡しません。
                                </p>
                                <p className="mt-4 text-[16px] leading-[1.8] text-[#20583F]">
                                    <TextLink href={THREADS_URL} external>
                                        毎日の投稿はThreadsで見られます
                                    </TextLink>
                                </p>
                                <p className="mt-4 text-[13px] leading-[1.8] text-[#5B6660]">
                                    社内の仕組み化の相談も受けています。
                                    <span className="text-[#20583F]">
                                        <TextLink href="/contact/personal?subject=ai-consulting">
                                            こちらから
                                        </TextLink>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 8. 最終CTA */}
                <section className="bg-[#20583F] px-4 py-16 text-white md:px-6 md:py-24">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="text-[20px] font-bold leading-[1.5] md:text-[31px]">
                            写真を1枚送るだけで、
                            <br />
                            お店のSNSが毎日動く。
                        </h2>
                        <p className="mt-6 max-w-[34em] text-[16px] leading-[1.8] text-white/85">
                            まずは無料相談60分。今のSNSの状態と、任せたい範囲だけ聞かせてください。合わなければ、そう伝えます。
                        </p>
                        <div className="mt-8 max-w-sm">
                            <LineCta block />
                            <p className="mt-4 text-[13px] leading-[1.8] text-white/85">
                                公式LINE「あんどーのスタンプ＆SNS工房」に届きます。
                            </p>
                        </div>
                        <p className="mt-8 text-[13px] leading-[1.8] text-white/85">
                            電話でも{" "}
                            <a
                                href={`tel:${TEL.replace(/-/g, "")}`}
                                className="inline-flex min-h-[44px] items-center underline underline-offset-4 transition-opacity duration-[160ms] ease-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                {TEL}
                            </a>{" "}
                            （月〜土 9:00〜18:00・日祝休）
                        </p>
                        <p className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/25 pt-6 text-[13px] leading-[1.8] text-white/85">
                            <TextLink href="/tokusho">
                                特定商取引法に基づく表記
                            </TextLink>
                            <TextLink href="/privacy">
                                プライバシーポリシー
                            </TextLink>
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
