import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SeasonalSalesClient } from "./SeasonalSalesClient";

export const dynamic = "force-dynamic";

export default async function SeasonalSalesPage() {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 md:px-6 py-8 max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/admin" className="text-stone-400 hover:text-stone-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-stone-900">季節セール管理</h1>
                </div>
                <p className="text-sm text-stone-500 mb-6">
                    期間中は全商品の価格に自動的に割引が適用されます。期間が重複する場合は割引率が高い方だけが適用され、二重には値引きされません。
                </p>
                <SeasonalSalesClient />
            </main>
            <Footer />
        </div>
    );
}
