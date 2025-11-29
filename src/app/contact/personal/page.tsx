"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function PersonalContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // For now, just show success message
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex flex-col font-sans bg-stone-50">
                <Header />
                <main className="flex-1 container mx-auto px-4 md:px-6 py-20 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm max-w-2xl w-full text-center">
                        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                            <CheckCircle className="h-10 w-10" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4 font-heading">
                            お問い合わせありがとうございます
                        </h1>
                        <p className="text-stone-600 mb-8">
                            内容を確認の上、担当者よりご連絡させていただきます。<br />
                            今しばらくお待ちください。
                        </p>
                        <a
                            href="/"
                            className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-dark transition-colors"
                        >
                            トップページへ戻る
                        </a>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1 container mx-auto px-4 md:px-6 py-20">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-stone-900 mb-4 font-heading">
                            個人のお客様 お問い合わせ
                        </h1>
                        <p className="text-stone-600">
                            商品や体験に関するご質問など、お気軽にお問い合わせください。
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-200">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-stone-700 mb-2">
                                    お名前 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="安藤 太郎"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-stone-700 mb-2">
                                    メールアドレス <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="taro@example.com"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-bold text-stone-700 mb-2">
                                    電話番号
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="090-1234-5678"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label htmlFor="type" className="block text-sm font-bold text-stone-700 mb-2">
                                    お問い合わせ種別 <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="type"
                                        name="type"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none bg-white"
                                    >
                                        <option value="">選択してください</option>
                                        <option value="product">商品について</option>
                                        <option value="experience">体験・予約について</option>
                                        <option value="other">その他</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-bold text-stone-700 mb-2">
                                    お問い合わせ内容 <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="ご質問内容をご記入ください"
                                ></textarea>
                            </div>

                            {/* Privacy Policy */}
                            <div className="pt-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        required
                                        className="mt-1 h-5 w-5 text-primary rounded border-stone-300 focus:ring-primary"
                                    />
                                    <span className="text-sm text-stone-600">
                                        <a href="#" className="text-primary hover:underline">プライバシーポリシー</a>
                                        に同意の上、送信します。
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary text-white font-bold py-4 rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isSubmitting ? "送信中..." : "送信する"}
                                </button>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                                    <AlertCircle className="h-5 w-5" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
