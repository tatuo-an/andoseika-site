"use client";

import { useShoppingCart } from "use-shopping-cart";
import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Product } from "@/types/microcms";

export function AddToCartButton({ product, variantId, variantName, price, shipType, imageUrl }: {
    product: Product;
    variantId?: string;
    variantName?: string;
    price?: number;
    shipType?: string;
    imageUrl?: string;
}) {
    const { addItem } = useShoppingCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        addItem({
            id: variantId ?? product.id,
            name: variantName || product.name,
            price: price ?? product.price,
            currency: "JPY",
            image: imageUrl ?? product.image?.url ?? "",
            description: product.description,
            sku: variantId ?? product.id,
            shipType: shipType ?? "",
        } as Parameters<typeof addItem>[0]);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`w-full md:w-auto px-12 py-4 rounded-full font-bold text-lg transition-all transform duration-200 flex items-center justify-center gap-2 ${isAdded
                    ? "bg-green-600 text-white scale-105"
                    : "bg-stone-900 text-white hover:bg-primary hover:shadow-lg hover:-translate-y-0.5"
                }`}
        >
            {isAdded ? (
                <>
                    <Check className="h-6 w-6" />
                    カートに追加しました
                </>
            ) : (
                <>
                    <ShoppingCart className="h-6 w-6" />
                    カートに入れる
                </>
            )}
        </button>
    );
}
