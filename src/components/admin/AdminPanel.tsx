"use client";

import { useState } from "react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { Product } from "@/types/microcms";

type InventoryItem = {
    id: string;
    name: string;
    stock: number;
    price: number | null;
};

type ShippingItem = {
    region: string;
    prefectures: string;
    normalFee: number;
    coolFee: number;
};

const DEFAULT_SHIPPING: ShippingItem[] = [
    { region: "北海道", prefectures: "北海道", normalFee: 1500, coolFee: 1800 },
    { region: "東北", prefectures: "青森県,岩手県,宮城県,秋田県,山形県,福島県", normalFee: 1200, coolFee: 1500 },
    { region: "関東", prefectures: "茨城県,栃木県,群馬県,埼玉県,千葉県,東京都,神奈川県,山梨県", normalFee: 1100, coolFee: 1400 },
    { region: "信越・北陸", prefectures: "新潟県,富山県,石川県,福井県,長野県", normalFee: 1100, coolFee: 1400 },
    { region: "東海", prefectures: "岐阜県,静岡県,愛知県,三重県", normalFee: 1100, coolFee: 1400 },
    { region: "近畿", prefectures: "滋賀県,京都府,大阪府,兵庫県,奈良県,和歌山県", normalFee: 1000, coolFee: 1300 },
    { region: "中国", prefectures: "鳥取県,島根県,岡山県,広島県,山口県", normalFee: 900, coolFee: 1200 },
    { region: "四国", prefectures: "徳島県,香川県,愛媛県,高知県", normalFee: 1000, coolFee: 1300 },
    { region: "九州", prefectures: "福岡県,佐賀県,長崎県,熊本県,大分県,宮崎県,鹿児島県", normalFee: 1200, coolFee: 1500 },
    { region: "沖縄", prefectures: "沖縄県", normalFee: 1800, coolFee: 2100 },
];

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

    // 在庫・価格
    const inventoryMap = Object.fromEntries(initialInventory.map((i) => [i.id, i]));
    const [items, setItems] = useState<InventoryItem[]>(
        products.map((p) => ({
            id: p.id,
            name: p.name,
            stock: inventoryMap[p.id]?.stock ?? -1,
            price: inventoryMap[p.id]?.price ?? null,
        }))
    );
    const [savingInventory, setSavingInventory] = useState(false);
    const [savedInventory, setSavedInventory] = useState(false);

    // 送料
    const [shipping, setShipping] = useState<ShippingItem[]>(
        initialShipping.length > 0 ? initialShipping : DEFAULT_SHIPPING
    );
    const [savingShipping, setSavingShipping] = useState(false);
    const [savedShipping, setSavedShipping] = useState(false);

    const updateItem = (id: string, field: keyof InventoryItem, value: number | null) => {
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
        } finally {
            setSavingInventory(false);
        }
    };

    const updateShipping = (index: number, field: keyof ShippingItem, value: string | number) => {
        setShipping((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
        setSavedShipping(false);
    };

    const addShippingRow = () => {
        setShipping((prev) => [...prev, { region: "", prefectures: "", normalFee: 0, coolFee: 0 }]);
    };

    const removeShippingRow = (index: number) => {
        setShipping((prev) => prev.filter((_, i) => i !== index));
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
        } finally {
            setSavingShipping(false);
        }
    };

    return (
        <div>
            {/* タブ */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setTab("inventory")}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${tab === "inventory" ? "bg-stone-900 text-white" : "bg-white text-stone-600 hover:bg-stone-100"}`}
                >
                    商品・在庫
                </button>
                <button
                    onClick={() => setTab("shipping")}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${tab === "shipping" ? "bg-stone-900 text-white" : "bg-white text-stone-600 hover:bg-stone-100"}`}
                >
                    送料設定
                </button>
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
                                    <th className="text-center px-4 py-3 w-24">状態</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {items.map((item) => {
                                    const isSoldOut = item.stock !== -1 && item.stock === 0;
                                    return (
                                        <tr key={item.id} className="hover:bg-stone-50">
                                            <td className="px-6 py-3">
                                                <p className="font-medium text-stone-900 text-sm">{item.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="number"
                                                    min={-1}
                                                    value={item.stock}
                                                    onChange={(e) => updateItem(item.id, "stock", parseInt(e.target.value, 10))}
                                                    className="w-20 text-center border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="text-stone-400 text-sm">¥</span>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={item.price ?? ""}
                                                        placeholder="未設定"
                                                        onChange={(e) => updateItem(item.id, "price", e.target.value ? parseInt(e.target.value, 10) : null)}
                                                        className="w-24 text-center border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                    />
                                                </div>
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
                    <button
                        onClick={saveInventory}
                        disabled={savingInventory}
                        className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-full font-bold hover:bg-primary transition-colors disabled:opacity-50"
                    >
                        {savingInventory ? <Loader2 className="w-4 h-4 animate-spin" /> : savedInventory ? <Check className="w-4 h-4" /> : null}
                        {savedInventory ? "保存しました" : "一括保存"}
                    </button>
                </div>
            )}

            {/* 送料タブ */}
            {tab === "shipping" && (
                <div>
                    <p className="text-sm text-stone-500 mb-4">都道府県はカンマ区切りで入力してください。例：鳥取県,島根県,岡山県</p>
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
                        <table className="w-full">
                            <thead className="bg-stone-100 text-stone-600 text-xs">
                                <tr>
                                    <th className="text-left px-4 py-3 w-24">地域名</th>
                                    <th className="text-left px-4 py-3">都道府県</th>
                                    <th className="text-center px-4 py-3 w-28">通常送料</th>
                                    <th className="text-center px-4 py-3 w-28">クール便</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {shipping.map((row, index) => (
                                    <tr key={index} className="hover:bg-stone-50">
                                        <td className="px-4 py-2">
                                            <input
                                                value={row.region}
                                                onChange={(e) => updateShipping(index, "region", e.target.value)}
                                                className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                value={row.prefectures}
                                                onChange={(e) => updateShipping(index, "prefectures", e.target.value)}
                                                className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-stone-400 text-sm">¥</span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={row.normalFee}
                                                    onChange={(e) => updateShipping(index, "normalFee", parseInt(e.target.value, 10) || 0)}
                                                    className="w-20 text-center border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-stone-400 text-sm">¥</span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={row.coolFee}
                                                    onChange={(e) => updateShipping(index, "coolFee", parseInt(e.target.value, 10) || 0)}
                                                    className="w-20 text-center border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <button
                                                onClick={() => removeShippingRow(index)}
                                                className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={saveShipping}
                            disabled={savingShipping}
                            className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-full font-bold hover:bg-primary transition-colors disabled:opacity-50"
                        >
                            {savingShipping ? <Loader2 className="w-4 h-4 animate-spin" /> : savedShipping ? <Check className="w-4 h-4" /> : null}
                            {savedShipping ? "保存しました" : "一括保存"}
                        </button>
                        <button
                            onClick={addShippingRow}
                            className="flex items-center gap-2 border border-stone-300 text-stone-600 px-5 py-3 rounded-full text-sm font-bold hover:bg-stone-100 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            地域を追加
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
