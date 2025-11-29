import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Truck, Package, Users, Sprout } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "業務用・卸売について",
    description: "飲食店・小売店様向けの卸売販売。白ネギ、長芋、里芋、梨、蜂蜜などを、業務用ロットで安定供給いたします。",
};

export default function BusinessPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/hero/hero_nagaimo_field.jpg" // Using existing field image
                            alt="安藤青果の畑"
                            fill
                            className="object-cover brightness-50"
                            priority
                        />
                    </div>
                    <div className="relative z-10 container mx-auto px-4 text-center text-white">
                        <h1 className="text-3xl md:text-5xl font-bold mb-6 font-heading leading-tight">
                            飲食店・小売店向けの<br className="md:hidden" />安定した青果・加工品のご提供
                        </h1>
                        <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto opacity-90">
                            鳥取県倉吉市・北栄町の畑から、白ネギ・長芋・里芋・梨・蜂蜜・らっきょう・むかごなどを、<br className="hidden md:block" />
                            業務用ロットで全国にお届けします。
                        </p>
                        <Link
                            href="/contact/business"
                            className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
                        >
                            業務用のお問い合わせ
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </section>

                {/* Product Lineup Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-stone-900 mb-4 font-heading">取扱品目</h2>
                            <p className="text-stone-600">
                                旬の時期に合わせた新鮮な野菜と、通年でご提供可能な加工品をご用意しています。
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Item 1: White Green Onion */}
                            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-stone-900">白ネギ</h3>
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">通年（冬メイン）</span>
                                </div>
                                <p className="text-stone-600 text-sm mb-4">
                                    鳥取砂丘の砂地で育った、白身が長く甘みの強い白ネギです。
                                </p>
                                <div className="text-xs text-stone-500 bg-white p-3 rounded border border-stone-200">
                                    <p><span className="font-bold">出荷形態:</span> 3kg箱 / 10kg箱 等</p>
                                </div>
                            </div>

                            {/* Item 2: Nagaimo / Mukago */}
                            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-stone-900">長芋・むかご</h3>
                                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">秋〜冬</span>
                                </div>
                                <p className="text-stone-600 text-sm mb-4">
                                    粘りと甘みが特徴の砂丘長芋と、その実であるむかご。
                                </p>
                                <div className="text-xs text-stone-500 bg-white p-3 rounded border border-stone-200">
                                    <p><span className="font-bold">出荷形態:</span> 5kg / 10kg / コンテナ 等</p>
                                </div>
                            </div>

                            {/* Item 3: Satoimo */}
                            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-stone-900">里芋</h3>
                                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">秋〜冬</span>
                                </div>
                                <p className="text-stone-600 text-sm mb-4">
                                    ねっとりとした食感と濃厚な旨味が特徴の黄金里芋など。
                                </p>
                                <div className="text-xs text-stone-500 bg-white p-3 rounded border border-stone-200">
                                    <p><span className="font-bold">出荷形態:</span> 5kg / 10kg 等</p>
                                </div>
                            </div>

                            {/* Item 4: Pear */}
                            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-stone-900">梨</h3>
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">夏〜秋</span>
                                </div>
                                <p className="text-stone-600 text-sm mb-4">
                                    新甘泉、王秋など、鳥取を代表する品種をお届けします。
                                </p>
                                <div className="text-xs text-stone-500 bg-white p-3 rounded border border-stone-200">
                                    <p><span className="font-bold">出荷形態:</span> 5kg箱 / 10kg箱 等</p>
                                </div>
                            </div>

                            {/* Item 5: Honey */}
                            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-stone-900">蜂蜜</h3>
                                    <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded">通年</span>
                                </div>
                                <p className="text-stone-600 text-sm mb-4">
                                    百花蜜、アカシアなど。豊かな自然の中で採れた純粋蜂蜜です。
                                </p>
                                <div className="text-xs text-stone-500 bg-white p-3 rounded border border-stone-200">
                                    <p><span className="font-bold">出荷形態:</span> 瓶 / 業務用サイズ要相談</p>
                                </div>
                            </div>

                            {/* Item 6: Rakkyo */}
                            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-stone-900">甘酢らっきょう</h3>
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">通年</span>
                                </div>
                                <p className="text-stone-600 text-sm mb-4">
                                    シャキシャキとした食感がたまらない、鳥取砂丘らっきょうの甘酢漬け。
                                </p>
                                <div className="text-xs text-stone-500 bg-white p-3 rounded border border-stone-200">
                                    <p><span className="font-bold">出荷形態:</span> パック / 業務用袋 等</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Strengths Section */}
                <section className="py-20 bg-stone-100">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-stone-900 mb-4 font-heading">安藤青果（&YOU）の強み</h2>
                            <p className="text-stone-600">
                                生産から出荷まで、品質と想いを込めてお届けします。
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <Sprout className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">地域ならではの品質</h3>
                                    <p className="text-stone-600 leading-relaxed">
                                        鳥取砂丘の特有な砂地で育つ長芋やらっきょうは、きめ細やかで粘りが強く、他にはない味わいです。
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">安定した作業体制</h3>
                                    <p className="text-stone-600 leading-relaxed">
                                        B型就労支援の仲間と一緒に、丁寧な選別・梱包作業を行っています。大量注文にも柔軟に対応できる体制を整えています。
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <Package className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">EC実績を活かした品質管理</h3>
                                    <p className="text-stone-600 leading-relaxed">
                                        個人向けECでの豊富な販売実績を活かし、配送時の傷みを防ぐ丁寧な梱包と品質管理を徹底しています。
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <Check className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">柔軟な提案力</h3>
                                    <p className="text-stone-600 leading-relaxed">
                                        規格外品の活用や、加工・ギフト向けの提案も可能です。お店のニーズに合わせたご提案をさせていただきます。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Conditions Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="max-w-3xl mx-auto bg-stone-50 rounded-3xl p-8 md:p-12 border border-stone-100">
                            <h2 className="text-2xl font-bold text-stone-900 mb-8 text-center font-heading">お取引条件の目安</h2>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <tbody className="divide-y divide-stone-200">
                                        <tr>
                                            <th className="py-4 px-4 font-bold text-stone-900 w-1/3">最低発注ロット</th>
                                            <td className="py-4 px-4 text-stone-600">1ケース〜（商品により異なります）</td>
                                        </tr>
                                        <tr>
                                            <th className="py-4 px-4 font-bold text-stone-900">発送可能エリア</th>
                                            <td className="py-4 px-4 text-stone-600">日本全国（離島は要相談）</td>
                                        </tr>
                                        <tr>
                                            <th className="py-4 px-4 font-bold text-stone-900">納期の目安</th>
                                            <td className="py-4 px-4 text-stone-600">ご注文から3〜5営業日発送</td>
                                        </tr>
                                        <tr>
                                            <th className="py-4 px-4 font-bold text-stone-900">お支払い方法</th>
                                            <td className="py-4 px-4 text-stone-600">銀行振込、請求書払い（要審査）</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <p className="mt-6 text-sm text-stone-500 text-center">
                                ※具体的な単価・条件はお問い合わせフォームから別途ご相談ください。<br />
                                ※定期購入や大口注文の場合は、別途お見積もりさせていただきます。
                            </p>
                        </div>
                    </div>
                </section>

                {/* Case Studies Section (Dummy) */}
                <section className="py-20 bg-stone-50">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-stone-900 mb-4 font-heading">導入事例</h2>
                            <p className="text-stone-600">
                                様々な業種のお客様にご利用いただいています。
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-2xl shadow-sm">
                                <div className="h-12 w-12 bg-stone-100 rounded-full mb-6 flex items-center justify-center">
                                    <span className="text-2xl">🍽️</span>
                                </div>
                                <h3 className="text-lg font-bold text-stone-900 mb-2">飲食店様</h3>
                                <p className="text-stone-600 text-sm">
                                    季節の野菜を使ったメニュー開発にご協力。新鮮な白ネギや長芋を定期的に納品させていただいています。
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-sm">
                                <div className="h-12 w-12 bg-stone-100 rounded-full mb-6 flex items-center justify-center">
                                    <span className="text-2xl">🏪</span>
                                </div>
                                <h3 className="text-lg font-bold text-stone-900 mb-2">小売店・スーパー様</h3>
                                <p className="text-stone-600 text-sm">
                                    産直コーナーでの販売用として。生産者の顔が見えるPOPとともに、旬の野菜をお届けしています。
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-sm">
                                <div className="h-12 w-12 bg-stone-100 rounded-full mb-6 flex items-center justify-center">
                                    <span className="text-2xl">🎁</span>
                                </div>
                                <h3 className="text-lg font-bold text-stone-900 mb-2">ふるさと納税・観光業様</h3>
                                <p className="text-stone-600 text-sm">
                                    地域の特産品として、贈答用や返礼品に採用。丁寧な梱包と品質の高さでご好評いただいています。
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-primary text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-6 font-heading">
                            まずはお気軽にご相談ください
                        </h2>
                        <p className="text-lg mb-10 opacity-90 max-w-2xl mx-auto">
                            お見積もり、納品時期のご相談など、<br />
                            専用フォームよりお問い合わせをお待ちしております。
                        </p>
                        <Link
                            href="/contact/business"
                            className="inline-flex items-center bg-white text-primary font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg"
                        >
                            業務用のお問い合わせはこちら
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
