import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { Metadata } from "next";
import { BookingButton } from "@/components/experience/BookingButton";

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
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 shadow-lg">
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
                                <p className="font-bold text-stone-900">料金（税込）</p>
                                <p className="text-2xl font-bold text-primary">¥7,000 <span className="text-sm text-stone-500 font-normal">/ 1組（2名まで）</span></p>
                                <ul className="text-sm text-stone-600 mt-2 space-y-1">
                                    <li>追加大人：¥3,500 / 人</li>
                                    <li>追加小学生：¥2,000 / 人</li>
                                    <li>未就学児：無料</li>
                                </ul>
                                <p className="text-xs text-stone-500 mt-2">防護服レンタル・蜂蜜試食込 / 1回最大4名程度</p>
                            </div>

                            <BookingButton experienceName="養蜂体験" durationMin={60} />
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
                                <p className="font-bold text-stone-900">料金（税込）</p>
                                <p className="text-2xl font-bold text-primary">¥3,000 <span className="text-sm text-stone-500 font-normal">/ 1区画</span></p>
                                <ul className="text-sm text-stone-600 mt-2 space-y-1">
                                    <li>1区画4名まで</li>
                                    <li>収穫物1kg込み</li>
                                    <li>超過分は量り売り</li>
                                </ul>
                                <p className="text-xs text-stone-500 mt-2">道具レンタル込み</p>
                            </div>

                            <BookingButton experienceName="芋掘り体験" durationMin={90} />
                        </div>
                        <div className="order-1 md:order-2 relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 shadow-lg">
                            <Image
                                src="/images/experience/harvesting_01.jpg"
                                alt="芋掘り体験"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    {/* Participation Conditions */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8">
                        <h3 className="font-bold text-stone-900 text-lg mb-4">ご参加の条件・注意事項</h3>
                        <ul className="space-y-2 text-sm text-stone-700">
                            <li>• 事前予約が必須です（当日の飛び込み参加はできません）</li>
                            <li>• 雨天の場合は中止になることがあります（前日〜当日にご連絡します）</li>
                            <li>• 動きやすい服装と、汚れてもよい靴でお越しください</li>
                            <li>• お子様の参加は保護者同伴をお願いします</li>
                            <li>• ご不明な点は<a href="https://lin.ee/xzQv9l5" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LINE</a>またはお問い合わせフォームからご相談ください</li>
                        </ul>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
