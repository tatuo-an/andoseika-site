"use client";

import { useState } from "react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { Product } from "@/types/microcms";

type InventoryItem = {
    id: string;
    name: string;
    stock: number;
    price: number | null;
    shipType: string;
};

type ShippingItem = {
    region: string;
    prefectures: string;
    s60: number; s80: number; s100: number; s120: number;
    s140: number; s160: number; s180: number; s200: number;
    compact: number;
    clickpost: number;
};

const SHIP_TYPES = [
    { value: "", label: "未設定" },
    { value: "60", label: "宅配便 60" },
    { value: "80", label: "宅配便 80" },
    { value: "100", label: "宅配便 100" },
    { value: "120", label: "宅配便 120" },
    { value: "140", label: "宅配便 140" },
    { value: "160", label: "宅配便 160" },
    { value: "180", label: "宅配便 180" },
    { value: "200", label: "宅配便 200" },
    { value: "compact", label: "コンパクト" },
    { value: "clickpost", label: "クリックポスト" },
];

// ヤマト運輸 中国エリア発送 税抜き参考値（4ゾーン）
const DEFAULT_SHIPPING: ShippingItem[] = [
    { region: "北海道", prefectures: "北海道", s60: 1200, s80: 1400, s100: 1600, s120: 1750, s140: 2000, s160: 2200, s180: 2400, s200: 2600, compact: 990, clickpost: 185 },
    { region: "東北", prefectures: "青森県,岩手県,宮城県,秋田県,山形県,福島県", s60: 800, s80: 1000, s100: 1200, s120: 1400, s140: 1600, s160: 1800, s180: 2000, s200: 2200, compact: 790, clickpost: 185 },
    { region: "沖縄", prefectures: "沖縄県", s60: 1200, s80: 1700, s100: 2200, s120: 2700, s140: 3200, s160: 3700, s180: 4200, s200: 4900, compact: 790, clickpost: 185 },
    { region: "それ以外", prefectures: "（北海道・東北・沖縄以外の全都道府県）", s60: 600, s80: 700, s100: 800, s120: 1000, s140: 1200, s160: 1400, s180: 1600, s200: 1800, compact: 690, clickpost: 185 },
];

const SIZE_KEYS: (keyof ShippingItem)[] = ["s60", "s80", "s100", "s120", "s140", "s160", "s180", "s200", "compact", "clickpost"];
const SIZE_LABELS = ["60", "80", "100", "120", "140", "160", "180", "200", "コンパクト", "クリックポスト"];

