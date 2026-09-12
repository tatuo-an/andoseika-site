"use client";

import { useEffect, useState } from "react";

type Props = {
    // "orders": HP（Stripe決済）の注文管理。ステータスが "paid"（未発送）の件数を新着として表示。
    // "line-orders": LINE直接注文。ステータス未入力（空欄）の件数を新着として表示。
    // "bookings": 体験予約。作成から24時間以内の確定予約の件数を新着として表示。
    kind: "orders" | "line-orders" | "bookings";
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function OrderNotificationBadge({ kind }: Props) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const endpoint = kind === "orders" ? "/api/admin/orders"
                    : kind === "line-orders" ? "/api/admin/line-orders"
                    : "/api/admin/bookings";
                const res = await fetch(endpoint);
                const data = await res.json();
                if (cancelled) return;
                let n = 0;
                if (kind === "bookings") {
                    const bookings: { status: string; createdAt: string }[] = data.bookings ?? [];
                    const cutoff = Date.now() - ONE_DAY_MS;
                    n = bookings.filter((b) => b.status !== "cancelled" && new Date(b.createdAt).getTime() >= cutoff).length;
                } else {
                    const orders: { status: string }[] = data.orders ?? [];
                    n = kind === "orders"
                        ? orders.filter((o) => o.status === "paid").length
                        : orders.filter((o) => !o.status?.trim()).length;
                }
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
