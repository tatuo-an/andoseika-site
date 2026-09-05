import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    Camera,
    Check,
    Heart,
    MessageCircle,
    Sparkles,
    ShieldCheck,
    Clock3,
    RefreshCcw,
    Smartphone,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        absolute: "あんどーのスタンプ＆SNS工房｜写真から、世界に1つのLINEスタンプ",
    },
    description:
        "お子さん・ご家族・ペットの写真から、オリジナルのLINEスタンプを作ります。写真を送っていただくだけ。おためし静止8個1,000円〜（LINEストアでのご購入は別途必要です）。鳥取で農業と養蜂をやっている安藤が、1件ずつ丁寧に作ります。",
    openGraph: {
        title: "あんどーのスタンプ＆SNS工房｜写真から、世界に1つのLINEスタンプ",
        description:
            "お子さん・ご家族・ペットの写真から、オリジナルのLINEスタンプを作ります。写真を送っていただくだけ。おためし静止8個1,000円〜。",
        images: [
            {
                url: "/images/stamp/hero-bg.png",
                width: 1672,
                height: 941,
                alt: "あんどーのスタンプ工房",
            },
        ],
    },
};

// 依頼主のお子さんの写真を使った作例（9スタイル分・制作済み）は、
// 石村さんの掲載許可が下り次第 true にする。切り替え方法: この1行の値を true に変更するだけ。
// false の間は、蜂・クマムシなど自社スタンプの作例で「作れる雰囲気」だけを見せる。
const ORDER_SAMPLE_CONSENT_GRANTED = true;

const LINE_ADD_FRIEND_URL = "https://lin.ee/WfeFzfF";
const ORDER_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSe83vs3wZZ3GAzDiNV9_dosONJ072QQIilpeKKhMw4i61Blqg/viewform";
const LINE_STORE_AUTHOR_URL = "https://line.me/S/shop/sticker/author/1272517";

const WORRY_ITEMS = [
    "スマホのアルバムに、可愛い一枚が眠ったままになっている",
    "家族グループのやり取り、いつも同じ絵文字ばかりで飽きてきた",
    "売っているスタンプは可愛いけど、なんだかうちの子っぽくない",
    "誰かへのちょっとしたプレゼント、何がいいか迷っている",
];

type OrderStyle = {
    id: string;
    name: string;
    desc: string;
};

const ORDER_STYLES: OrderStyle[] = [
    { id: "suisai", name: "水彩・手描き", desc: "やさしい絵本のような雰囲気" },
    { id: "amecomi", name: "アメコミ風", desc: "元気いっぱい、ポップな仕上がり" },
    { id: "showa", name: "昭和レトロ", desc: "どこか懐かしい、味のある一枚" },
    { id: "shonen-manga", name: "少年マンガ風", desc: "動きのある、勢いのある線" },
    { id: "senga-bw", name: "線画・白黒", desc: "シンプルで飽きのこない一枚" },
    { id: "moe", name: "萌え系", desc: "大きな瞳とやわらかい色合い" },
    { id: "kaodeka", name: "顔デカ似顔絵", desc: "頭を大きく、特徴をぎゅっと似顔絵に" },
    { id: "doubutsu", name: "動物化", desc: "本人そっくりの動物キャラに変身" },
    { id: "yurukawa", name: "ゆるカワ", desc: "線も色数も少ない、脱力系の一枚" },
];

const TRIAL_PLAN = {
    price: "1,000円",
    points: [
        "静止スタンプ8個",
        "タッチは「ゆるカワ」固定（他8タッチは選べません）",
        "セリフは定番8種の固定（おはよう／おやすみ／ありがとう／お疲れ様です／よろしくお願いします／OK！／がんばって／帰るよ）",
        "修正なし・お一人1回限り",
    ],
};

