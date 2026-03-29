"use client";

import { useActionState } from "react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { submitContact, ContactState } from "@/app/actions/contact";

const initialState: ContactState = {
    success: false,
    message: "",
};

export function BusinessContactForm() {
    const [state, formAction, isPending] = useActionState(submitContact, initialState);

    if (state.success) {
        return (
            <div className="flex items-center justify-center">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm max-w-2xl w-full text-center">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                        <CheckCircle className="h-10 w-10" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4 font-heading">
                        お問い合わせありがとうございます
                    </h1>
                    <p className="text-stone-600 mb-8">
                        {state.message}<br />
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
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-200">
            <form action={formAction} className="space-y-8">
                <input type="hidden" name="kind" value="business" />

                {/* Company Info Section */}
                <div>
                    <h2 className="text-xl font-bold text-stone-900 mb-6 border-b border-stone-200 pb-2">
                        貴社情報
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Company Name */}
                        <div className="md:col-span-2">
                            <label htmlFor="companyName" className="block text-sm font-bold text-stone-700 mb-2">
                                貴社名・屋号 <span className="text-red-500">*</span>
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

                        {/* Department/Name */}
                        <div className="md:col-span-2">
                            <label htmlFor="department" className="block text-sm font-bold text-stone-700 mb-2">
                                部署名・ご担当者名 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="department"
                                name="department"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="営業部 安藤 太郎"
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

                {/* Transaction Details Section */}
                <div>
                    <h2 className="text-xl font-bold text-stone-900 mb-6 border-b border-stone-200 pb-2">
                        お取引内容
                    </h2>
                    <div className="space-y-6">
                        {/* Products */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-3">
                                ご希望の商品（複数選択可）
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {["白ネギ", "長芋・むかご", "里芋", "梨", "蜂蜜", "甘酢らっきょう", "その他"].map((item) => (
                                    <label key={item} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="items"
                                            value={item}
                                            className="h-5 w-5 text-primary rounded border-stone-300 focus:ring-primary"
                                        />
                                        <span className="text-stone-700">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Quantity */}
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-bold text-stone-700 mb-2">
                                    想定数量・頻度
                                </label>
                                <input
                                    type="text"
                                    id="quantity"
                                    name="quantity"
                                    className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="例：週1回 10kg程度"
                                />
                            </div>

                            {/* Schedule */}
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-bold text-stone-700 mb-2">
                                    お取引開始希望時期
                                </label>
                                <input
                                    type="text"
                                    id="startDate"
                                    name="startDate"
                                    className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="例：2024年4月頃から"
                                />
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-bold text-stone-700 mb-2">
                                その他ご要望・お問い合わせ内容 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows={6}
                                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                placeholder="具体的なご要望やご質問などがございましたらご記入ください"
                            ></textarea>
                        </div>
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
                        disabled={isPending}
                        className="w-full bg-primary text-white font-bold py-4 rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                    >
                        {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                        {isPending ? "送信中..." : "送信する"}
                    </button>
                </div>

                {state.message && !state.success && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm">{state.message}</span>
                    </div>
                )}
            </form>
        </div>
    );
}
