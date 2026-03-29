"use client";

import Link from "next/link";
import { ShoppingCart, Menu } from "lucide-react";
import { useShoppingCart } from "use-shopping-cart";
import { useState } from "react";
import { CartModal } from "@/components/cart/CartModal";

export function Header() {
    const { cartCount } = useShoppingCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-heading text-2xl font-bold tracking-wider text-primary">
                            &YOU
                        </span>
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold text-primary/80 tracking-widest">AND YOU</span>
                            <span className="text-xs font-medium text-stone-600">安藤青果</span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
                        <Link href="/products" className="hover:text-primary transition-colors">
                            商品一覧
                        </Link>
                        <Link href="/experience" className="hover:text-primary transition-colors">
                            体験・予約
                        </Link>
                        <Link href="/about" className="hover:text-primary transition-colors">
                            私たちについて
                        </Link>
                        <Link href="/business" className="hover:text-primary transition-colors">
                            業務用・卸
                        </Link>
                        <Link href="/news" className="hover:text-primary transition-colors">
                            お知らせ
                        </Link>
                        <Link href="/supporter" className="text-primary font-bold hover:text-primary/80 transition-colors">
                            サポーター募集
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <ShoppingCart className="h-5 w-5 text-stone-600" />
                            {cartCount! > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-primary text-white text-xs font-bold rounded-full">
                                    {cartCount}
                                </span>
                            )}
                            <span className="sr-only">カート</span>
                        </button>
                        <button className="md:hidden p-2 hover:bg-stone-100 rounded-full transition-colors">
                            <Menu className="h-5 w-5 text-stone-600" />
                            <span className="sr-only">メニュー</span>
                        </button>
                    </div>
                </div>
            </header>
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
