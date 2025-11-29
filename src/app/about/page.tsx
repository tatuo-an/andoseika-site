import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { Heart, Users, Sprout, Store } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "私たちについて",
    description: "安藤青果（&YOU）の想い、代表紹介、農福連携について。まじめにふざける、おいしい毎日をつくる私たちの物語。",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-24 bg-stone-100 overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="container mx-auto px-4 md:px-6 relative z-10 text-center space-y-6">
                        <span className="text-primary font-bold tracking-widest uppercase">Our Story</span>
                        <h1 className="text-3xl md:text-5xl font-bold text-stone-900 leading-tight font-heading">
                            まじめにふざける、<br />
                            おいしい毎日。
                        </h1>
                        <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
                            鳥取の畑から、あなたへ。<br />
                            私たちは、ただ野菜を作るだけの農家ではありません。<br />
                            「おいしい」のその先にある、みんなの笑顔をつくるために。
                        </p>
                    </div>
                </section>

                {/* Representatives Section */}
                <section className="py-20 bg-white border-b border-stone-100">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="text-primary font-bold tracking-widest uppercase text-sm">Representatives</span>
                                <h2 className="text-3xl font-bold text-stone-900 font-heading mt-2">
                                    私たちについて
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div className="relative aspect-[3/4] w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl">
                                    <Image
                                        src="/images/about/founders.jpg"
                                        alt="会長 安藤達夫と代表 安藤匡志"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="border-l-4 border-primary pl-4">
                                            <p className="text-sm text-stone-500 font-bold mb-1">Chairman</p>
                                            <h3 className="text-2xl font-bold text-stone-900">会長：安藤 達夫</h3>
                                        </div>
                                        <p className="text-stone-600 leading-relaxed">
                                            長年の経験と勘で、鳥取の土と向き合い続けてきました。<br />
                                            「うまいもんを作れば、人は笑顔になる」<br />
                                            その信念を胸に、今日も畑に立ちます。
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="border-l-4 border-primary pl-4">
                                            <p className="text-sm text-stone-500 font-bold mb-1">Representative</p>
                                            <h3 className="text-2xl font-bold text-stone-900">代表：安藤 匡志</h3>
                                        </div>
                                        <p className="text-stone-600 leading-relaxed">
                                            父の背中を追いかけながら、新しい農業の形を模索しています。<br />
                                            地域との連携、福祉との連携。<br />
                                            農業の可能性を広げ、次世代に繋いでいきます。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Philosophy Section (&YOU) */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-stone-900 font-heading">
                                    &YOU（アンドユー）に<br />込められた想い
                                </h2>
                                <div className="space-y-4 text-stone-600 leading-relaxed">
                                    <p>
                                        私たちのブランド名「&YOU（安藤青果）」には、<br />
                                        <strong>「安藤（Ando）と、あなた（YOU）」</strong><br />
                                        という意味が込められています。
                                    </p>
                                    <p>
                                        野菜を育てる私たちと、それを食べてくれるあなた。<br />
                                        畑を手伝ってくれる仲間たちと、地域の人々。<br />
                                        農業は、決して一人ではできません。
                                    </p>
                                    <p>
                                        関わるすべての人（YOU）と一緒に、<br />
                                        おいしい幸せをつくっていきたい。<br />
                                        そんな願いを込めて、私たちは今日も畑に出ます。
                                    </p>
                                </div>
                            </div>
                            <div className="relative aspect-square md:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 rotate-2 hover:rotate-0 transition-transform duration-500 shadow-lg">
                                <Image
                                    src="/images/hero/brand_concept.jpg"
                                    alt="安藤青果の畑"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Cycle of Happiness (Community) */}
                <section className="py-20 bg-stone-50">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-stone-900 font-heading mb-4">
                                幸せな循環をつくる
                            </h2>
                            <p className="text-stone-600">
                                遊ぶように働き、みんながちょっと幸せになれる。<br />
                                そんな新しい農業のカタチを目指しています。
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-4">地域の農家さんと共に</h3>
                                <p className="text-stone-600 leading-relaxed text-sm">
                                    自分の畑だけでなく、ご近所の農家さんの野菜や果物も預かり、販売しています。地域全体で支え合い、鳥取のおいしいものを全国へ届けます。
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-6 text-yellow-600">
                                    <Heart className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-4">多様な仲間と働く</h3>
                                <p className="text-stone-600 leading-relaxed text-sm">
                                    B型就労支援の仲間たちと一緒に、農作業を行っています。「仕事＝遊び」のように楽しみながら、それぞれの得意を生かせる場所をつくっています。
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-6 text-orange-600">
                                    <Sprout className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-4">土づくりへのこだわり</h3>
                                <p className="text-stone-600 leading-relaxed text-sm">
                                    鳥取特有の砂丘地帯の砂地を生かしつつ、環境に配慮した栽培方法を実践。食べる人にも、作る人にも、自然にも優しい農業を心がけています。
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Business Overview */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6">
                        <h2 className="text-3xl font-bold text-stone-900 font-heading mb-12 text-center">
                            事業内容
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex gap-4 p-6 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors">
                                <div className="flex-shrink-0 mt-1">
                                    <Sprout className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900 mb-2">農産物の生産・販売</h3>
                                    <p className="text-stone-600 text-sm">白ネギ、長芋、里芋、梨、紅はるか等の栽培および販売。</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-6 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors">
                                <div className="flex-shrink-0 mt-1">
                                    <Store className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900 mb-2">加工品の製造・販売</h3>
                                    <p className="text-stone-600 text-sm">自家製蜂蜜、ネギ味噌、紅生姜などの加工品開発。</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-6 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors">
                                <div className="flex-shrink-0 mt-1">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900 mb-2">農業体験の提供</h3>
                                    <p className="text-stone-600 text-sm">養蜂体験、芋掘り体験など、農業に触れる機会の提供。</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-6 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors">
                                <div className="flex-shrink-0 mt-1">
                                    <Heart className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900 mb-2">農福連携</h3>
                                    <p className="text-stone-600 text-sm">就労継続支援B型事業所との連携による就労支援。</p>
                                </div>
                            </div>
                        </div>

                        {/* Wholesale / Business Info */}
                        <div className="mt-16 bg-stone-50 rounded-2xl p-8 md:p-12 border border-stone-100">
                            <div className="md:flex items-center gap-12">
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-2xl font-bold text-stone-900 font-heading">
                                        飲食店・小売店様へ
                                    </h3>
                                    <p className="text-stone-600 leading-relaxed">
                                        安藤青果では、飲食店様や小売店様への卸販売も行っております。
                                        旬の採れたて野菜を、ご希望の規格・数量に合わせて定期的にお届けいたします。
                                        <br /><br />
                                        <strong>主な出荷実績：</strong><br />
                                        県内のレストラン、居酒屋、道の駅、スーパーマーケットなど
                                    </p>
                                    <div className="pt-4">
                                        <a
                                            href="/contact/business"
                                            className="inline-flex items-center justify-center px-8 py-3 bg-stone-900 text-white font-bold rounded-full hover:bg-stone-800 transition-colors"
                                        >
                                            仕入れのご相談はこちら
                                        </a>
                                    </div>
                                </div>
                                <div className="hidden md:block w-1/3 relative aspect-square rounded-xl overflow-hidden bg-stone-200">
                                    <Image
                                        src="/images/products/negi.png"
                                        alt="出荷を待つ白ネギ"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Company Profile */}
                <section className="py-20 bg-stone-100">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <h2 className="text-3xl font-bold text-stone-900 font-heading mb-8 text-center">
                            農園概要
                        </h2>
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <dl className="space-y-6">
                                <div className="grid md:grid-cols-3 gap-4 border-b border-stone-100 pb-6">
                                    <dt className="font-bold text-stone-900">屋号</dt>
                                    <dd className="md:col-span-2 text-stone-600">&YOU 安藤青果（アンドユー アンドウセイカ）</dd>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4 border-b border-stone-100 pb-6">
                                    <dt className="font-bold text-stone-900">会長</dt>
                                    <dd className="md:col-span-2 text-stone-600">安藤 達夫</dd>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4 border-b border-stone-100 pb-6">
                                    <dt className="font-bold text-stone-900">代表</dt>
                                    <dd className="md:col-span-2 text-stone-600">安藤 匡志</dd>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4 border-b border-stone-100 pb-6">
                                    <dt className="font-bold text-stone-900">所在地</dt>
                                    <dd className="md:col-span-2 text-stone-600">
                                        〒682-0000<br />
                                        鳥取県倉吉市・北栄町エリア
                                    </dd>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <dt className="font-bold text-stone-900">主な販売先</dt>
                                    <dd className="md:col-span-2 text-stone-600">
                                        自社ECサイト、BASE、メルカリShops、<br />
                                        道の駅、地域の直売所
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </section >
            </main >

            <Footer />
        </div >
    );
}
