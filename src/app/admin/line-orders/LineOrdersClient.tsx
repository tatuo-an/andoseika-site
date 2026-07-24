"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, Send, RefreshCw } from "lucide-react";
import type { LineOrderEntry } from "@/app/api/admin/line-orders/route";

const TABS = [
    { key: "all", label: "すべて" },
    { key: "single", label: "個人注文" },
    { key: "bulk", label: "大口注文" },
] as const;
type Tab = typeof TABS[number]["key"];

function orderDate(o: LineOrderEntry): string {
    return o.kind === "single" ? o.orderedAt : o.createdAt;
}

function orderTitle(o: LineOrderEntry): string {
    return o.kind === "single" ? o.productName : (o.subject || o.clientName);
}

function orderAmount(o: LineOrderEntry): number {
    return o.kind === "single" ? o.subtotal : o.total;
}

// 通知送信モーダル
function NotifyModal({ onSend, onCancel, loading }: {
    onSend: (message: string) => void;
    onCancel: () => void;
    loading: boolean;
}) {
    const [message, setMessage] = useState("");
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                <h3 className="font-bold text-stone-900 mb-1">お客様へLINE通知</h3>
                <p className="text-sm text-stone-500 mb-4">お客様のLINEにメッセージを送信します。</p>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    autoFocus
                    placeholder="メッセージを入力してください"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4 resize-none"
                />
                <div className="flex gap-2">
                    <button onClick={onCancel} className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50 transition-colors">
                        キャンセル
                    </button>
                    <button
                        onClick={() => message.trim() && onSend(message.trim())}
                        disabled={!message.trim() || loading}
                        className="flex-1 py-2.5 bg-[#06C755] text-white rounded-xl text-sm font-bold hover:bg-[#05b34c] transition-colors disabled:opacity-50"
                    >
                        {loading ? "送信中..." : "送信する"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function LineOrdersClient() {
    const [orders, setOrders] = useState<LineOrderEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab] = useState<Tab>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [statusDraft, setStatusDraft] = useState<Record<string, string>>({});
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
    const [notifyModal, setNotifyModal] = useState<LineOrderEntry | null>(null);
    const [notifying, setNotifying] = useState(false);
    const [notifyResult, setNotifyResult] = useState<Record<string, string>>({});

    async function load() {
        try {
            const res = await fetch("/api/admin/line-orders");
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "読み込みに失敗しました");
                return;
            }
            setOrders(data.orders ?? []);
            setError(null);
        } catch {
            setError("通信エラーが発生しました");
        }
    }

    useEffect(() => {
        load().finally(() => setLoading(false));
    }, []);

    async function handleRefresh() {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }

    const filtered = useMemo(() => {
        let list = orders;
        if (tab !== "all") list = list.filter((o) => o.kind === tab);
        const q = searchQuery.trim();
        if (q) {
            list = list.filter((o) => {
                const haystack = [
                    o.orderId,
                    o.kind === "single" ? o.name : o.clientName,
                    orderTitle(o),
                    o.status,
                ].join(" ");
                return haystack.includes(q);
            });
        }
        return list;
    }, [orders, tab, searchQuery]);

    const countOf = (t: Tab) => (t === "all" ? orders.length : orders.filter((o) => o.kind === t).length);

    async function updateStatus(order: LineOrderEntry) {
        const newStatus = statusDraft[order.orderId] ?? order.status;
        setStatusUpdating(order.orderId);
        try {
            const res = await fetch(`/api/admin/line-orders/${encodeURIComponent(order.orderId)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kind: order.kind, status: newStatus }),
            });
            if (res.ok) {
                setOrders((prev) => prev.map((o) => o.orderId === order.orderId ? { ...o, status: newStatus } : o));
            }
        } finally {
            setStatusUpdating(null);
        }
    }

    async function sendNotify(message: string) {
        if (!notifyModal) return;
        setNotifying(true);
        try {
            const res = await fetch(`/api/admin/line-orders/${encodeURIComponent(notifyModal.orderId)}/notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kind: notifyModal.kind, message }),
            });
            const data = await res.json();
            setNotifyResult((prev) => ({
                ...prev,
                [notifyModal.orderId]: res.ok ? "送信しました" : `失敗：${data.error ?? ""}`,
            }));
        } catch {
            setNotifyResult((prev) => ({ ...prev, [notifyModal.orderId]: "通信エラーが発生しました" }));
        } finally {
            setNotifying(false);
            setNotifyModal(null);
        }
    }

    if (loading) {
        return <p className="text-stone-400 text-sm py-10 text-center">読み込み中...</p>;
    }
    if (error) {
        return <p className="text-red-500 text-sm py-10 text-center">{error}</p>;
    }

    return (
        <div>
            {notifyModal && (
                <NotifyModal
                    loading={notifying}
                    onSend={sendNotify}
                    onCancel={() => setNotifyModal(null)}
                />
            )}

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="注文ID・氏名・件名・ステータスなどで検索"
                    className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-4 border-b border-stone-200 pb-0">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${tab === t.key ? "border-primary text-primary" : "border-transparent text-stone-400 hover:text-stone-600"}`}
                    >
                        {t.label} ({countOf(t.key)})
                    </button>
                ))}
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="ml-auto flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors px-2"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    更新
                </button>
            </div>

            {filtered.length === 0 && (
                <p className="text-stone-400 text-sm py-10 text-center">該当する注文はありません</p>
            )}

            <div className="space-y-3">
                {filtered.map((o) => {
                    const isExpanded = expandedId === o.orderId;
                    return (
                        <div key={o.orderId} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-100">
                            <div
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
                                onClick={() => setExpandedId(isExpanded ? null : o.orderId)}
                            >
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${o.kind === "bulk" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                                    {o.kind === "bulk" ? "大口" : "個人"}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-stone-900 truncate">{orderTitle(o)}</p>
                                    <p className="text-xs text-stone-400">{orderDate(o)} · {o.kind === "single" ? o.name : o.clientName}{o.kind === "bulk" && o.honorific ? o.honorific : ""}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold text-stone-900">¥{orderAmount(o).toLocaleString()}</p>
                                    <p className="text-xs text-stone-400">{o.orderId}</p>
                                </div>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
                            </div>

                            {isExpanded && (
                                <div className="border-t border-stone-100 px-4 py-4 bg-stone-50 space-y-4">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs text-stone-400 mb-0.5">LINE ID</p>
                                            <p className="text-stone-700 text-xs break-all">{o.lineId || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-400 mb-0.5">電話番号</p>
                                            <p className="text-stone-700">{o.phone || "—"}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs text-stone-400 mb-0.5">住所</p>
                                            <p className="text-stone-700">{o.address || "—"}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs text-stone-400 mb-0.5">メール</p>
                                            <p className="text-stone-700 text-xs break-all">{o.email || "—"}</p>
                                        </div>
                                    </div>

                                    {o.kind === "single" ? (
                                        <div className="bg-white border border-stone-200 rounded-lg p-3 text-sm">
                                            <div className="flex justify-between text-stone-700">
                                                <span>{o.productName} × {o.quantity}</span>
                                                <span>¥{o.subtotal.toLocaleString()}</span>
                                            </div>
                                            {(o.desiredDate || o.desiredTime) && (
                                                <p className="text-xs text-stone-400 mt-1">配達希望：{o.desiredDate} {o.desiredTime}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-white border border-stone-200 rounded-lg p-3 text-sm space-y-1">
                                            {o.items.map((it, i) => (
                                                <div key={i} className="flex justify-between text-stone-700">
                                                    <span>{it.name} × {it.quantity}{it.unit}</span>
                                                    <span>¥{(it.unitPrice * it.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-100 mt-1">
                                                <span>合計</span>
                                                <span>¥{o.total.toLocaleString()}</span>
                                            </div>
                                            <div className="text-xs text-stone-400 pt-2 space-y-0.5">
                                                {o.billingDate && <p>請求日：{o.billingDate}</p>}
                                                {o.dueDate && <p>支払期限：{o.dueDate}</p>}
                                                {o.note && <p>備考：{o.note}</p>}
                                                {o.freeeInvoiceNumber && <p>freee請求書番号：{o.freeeInvoiceNumber}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {/* ステータス変更 */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={statusDraft[o.orderId] ?? o.status}
                                            onChange={(e) => setStatusDraft((prev) => ({ ...prev, [o.orderId]: e.target.value }))}
                                            placeholder="ステータス"
                                            className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                                        />
                                        <button
                                            onClick={() => updateStatus(o)}
                                            disabled={statusUpdating === o.orderId}
                                            className="shrink-0 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                                        >
                                            {statusUpdating === o.orderId ? "更新中..." : "更新"}
                                        </button>
                                    </div>

                                    {/* LINE通知 */}
                                    <div>
                                        <button
                                            onClick={() => setNotifyModal(o)}
                                            className="flex items-center gap-1.5 text-xs font-bold text-[#06C755] border border-[#06C755]/30 bg-[#06C755]/10 rounded-full px-3 py-1.5 hover:bg-[#06C755]/20 transition-colors"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            お客様へLINE通知
                                        </button>
                                        {notifyResult[o.orderId] && (
                                            <p className="text-xs text-stone-500 mt-1">{notifyResult[o.orderId]}</p>
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
