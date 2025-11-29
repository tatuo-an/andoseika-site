import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function CancelPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1 flex items-center justify-center py-20">
                <div className="bg-white p-12 rounded-2xl shadow-sm text-center max-w-lg mx-4 space-y-6">
                    <div className="flex justify-center">
                        <XCircle className="h-20 w-20 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-stone-900">決済がキャンセルされました</h1>
                    <p className="text-stone-600 leading-relaxed">
                        決済処理が中断されました。<br />
                        カートの中身はそのまま残っています。
                    </p>
                    <div className="pt-6">
                        <Link
                            href="/products"
                            className="inline-block px-8 py-3 bg-stone-900 text-white font-bold rounded-full hover:bg-stone-800 transition-colors"
                        >
                            買い物を続ける
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
