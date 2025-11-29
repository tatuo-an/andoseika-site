import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/lib/microcms";
import { News } from "@/types/microcms";
import { Calendar } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "お知らせ",
    description: "安藤青果からの最新情報、季節の便り、イベント情報などをお届けします。",
};

async function getNews(): Promise<News[]> {
    try {
        const data = await client.getList<News>({
            endpoint: "news",
            queries: { orders: "-publishedAt" },
        });
        return data.contents;
    } catch (error) {
        console.error("Failed to fetch news:", error);
        return [];
    }
}

export default async function NewsPage() {
    const newsList = await getNews();

    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 font-heading">
                            お知らせ
                        </h1>
                        <p className="text-stone-600 max-w-2xl mx-auto">
                            安藤青果からの最新情報や、日々の畑の様子をお届けします。
                        </p>
                    </div>

                    {newsList.length === 0 ? (
                        <div className="text-center py-20 text-stone-500">
                            <p>現在お知らせはありません。</p>
                        </div>
                    ) : (
                        <div className="grid gap-8 max-w-4xl mx-auto">
                            {newsList.map((news) => (
                                <Link
                                    key={news.id}
                                    href={`/news/${news.id}`}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row"
                                >
                                    {news.thumbnail && (
                                        <div className="relative h-48 md:h-auto md:w-64 bg-stone-200 flex-shrink-0">
                                            <Image
                                                src={news.thumbnail.url}
                                                alt={news.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-center space-y-3">
                                        <div className="flex items-center gap-2 text-stone-500 text-sm">
                                            <Calendar className="h-4 w-4" />
                                            <time dateTime={news.publishedAt}>
                                                {new Date(news.publishedAt).toLocaleDateString("ja-JP")}
                                            </time>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold text-stone-900 group-hover:text-primary transition-colors">
                                            {news.title}
                                        </h2>
                                        <p className="text-stone-600 line-clamp-2 text-sm md:text-base">
                                            {news.content.replace(/<[^>]+>/g, "")}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
