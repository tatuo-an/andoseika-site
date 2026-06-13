"use client";

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

export function FavoriteButton({ productId, className = "", size = "md" }: {
    productId: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(true);

    useEffect(() => {
        fetch("/api/favorites")
            .then(async (r) => {
                if (r.status === 401) { setLoggedIn(false); return { favorites: [] }; }
                return r.json();
            })
            .then((data) => {
                setIsFavorite((data.favorites ?? []).includes(productId));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [productId]);

    const toggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!loggedIn) {
            window.location.href = "/login";
            return;
        }
        const action = isFavorite ? "remove" : "add";
        setIsFavorite(!isFavorite); // 楽観的更新
        try {
            const res = await fetch("/api/favorites", {
                method: "POST",
                keepalive: true, // ページ遷移中でもリクエストを継続
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, action }),
            });
            if (!res.ok) {
                setIsFavorite(isFavorite); // ロールバック
                if (res.status === 401) window.location.href = "/login";
            }
        } catch {
            setIsFavorite(isFavorite);
        }
    };

    const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
    const btnPadding = size === "sm" ? "p-1.5" : size === "lg" ? "p-3" : "p-2";

    return (
        <button
            onClick={toggle}
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
