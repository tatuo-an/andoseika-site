"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useShoppingCart } from "use-shopping-cart";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
    const { clearCart } = useShoppingCart();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

    useEffect(() => {
        clearCart();
        if (sessionId) {
            fetch(`/api/checkout_sessions/status?session_id=${sessionId}`)
                .then((r) => r.json())
                .then((d) => setPaymentStatus(d.paymentStatus ?? null))
                .catch(() => {});
        }
    }, []);

    const isPending = paymentStatus === "unpaid";

    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1 flex items-center justify-center py-20">
                <div className="bg-white p-12 rounded-2xl shadow-sm text-center max-w-lg mx-4 space-y-6">
                    <div className="flex justify-center">
                        {isPending
                            ? <Clock className="h-20 w-20 text-amber-500" />
                            : <CheckCircle className="h-20 w-20 text-green-500" />
                        }
                    </div>

                    {isPending ? (
                        <>
                            <h1 className="text-2xl font-bold text-stone-900">ご注文を受け付けました</h1>
                            <p className="text-stone-600 leading-relaxed">
                                銀行振り込みでのお支払いをお選びいただきました。<br />
                                <strong>7日以内</strong>に下記の口座へお振り込みください。
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-left space-y-2 text-sm text-stone-700">
                                <p className="font-bold text-amber-800">振込先について</p>
                                <p>振込先口座は <strong>Stripe（ストライプ）</strong> が管理する収納代行口座です。口座名義が「安藤青果」と異なる場合がありますが、<strong>安藤青果への正規のお支払い</strong>として処理されますのでご安心ください。</p>
                                <p className="text-stone-500 text-xs">振込先の詳細は Stripe の決済確認メールに記載されています。</p>
                            </div>
                            <p className="text-stone-500 text-sm">
                                入金確認後にご注文確認のご連絡をお送りします。
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-stone-900">ご注文ありがとうございます！</h1>
                            <p className="text-stone-600 leading-relaxed">
                                決済が完了しました。<br />
                                ご登録いただいたメールアドレスに注文確認メールをお送りしましたのでご確認ください。
                            </p>
                        </>
                    )}

                    <div className="pt-2">
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
