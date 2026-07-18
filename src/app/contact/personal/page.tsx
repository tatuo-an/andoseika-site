import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";
import { PersonalContactForm } from "@/components/contact/PersonalContactForm";

export const metadata: Metadata = {
    title: "個人のお客様 お問い合わせ",
    description: "商品のご購入、体験のご予約など、個人のお客様からのお問い合わせはこちら。",
};

export default async function PersonalContactPage({
    searchParams,
}: {
    searchParams: Promise<{ subject?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const isAiConsulting = resolvedSearchParams.subject === "ai-consulting";

    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1 container mx-auto px-4 md:px-6 py-20">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-stone-900 mb-4 font-heading">
                            {isAiConsulting ? "AI仕組み化の無料相談 お申し込み" : "個人のお客様 お問い合わせ"}
                        </h1>
                        <p className="text-stone-600">
                            {isAiConsulting
                                ? "AIを使った業務仕組み化の無料相談です。今の仕事の悩みを、下の欄にそのままご記入ください。"
                                : "商品や体験に関するご質問など、お気軽にお問い合わせください。"}
                        </p>
                    </div>

                    <PersonalContactForm
                        defaultType={isAiConsulting ? "other" : undefined}
                        defaultMessage={isAiConsulting ? "【AI仕組み化の無料相談を希望します】\n\n会社名：\n今困っている仕事：\n" : undefined}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
