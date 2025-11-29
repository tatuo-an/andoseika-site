import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function IndividualContactPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                    <div className="text-center mb-12 space-y-4">
                        <span className="text-primary font-bold tracking-widest uppercase">For Individual</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 font-heading">
                            お問い合わせ（個人のお客様）
                        </h1>
                        <p className="text-stone-600">
                            商品についてのご質問や、体験のご予約など、<br />
                            お気軽にお問い合わせください。
                        </p>
                    </div>

                    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm">
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-bold text-stone-700">
                                    お名前 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="安藤 太郎"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-bold text-stone-700">
                                    メールアドレス <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="taro@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="type" className="block text-sm font-bold text-stone-700">
                                    お問い合わせ種別 <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="type"
                                        className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none bg-white"
                                    >
                                        <option value="general">一般的なお問い合わせ</option>
                                        <option value="experience">体験・ワークショップについて</option>
                                        <option value="other">その他</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="block text-sm font-bold text-stone-700">
                                    お問い合わせ内容 <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    placeholder="お問い合わせ内容をご記入ください"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
                            >
                                送信する
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
