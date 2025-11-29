import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/lib/microcms";
import { News } from "@/types/microcms";
import { Calendar, ChevronLeft } from "lucide-react";

async function getNewsDetail(id: string): Promise<News | null> {
    try {
        const data = await client.get<News>({
            endpoint: "news",
            contentId: id,
        });
        return data;
    } catch (error) {
        console.error("Failed to fetch news detail:", error);
        return null;
    }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const news = await getNewsDetail(id);

    if (!news) {
        return (
            <div className="min-h-screen flex flex-col font-sans bg-stone-50">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <p className="text-stone-500">記事が見つかりませんでした。</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1 py-16">
                <article className="container mx-auto px-4 md:px-6 max-w-3xl">
                    <div className="mb-8">
                        <Link
                            href="/news"
                            className="inline-flex items-center text-stone-500 hover:text-primary transition-colors mb-6"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            お知らせ一覧に戻る
                        </Link>

                        <div className="flex items-center gap-2 text-stone-500 mb-4">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={news.publishedAt}>
                                {new Date(news.publishedAt).toLocaleDateString("ja-JP")}
                            </time>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
                            {news.title}
                        </h1>
                    </div>

                    {news.thumbnail && (
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-stone-200 mb-12 shadow-sm">
                            <Image
                                src={news.thumbnail.url}
                                alt={news.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    <div
                        className="prose prose-stone prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: news.content }}
                    />
                </article>
            </main>

            <Footer />
        </div>
    );
}
