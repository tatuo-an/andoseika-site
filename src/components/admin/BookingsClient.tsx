"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Phone, Users, RefreshCw, Ban, Undo2 } from "lucide-react";
import type { AdminBooking } from "@/app/api/admin/bookings/route";

type Tab = "upcoming" | "past" | "cancelled";

function todayYMD(): string {
    return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

function formatDate(ymd: string): string {
    const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return ymd;
    return `${m[1]}年${parseInt(m[2], 10)}月${parseInt(m[3], 10)}日`;
}

export function BookingsClient() {
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tab, setTab] = useState<Tab>("upcoming");
    const [updating, setUpdating] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/bookings");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "取得に失敗しました");
            setBookings(data.bookings ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const today = todayYMD();
    const filtered = useMemo(() => {
        return bookings.filter((b) => {
            if (tab === "cancelled") return b.status === "cancelled";
            if (b.status === "cancelled") return false;
            if (tab === "upcoming") return b.date >= today;
            return b.date < today;
        });
    }, [bookings, tab, today]);

    const counts = useMemo(() => ({
        upcoming: bookings.filter((b) => b.status !== "cancelled" && b.date >= today).length,
        past: bookings.filter((b) => b.status !== "cancelled" && b.date < today).length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }), [bookings, today]);

    const updateStatus = async (id: string, status: string) => {
        setUpdating(id);
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            if (!res.ok) throw new Error();
            setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
        } catch {
            alert("更新に失敗しました");
        } finally {
            setUpdating(null);
        }
    };

    const TABS: { key: Tab; label: string }[] = [
        { key: "upcoming", label: "今後の予約" },
        { key: "past", label: "終了" },
        { key: "cancelled", label: "キャンセル" },
    ];

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                            tab === t.key
                                ? "bg-primary text-white"
                                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                        }`}
                    >
                        {t.label} ({counts[t.key]})
                    </button>
                ))}
                <button
                    onClick={load}
                    className="ml-auto flex items-center gap-1.5 px-3 py-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    更新
                </button>
            </div>

            {loading && <p className="text-stone-400 text-sm py-8 text-center">読み込み中...</p>}
            {error && <p className="text-red-500 text-sm py-8 text-center">{error}</p>}

            {!loading && !error && filtered.length === 0 && (
                <p className="text-stone-400 text-sm py-12 text-center">該当する予約はありません</p>
            )}

            <div className="space-y-3">
                {filtered.map((b) => (
                    <div key={b.id} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-bold text-stone-900">{b.experienceName || "（体験名未設定）"}</span>
                                {b.status === "cancelled" && (
                                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">キャンセル済み</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
                                <span className="flex items-center gap-1">
                                    <CalendarDays className="w-3.5 h-3.5 text-stone-400" />
                                    {formatDate(b.date)} {b.startTime}〜（{b.durationMin}分）
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5 text-stone-400" />
                                    {b.headcount}名
                                </span>
                                {b.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                                        {b.phone}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-stone-400 mt-1">
                                {b.name || "（お名前未設定）"} ／ {b.email}
                                {b.price > 0 && ` ／ ¥${b.price.toLocaleString()}`}
                            </p>
                        </div>
                        <div className="shrink-0">
                            {b.status === "cancelled" ? (
                                <button
                                    onClick={() => updateStatus(b.id, "confirmed")}
                                    disabled={updating === b.id}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-200 text-stone-700 text-sm font-bold rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
                                >
                                    <Undo2 className="w-4 h-4" />
                                    予約を戻す
                                </button>
                            ) : (
                                <button
                                    onClick={() => { if (confirm("この予約をキャンセルしますか？")) updateStatus(b.id, "cancelled"); }}
                                    disabled={updating === b.id}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    <Ban className="w-4 h-4" />
                                    キャンセルにする
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
