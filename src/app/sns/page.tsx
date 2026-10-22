import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "たっちゃんのつぶやき（Threads）",
    description: "安藤青果 たっちゃんのThreads。ミツバチや畑の様子、日々の出来事を発信しています。",
};

// 公開プロフィールのピン留め投稿を2026-10-22に本人アカウントの画面で確認。
// 公式の「埋め込みコードを取得」が表示するiframe。鍵や有料サービスは不要。
const THREADS_PROFILE = "https://www.threads.com/@tacchan_nooen";
const THREADS_POST = `${THREADS_PROFILE}/post/Db-pv9Hlibz`;

export default function SnsPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />
            <main className="flex-1">
                <section className="bg-primary/5 border-b border-primary/10 py-16 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center space-y-4">
                        <h1 className="text-sm font-bold uppercase tracking-widest text-primary">つぶやき</h1>
                        <p className="text-stone-600 leading-relaxed">
                            ミツバチや畑の様子、日々の出来事をThreadsで発信しています。<br />
                            こちらではピン留めしている投稿をご紹介します。
                        </p>
                        <a
                            href={THREADS_PROFILE}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-sm font-bold text-primary hover:underline"
                        >
                            @tacchan_nooen の最新の投稿をThreadsで見る →
                        </a>
                    </div>
                </section>

                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-4 md:px-6 max-w-xl">
                        <h2 className="text-xl font-bold text-stone-900 mb-6">ミツバチの巣には、専門の「葬儀屋」がいます。</h2>
                        <iframe
                            src={`${THREADS_POST}/embed`}
                            title="たっちゃんのThreads投稿：ミツバチの葬儀屋（2026年8月13日）"
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            className="w-full h-[820px] rounded-2xl border border-stone-200 bg-white"
                        />
                        <details className="mt-4 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
                            <summary className="cursor-pointer font-bold">投稿が表示されない場合はこちら</summary>
                            <blockquote className="mt-4 leading-relaxed">ミツバチの巣には、専門の「葬儀屋」がいます。 死んだ仲間のにおいの変化を察知すると、担当の蜂がくわえて巣の外まで運び出し、数メートル先まで飛んで捨てるんです。 巣の中で病気が広がらないようにするための、れっきとした仕事だと言われています。</blockquote>
                            <p className="mt-3">2026年8月13日・@tacchan_nooen</p>
                            <a href={THREADS_POST} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 font-bold text-primary underline">元の投稿をThreadsで開く →</a>
                        </details>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
