import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-stone-100 py-12 border-t border-stone-200">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-2">
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
                            鳥取の畑みんなで、まじめにふざける、おいしい毎日。
                        </p>
                    </div>
                    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600">
                        <li><Link href="/contact" className="hover:text-primary">お問い合わせ</Link></li>
                        <li><Link href="/business" className="hover:text-primary">業務用のお取引</Link></li>
                        <li><Link href="/safety" className="hover:text-primary">安心・安全への取り組み</Link></li>
                        <li><Link href="/terms" className="hover:text-primary">利用規約</Link></li>
                        <li><Link href="/supporter-terms" className="hover:text-primary">サポーター会員規約</Link></li>
                        <li><Link href="/community-guidelines" className="hover:text-primary">投稿ガイドライン</Link></li>
                        <li><Link href="/point-terms" className="hover:text-primary">ポイント利用条件</Link></li>
                        <li><Link href="/tokusho" className="hover:text-primary">特定商取引法に基づく表示</Link></li>
                        <li><Link href="/privacy" className="hover:text-primary">プライバシーポリシー</Link></li>
                    </ul>
                </div>

                <div className="mt-12 pt-8 border-t border-stone-200 text-center text-sm text-stone-500">
                    © {new Date().getFullYear()} Ando Seika. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
