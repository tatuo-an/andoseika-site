import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Users } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "体験・予約",
    description: "鳥取の自然と触れ合う農業体験。ミツバチの世界をのぞく養蜂体験や、土まみれで楽しむ芋掘り体験など。",
};

export default function ExperiencePage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-white">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-primary/5 py-20">
                    <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
                        <h1 className="text-3xl md:text-5xl font-bold text-stone-900 font-heading">
                            体験・ワークショップ
                        </h1>
                        <p className="text-lg text-stone-700 max-w-2xl mx-auto">
                            食べるだけじゃもったいない。<br />
                            土に触れ、生き物に触れ、農家の日常をちょっとだけ覗いてみませんか？
                        </p>
                    </div>
                </section>

                <div className="container mx-auto px-4 md:px-6 py-16 space-y-24">
                    {/* Beekeeping */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative aspect-square md:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 shadow-lg">
                            <Image
                                src="/images/experience/beekeeping.jpg"
                                alt="養蜂体験"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-6">
                            <div className="inline-block px-4 py-1 bg-yellow-100 text-yellow-800 font-bold rounded-full text-sm">
                                5月〜10月限定
                            </div>
                            <h2 className="text-3xl font-bold text-stone-900">ミツバチの世界をのぞく養蜂体験</h2>
                            <p className="text-stone-600 leading-relaxed">
                                普段は見ることのできない巣箱の中を観察します。
                                女王蜂を探したり、採れたての蜂蜜をその場で試食したり。
                                防護服を着用するので、初めての方やお子様でも安心してご参加いただけます。
                            </p>

                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="flex items-center gap-3 text-stone-700">
                                    <Clock className="h-5 w-5 text-primary" />
                                    <span>約60分</span>
                                </div>
                                <div className="flex items-center gap-3 text-stone-700">
                                    <Users className="h-5 w-5 text-primary" />
                                    <span>2名様〜</span>
                                </div>
                            </div>

                            <div className="bg-stone-50 p-6 rounded-xl space-y-2">
                                <p className="font-bold text-stone-900">料金目安</p>
                                <p className="text-2xl font-bold text-primary">¥3,500 <span className="text-sm text-stone-500 font-normal">/ 1名様</span></p>
                                <p className="text-xs text-stone-500">※小学生以下 ¥1,500、未就学児無料</p>
                            </div>

                            <button className="w-full md:w-auto px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors shadow-md">
                                予約状況を確認する
                            </button>
                        </div>
                    </div>

                    {/* Harvesting */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 space-y-6">
                            <div className="inline-block px-4 py-1 bg-orange-100 text-orange-800 font-bold rounded-full text-sm">
                                10月〜12月限定
                            </div>
                            <h2 className="text-3xl font-bold text-stone-900">土まみれで宝探し！芋掘り体験</h2>
                            <p className="text-stone-600 leading-relaxed">
                                鳥取の砂丘地帯で育った「里芋」や「長芋」を収穫します。
                                土の中からゴロゴロと出てくるお芋に、大人も子供も大興奮。
                                収穫したお芋は、量り売りでお持ち帰りいただけます。
                            </p>

                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="flex items-center gap-3 text-stone-700">
                                    <Clock className="h-5 w-5 text-primary" />
                                    <span>約90分</span>
                                </div>
                                <div className="flex items-center gap-3 text-stone-700">
                                    <Users className="h-5 w-5 text-primary" />
                                    <span>1名様〜</span>
                                </div>
                            </div>

                            <div className="bg-stone-50 p-6 rounded-xl space-y-2">
                                <p className="font-bold text-stone-900">料金目安</p>
                                <p className="text-2xl font-bold text-primary">¥1,500 <span className="text-sm text-stone-500 font-normal">/ 1区画</span></p>
                                <p className="text-xs text-stone-500">※お持ち帰りは別途量り売り</p>
                            </div>

                            <button className="w-full md:w-auto px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors shadow-md">
                                予約状況を確認する
                            </button>
                        </div>
                        <div className="order-1 md:order-2 relative aspect-square md:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 shadow-lg">
                            <Image
                                src="/images/experience/harvesting_01.jpg"
                                alt="芋掘り体験"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
