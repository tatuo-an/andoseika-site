"use client";

import { useShoppingCart } from "use-shopping-cart";
import { useState } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Product } from "@/types/microcms";

export function QuickAddButton({ product }: { product: Product }) {
    const { addItem, removeItem, cartDetails } = useShoppingCart();
    const [quantity, setQuantity] = useState(0);

    const cartItem = cartDetails?.[product.id];
    const currentQty = cartItem?.quantity ?? 0;

    const stop = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleAdd = (e: React.MouseEvent) => {
        stop(e);
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            currency: "JPY",
            image: product.image?.url ?? "",
            description: product.description,
            sku: product.id,
        });
        setQuantity((q) => q + 1);
    };

    const handleRemove = (e: React.MouseEvent) => {
        stop(e);
        if (currentQty <= 1) {
            removeItem(product.id);
            setQuantity(0);
        } else {
            addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                currency: "JPY",
                image: product.image?.url ?? "",
                description: product.description,
                sku: product.id,
            }, { count: -1 });
            setQuantity((q) => Math.max(0, q - 1));
        }
    };

    if (currentQty === 0) {
        return (
            <button
                onClick={handleAdd}
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-md hover:bg-primary transition-all"
            >
                <ShoppingCart className="h-5 w-5" />
            </button>
        );
    }

    return (
        <div
            className="absolute bottom-4 right-4 flex items-center gap-1 bg-stone-900 text-white rounded-full shadow-md px-2 py-1"
            onClick={stop}
        >
            <button onClick={handleRemove} className="w-7 h-7 flex items-center justify-center hover:text-primary transition-colors rounded-full">
                <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold w-5 text-center">{currentQty}</span>
            <button onClick={handleAdd} className="w-7 h-7 flex items-center justify-center hover:text-primary transition-colors rounded-full">
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );
}
