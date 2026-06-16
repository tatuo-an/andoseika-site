"use client";

import { useState } from "react";
import { Package, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, RefreshCw, Send } from "lucide-react";
import type { Order } from "@/app/api/admin/orders/route";

type Message = { senderType: string; senderName: string; message: string; sentAt: string };

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid:      { label: "発送準備中", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  shipping:  { label: "発送済み",   color: "bg-blue-100 text-blue-800 border-blue-200" },
  delivered: { label: "受取完了",   color: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "キャンセル", color: "bg-stone-100 text-stone-500 border-stone-200" },
};

const TABS = [
  { key: "all",       label: "すべて" },
  { key: "active",    label: "取引中" },
  { key: "delivered", label: "完了" },
  { key: "cancelled", label: "キャンセル" },
] as const;

type Tab = typeof TABS[number]["key"];

function filterOrders(orders: Order[], tab: Tab): Order[] {
  if (tab === "all")       return orders;
  if (tab === "active")    return orders.filter((o) => o.status === "paid" || o.status === "shipping");
  if (tab === "delivered") return orders.filter((o) => o.status === "delivered");
  if (tab === "cancelled") return orders.filter((o) => o.status === "cancelled");
  return orders;
}

export function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [tab, setTab] = useState<Tab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [msgLoading, setMsgLoading] = useState<string | null>(null);
  const [msgText, setMsgText] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

  const filtered = filterOrders(orders, tab);

  const countOf = (t: Tab) => filterOrders(orders, t).length;

  async function updateStatus(orderNumber: string, status: string) {
    setUpdating(orderNumber);
    try {
      await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => o.orderNumber === orderNumber ? { ...o, status } : o));
    } finally {
      setUpdating(null);
    }
  }

  async function toggleExpand(orderNumber: string) {
    const isExpanded = expandedId === orderNumber;
    setExpandedId(isExpanded ? null : orderNumber);
    if (!isExpanded && !messages[orderNumber]) {
      setMsgLoading(orderNumber);
      try {
        const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}/message`);
        const data = await res.json();
        setMessages((prev) => ({ ...prev, [orderNumber]: data.messages ?? [] }));
      } finally {
        setMsgLoading(null);
      }
    }
  }

  async function sendAdminMessage(orderNumber: string) {
    const text = (msgText[orderNumber] ?? "").trim();
    if (!text) return;
    setSending(orderNumber);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages((prev) => ({
          ...prev,
          [orderNumber]: [...(prev[orderNumber] ?? []), { senderType: "admin", senderName: "安藤青果", message: text, sentAt: data.sentAt }],
        }));
        setMsgText((prev) => ({ ...prev, [orderNumber]: "" }));
      }
    } finally { setSending(null); }
  }

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-stone-200 pb-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            {t.label}
            <span className="ml-1 text-xs text-stone-400">({countOf(t.key)})</span>
          </button>
        ))}
        <div className="ml-auto mb-1">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            更新
          </button>
        </div>
      </div>

      {/* Order list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-stone-400 text-sm">注文がありません</div>
        )}
        {filtered.map((order) => {
          const st = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-stone-100 text-stone-600 border-stone-200" };
          const isExpanded = expandedId === order.orderNumber;
          const isUpdating = updating === order.orderNumber;

          return (
            <div key={order.orderNumber} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
              {/* Header row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => toggleExpand(order.orderNumber)}
              >
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-900 truncate">{order.productNames}</p>
                  <p className="text-xs text-stone-400">{order.createdAt} · {order.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-stone-900">¥{order.amount.toLocaleString()}</p>
                  <p className="text-xs text-stone-400">{order.orderNumber}</p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
              </div>

              {/* Detail panel */}
              {isExpanded && (
                <div className="border-t border-stone-100 px-4 py-4 bg-stone-50 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-stone-400 mb-0.5">注文番号</p>
                      <p className="font-mono text-xs text-stone-700">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 mb-0.5">注文日時</p>
                      <p className="text-stone-700">{order.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 mb-0.5">金額</p>
                      <p className="font-bold text-stone-900">¥{order.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 mb-0.5">氏名</p>
                      <p className="text-stone-700">{order.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 mb-0.5">電話</p>
                      <p className="text-stone-700">{order.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 mb-0.5">メール</p>
                      <p className="text-stone-700 text-xs break-all">{order.email || "—"}</p>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-xs text-stone-400 mb-0.5">お届け先</p>
                      <p className="text-stone-700">{order.address || "—"}</p>
                    </div>
                    {(order.desiredDate || order.desiredTime) && (
                      <div className="col-span-2 md:col-span-3">
                        <p className="text-xs text-stone-400 mb-0.5">配達希望</p>
                        <p className="text-stone-700">{order.desiredDate} {order.desiredTime}</p>
                      </div>
                    )}
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-xs text-stone-400 mb-0.5">商品</p>
                      <p className="text-stone-700">{order.productNames}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="border-t border-stone-200 pt-3">
                    <p className="text-xs text-stone-400 mb-2 font-medium">取引メッセージ</p>
                    {msgLoading === order.orderNumber ? (
                      <p className="text-xs text-stone-400">読み込み中...</p>
                    ) : (
                      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                        {(messages[order.orderNumber] ?? []).length === 0 && (
                          <p className="text-xs text-stone-400">メッセージなし</p>
                        )}
                        {(messages[order.orderNumber] ?? []).map((m, i) => (
                          <div key={i} className={`flex gap-2 ${m.senderType === "admin" ? "flex-row-reverse" : ""}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${m.senderType === "admin" ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-600"}`}>
                              {m.senderType === "admin" ? "店" : "客"}
                            </div>
                            <div className={`max-w-[70%] flex flex-col gap-0.5 ${m.senderType === "admin" ? "items-end" : "items-start"}`}>
                              <span className="text-[10px] text-stone-400">{m.senderName} · {m.sentAt}</span>
                              <div className={`rounded-xl px-3 py-1.5 text-xs ${m.senderType === "admin" ? "bg-primary text-white rounded-tr-none" : "bg-white border border-stone-200 text-stone-700 rounded-tl-none"}`}>
                                {m.message}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={msgText[order.orderNumber] ?? ""}
                        onChange={(e) => setMsgText((p) => ({ ...p, [order.orderNumber]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") sendAdminMessage(order.orderNumber); }}
                        placeholder="お客様へメッセージを送る（Enter送信）"
                        className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                      />
                      <button
                        onClick={() => sendAdminMessage(order.orderNumber)}
                        disabled={sending === order.orderNumber || !(msgText[order.orderNumber] ?? "").trim()}
                        className="px-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Status actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200">
                    <p className="text-xs text-stone-500 w-full">ステータス変更：</p>
                    {order.status === "paid" && (
                      <button
                        onClick={() => updateStatus(order.orderNumber, "shipping")}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <Truck className="w-4 h-4" />
                        {isUpdating ? "処理中…" : "発送済みにする"}
                      </button>
                    )}
                    {order.status === "shipping" && (
                      <button
                        onClick={() => updateStatus(order.orderNumber, "delivered")}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {isUpdating ? "処理中…" : "受取完了にする"}
                      </button>
                    )}
                    {order.status !== "cancelled" && order.status !== "delivered" && (
                      <button
                        onClick={() => {
                          if (confirm("キャンセルしますか？")) updateStatus(order.orderNumber, "cancelled");
                        }}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 text-stone-600 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        キャンセル
                      </button>
                    )}
                    {order.status === "paid" && (
                      <p className="w-full text-xs text-amber-600 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        発送後、「発送済みにする」を押してください
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
