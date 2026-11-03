import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { MyOrders } from "@/components/mypage/MyOrders";

export const dynamic = "force-dynamic";

export const metadata = { title: "注文履歴" };

// マイページの「すべて見る」や注文メール・LINE通知の「注文履歴」リンクの行き先。
export default async function MyOrdersPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    return (
        <div className="min-h-screen flex flex-col bg-stone-50">
            <Header />
            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <Link href="/mypage" className="text-stone-400 hover:text-stone-600 transition-colors" aria-label="マイページへ戻る">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold text-stone-900">注文履歴</h1>
                    </div>
                    <MyOrders showAll />
                </div>
            </main>
            <Footer />
        </div>
    );
}
