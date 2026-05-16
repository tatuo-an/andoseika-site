"use client";

import { useShoppingCart } from "use-shopping-cart";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import Link from "next/link";

export function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { cartDetails, removeItem, incrementItem, decrementItem, totalPrice, cartCount } = useShoppingCart();

    if (!isOpen) return null;

    const handleCheckout = async () => {
        try {
            const response = await fetch("/api/checkout_sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ cartDetails }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error(error);
                return;
            }

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Cart Panel */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                        ショッピングカート
                        <span className="text-sm font-normal text-stone-500">({cartCount}点)</span>
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                        <X className="h-5 w-5 text-stone-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cartCount === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-stone-500 space-y-4">
                            <p>カートに商品は入っていません</p>
                            <button onClick={onClose} className="text-primary font-bold hover:underline">
                                買い物を続ける
                            </button>
                        </div>
                    ) : (
                        Object.values(cartDetails ?? {}).map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="h-20 w-20 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-bold text-stone-900">{item.name}</h3>
                                    <p className="text-sm text-stone-500">¥{item.price.toLocaleString()}</p>
                                    <div className="flex items-center gap-3 pt-2">
                                        <div className="flex items-center border border-stone-200 rounded-full">
                                            <button
                                                onClick={() => decrementItem(item.id)}
                                                className="p-1 hover:bg-stone-100 rounded-l-full"
                                            >
                                                <Minus className="h-4 w-4 text-stone-600" />
                                            </button>
                                            <span className="px-2 text-sm font-medium w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => incrementItem(item.id)}
                                                className="p-1 hover:bg-stone-100 rounded-r-full"
                                            >
                                                <Plus className="h-4 w-4 text-stone-600" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            削除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cartCount! > 0 && (
                    <div className="p-6 border-t border-stone-100 bg-stone-50 space-y-4">
                        <div className="flex items-center justify-between text-lg font-bold text-stone-900">
                            <span>合計</span>
                            <span>¥{totalPrice?.toLocaleString()}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors shadow-lg"
                        >
                            お支払いへ進む
                        </button>
                        <p className="text-xs text-center text-stone-500">
                            Stripeのセキュアな決済画面へ移動します。ご注文前に
                            <Link href="/tokusho" className="font-medium text-primary hover:underline">
                                特定商取引法に基づく表示
                            </Link>
                            をご確認ください。
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
