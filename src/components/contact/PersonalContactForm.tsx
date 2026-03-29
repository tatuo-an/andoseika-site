"use client";

import { useActionState } from "react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { submitContact, ContactState } from "@/app/actions/contact";

const initialState: ContactState = {
    success: false,
    message: "",
};

export function PersonalContactForm() {
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
            <form action={formAction} className="space-y-6">
                <input type="hidden" name="kind" value="personal" />

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
