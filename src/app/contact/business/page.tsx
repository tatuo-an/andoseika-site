"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function BusinessContactPage() {
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
                            内容を確認の上、担当者より2〜3営業日以内にご連絡させていただきます。<br />
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
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-stone-900 mb-4 font-heading">
                            法人・業務用 お問い合わせ
                        </h1>
                        <p className="text-stone-600">
                            卸売、大口注文、お取引に関するご相談はこちらからお願いいたします。
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-200">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Company Info Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">
                                    貴社情報
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="companyName" className="block text-sm font-bold text-stone-700 mb-2">
                                            会社名・屋号 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="companyName"
                                            name="companyName"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            placeholder="株式会社〇〇"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="department" className="block text-sm font-bold text-stone-700 mb-2">
                                            部署・ご担当者名 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="department"
                                            name="department"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            placeholder="安藤 次郎"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            placeholder="jiro@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-bold text-stone-700 mb-2">
                                            電話番号 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            placeholder="03-1234-5678"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Request Details Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">
                                    ご希望内容
                                </h3>

                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-3">
                                        ご希望の取扱品目（複数選択可）
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {["白ネギ", "長芋・むかご", "里芋", "梨", "蜂蜜", "甘酢らっきょう"].map((item) => (
                                            <label key={item} className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    name="items"
                                                    value={item}
                                                    className="h-5 w-5 text-primary rounded border-stone-300 focus:ring-primary"
                                                />
                                                <span className="text-sm text-stone-700">{item}</span>
                                            </label>
                                        ))}
                                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                name="items"
                                                value="その他"
                                                className="h-5 w-5 text-primary rounded border-stone-300 focus:ring-primary"
                                            />
                                            <span className="text-sm text-stone-700">その他</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-bold text-stone-700 mb-2">
                                            ご希望の数量・頻度
                                        </label>
                                        <input
                                            type="text"
                                            id="quantity"
                                            name="quantity"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            placeholder="例：週1回 10kg程度"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="startDate" className="block text-sm font-bold text-stone-700 mb-2">
                                            ご希望の開始時期
                                        </label>
                                        <input
                                            type="text"
                                            id="startDate"
                                            name="startDate"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            placeholder="例：来月から、なるべく早く"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-bold text-stone-700 mb-2">
                                        お問い合わせ内容・詳細
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                        placeholder="ご質問、ご要望などをご自由にご記入ください"
                                    ></textarea>
                                </div>
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
