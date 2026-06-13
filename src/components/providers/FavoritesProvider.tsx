"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type FavoritesContextType = {
    favorites: Set<string>;
    loading: boolean;
    loggedIn: boolean;
    toggle: (productId: string) => Promise<void>;
    refresh: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const res = await fetch("/api/favorites");
            if (res.status === 401) {
                setLoggedIn(false);
                setFavorites(new Set());
                setLoading(false);
                return;
            }
            const data = await res.json();
            setFavorites(new Set(data.favorites ?? []));
            setLoggedIn(true);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const toggle = useCallback(async (productId: string) => {
        if (!loggedIn) {
            window.location.href = "/login";
            return;
        }
        const isCurrent = favorites.has(productId);
        const action = isCurrent ? "remove" : "add";
        // 楽観的更新
        setFavorites((prev) => {
            const next = new Set(prev);
            if (isCurrent) next.delete(productId);
            else next.add(productId);
            return next;
        });
        try {
            const res = await fetch("/api/favorites", {
                method: "POST",
                keepalive: true,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, action }),
            });
            if (!res.ok) {
                // ロールバック
                setFavorites((prev) => {
                    const next = new Set(prev);
                    if (isCurrent) next.add(productId);
                    else next.delete(productId);
                    return next;
                });
                if (res.status === 401) window.location.href = "/login";
            }
        } catch {
            setFavorites((prev) => {
                const next = new Set(prev);
                if (isCurrent) next.add(productId);
                else next.delete(productId);
                return next;
            });
        }
    }, [favorites, loggedIn]);

    return (
        <FavoritesContext.Provider value={{ favorites, loading, loggedIn, toggle, refresh }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const ctx = useContext(FavoritesContext);
    if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
    return ctx;
}
