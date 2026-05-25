import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AddressForm } from "@/components/mypage/AddressForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AddressPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return (
        <div className="min-h-screen flex flex-col bg-stone-50">
            <Header />
            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                    <Link href="/mypage" className="flex items-center gap-1 text-stone-500 hover:text-stone-700 text-sm mb-6">
                        <ChevronLeft className="w-4 h-4" />
                        マイページに戻る
                    </Link>
                    <h1 className="text-2xl font-bold text-stone-900 mb-8">配送先住所</h1>
                    <div className="bg-white rounded-2xl shadow-sm p-8">
                        <AddressForm />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
