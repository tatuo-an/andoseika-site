import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    Camera,
    MessageCircle,
    PlayCircle,
    Phone,
    CheckCircle2,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "SNS運用代行・公式LINE構築 AND U｜安藤青果",
    description:
        "写真を送るだけ。SNSと公式LINEの運用を、鳥取で農業と養蜂をやる安藤自身が毎日回している仕組みで代行します。AND U（アンドユー）の無料相談で、今の状況をお聞かせください。",
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

export default function AiConsultingPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1">
                {/* 1. ヒーロー（なぜ：思想＋顔写真＋CTA） */}
                <section className="relative py-20 md:py-28 bg-stone-100 overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <div className="max-w-3xl mx-auto text-center space-y-6">
                            <span className="text-stone-500 font-bold tracking-widest uppercase text-sm">
                                AND U — SNS運用代行 × 公式LINE構築
                            </span>
                            <h1 className="text-2xl md:text-4xl font-bold text-stone-900 leading-tight font-heading">
                                いいものを作っているのに、知られていない。
                                <br className="hidden sm:block" />
                                それが一番もったいないと思っています。
                            </h1>
                            <p className="text-stone-600 text-base md:text-lg leading-relaxed">
                                写真を送るだけ。SNSと公式LINEは、ぜんぶこちらで回します。
                            </p>
                            <p className="text-stone-500 text-sm leading-relaxed max-w-lg mx-auto">
                                安藤（ANDO）の名前には、最初から「AND」が入っています。あなたのお店と、一緒に。それでAND
                                Uです。
                            </p>
                            <div className="pt-4">
                                <Link
                                    href="/contact/personal?subject=sns-line"
                                    className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
                                >
                                    無料相談に申し込む
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <p className="text-stone-500 text-xs mt-3">
                                    60分・オンライン可・売り込みはしません
                                </p>
                            </div>
                        </div>

                        <div className="max-w-md mx-auto mt-14 flex items-center gap-4 bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
                            <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-stone-100">
                                <Image
                                    src="/images/about/founders.jpg"
                                    alt="AND U運営責任者 安藤匡志"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-stone-900">安藤 匡志</p>
                                <p className="text-sm text-stone-500">
                                    養蜂家 / 鳥取の青果卸「安藤青果」運営責任者
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. 悩み共感（店主の生活の言葉） */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading">
                                こんな夜、ありませんか。
                            </h2>
                        </div>

                        <ul className="bg-stone-50 rounded-2xl border border-stone-100 divide-y divide-stone-200 overflow-hidden">
                            {[
                                "営業が終わってから、今日の投稿を考える気力が残っていない",
                                "何を書けば読まれるのか、正直よく分からない",
                                "フォロワーは増えたのに、お店に来る人は増えていない",
                                "写真は撮っているのに、投稿しないまま溜まっていく",
                            ].map((item) => (
                                <li
                                    key={item}
                                    className="flex items-start gap-3 p-4 md:p-5 text-stone-700 text-base leading-relaxed"
                                >
                                    <span className="text-stone-400 flex-shrink-0">・</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <p className="text-stone-600 leading-relaxed mt-8 text-center">
                            どれか一つでも当てはまるなら、この先を読んでください。
                        </p>
                    </div>
                </section>

                {/* 3. 証拠（なに：実演販売。実物のスクショと数字で見せる） */}
                <section className="py-20 bg-stone-50">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading mb-4">
                                まず、自分の店で毎日やっています。
                            </h2>
                            <p className="text-stone-600 leading-relaxed">
                                デモではなく実物です。鳥取で農業と養蜂をやっている当方自身が、閉店後の1時間をスマホとにらめっこせずに過ごせる毎日を、先に体験しています。
                            </p>
                        </div>

                        {/* Threadsの実投稿スクショ（スマホ風の枠） */}
                        <div className="mx-auto max-w-[260px] rounded-[2.2rem] border-[6px] border-stone-900 shadow-xl overflow-hidden bg-stone-900">
                            <div className="rounded-[1.7rem] overflow-hidden bg-white">
                                <Image
                                    src="/images/ai/threads-14000-likes.png"
                                    alt="実際のThreads投稿のスクリーンショット。いいね1.4万件・コメント157件・リポスト271件と表示されている。"
                                    width={520}
                                    height={565}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                        <p className="text-center text-xs text-stone-400 mt-3">
                            実際の投稿（2026年8月・Threads）
                        </p>

                        {/* 逆張り訴求：投稿当時のフォロワー数 */}
                        <div className="max-w-md mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-6 md:p-8 text-center mt-8">
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

                        {/* Xのフォロワー数 */}
                        <div className="max-w-md mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-6 md:p-8 text-center mt-6">
                            <p className="font-heading font-bold text-primary text-4xl md:text-5xl">
                                13,923<span className="text-lg text-stone-800 ml-1">人</span>
                            </p>
                            <p className="text-stone-500 text-sm mt-2">
                                X（旧Twitter）のフォロワー・2026年8月時点
                            </p>
                            {/* 差し込み予定: 本人のXプロフィール画面の実スクショ（後日受け取り次第、この下に追加） */}
                        </div>

                        {/* 養蜂の実写（本人が現場をやっている証拠） */}
                        <div className="max-w-sm mx-auto mt-10">
                            <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
                                <Image
                                    src="/images/experience/beekeeping.jpg"
                                    alt="実際に養蜂をしている安藤本人。鳥取県北栄町の巣箱にて。"
                                    width={1280}
                                    height={1280}
                                    className="w-full h-auto"
                                />
                            </div>
                            <p className="text-center text-xs text-stone-400 mt-2">
                                SNSも、この畑と巣箱を回しながらやっています。
                            </p>
                        </div>

                        <p className="text-stone-700 leading-relaxed mt-10 text-center max-w-xl mx-auto">
                            現在、地元のラーメン店と美容室のSNS運用を実際に担当しています。
                        </p>

                        {/* 差し込み予定: クライアント実績データ（本人確認済みの実数字が出たら追記。未検証の間は空欄のまま）
                            例: ○○様（ラーメン店）フォロワー数◯人→◯人／LINE登録者◯人 等。実額・保証表現は禁止 */}

                        <p className="text-center text-stone-400 text-sm mt-8">
                            やり方は、無料相談のときにそのままお見せします。
                        </p>
                    </div>
                </section>

                {/* 4. 何をするか（どうやって） */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading mb-4">
                                写真を送るだけ。あとはこちらで回します。
                            </h2>
                            <p className="text-stone-600 leading-relaxed">
                                SNS投稿代行と公式LINE構築、この2つに絞ってやっています。
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-stone-50 rounded-2xl p-6 md:p-8 border border-stone-100">
                                <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-700 mb-4">
                                    <Camera className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-stone-900 mb-3">SNS投稿代行</h3>
                                <p className="text-xs text-stone-400 mb-1">困り事</p>
                                <p className="text-stone-600 text-sm leading-relaxed mb-3">
                                    投稿する時間も、文章を考える余力もない
                                </p>
                                <p className="text-xs text-stone-400 mb-1">任せられる実作業</p>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    写真を受け取ってから、文章づくり・投稿までこちらで
                                </p>
                            </div>
                            <div className="bg-stone-50 rounded-2xl p-6 md:p-8 border border-stone-100">
                                <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-700 mb-4">
                                    <MessageCircle className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-stone-900 mb-3">公式LINE構築</h3>
                                <p className="text-xs text-stone-400 mb-1">困り事</p>
                                <p className="text-stone-600 text-sm leading-relaxed mb-3">
                                    フォロワーが増えても、来店やリピートにつながらない
                                </p>
                                <p className="text-xs text-stone-400 mb-1">任せられる実作業</p>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    公式LINEの設計から、登録してもらう導線、配信まで
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 py-8 border-t border-b border-stone-200 text-center">
                            <p className="font-heading text-lg md:text-xl text-stone-900 leading-relaxed">
                                フォロワーは、<strong>SNS会社のもの</strong>です。
                                <br />
                                LINEの友だちは、<strong>あなたのお店のもの</strong>です。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 5. 料金 */}
                <section className="py-20 bg-stone-100">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading">
                                料金は、まずは無料相談から。
                            </h2>
                        </div>

                        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 md:p-8 mb-8">
                            <p className="text-xs text-stone-400 tracking-wide mb-2">
                                まずはここから・全員の入口
                            </p>
                            <h3 className="font-bold text-stone-900 mb-1">無料相談</h3>
                            <p className="text-2xl font-bold text-stone-900 mb-3">
                                無料<span className="text-sm font-normal text-stone-500">（60分）</span>
                            </p>
                            <p className="text-stone-600 text-sm leading-relaxed mb-5">
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

                        <p className="text-stone-600 text-sm mb-4">
                            相談のあとは、次の4段階から選べます。
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl border border-stone-200 p-6">
                                <p className="text-sm font-bold text-stone-900 mb-1">初期構築</p>
                                <p className="text-2xl font-bold text-stone-900 mb-2">
                                    10<span className="text-xs font-normal text-stone-500 ml-1">万円（税込・買い切り）</span>
                                </p>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    SNSアカウント設計と公式LINE構築を一式で行います。ここまでは1回きりの費用です。
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl border border-stone-200 p-6">
                                <p className="text-sm font-bold text-stone-900 mb-1">ライト</p>
                                <p className="text-2xl font-bold text-stone-900 mb-2">
                                    3<span className="text-xs font-normal text-stone-500 ml-1">万円（税込・月額）</span>
                                </p>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    投稿代行のみ。写真を送っていただければ、あとは形にして投稿します。
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl border-2 border-stone-900 p-6 relative">
                                <span className="inline-block bg-stone-900 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                                    おすすめ
                                </span>
                                <p className="text-sm font-bold text-stone-900 mb-1">スタンダード</p>
                                <p className="text-2xl font-bold text-stone-900 mb-2">
                                    5<span className="text-xs font-normal text-stone-500 ml-1">万円（税込・月額）</span>
                                </p>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    投稿代行に加えて、公式LINEの配信と月1回の数字報告まで行います。
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl border border-stone-200 p-6">
                                <p className="text-sm font-bold text-stone-900 mb-1">おまかせフル</p>
                                <p className="text-2xl font-bold text-stone-900 mb-2">
                                    10<span className="text-xs font-normal text-stone-500 ml-1">万円（税込・月額）</span>
                                </p>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    コメント対応やキャンペーンの企画まで、まるごとお任せいただけます。
                                </p>
                            </div>
                        </div>

                        <p className="text-stone-500 text-sm mt-6 text-center">
                            最初にご協力いただくお店には、モニター特別条件をご用意しています。
                        </p>
                    </div>
                </section>

                {/* 6. 正直告白 */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading mb-4">
                                正直に言うと、どのお店にも向くわけではありません。
                            </h2>
                            <p className="text-stone-600 leading-relaxed">
                                合うお店と、合わないお店があります。ここは飾らずに書きます。
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden">
                                <div className="px-5 py-3 border-b border-stone-200 font-bold text-stone-900 text-sm">
                                    向いていると思うお店
                                </div>
                                <ul className="p-5 space-y-2 text-stone-700 text-sm leading-relaxed list-disc pl-8">
                                    <li>写真は撮れるけど、文章と投稿が続かない</li>
                                    <li>SNSを増やすだけでなく、来店につながる形にしたい</li>
                                    <li>公式LINEを育てて、お店自身の資産にしたい</li>
                                    <li>効果が出るまで2〜3ヶ月かかることを許容できる</li>
                                </ul>
                            </div>
                            <div className="bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden">
                                <div className="px-5 py-3 border-b border-stone-200 font-bold text-stone-900 text-sm">
                                    向いていないと思うお店
                                </div>
                                <ul className="p-5 space-y-2 text-stone-700 text-sm leading-relaxed list-disc pl-8">
                                    <li>今すぐ売上が倍になる魔法を求めている</li>
                                    <li>写真を一枚も送れない（現場の材料がない）</li>
                                    <li>発信の内容・言葉づかいを一切変えたくない</li>
                                    <li>月1回のやり取りすら負担に感じる</li>
                                </ul>
                            </div>
                        </div>

                        <p className="text-stone-600 leading-relaxed mt-8 text-center">
                            当てはまらないと思ったら、無理に申し込む必要はありません。相談だけ受けて、合わないと分かって帰っていただいて構いません。
                        </p>
                    </div>
                </section>

                {/* 7. 進め方 */}
                <section className="py-20 bg-stone-50">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading">
                                始め方は3ステップです。
                            </h2>
                        </div>

                        <ol className="bg-white rounded-2xl border border-stone-200 shadow-sm divide-y divide-stone-100 overflow-hidden">
                            {[
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
                            ].map((item) => (
                                <li key={item.step} className="flex gap-4 p-4 md:p-5">
                                    <span className="flex-shrink-0 text-xs font-bold text-stone-500 tracking-wide pt-0.5 w-16">
                                        {item.step}
                                    </span>
                                    <p className="text-stone-700 text-sm leading-relaxed">{item.text}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* 8. 無料相談の中身（AIでの仕組み化）＋動画講義 全10回 */}
                <section id="lecture" className="py-20 bg-white scroll-mt-16">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <div className="bg-stone-50 rounded-2xl border border-stone-100 p-6 md:p-10 mb-14">
                            <p className="font-bold text-stone-900 mb-3">
                                無料相談では、AIでの仕組み化もご相談いただけます。
                            </p>
                            <p className="text-stone-600 text-sm md:text-base leading-relaxed mb-6">
                                鳥取の小さな青果卸を経営しながら、この4ヶ月で仕事の仕組みを80本以上作ってきました。作ったのに一度も使わなかった仕組みも7つあります。きれいな成功談だけでなく、実際にやったことをそのままお話しします。
                            </p>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-white rounded-xl p-3 md:p-4 text-center border border-stone-200">
                                    <p className="text-xl md:text-2xl font-bold text-primary font-heading">
                                        4ヶ月
                                    </p>
                                    <p className="text-[11px] md:text-xs text-stone-500 mt-1">
                                        で仕組み80本以上
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl p-3 md:p-4 text-center border border-stone-200">
                                    <p className="text-xl md:text-2xl font-bold text-primary font-heading">
                                        1日
                                    </p>
                                    <p className="text-[11px] md:text-xs text-stone-500 mt-1">
                                        で社内総点検
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl p-3 md:p-4 text-center border border-stone-200">
                                    <p className="text-xl md:text-2xl font-bold text-primary font-heading">7つ</p>
                                    <p className="text-[11px] md:text-xs text-stone-500 mt-1">
                                        は作って使わなかった
                                    </p>
                                </div>
                            </div>

                            <p className="text-stone-600 text-sm leading-relaxed mb-4">
                                やり方は、現場の仕事を棚卸しして、任せられる仕事を見極め、小さく始めるロードマップをつくる。この3つだけです。業種は問いません。
                            </p>
                            <p className="text-stone-400 text-xs leading-relaxed">
                                ※AIでの仕組み化・伴走支援の料金は、会社の規模やご相談内容によって変わるため、無料相談の中でお伝えします（上のSNS運用代行の料金表とは別です）。
                            </p>
                        </div>

                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading mb-4">
                                動画講義 全10回（無料・各3〜4分）
                            </h2>
                            <p className="text-stone-600 leading-relaxed">
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
                                <p className="text-xs text-stone-400 font-bold mb-1">第1回</p>
                                <h3 className="font-bold text-stone-900">{FIRST_LECTURE_VIDEO.title}</h3>
                            </div>
                        </div>

                        <ol className="mt-8 bg-white rounded-2xl border border-stone-200 shadow-sm divide-y divide-stone-100 overflow-hidden">
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

                        <div className="text-center mt-8">
                            <a
                                href={LECTURE_PLAYLIST_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center font-bold text-stone-800 hover:text-stone-600"
                            >
                                ▶ 全10回をまとめて見る
                            </a>
                        </div>

                        <div className="max-w-2xl mx-auto mt-12 space-y-5 text-stone-700 leading-relaxed">
                            <p>「見て終わり」で構いません。まずは知ってもらうためのものです。</p>
                            <p>
                                その上で、自分のお店の話を聞いてほしいと思った方は、無料相談にお申し込みください。契約前提の話ではありません。今のSNSや仕事の悩みを聞かせてもらうだけでも大丈夫です。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 9. FAQ */}
                <section className="py-20 bg-stone-50">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading">
                                よくある質問
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    q: "契約の縛りはありますか",
                                    a: "月額プランは3ヶ月を1つの区切りとしています。3ヶ月経過したあとは、いつでも解約いただけます。",
                                },
                                {
                                    q: "写真はスマホで撮ったものでいいですか",
                                    a: "はい。スマホで撮った写真を送っていただければ十分です。",
                                },
                                {
                                    q: "効果はいつから出ますか",
                                    a: "早いお店で1〜2ヶ月ほどで変化を感じています。ただしお約束はできません。写真の量やお店の業種によって変わります。",
                                },
                                {
                                    q: "解約したら、SNSアカウントや公式LINEはどうなりますか",
                                    a: "すべてお店のものとしてお渡しします。当方が持ち続けることはありません。",
                                },
                                {
                                    q: "対応地域はどこまでですか",
                                    a: "鳥取近隣のお店を優先していますが、オンラインでのやり取りで全国どこからでもご相談いただけます。",
                                },
                            ].map((item) => (
                                <div key={item.q}>
                                    <p className="font-bold text-stone-900 mb-2">
                                        <span className="text-stone-400 mr-1">Q.</span>
                                        {item.q}
                                    </p>
                                    <p className="text-stone-600 text-sm leading-relaxed pl-5">
                                        <span className="text-stone-400 mr-1">A.</span>
                                        {item.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 10. 最終CTA */}
                <section className="py-20 bg-primary text-white">
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
                                className="text-xs opacity-75 underline underline-offset-2"
                            >
                                AIでの社内の仕組み化について相談したい方はこちら
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
