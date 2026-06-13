"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

export function FavoritesRefreshButton() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    // 初回マウント時に1回だけ自動でrefresh
    useEffect(() => {
        router.refresh();
    }, [router]);

    const handleClick = () => {
        setRefreshing(true);
        router.refresh();
        setTimeout(() => setRefreshing(false), 1500);
    };

    return (
        <button
            onClick={handleClick}
            disabled={refreshing}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-primary border border-stone-200 hover:border-primary/40 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
            title="お気に入り操作の直後はサーバー反映に少し時間がかかる場合があります"
        >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            最新の状態を取得
        </button>
    );
}
