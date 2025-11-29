import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { User, Building2, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "お問い合わせ",
    description: "商品のご購入、体験のご予約、業務用のお取引に関するお問い合わせはこちらから。",
};

export default function ContactGatewayPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1 container mx-auto px-4 md:px-6 py-20">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6 font-heading">
                        お問い合わせ
                    </h1>
                    <p className="text-stone-600 text-lg">
                        お問い合わせの内容に合わせて、以下のフォームよりご連絡ください。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Personal Contact Card */}
                    <Link
                        href="/contact/personal"
                        className="group block bg-white rounded-3xl p-8 md:p-12 border border-stone-200 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
                    >
                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                            <User className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-stone-900 mb-4 group-hover:text-primary transition-colors">
                            個人のお客様
                        </h2>
                        <p className="text-stone-600 mb-8 leading-relaxed">
                            商品のご購入、体験のご予約、その他一般的なご質問はこちらからお問い合わせください。
                        </p>
                        <span className="inline-flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform">
                            フォームへ進む
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                    </Link>

                    {/* Business Contact Card */}
                    <Link
                        href="/contact/business"
                        className="group block bg-white rounded-3xl p-8 md:p-12 border border-stone-200 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
                    >
                        <div className="h-16 w-16 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-600 mb-8 group-hover:scale-110 transition-transform">
                            <Building2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-stone-900 mb-4 group-hover:text-primary transition-colors">
                            法人・業務用のお問い合わせ
                        </h2>
                        <p className="text-stone-600 mb-8 leading-relaxed">
                            卸売、大口注文、お取引に関するご相談はこちらからお問い合わせください。
                        </p>
                        <span className="inline-flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform">
                            フォームへ進む
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
