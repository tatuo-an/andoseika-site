"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import type { SeasonalSale } from "@/lib/seasonalSales";

export function SeasonalSalesClient() {
    const [sales, setSales] = useState<SeasonalSale[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/seasonal-sales")
            .then((r) => r.json())
            .then((d) => setSales(d.sales ?? []))
            .catch(() => setError("読み込みに失敗しました"))
            .finally(() => setLoading(false));
    }, []);

    function update<K extends keyof SeasonalSale>(index: number, field: K, value: SeasonalSale[K]) {
        setSales((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
        setSaved(false);
    }

    function addRow() {
        setSales((prev) => [...prev, { name: "", startDate: "01-01", endDate: "01-01", discountPercent: 5, enabled: true }]);
        setSaved(false);
    }

    function removeRow(index: number) {
        setSales((prev) => prev.filter((_, i) => i !== index));
        setSaved(false);
    }

    async function save() {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch("/api/seasonal-sales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sales }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                setError(d.error ?? "保存に失敗しました");
                return;
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            setError("通信エラーが発生しました");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p className="text-stone-400 text-sm py-10 text-center">読み込み中...</p>;
    }

    return (
        <div>
            <div className="space-y-3 mb-4">
                {sales.map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-3 md:items-center">
                        <input
                            type="text"
                            value={s.name}
                            onChange={(e) => update(i, "name", e.target.value)}
                            placeholder="セール名"
                            className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                            <input
                                type="text"
                                value={s.startDate}
                                onChange={(e) => update(i, "startDate", e.target.value)}
                                placeholder="MM-DD"
                                className="w-24 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                            />
                            <span className="text-stone-400">〜</span>
                            <input
                                type="text"
                                value={s.endDate}
                                onChange={(e) => update(i, "endDate", e.target.value)}
                                placeholder="MM-DD"
                                className="w-24 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                            />
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={s.discountPercent}
                                onChange={(e) => update(i, "discountPercent", parseInt(e.target.value, 10) || 0)}
                                className="w-16 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <span className="text-sm text-stone-500">%</span>
                        </div>
                        <label className="flex items-center gap-1.5 shrink-0 text-sm text-stone-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={s.enabled}
                                onChange={(e) => update(i, "enabled", e.target.checked)}
                                className="w-4 h-4 accent-primary"
                            />
                            有効
                        </label>
                        <button
                            onClick={() => removeRow(i)}
                            className="shrink-0 p-2 text-stone-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={addRow}
                    className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 rounded-full text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    セールを追加
                </button>
                <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "保存中..." : saved ? "保存しました" : "保存する"}
                </button>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        </div>
    );
}