export function AdminPanel({
    products,
    initialInventory,
    initialShipping,
}: {
    products: Product[];
    initialInventory: InventoryItem[];
    initialShipping: ShippingItem[];
}) {
    const [tab, setTab] = useState<"inventory" | "shipping">("inventory");

    const inventoryMap = Object.fromEntries(initialInventory.map((i) => [i.id, i]));
    const [items, setItems] = useState<InventoryItem[]>(
        products.map((p) => ({
            id: p.id,
            name: p.name,
            stock: inventoryMap[p.id]?.stock ?? -1,
            price: inventoryMap[p.id]?.price ?? null,
            shipType: inventoryMap[p.id]?.shipType ?? "",
        }))
    );
    const [savingInventory, setSavingInventory] = useState(false);
    const [savedInventory, setSavedInventory] = useState(false);

    const [shipping, setShipping] = useState<ShippingItem[]>(
        initialShipping.length > 0 ? initialShipping : DEFAULT_SHIPPING
    );
    const [savingShipping, setSavingShipping] = useState(false);
    const [savedShipping, setSavedShipping] = useState(false);

    const updateItem = <K extends keyof InventoryItem>(id: string, field: K, value: InventoryItem[K]) => {
        setItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
        setSavedInventory(false);
    };

    const saveInventory = async () => {
        setSavingInventory(true);
        try {
            await fetch("/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });
            setSavedInventory(true);
            setTimeout(() => setSavedInventory(false), 2000);
        } finally { setSavingInventory(false); }
    };

    const updateShipping = <K extends keyof ShippingItem>(index: number, field: K, value: ShippingItem[K]) => {
        setShipping((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
        setSavedShipping(false);
    };

    const saveShipping = async () => {
        setSavingShipping(true);
        try {
            await fetch("/api/shipping", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: shipping }),
            });
            setSavedShipping(true);
            setTimeout(() => setSavedShipping(false), 2000);
        } finally { setSavingShipping(false); }
    };

    return (
        <div>
            <div className="flex gap-2 mb-6">
                {(["inventory", "shipping"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${tab === t ? "bg-stone-900 text-white" : "bg-white text-stone-600 hover:bg-stone-100"}`}>
                        {t === "inventory" ? "商品・在庫" : "送料設定"}
                    </button>
                ))}
            </div>

            {/* 商品・在庫タブ */}
            {tab === "inventory" && (
                <div>
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
                        <table className="w-full">
                            <thead className="bg-stone-100 text-stone-600 text-xs">
                                <tr>
                                    <th className="text-left px-6 py-3">商品名</th>
                                    <th className="text-center px-4 py-3 w-28">在庫数<br /><span className="font-normal text-stone-400">-1=管理なし</span></th>
                                    <th className="text-center px-4 py-3 w-32">販売価格<br /><span className="font-normal text-stone-400">空欄=デフォルト</span></th>
                                    <th className="text-center px-4 py-3 w-36">配送区分</th>
                                    <th className="text-center px-4 py-3 w-20">状態</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {items.map((item) => {
                                    const isSoldOut = item.stock !== -1 && item.stock === 0;
                                    return (
                                        <tr key={item.id} className="hover:bg-stone-50">
                                            <td className="px-6 py-3 text-sm font-medium text-stone-900">{item.name}</td>
                                            <td className="px-4 py-3 text-center">
                                                <input type="number" min={-1} value={item.stock}
                                                    onChange={(e) => updateItem(item.id, "stock", parseInt(e.target.value, 10))}
                                                    className="w-20 text-center border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="text-stone-400 text-sm">¥</span>
                                                    <input type="number" min={0} value={item.price ?? ""} placeholder="未設定"
                                                        onChange={(e) => updateItem(item.id, "price", e.target.value ? parseInt(e.target.value, 10) : null)}
                                                        className="w-24 text-center border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <select value={item.shipType}
                                                    onChange={(e) => updateItem(item.id, "shipType", e.target.value)}
                                                    className="border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                                    {SHIP_TYPES.map((t) => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {item.stock === -1
                                                    ? <span className="text-xs text-stone-400">管理なし</span>
                                                    : isSoldOut
                                                        ? <span className="text-xs font-bold text-red-500">売り切れ</span>
                                                        : <span className="text-xs font-bold text-green-600">販売中</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={saveInventory} disabled={savingInventory}
                        className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-full font-bold hover:bg-primary transition-colors disabled:opacity-50">
                        {savingInventory ? <Loader2 className="w-4 h-4 animate-spin" /> : savedInventory ? <Check className="w-4 h-4" /> : null}
                        {savedInventory ? "保存しました" : "一括保存"}
                    </button>
                </div>
            )}

            {/* 送料タブ */}
            {tab === "shipping" && (
                <div>
                    <p className="text-sm text-stone-500 mb-1">ヤマト運輸 中国エリア発送 税抜き参考値を初期値として設定済みです。</p>
                    <p className="text-xs text-stone-400 mb-4">※ 消費税10%を加算する場合は各金額を1.1倍にしてください</p>

                    <div className="space-y-4 mb-6">
                        {shipping.map((row, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-sm p-5">
                                {/* ヘッダー行 */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-stone-400 mb-1 block">地域名</label>
                                            <input value={row.region}
                                                onChange={(e) => updateShipping(index, "region", e.target.value)}
                                                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-stone-400 mb-1 block">都道府県（カンマ区切り）</label>
                                            <input value={row.prefectures}
                                                onChange={(e) => updateShipping(index, "prefectures", e.target.value)}
                                                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                        </div>
                                    </div>
                                    <button onClick={() => setShipping((prev) => prev.filter((_, i) => i !== index))}
                                        className="mt-6 p-1.5 text-stone-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* 宅配便サイズ */}
                                <div className="mb-3">
                                    <p className="text-xs font-bold text-stone-500 mb-2">宅配便（サイズ別）</p>
                                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                        {(["s60","s80","s100","s120","s140","s160","s180","s200"] as const).map((key, i) => (
                                            <div key={key} className="text-center">
                                                <label className="text-xs text-stone-400 block mb-1">{SIZE_LABELS[i]}</label>
                                                <input type="number" min={0} value={row[key]}
                                                    onChange={(e) => updateShipping(index, key, parseInt(e.target.value, 10) || 0)}
                                                    className="w-full text-center border border-stone-200 rounded-lg px-1 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* コンパクト・クリックポスト */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div className="text-center">
                                        <label className="text-xs text-stone-400 block mb-1">コンパクト</label>
                                        <input type="number" min={0} value={row.compact}
                                            onChange={(e) => updateShipping(index, "compact", parseInt(e.target.value, 10) || 0)}
                                            className="w-full text-center border border-stone-200 rounded-lg px-1 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div className="text-center">
                                        <label className="text-xs text-stone-400 block mb-1">クリックポスト</label>
                                        <input type="number" min={0} value={row.clickpost}
                                            onChange={(e) => updateShipping(index, "clickpost", parseInt(e.target.value, 10) || 0)}
                                            className="w-full text-center border border-stone-200 rounded-lg px-1 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={saveShipping} disabled={savingShipping}
                            className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-full font-bold hover:bg-primary transition-colors disabled:opacity-50">
                            {savingShipping ? <Loader2 className="w-4 h-4 animate-spin" /> : savedShipping ? <Check className="w-4 h-4" /> : null}
                            {savedShipping ? "保存しました" : "一括保存"}
                        </button>
                        <button
                            onClick={() => setShipping((prev) => [...prev, { region: "", prefectures: "", s60: 0, s80: 0, s100: 0, s120: 0, s140: 0, s160: 0, s180: 0, s200: 0, compact: 0, clickpost: 185 }])}
                            className="flex items-center gap-2 border border-stone-300 text-stone-600 px-5 py-3 rounded-full text-sm font-bold hover:bg-stone-100 transition-colors">
                            <Plus className="w-4 h-4" />
                            地域を追加
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
