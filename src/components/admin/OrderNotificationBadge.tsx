"use client";

import { useEffect, useState } from "react";

type Props = {
    // "orders": HP（Stripe決済）の注文管理。ステータスが "paid"（未発送）の件数を新着として表示。
    // "line-orders": LINE直接注文。ステータス未入力（空欄）の件数を新着として表示。
    kind: "orders" | "line-orders";
};

export function OrderNotificationBadge({ kind }: Props) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const endpoint = kind === "orders" ? "/api/admin/orders" : "/api/admin/line-orders";
                const res = await fetch(endpoint);
                const data = await res.json();
                if (cancelled) return;
                const orders: { status: string }[] = data.orders ?? [];
                const n = kind === "orders"
                    ? orders.filter((o) => o.status === "paid").length
                    : orders.filter((o) => !o.status?.trim()).length;
                setCount(n);
            } catch {
                // 取得失敗時はバッジを増やさない（既存表示を維持）
            }
        }

        load();
        const timer = setInterval(load, 30000);
        return () => { cancelled = true; clearInterval(timer); };
    }, [kind]);

    if (count === 0) return null;

    return (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
            {count > 99 ? "99+" : count}
        </span>
    );
}
