import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-stone-100 py-12 border-t border-stone-200">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="font-heading text-2xl font-bold tracking-wider text-primary">
                                &YOU
                            </span>
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] font-bold text-primary/80 tracking-widest">AND YOU</span>
                                <span className="text-xs font-medium text-stone-600">安藤青果</span>
                            </div>
                        </Link>
                        <p className="text-sm text-stone-500 leading-relaxed">
                            鳥取の畑みんなで、まじめにふざける、おいしい毎日。<br />
                            白ネギ、長芋、梨、蜂蜜をお届けします。
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-stone-800 mb-4">商品</h3>
                        <ul className="space-y-2 text-sm text-stone-600">
                            <li><Link href="/products?category=negi" className="hover:text-primary">白ネギ</Link></li>
                            <li><Link href="/products?category=nagaimo" className="hover:text-primary">長芋・ねばりっこ</Link></li>
                            <li><Link href="/products?category=nashi" className="hover:text-primary">梨</Link></li>
                            <li><Link href="/products?category=honey" className="hover:text-primary">蜂蜜</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-stone-800 mb-4">体験・情報</h3>
                        <ul className="space-y-2 text-sm text-stone-600">
                            <li><Link href="/experience" className="hover:text-primary">養蜂体験</Link></li>
                            <li><Link href="/experience" className="hover:text-primary">芋掘り体験</Link></li>
                            <li><Link href="/news" className="hover:text-primary">お知らせ</Link></li>
                            <li><Link href="/about" className="hover:text-primary">私たちについて</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-stone-800 mb-4">お問い合わせ</h3>
                        <ul className="space-y-2 text-sm text-stone-600">
                            <li><Link href="/contact" className="hover:text-primary">お問い合わせフォーム</Link></li>
                            <li><Link href="/business" className="hover:text-primary">業務用のお取引について</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-stone-200 text-center text-sm text-stone-500">
                    © {new Date().getFullYear()} Ando Seika. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
