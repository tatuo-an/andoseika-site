"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import type { Supporter } from "@/app/api/admin/supporters/route";

const TABS = [
    { key: "active", label: "有効なサポーター" },
    { key: "all", label: "すべて（過去含む）" },
] as const;
type Tab = typeof TABS[number]["key"];

const TIER_COLOR: Record<string, string> = {
    mebuking: "bg-blue-50 text-blue-700 border-blue-200",
    minori: "bg-emerald-50 text-emerald-700 border-emerald-200",
    partner: "bg-amber-50 text-amber-700 border-amber-200",
    free: "bg-stone-100 text-stone-500 border-stone-200",
};

export function SupportersClient() {
    const [supporters, setSupporters] = useState<Supporter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab] = useState<Tab>("active");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

    async function load() {
        try {
            const res = await fetch("/api/admin/supporters");
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "読み込みに失敗しました");
                return;
            }
            setSupporters(data.supporters ?? []);
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

    const countActive = supporters.filter((s) => s.isActive).length;

    const filtered = useMemo(() => {
        let list = supporters;
        if (tab === "active") list = list.filter((s) => s.isActive);
        const q = searchQuery.trim();
        if (q) {
            list = list.filter((s) => [s.email, s.displayName, s.tierName].join(" ").includes(q));
        }
        return list;
    }, [supporters, tab, searchQuery]);

    if (loading) {
        return <p className="text-stone-400 text-sm py-10 text-center">読み込み中...</p>;
    }
    if (error) {
        return <p className="text-red-500 text-sm py-10 text-center">{error}</p>;
    }

    return (
        <div>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{countActive}</p>
                    <p className="text-xs text-stone-500 mt-1">有効なサポーター</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-stone-700">{supporters.length}</p>
                    <p className="text-xs text-stone-500 mt-1">累計（過去含む）</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="メールアドレス・表示名・プラン名で検索"
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
                        {t.label}
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
                <p className="text-stone-400 text-sm py-10 text-center">該当するサポーターはいません</p>
            )}

            <div className="space-y-3">
                {filtered.map((s) => {
                    const isExpanded = expandedEmail === s.email;
                    return (
                        <div key={s.email} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-100">
                            <div
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
                                onClick={() => setExpandedEmail(isExpanded ? null : s.email)}
                            >
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${TIER_COLOR[s.tier] ?? TIER_COLOR.free}`}>
                                    {s.tierName}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-stone-900 truncate">{s.displayName || "（表示名未設定）"}</p>
                                    <p className="text-xs text-stone-400 truncate">{s.email}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    {s.isActive ? (
                                        <p className="text-xs font-bold text-emerald-600">有効</p>
                                    ) : (
                                        <p className="text-xs font-bold text-stone-400">無効</p>
                                    )}
                                    {s.tierExpiry && <p className="text-xs text-stone-400">〜{s.tierExpiry}</p>}
                                </div>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
                            </div>

                            {isExpanded && (
                                <div className="border-t border-stone-100 px-4 py-4 bg-stone-50 space-y-3">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs text-stone-400 mb-0.5">契約期限</p>
                                            <p className="text-stone-700">{s.tierExpiry || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-400 mb-0.5">LINE連携</p>
                                            <p className="text-stone-700">{s.lineLinked ? "あり" : "なし"}</p>
                                        </div>
                                        {s.cancelRequestedAt && (
                                            <div className="col-span-2">
                                                <p className="text-xs text-stone-400 mb-0.5">退会申請日時</p>
                                                <p className="text-red-500">{s.cancelRequestedAt}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">年会費お支払い履歴</p>
                                        {s.payments.length === 0 ? (
                                            <p className="text-xs text-stone-400">支払い履歴がありません</p>
                                        ) : (
                                            <div className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-100">
                                                {s.payments.map((p) => (
                                                    <div key={p.orderNumber} className="flex items-center justify-between px-3 py-2 text-sm">
                                                        <div className="min-w-0">
                                                            <p className="text-stone-700 truncate">{p.productNames}</p>
                                                            <p className="text-xs text-stone-400">{p.createdAt} · {p.orderNumber}</p>
                                                        </div>
                                                        <p className="text-stone-900 font-bold shrink-0 ml-3">¥{p.amount.toLocaleString()}</p>
                                                    </div>
                                                ))}
                                            </div>
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
