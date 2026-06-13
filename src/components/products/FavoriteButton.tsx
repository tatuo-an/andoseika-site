"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/components/providers/FavoritesProvider";

export function FavoriteButton({ productId, className = "", size = "md" }: {
    productId: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}) {
    const { favorites, loading, toggle } = useFavorites();
    const isFavorite = favorites.has(productId);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
    };

    const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
    const btnPadding = size === "sm" ? "p-1.5" : size === "lg" ? "p-3" : "p-2";

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            aria-label={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
            className={`${btnPadding} rounded-full bg-white/90 hover:bg-white shadow-md transition-all ${className}`}
        >
            <Heart
                className={`${sizeClass} transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-stone-400"}`}
            />
        </button>
    );
}