const PRICE_ROWS: {
    type: string;
    counts: { count: string; price: string }[];
    bonus: string;
}[] = [
    {
        type: "静止スタンプ（カスタム）",
        counts: [
            { count: "8個", price: "2,000円" },
            { count: "16個", price: "3,000円" },
            { count: "24個", price: "4,000円" },
        ],
        bonus: "おまけ：LINEアイコン用の丸画像1枚＋おうちで印刷できるシール台紙PDF",
    },
    {
        type: "動くスタンプ（カスタム）",
        counts: [
            { count: "8個", price: "3,500円" },
            { count: "16個", price: "5,000円" },
            { count: "24個", price: "6,500円" },
        ],
        bonus: "おまけ：LINEアイコン用の丸画像1枚＋シール台紙PDF＋トーク背景画像1枚",
    },
];

const FLOW_STEPS = [
    {
        icon: MessageCircle,
        title: "友だち追加 → フォーム記入",
        text: "公式LINEを友だち追加して、注文フォームに入力してください。3分くらいで終わります。写真はまだ無くて大丈夫です。",
    },
    {
        icon: Camera,
        title: "LINEで写真を送る",
        text: "公式LINEのトークに、そのまま写真を送ってください。表情違いが数枚あると、仕上がりの幅が広がります。",
    },
    {
        icon: Sparkles,
        title: "ラフ案を確認",
        text: "1パターンにつき1回、ラフ案をお送りします。雰囲気が違えば、ここで直せます。",
    },
    {
        icon: Heart,
        title: "完成 → 申請・審査",
        text: "OKが出たら本制作。完成後にLINEスタンプとして申請します。LINE側の審査に数日〜1週間ほどかかります。",
    },
];

const FAQ_ITEMS = [
    {
        q: "完成したら、それだけで使えますか。追加のお金はかかりますか",
        a: "制作料とは別に、完成したスタンプをLINEストアでご購入いただく必要があります（静止スタンプ190円〜、動くスタンプ250円程度が目安です）。これはLINEが決めている価格で、うちの収入にはなりません。ご家族で使う場合は、使う方おひとりずつのご購入が必要になります。",
    },
    {
        q: "写真はどう扱われますか。誰でも見られるようになりませんか",
        a: "スタンプはLINEストアの検索結果には出てこない設定（非公開・限定公開）で申請します。ただし、購入用のURLを直接知っている人は閲覧・購入ができてしまうため、完全に他人から見られない状態にはできません。写真そのものはスタンプ制作のためだけに使い、納品後30日を目安に削除します。ご依頼主さま以外の第三者へお渡しすることはありません。作例として他のお客さまにお見せしたい場合は、その都度あらためて許可をいただいてからにします。",
    },
    {
        q: "必ずイラスト風になりますか。写真そのままは頼めますか",
        a: "標準は写真をもとにしたイラスト風の仕上がりです。写真に近い仕上がりをご希望の場合はフォームでお選びいただけますが、その場合は表情違いの写真を複数枚（8枚程度）お送りいただくようお願いすることがあります。",
    },
    {
        q: "納期はどれくらいかかりますか",
        a: "写真を受け取ってから完成・申請までは、目安として即日〜2日ほどです。そこからLINE側の審査に数日〜1週間ほど（長いと2週間ほど）かかります。この審査の時間はこちらでは短縮できません。",
    },
    {
        q: "「1パターン」とはどういう意味ですか",
        a: "1パターン＝1人（1匹）を、1セット（8個・16個・24個のいずれか）分のスタンプに仕上げることです。ごきょうだいなど複数人をそれぞれスタンプにする場合は、人数分のパターンとしてお申し込みください。",
    },
    {
        q: "修正は何回できますか",
        a: "無料の修正は1回までです。2回目以降は、表情の差し替えなど軽微な修正でも500円をいただきます。ラフ案の段階でしっかり確認していただくと、この手間を減らせます。",
    },
    {
        q: "支払いのタイミングはいつですか。途中でキャンセルはできますか",
        a: "ラフ案を確認していただくところまでは、無料でキャンセルできます。本制作に入ったあとのキャンセルはお受けできません。お支払いは、完成品をご確認いただいたあと、LINEへの申請前にお願いしています（前払い）。現金・PayPay・銀行振込・楽天ペイに対応しています。万一LINE側の審査に通らなかった場合は、全額返金または作り直しで対応します。",
    },
    {
        q: "複数パターンをまとめて頼むと安くなりますか",
        a: "はい。きょうだい分・パパ用ママ用など、2パターン目以降は1パターンにつき500円引きになります。まとめての依頼はフォームでそのまま選べます。",
    },
    {
        q: "おためし1,000円と2,000円のカスタムは何が違いますか",
        a: "おためし（1,000円）はタッチが「ゆるカワ」固定、セリフも定番8種の固定で、修正はできません。おまけ（アイコン画像・シール台紙）も付きません。まずは雰囲気を確かめたい方向けの、お一人1回限りのプランです。2,000円のカスタムはタッチ9種から選べて、セリフも自由に決められ、修正1回付き、おまけも付きます。",
    },
];

