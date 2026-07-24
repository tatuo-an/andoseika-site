import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { LineOrdersClient } from "./LineOrdersClient";

export const dynamic = "force-dynamic";

export default async function LineOrdersPage() {
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
                    <h1 className="text-2xl font-bold text-stone-900 flex-1">LINE注文管理</h1>
                    <a
                        href="https://docs.google.com/spreadsheets/d/15f9srYPB0WxN0D_YlT5dMvd6uV8DgwG6WgUU9YxVfA8/edit?gid=1036575973#gid=1036575973"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold text-[#06C755] border border-[#06C755]/30 bg-[#06C755]/10 rounded-full px-3 py-1.5 hover:bg-[#06C755]/20 transition-colors"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        スプレッドシート
                    </a>
                </div>
                <LineOrdersClient />
            </main>
            <Footer />
        </div>
    );
}
