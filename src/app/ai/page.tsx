import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    Search,
    ClipboardList,
    Route,
    PlayCircle,
    Phone,
    CheckCircle2,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI仕組み化相談｜安藤青果",
    description:
        "コードは書けない経営者が、自分の会社をAIで仕組み化してきた実例をもとにお話しする無料相談。地方の小さな会社の「何から始めればいいかわからない」に、仕組み化診断で答えます。",
};

const LECTURE_VIDEOS: {
    title: string;
    note: string;
    description: string;
    youtubeId: string | null;
}[] = [
    {
        title: "仕組み化診断デモ講義 第1回",
        note: "約3分30秒",
        description:
            "AIに任せられる仕事の見つけ方を、実際の診断の流れに沿って説明します。",
        youtubeId: null,
    },
    {
        title: "養蜂家が発信を自動化した話",
        note: "準備中",
        description:
            "毎日の情報発信の作業をAIに任せるようにした実例を、そのままお話しします。",
        youtubeId: null,
    },
    {
        title: "経理をAIで半自動化した話",
        note: "準備中",
        description:
            "経理まわりの作業をAIで仕組み化した実例を、そのままお話しします。",
        youtubeId: null,
    },
];

export default function AiConsultingPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1">
                {/* 0. ファーストビュー */}
                <section className="relative py-20 md:py-28 bg-stone-100 overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <div className="max-w-3xl mx-auto text-center space-y-6">
                            <span className="text-primary font-bold tracking-widest uppercase text-sm">
                                AI Business Consulting
                            </span>
                            <h1 className="text-2xl md:text-4xl font-bold text-stone-900 leading-tight font-heading">
                                「うちみたいな小さな会社でも、<br className="hidden sm:block" />
                                AIって使えるんですか？」
                            </h1>
                            <p className="text-stone-600 text-base md:text-lg leading-relaxed">
                                鳥取でハチを育て、家業の青果会社を経営しながら、
                                自分の会社をAIで仕組み化してきました。
                                <br />
                                コードは一行も書けません。
                            </p>
                            <div className="pt-4">
                                <a
                                    href="#lecture"
                                    className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
                                >
                                    まずは3分半の話を聞いてみる
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </a>
                            </div>
                        </div>

                        <div className="max-w-md mx-auto mt-14 flex items-center gap-4 bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
                            <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-stone-100">
                                <Image
                                    src="/images/about/founders.jpg"
                                    alt="安藤青果 運営責任者 安藤匡志"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-stone-900">安藤 匡志</p>
                                <p className="text-sm text-stone-500">
                                    鳥取の青果卸「安藤青果」運営責任者・養蜂家
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 1. Problem */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="space-y-5 text-stone-700 leading-relaxed text-base md:text-lg">
                            <p>
                                AIが便利らしい、というのはもう聞き飽きたと思います。
                            </p>
                            <p>
                                でも、自分の会社のどの仕事に使えるのか。
                                <br />
                                そこがわからないまま、時間だけが過ぎていないでしょうか。
                            </p>
                            <p>
                                ツールを試してみても、結局続かない。
                                <br />
                                パソコンが得意な人がいないから、そこで止まってしまう。
                                <br />
                                何から手をつけていいのか、誰に聞けばいいのかもわからない。
                            </p>
                            <p className="font-bold text-stone-900">
                                そんな声を、あちこちの社長さんから聞いてきました。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2. Affinity */}
                <section className="py-20 bg-stone-50">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="space-y-5 text-stone-700 leading-relaxed text-base md:text-lg">
                            <p className="font-bold text-stone-900 text-xl">
                                私も、同じ立場です。
                            </p>
                            <p>
                                鳥取の小さな青果卸を経営していて、コードは一行も書けません。
                                パソコンが特別得意なわけでもありません。
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 md:gap-6 my-10">
                            <div className="bg-white rounded-2xl p-4 md:p-6 text-center border border-stone-200 shadow-sm">
                                <p className="text-2xl md:text-3xl font-bold text-primary font-heading">4ヶ月</p>
                                <p className="text-xs md:text-sm text-stone-500 mt-1">で仕組み80本以上</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 md:p-6 text-center border border-stone-200 shadow-sm">
                                <p className="text-2xl md:text-3xl font-bold text-primary font-heading">1日</p>
                                <p className="text-xs md:text-sm text-stone-500 mt-1">で社内総点検</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 md:p-6 text-center border border-stone-200 shadow-sm">
                                <p className="text-2xl md:text-3xl font-bold text-primary font-heading">7つ</p>
                                <p className="text-xs md:text-sm text-stone-500 mt-1">は作って使わなかった</p>
                            </div>
                        </div>

                        <div className="space-y-5 text-stone-700 leading-relaxed text-base md:text-lg">
                            <p>
                                うちの会社では、この4ヶ月で仕事の仕組みを80本以上、
                                AIに任せる形で作ってきました。
                                6月には、社内の仕組みを丸ごと点検する「監査」も1日でやりました。
                                人がやれば数週間かかる量です。
                            </p>
                            <p>
                                もちろん、うまくいかなかったこともあります。
                                作ったのに一度も使わなかった仕組みが、7つありました。
                                だから今は「使う場面が3回見えてから作る」というルールにしています。
                            </p>
                            <p className="font-bold text-stone-900">
                                きれいな成功談だけを話すつもりはありません。
                                うちで実際にやったこと、失敗したことだけを、そのままお話しします。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. Solution */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-14 max-w-2xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading mb-4">
                                やっているのは「仕組み化診断」
                            </h2>
                            <p className="text-stone-600 leading-relaxed">
                                やることは、3つだけです。
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                                    <Search className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-stone-900 mb-3">① 現場の棚卸し</h3>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    どんな仕事を、どれくらいの頻度で、どれくらいの時間かけてやっているか。
                                    紙かパソコンかも聞きます。専門知識は不要です。いつもの仕事を、そのまま教えてもらうだけです。
                                </p>
                            </div>
                            <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                                    <ClipboardList className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-stone-900 mb-3">② 任せられる仕事の見極め</h3>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    よくやる仕事で、やり方が決まっている仕事。ここがAI化の一等地です。
                                    効果・導入のしやすさ・失敗したときのリスク、この3つで採点します。数字で見えるので、感覚ではなく判断できます。
                                </p>
                            </div>
                            <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                                    <Route className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-stone-900 mb-3">③ 小さく始めるロードマップ</h3>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    今週できること、3ヶ月以内、6ヶ月以内の3段階に分けます。
                                    最初の一歩は、失敗しても仕事が止まらない、小さなところから選びます。一気に全部を変えることはしません。
                                </p>
                            </div>
                        </div>

                        <p className="text-center text-stone-500 text-sm mt-10">
                            業種は問いません。花屋さんでも、工務店さんでも、同じやり方で進められます。
                        </p>
                    </div>
                </section>

                {/* 4. Offer */}
                <section id="lecture" className="py-20 bg-stone-100 scroll-mt-16">
                    <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading mb-4">
                                文章より、話しているところを見てください
                            </h2>
                            <p className="text-stone-600 leading-relaxed">
                                仕組み化診断のやり方を、無料の講義動画で公開しています。
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {LECTURE_VIDEOS.map((video) => (
                                <div
                                    key={video.title}
                                    className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm"
                                >
                                    <div className="relative aspect-video bg-stone-200 flex items-center justify-center">
                                        {video.youtubeId ? (
                                            <iframe
                                                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                                                title={video.title}
                                                className="absolute inset-0 w-full h-full"
                                                loading="lazy"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <>
                                                <PlayCircle className="h-12 w-12 text-stone-400" />
                                                <span className="absolute top-3 right-3 bg-stone-900/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                    近日公開
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs text-stone-400 font-bold mb-1">{video.note}</p>
                                        <h3 className="font-bold text-stone-900 mb-2">{video.title}</h3>
                                        <p className="text-stone-600 text-sm leading-relaxed">{video.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="max-w-2xl mx-auto mt-12 space-y-5 text-stone-700 leading-relaxed">
                            <p>
                                「見て終わり」で構いません。まずは知ってもらうためのものです。
                            </p>
                            <p>
                                その上で、自分の会社の話を聞いてほしいと思った方は、無料相談にお申し込みください。
                                契約前提の話ではありません。今の仕事の悩みを聞かせてもらうだけでも大丈夫です。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 5. Narrowing */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                        <div className="bg-stone-50 rounded-2xl p-8 md:p-10 border border-stone-100 space-y-4 text-stone-700 leading-relaxed">
                            <p>
                                伴走支援は、私が一社ずつ実際に関わる形で進めています。
                                そのため、同時にお受けできる数には限りがあります。
                            </p>
                            <p>
                                料金については、会社の規模やご相談内容によって変わるため、無料相談の中でお伝えします。
                            </p>
                            <p className="text-stone-500 text-sm">
                                「今だけ」「限定」といった話ではありません。単純に、私一人で見られる数に限りがあるというだけです。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 6. Action */}
                <section className="py-20 bg-primary text-white">
                    <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 font-heading">
                            気になった方は、ご連絡ください
                        </h2>
                        <p className="text-base md:text-lg mb-10 opacity-90 leading-relaxed">
                            スマホからのメッセージでも、電話でも構いません。
                            まずは今の仕事の悩みを聞かせてください。
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/contact/personal?subject=ai-consulting"
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
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