const LINE_OFFICIAL_ID = "@500ngbml";

function LineOfficialCard({ showRichMenu = false }: { showRichMenu?: boolean }) {
    return (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 md:p-6 max-w-xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-5 md:gap-6">
                <Link
                    href={LINE_ADD_FRIEND_URL}
                    className="flex-shrink-0 order-2 md:order-1"
                    aria-label="公式LINEのQRコードから友だち追加"
                >
                    <Image
                        src="/images/stamp/line-qr.png"
                        alt="公式LINE友だち追加QRコード"
                        width={160}
                        height={160}
                        className="w-24 h-24 md:w-40 md:h-40"
                    />
                </Link>
                <div className="order-1 md:order-2 flex-1 text-center md:text-left space-y-3">
                    <p className="text-stone-700 text-sm leading-relaxed">
                        友だち追加すると、作例と料金がすぐ届きます
                    </p>
                    <Link href={LINE_ADD_FRIEND_URL} className="inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png"
                            alt="友だち追加"
                            className="h-10 md:h-9 w-auto mx-auto md:mx-0"
                        />
                    </Link>
                    <p className="text-stone-500 text-xs">
                        LINEでID検索する場合:{" "}
                        <span className="font-bold text-stone-800 text-sm select-all">
                            {LINE_OFFICIAL_ID}
                        </span>
                    </p>
                </div>
            </div>
            {showRichMenu && (
                <div className="mt-5 pt-5 border-t border-stone-100 text-center">
                    <p className="text-stone-500 text-xs mb-2">
                        登録するとこんなメニューが使えます
                    </p>
                    <Image
                        src="/images/stamp/richmenu-v3.png"
                        alt="公式LINEのリッチメニュー画面"
                        width={480}
                        height={324}
                        className="w-full max-w-xs mx-auto h-auto rounded-lg border border-stone-200"
                    />
                </div>
            )}
        </div>
    );
}

function BigCta({ label = "公式LINEを友だち追加する" }: { label?: string }) {
    return (
        <Link
            href={LINE_ADD_FRIEND_URL}
            className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
        >
            {label}
            <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
    );
}

