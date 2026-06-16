"use client";

import { useEffect, useState } from "react";
import { Package, ChevronRight } from "lucide-react";
import Link from "next/link";

const STATUS = {
  paid:      { label: "発送準備中", color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  shipping:  { label: "発送済み",   color: "text-blue-700 bg-blue-50 border-blue-200" },
  delivered: { label: "受取完了",   color: "text-green-700 bg-green-50 border-green-200" },
  cancelled: { label: "キャンセル", color: "text-stone-500 bg-stone-50 border-stone-200" },
} as const;

type Order = {
  orderNumber: string;
  createdAt: string;
  productNames: string;
  amount: number;
  status: string;
  desiredDate: string;
};

export function MyOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    fetch("/api/my/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => setOrders([]));
  }, []);

  if (orders === null) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-stone-900">注文・発送状況</h2>
        </div>
        <p className="text-sm text-stone-400">読み込み中...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-stone-900">注文・発送状況</h2>
        </div>
        <p className="text-sm text-stone-500">注文履歴はありません</p>
        <Link href="/products" className="text-xs text-primary mt-3 font-medium inline-block">商品を見る →</Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <Package className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-stone-900">注文・発送状況</h2>
      </div>
      <div className="space-y-3">
        {orders.map((order) => {
          const st = STATUS[order.status as keyof typeof STATUS] ?? { label: order.status, color: "text-stone-500 bg-stone-50 border-stone-200" };
          return (
            <Link key={order.orderNumber} href={`/mypage/orders/${order.orderNumber}`}
              className="block border border-stone-100 rounded-xl p-3 hover:border-primary/30 hover:bg-stone-50 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-xs text-stone-500">{order.createdAt.slice(0, 10)}</p>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${st.color}`}>
                  {st.label}
                </span>
              </div>
              <p className="text-sm font-medium text-stone-800 line-clamp-1">{order.productNames}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm font-bold text-stone-900">¥{order.amount.toLocaleString()}</p>
                <p className="text-[10px] font-mono text-stone-400">{order.orderNumber}</p>
              </div>
            </Link>
          );
        })}
      </div>
      {orders.length >= 5 && (
        <Link href="/mypage/orders" className="flex items-center gap-1 text-xs text-primary font-medium mt-3 hover:underline">
          すべて見る <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
