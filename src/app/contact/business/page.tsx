import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";
import { BusinessContactForm } from "@/components/contact/BusinessContactForm";

export const metadata: Metadata = {
    title: "法人・業務用 お問い合わせ",
    description: "飲食店・小売店様からの仕入れ、大口注文など、ビジネスに関するお問い合わせはこちら。",
};

export default function BusinessContactPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1 container mx-auto px-4 md:px-6 py-20">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-stone-900 mb-4 font-heading">
                            法人・業務用 お問い合わせ
                        </h1>
                        <p className="text-stone-600">
                            飲食店様、小売店様からの仕入れや、大口注文に関するお問い合わせはこちらから承ります。
                        </p>
                    </div>

                    <BusinessContactForm />
                </div>
            </main>

            <Footer />
        </div>
    );
}