function OrderSampleGrid() {
    if (!ORDER_SAMPLE_CONSENT_GRANTED) {
        return (
            <div>
                <p className="text-center text-stone-600 text-sm mb-6 max-w-xl mx-auto leading-relaxed">
                    お子さんの写真そのものの作例は、現在ご依頼主さまの掲載許可を確認しています。
                    ここでは、実際に同じ仕組みで作っている自社のスタンプ（蜂・クマムシなど）で、
                    仕上がりの雰囲気だけ先にご覧いただけます。
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl border border-stone-200 p-3 flex items-center justify-center">
                        <Image src="/images/stamp/bee/01.png" alt="蜂のLINEスタンプ例" width={200} height={200} priority className="w-full h-auto" />
                    </div>
                    <div className="bg-white rounded-2xl border border-stone-200 p-3 flex items-center justify-center">
                        <Image src="/images/stamp/bee/03.png" alt="蜂のLINEスタンプ例" width={200} height={200} priority className="w-full h-auto" />
                    </div>
                    <div className="bg-white rounded-2xl border border-stone-200 p-3 flex items-center justify-center">
                        <Image src="/images/stamp/creatures/kumamushi/01.png" alt="クマムシのLINEスタンプ例" width={200} height={200} priority className="w-full h-auto" />
                    </div>
                    <div className="bg-white rounded-2xl border border-stone-200 p-3 flex items-center justify-center">
                        <Image src="/images/stamp/creatures/uparuparu/01.png" alt="ウーパールーパーのLINEスタンプ例" width={200} height={200} priority className="w-full h-auto" />
                    </div>
                </div>
                <p className="text-center text-stone-500 text-xs mt-4">
                    9つのタッチ（水彩・手描き／アメコミ／昭和レトロ／少年漫画／線画・白黒／萌え系／顔デカ似顔絵／動物化／ゆるカワ）は、実際のご依頼写真での作例が公開できるようになり次第、ここに追加します。
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {ORDER_STYLES.map((style) => (
                <div key={style.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                    <div className="relative p-3">
                        <Image
                            src={`/images/stamp/styles/${style.id}/01.png`}
                            alt={`${style.name}の作例`}
                            width={320}
                            height={320}
                            className="w-full h-auto"
                        />
                        <Image
                            src={`/images/stamp/styles/${style.id}/08.png`}
                            alt={`${style.name}の作例（2枚目）`}
                            width={320}
                            height={320}
                            className="absolute bottom-1 right-1 w-1/3 h-auto rounded-lg border-2 border-white shadow"
                        />
                    </div>
                    <div className="px-3 pb-3">
                        <p className="font-bold text-stone-800 text-sm">{style.name}</p>
                        <p className="text-stone-500 text-xs">{style.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function StampPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1">
                {/* 1. ヒーロー */}
                <section className="relative py-16 md:py-24 overflow-hidden">
                    <div className="absolute inset-0">
                        <Image
                            src="/images/stamp/hero-bg.png"
                            alt=""
                            fill
                            priority
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-white/55" />
                    </div>
                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <div className="max-w-3xl mx-auto text-center space-y-6">
                            <span className="inline-block text-stone-600 font-bold tracking-widest uppercase text-sm">
                                あんどーのスタンプ＆SNS工房
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold text-stone-900 leading-[1.3] font-heading">
                                その一枚が、
                                <br className="md:hidden" />
                                毎日使うスタンプになる。
                            </h1>
                            <p className="text-stone-700 text-base md:text-lg leading-relaxed">
                                お子さん・ご家族・ペットの写真から、世界に1つだけのLINEスタンプを作ります。
                                <br className="hidden md:block" />
                                写真を送っていただくだけ。あとはこちらで仕上げます。
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {["写真を送るだけ", "おためし静止8個1,000円〜", "審査対応込み"].map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center rounded-full border border-stone-300 bg-white/90 px-3 py-1 text-sm font-medium text-stone-700"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="pt-2">
                                <BigCta />
                                <p className="text-stone-600 text-sm mt-3">
                                    公式LINEから、そのままフォームに進めます
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                <div id="hero-end-sentinel" />

                {/* 1.5 公式LINE導線（ヒーロー直下） */}
                <section className="py-10 md:py-14 bg-white border-b border-stone-100">
                    <div className="container mx-auto px-4 md:px-6">
                        <LineOfficialCard showRichMenu />
                    </div>
                </section>

                {/* 2. 共感 */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading">
                                こんなこと、ありませんか。
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
                            特別な記念日だけの贈り物ではありません。毎日のLINEで、何度も開かれるものになります。
                        </p>
                    </div>
                </section>

                {/* 3. 実績（販売中スタンプ） */}
                <section className="py-16 md:py-20 bg-stone-50">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading mb-4">
                                実際に、LINEストアで売っています
                            </h2>
                            <p className="text-stone-700 leading-relaxed">
                                これは試作ではありません。同じ作り方で作った蜂・生きもののスタンプが、実際にLINEストアで販売中です。
                                動く版もあります。
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-6">
                            {["01", "04", "08", "12"].map((n) => (
                                <div key={n} className="bg-white rounded-2xl border border-stone-200 p-2">
                                    {/* APNGはNext.jsの画像最適化を通さず、素のimgでアニメーションを保つ */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`/images/stamp/bee-animated/${n}.png`}
                                        alt="動く蜂のLINEスタンプ"
                                        className="w-full h-auto"
                                        loading="eager"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-stone-500 text-xs mb-6">
                            ↑ 実際に動きます（LINEストアで販売中の商品と同じ素材です）
                        </p>

                        <div className="text-center">
                            <Link
                                href={LINE_STORE_AUTHOR_URL}
                                className="inline-flex items-center gap-1 text-sm font-bold text-stone-800 hover:text-primary transition-colors"
                            >
                                販売中のスタンプ一覧を見る（LINEストア）
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 4. オーダーメイド作例 */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading mb-4">
                                タッチは9種類、選べます
                            </h2>
                            <p className="text-stone-700 leading-relaxed max-w-2xl mx-auto">
                                やさしい水彩から、元気なアメコミ風、懐かしい昭和レトロ、動物キャラ化まで。
                                お子さんやペットの雰囲気に合わせて選んでいただけます。
                            </p>
                        </div>
                        <OrderSampleGrid />
                    </div>
                </section>

                {/* 5. 料金表 */}
                <section className="py-16 md:py-20 bg-stone-50">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading">
                                料金
                            </h2>
                        </div>

                        <div className="bg-white rounded-2xl border-2 border-primary/40 overflow-hidden mb-4">
                            <p className="bg-primary/10 px-4 py-2 font-bold text-stone-700 text-sm border-b border-primary/20">
                                おためし（初回限定・お一人1回）
                            </p>
                            <div className="p-4 md:p-5">
                                <p className="text-primary font-bold text-xl md:text-2xl">{TRIAL_PLAN.price}</p>
                                <ul className="mt-3 space-y-1.5">
                                    {TRIAL_PLAN.points.map((point) => (
                                        <li key={point} className="flex items-start gap-2 text-stone-600 text-sm leading-relaxed">
                                            <Check className="h-4 w-4 text-stone-400 flex-shrink-0 mt-0.5" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {PRICE_ROWS.map((row) => (
                                <div key={row.type} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                                    <p className="bg-stone-100 px-4 py-2 font-bold text-stone-700 text-sm border-b border-stone-200">
                                        {row.type}
                                    </p>
                                    <div className="grid grid-cols-3 divide-x divide-stone-100">
                                        {row.counts.map((c) => (
                                            <div key={c.count} className="p-4 text-center">
                                                <p className="text-stone-500 text-sm">{c.count}</p>
                                                <p className="text-primary font-bold text-lg md:text-xl mt-1">{c.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="px-4 py-3 text-stone-600 text-xs md:text-sm leading-relaxed border-t border-stone-100 bg-stone-50">
                                        {row.bonus}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <p className="text-center text-stone-600 text-sm mt-6 leading-relaxed">
                            きょうだい分・パパ用ママ用などをまとめる場合、2パターン目以降は1パターンにつき500円引きです。
                        </p>
                        <p className="text-center text-stone-500 text-xs mt-4 leading-relaxed max-w-xl mx-auto">
                            ※上記は制作料です。完成したスタンプは、LINEストアでのご購入（静止190円〜・動くスタンプ250円程度が目安）が別途必要になります。これはLINEが決めている価格で、うちの収入ではありません。使う方おひとりずつのご購入が必要です。
                        </p>
                    </div>
                </section>

                {/* 6. 流れ */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading">
                                注文から完成まで
                            </h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            {FLOW_STEPS.map((step, i) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.title} className="bg-stone-50 border border-stone-100 rounded-2xl p-5">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                                {i + 1}
                                            </span>
                                            <Icon className="h-5 w-5 text-primary" />
                                            <p className="font-bold text-stone-900">{step.title}</p>
                                        </div>
                                        <p className="text-stone-600 text-sm leading-relaxed pl-11">{step.text}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-stone-500 text-sm text-center mt-6">
                            合計の目安は、フォーム記入から1〜2週間ほどです。大半はLINE側の審査待ちの時間です。
                        </p>
                    </div>
                </section>

                {/* 7. FAQ */}
                <section className="py-16 md:py-20 bg-stone-50">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading">
                                よくある質問
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {FAQ_ITEMS.map((item) => (
                                <details
                                    key={item.q}
                                    className="group bg-white rounded-2xl border border-stone-200 p-4 md:p-5"
                                >
                                    <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-bold text-stone-800 text-sm md:text-base">
                                        <span className="flex items-start gap-2">
                                            <span className="text-primary">Q.</span>
                                            {item.q}
                                        </span>
                                        <span className="text-stone-400 group-open:rotate-180 transition-transform flex-shrink-0">
                                            ▾
                                        </span>
                                    </summary>
                                    <p className="text-stone-700 text-sm leading-relaxed pl-5 mt-3">
                                        <span className="text-stone-500 mr-1">A.</span>
                                        {item.a}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 8. 作り手紹介 */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading mb-6">
                            作っているのは
                        </h2>
                        <div className="inline-flex items-center gap-4 bg-stone-50 rounded-2xl p-5 border border-stone-200 text-left">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-stone-100">
                                <Image
                                    src="/images/about/founders.jpg"
                                    alt="安藤"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-stone-900">安藤</p>
                                <p className="text-sm text-stone-600">
                                    鳥取で農業と養蜂をやっています。自分の蜂スタンプも、この仕組みで作って売っています。
                                </p>
                            </div>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed mt-6">
                            1件ずつ、こちらで内容を確認しながら作っています。まとめて何十件も同時には受けられませんが、
                            そのぶん1つ1つに時間をかけられます。
                        </p>
                    </div>
                </section>

                {/* 9. 最終CTA */}
                <section className="py-16 md:py-20 bg-primary text-white">
                    <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 font-heading">
                            まずは友だち追加から
                        </h2>
                        <p className="text-base md:text-lg mb-10 opacity-90 leading-relaxed">
                            写真はまだ無くて大丈夫です。友だち追加とフォームの記入だけ、先に済ませてください。
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={LINE_ADD_FRIEND_URL}
                                className="inline-flex items-center bg-white text-primary font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg"
                            >
                                <Smartphone className="mr-2 h-5 w-5" />
                                公式LINEを友だち追加する
                            </Link>
                        </div>

                        <div className="mt-6">
                            <Link
                                href={ORDER_FORM_URL}
                                className="text-sm opacity-80 underline underline-offset-2"
                            >
                                注文フォームを直接開く方はこちら
                            </Link>
                        </div>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm opacity-85">
                            <span className="inline-flex items-center gap-1">
                                <ShieldCheck className="h-4 w-4" /> 検索に出ない設定で申請
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <RefreshCcw className="h-4 w-4" /> 無料修正1回
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Clock3 className="h-4 w-4" /> 審査まで数日〜1週間
                            </span>
                        </div>

                        <div className="mt-10">
                            <LineOfficialCard />
                        </div>
                    </div>
                </section>

                {/* 10. 作っている人（控えめな補足欄） */}
                <section className="py-10 bg-stone-50">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <h3 className="text-sm font-bold text-stone-500 mb-2">作っている人</h3>
                        <p className="text-sm text-stone-600 leading-relaxed">
                            鳥取で農業と養蜂をやっている安藤です。Xはフォロワー1.5万人、Threadsでは蜂の投稿が1万いいねを超えることもあります。スタンプは1件ずつ、私が仕上げています。
                        </p>
                        <div className="mt-3 flex flex-col sm:flex-row gap-x-6 gap-y-1 text-sm">
                            <a
                                href="https://www.threads.com/@tacchan_nooen"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline underline-offset-2"
                            >
                                Threadsで蜂の投稿を見る
                            </a>
                            <a
                                href={LINE_STORE_AUTHOR_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline underline-offset-2"
                            >
                                LINEストアで販売中のスタンプを見る
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <div id="footer-sentinel" />
            <Footer />

            {/* モバイル追従CTA */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-stone-200 p-3">
                <Link
                    href={LINE_ADD_FRIEND_URL}
                    className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-full shadow-lg"
                >
                    公式LINEを友だち追加する
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            <div className="md:hidden h-16" />
        </div>
    );
}
