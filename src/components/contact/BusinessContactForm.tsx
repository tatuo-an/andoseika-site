"use client";

import { useActionState } from "react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { submitContact, ContactState } from "@/app/actions/contact";

const initialState: ContactState = {
    success: false,
    message: "",
};

const PRODUCTS = ["白ネギ", "長芋・むかご", "里芋", "梨", "蜂蜜", "甘酢らっきょう", "その他"];
const BUSINESS_TYPES = ["飲食店", "小売・スーパー", "加工業者", "ギフト・贈答", "その他"];
const USAGE_OPTIONS = ["週5kg未満", "週5〜20kg", "週20〜50kg", "週50kg以上", "単発・不定期"];
const SPEC_OPTIONS = ["小袋・個包装（1〜3kg）", "中箱（5〜10kg）", "大箱・コンテナ（10kg以上）", "規格はこだわらない"];
const PRICE_OPTIONS = ["できるだけ安く", "品質重視で相場程度", "プレミアム品でも可", "まずは相場を知りたい"];

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
            <form action={formAction} className="space-y-10">
                <input type="hidden" name="kind" value="business" />

                {/* ── 貴社情報 ── */}
                <div>
                    <h2 className="text-lg font-bold text-stone-900 mb-5 border-b border-stone-200 pb-2">貴社情報</h2>
                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label htmlFor="companyName" className="block text-sm font-bold text-stone-700 mb-1.5">
                                貴社名・屋号 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="companyName"
                                name="companyName"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="株式会社〇〇 / 〇〇食堂"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="department" className="block text-sm font-bold text-stone-700 mb-1.5">
                                ご担当者名 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="department"
                                name="department"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="安藤 太郎"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-stone-700 mb-1.5">
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
                        <div>
                            <label htmlFor="phone" className="block text-sm font-bold text-stone-700 mb-1.5">
                                電話番号
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="03-1234-5678"
                            />
                        </div>
                    </div>
                </div>

                {/* ── 仕入れ相談内容 ── */}
                <div>
                    <h2 className="text-lg font-bold text-stone-900 mb-5 border-b border-stone-200 pb-2">仕入れ相談内容</h2>
                    <div className="space-y-7">

                        {/* 業種 */}
                        <div>
                            <p className="text-sm font-bold text-stone-700 mb-2">業種 <span className="text-red-500">*</span></p>
                            <div className="flex flex-wrap gap-3">
                                {BUSINESS_TYPES.map((t) => (
                                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="businessType" value={t} required className="accent-primary w-4 h-4" />
                                        <span className="text-sm text-stone-700">{t}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 欲しい商品 */}
                        <div>
                            <p className="text-sm font-bold text-stone-700 mb-2">欲しい商品（複数選択可）</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {PRODUCTS.map((item) => (
                                    <label key={item} className="flex items-center gap-2 p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer transition-colors">
                                        <input type="checkbox" name="items" value={item} className="accent-primary w-4 h-4" />
                                        <span className="text-sm text-stone-700">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 使用量 */}
                        <div>
                            <p className="text-sm font-bold text-stone-700 mb-2">使用量の目安</p>
                            <div className="flex flex-wrap gap-3">
                                {USAGE_OPTIONS.map((u) => (
                                    <label key={u} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="usageAmount" value={u} className="accent-primary w-4 h-4" />
                                        <span className="text-sm text-stone-700">{u}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 希望規格 */}
                        <div>
                            <p className="text-sm font-bold text-stone-700 mb-2">希望する規格・ロット</p>
                            <div className="flex flex-wrap gap-3">
                                {SPEC_OPTIONS.map((s) => (
                                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="specOption" value={s} className="accent-primary w-4 h-4" />
                                        <span className="text-sm text-stone-700">{s}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 希望価格帯 */}
                        <div>
                            <p className="text-sm font-bold text-stone-700 mb-2">希望価格帯</p>
                            <div className="flex flex-wrap gap-3">
                                {PRICE_OPTIONS.map((p) => (
                                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="priceRange" value={p} className="accent-primary w-4 h-4" />
                                        <span className="text-sm text-stone-700">{p}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 定期 or 単発 */}
                        <div>
                            <p className="text-sm font-bold text-stone-700 mb-2">取引形態</p>
                            <div className="flex gap-6">
                                {["定期仕入れを希望", "単発・スポット購入", "まだ決めていない"].map((r) => (
                                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="tradeType" value={r} className="accent-primary w-4 h-4" />
                                        <span className="text-sm text-stone-700">{r}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* チェックボックス2つ */}
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="acceptOffSpec" value="yes" className="accent-primary w-4 h-4" />
                                <span className="text-sm text-stone-700">規格外品・傷ありでも価格優先で構わない</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="sampleRequest" value="yes" className="accent-primary w-4 h-4" />
                                <span className="text-sm text-stone-700">まずサンプルを試したい</span>
                            </label>
                        </div>

                        {/* 自由記述 */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-bold text-stone-700 mb-1.5">
                                その他ご要望・補足
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                placeholder="納期・配送先・その他ご質問などがあればご記入ください"
                            />
                        </div>
                    </div>
                </div>

                {/* プライバシー同意 */}
                <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            required
                            className="mt-1 h-5 w-5 accent-primary"
                        />
                        <span className="text-sm text-stone-600">
                            プライバシーポリシーに同意の上、送信します。
                        </span>
                    </label>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-primary text-white font-bold py-4 rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                    >
                        {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                        {isPending ? "送信中..." : "相談内容を送信する"}
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
