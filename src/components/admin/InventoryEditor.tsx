"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Product } from "@/types/microcms";

export function InventoryEditor({
    product,
    initialStock,
}: {
    product: Product;
    initialStock: number;
}) {
    // -1 = 未設定（在庫管理しない）
    const [stock, setStock] = useState(initialStock);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch("/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: product.id, name: product.name, stock }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    };

    const statusLabel = stock === -1
        ? <span className="text-xs text-stone-400">管理なし</span>
        : stock === 0
            ? <span className="text-xs font-bold text-red-500">売り切れ</span>
            : <span className="text-xs font-bold text-green-600">販売中</span>;

    return (
        <tr className="hover:bg-stone-50 transition-colors">
            <td className="px-6 py-4">
                <p className="font-medium text-stone-900 text-sm">{product.name}</p>
                <p className="text-xs text-stone-400">¥{product.price.toLocaleString()}</p>
            </td>
            <td className="px-6 py-4 text-center">
                <input
                    type="number"
                    min={-1}
                    value={stock}
                    onChange={(e) => { setStock(parseInt(e.target.value, 10)); setSaved(false); }}
                    className="w-20 text-center border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
            </td>
            <td className="px-6 py-4 text-center">{statusLabel}</td>
            <td className="px-6 py-4 text-center">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1 mx-auto bg-stone-900 text-white text-xs px-4 py-2 rounded-full hover:bg-primary transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <Check className="w-3 h-3" /> : null}
                    {saved ? "保存済み" : "保存"}
                </button>
            </td>
        </tr>
    );
}
