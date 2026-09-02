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
    const isSnsLine = resolvedSearchParams.subject === "sns-line";

    const heading = isSnsLine
        ? "SNS運用代行・公式LINE構築 無料相談 お申し込み"
        : isAiConsulting
            ? "AI仕組み化の無料相談 お申し込み"
            : "個人のお客様 お問い合わせ";
    const description = isSnsLine
        ? "SNS運用代行・公式LINE構築の無料相談です。今のSNS・公式LINEの状況を、下の欄にそのままご記入ください。"
        : isAiConsulting
            ? "AIを使った業務仕組み化の無料相談です。今の仕事の悩みを、下の欄にそのままご記入ください。"
            : "商品や体験に関するご質問など、お気軽にお問い合わせください。";
    const defaultMessage = isSnsLine
        ? "【SNS運用代行・公式LINE構築（AND U）の無料相談を希望します】\n\n店舗名：\n業種：\n今のSNS・公式LINEの状況：\n"
        : isAiConsulting
            ? "【AI仕組み化の無料相談を希望します】\n\n会社名：\n今困っている仕事：\n"
            : undefined;

    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1 container mx-auto px-4 md:px-6 py-20">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-stone-900 mb-4 font-heading">
                            {heading}
                        </h1>
                        <p className="text-stone-600">
                            {description}
                        </p>
                    </div>

                    <PersonalContactForm
                        defaultType={isSnsLine || isAiConsulting ? "other" : undefined}
                        defaultMessage={defaultMessage}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
