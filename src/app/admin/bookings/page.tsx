import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { BookingsClient } from "@/components/admin/BookingsClient";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) redirect("/");

    return (
        <div className="min-h-screen flex flex-col bg-stone-50">
            <Header />
            <main className="flex-1 py-10">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/admin" className="text-stone-400 hover:text-stone-600 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <CalendarDays className="w-5 h-5 text-primary" />
                        <h1 className="text-2xl font-bold text-stone-900">体験予約管理</h1>
                    </div>

                    <BookingsClient />
                </div>
            </main>
            <Footer />
        </div>
    );
}
