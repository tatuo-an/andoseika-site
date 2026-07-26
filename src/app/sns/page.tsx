import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";
import { XTimeline } from "@/components/sns/XTimeline";

export const metadata: Metadata = {
    title: "たっちゃんの農園日記（X）",
    description: "安藤青果 たっちゃんのXでの最新の投稿をご紹介します。畑の様子や収穫の様子など、日々の農園の出来事を発信しています。",
};

const X_USERNAME = "tacchannooen";

export default function SnsPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />
            <main className="flex-1">
                <section className="bg-primary/5 border-b border-primary/10 py-16 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center space-y-4">
                        <p className="text-sm font-bold uppercase tracking-widest text-primary">つぶやき</p>
                        <h1 className="text-3xl md:text-4xl font-bold font-heading text-stone-900">
                            たっちゃんの農園日記
                        </h1>
                        <p className="text-stone-600 leading-relaxed">
                            畑の様子や収穫の様子、日々の出来事をXで発信しています。<br />
                            最新の投稿をこちらでご覧いただけます。
                        </p>
                        <a
                            href={`https://x.com/${X_USERNAME}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-sm font-bold text-primary hover:underline"
                        >
                            @{X_USERNAME} をXで見る →
                        </a>
                    </div>
                </section>

                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-4 md:px-6 max-w-xl">
                        <XTimeline username={X_USERNAME} />
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
