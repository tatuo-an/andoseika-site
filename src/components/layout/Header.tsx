"use client";

import Link from "next/link";
import { ShoppingCart, Menu, User, X } from "lucide-react";
import { useShoppingCart } from "use-shopping-cart";
import { useState } from "react";
import { CartModal } from "@/components/cart/CartModal";
import { OnlineTracker } from "@/components/layout/OnlineTracker";

const NAV_ITEMS = [
    { href: "/", label: "TOP" },
    { href: "/products", label: "商品一覧" },
    { href: "/experience", label: "体験・予約" },
    { href: "/supporter", label: "サポーター募集", highlight: true },
    { href: "/business", label: "業務用・卸" },
    { href: "/community", label: "みんなの料理" },
    { href: "/about", label: "私たちについて" },
];

export function Header() {
    const { cartCount } = useShoppingCart();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <OnlineTracker />
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
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={item.highlight ? "text-primary font-bold hover:text-primary/80 transition-colors" : "hover:text-primary transition-colors"}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/mypage"
                            className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                            <User className="h-5 w-5 text-stone-600" />
                            <span className="text-[10px] text-stone-500 font-medium">マイページ</span>
                        </Link>
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                            <ShoppingCart className="h-5 w-5 text-stone-600" />
                            {cartCount! > 0 && (
                                <span className="absolute -top-1 right-0 h-5 w-5 flex items-center justify-center bg-primary text-white text-xs font-bold rounded-full">
                                    {cartCount}
                                </span>
                            )}
                            <span className="text-[10px] text-stone-500 font-medium">カート</span>
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="md:hidden p-2 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <Menu className="h-5 w-5 text-stone-600" />
                            <span className="sr-only">メニュー</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* モバイルメニュー */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-xs bg-white shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                            <span className="font-bold text-stone-900">メニュー</span>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                                <X className="h-5 w-5 text-stone-500" />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                        item.highlight
                                            ? "text-primary bg-primary/5 hover:bg-primary/10 font-bold"
                                            : "text-stone-700 hover:bg-stone-100"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
