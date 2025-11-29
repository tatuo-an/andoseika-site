"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useShoppingCart } from "use-shopping-cart";
import { useEffect } from "react";

export default function SuccessPage() {
    const { clearCart } = useShoppingCart();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1 flex items-center justify-center py-20">
                <div className="bg-white p-12 rounded-2xl shadow-sm text-center max-w-lg mx-4 space-y-6">
                    <div className="flex justify-center">
                        <CheckCircle className="h-20 w-20 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-stone-900">ご注文ありがとうございます！</h1>
                    <p className="text-stone-600 leading-relaxed">
                        決済が完了しました。<br />
                        ご登録いただいたメールアドレスに注文確認メールをお送りしましたのでご確認ください。
                    </p>
                    <div className="pt-6">
                        <Link
                            href="/"
                            className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors"
                        >
                            トップページへ戻る
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
