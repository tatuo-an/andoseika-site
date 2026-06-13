"use client";

import React, { useState, useRef } from "react";
import { Check, Loader2, Plus, Trash2, GripVertical, Eye, EyeOff, Copy, ChevronDown, ChevronRight, Camera } from "lucide-react";
import { Product } from "@/types/microcms";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BADGE_COLORS, DEFAULT_BADGE_COLOR } from "@/lib/badges";

export { BADGE_COLORS, DEFAULT_BADGE_COLOR };

export type InventoryItem = {
    id: string;
    name: string;
    stock: number;
    price: number | null;       // 販売価格（Stripeへ送る額）
    shipType: string;
    hidden: boolean;
    deleted: boolean;
    nextShipment: string;
    badges: string[];
    family: string;
    imageUrl: string;
    familyImages: string[];
    cost: number | null;        // 原価
    profitRate: number | null;  // 利益率(%)
    coolAvailable: boolean;     // クール便対応(ファミリー単位)
};

const PRESET_BADGES = ["新物", "訳あり", "秀品", "贈答用", "栽培期間中農薬不使用", "慣行栽培"];


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

const DEFAULT_SHIPPING: ShippingItem[] = [
    { region: "北海道", prefectures: "北海道", s60: 1200, s80: 1400, s100: 1600, s120: 1750, s140: 2000, s160: 2200, s180: 2400, s200: 2600, compact: 990, clickpost: 185 },
    { region: "東北", prefectures: "青森県,岩手県,宮城県,秋田県,山形県,福島県", s60: 800, s80: 1000, s100: 1200, s120: 1400, s140: 1600, s160: 1800, s180: 2000, s200: 2200, compact: 790, clickpost: 185 },
    { region: "沖縄", prefectures: "沖縄県", s60: 1200, s80: 1700, s100: 2200, s120: 2700, s140: 3200, s160: 3700, s180: 4200, s200: 4900, compact: 790, clickpost: 185 },
    { region: "それ以外", prefectures: "（北海道・東北・沖縄以外の全都道府県）", s60: 600, s80: 700, s100: 800, s120: 1000, s140: 1200, s160: 1400, s180: 1600, s200: 1800, compact: 690, clickpost: 185 },
];

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

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    const inventoryIds = new Set(initialInventory.map((i) => i.id));

    // items = シート全件のみ（MicroCMS未登録商品は自動追加しない）
    const [items, setItems] = useState<InventoryItem[]>(
        initialInventory.map((inv) => ({
            id: inv.id,
            name: inv.name || productMap[inv.id]?.name || inv.id,
            stock: inv.stock,
            price: inv.price,
            shipType: inv.shipType,
            hidden: inv.hidden,
            deleted: false,
            nextShipment: inv.nextShipment ?? "",
            badges: inv.badges ?? [],
            family: inv.family ?? "",
            imageUrl: inv.imageUrl ?? productMap[inv.id]?.image?.url ?? "",
            familyImages: inv.familyImages ?? [],
            cost: inv.cost ?? null,
            profitRate: inv.profitRate ?? null,
            coolAvailable: inv.coolAvailable ?? false,
        }))
    );

    // 折りたたまれたファミリー（初期はすべて折りたたみ）
    const [collapsedFamilies, setCollapsedFamilies] = useState<Set<string>>(() => {
        const families = new Set<string>();
        initialInventory.forEach(inv => { if (inv.family?.trim()) families.add(inv.family.trim()); });
        return families;
    });
    const toggleFamily = (family: string) => {
        setCollapsedFamilies((prev) => {
            const next = new Set(prev);
            next.has(family) ? next.delete(family) : next.add(family);
            return next;
        });
    };

    // ファミリー名を一括変更（全メンバーの family フィールドを更新）
    const renameFamily = (oldName: string, newName: string) => {
        if (!newName.trim() || newName === oldName) return;
        setItems((prev) => prev.map((item) =>
            item.family?.trim() === oldName ? { ...item, family: newName.trim() } : item
        ));
        setCollapsedFamilies((prev) => {
            const next = new Set(prev);
            if (next.has(oldName)) { next.delete(oldName); next.add(newName.trim()); }
            return next;
        });
        setSavedInventory(false);
    };

    // ファミリーのギャラリー画像を一括更新
    const updateFamilyImages = (family: string, familyImages: string[]) => {
        setItems((prev) => prev.map((item) =>
            item.family?.trim() === family ? { ...item, familyImages } : item
        ));
        setSavedInventory(false);
    };

    // ファミリー全体のクール便フラグを一括切替
    const toggleFamilyCool = (family: string) => {
        setItems((prev) => {
            const current = prev.find(i => i.family?.trim() === family)?.coolAvailable ?? false;
            return prev.map((item) => item.family?.trim() === family ? { ...item, coolAvailable: !current } : item);
        });
        setSavedInventory(false);
    };


    // ファミリー全体を一括非表示/表示切り替え
    const toggleFamilyHidden = (family: string) => {
        const familyItems = items.filter((i) => i.family?.trim() === family);
        const allHidden = familyItems.every((i) => i.hidden);
        setItems((prev) => prev.map((item) =>
            item.family?.trim() === family ? { ...item, hidden: !allHidden } : item
        ));
        setSavedInventory(false);
    };

    // ファミリーにバリエーションを追加
    const addVariantToFamily = (family: string) => {
        const newId = `custom-${Date.now()}`;
        // 同ファミリーの最後の商品の直後に挿入
        setItems((prev) => {
            const lastIdx = [...prev].map((i, idx) => ({ i, idx })).filter(({ i }) => i.family?.trim() === family).at(-1)?.idx ?? prev.length - 1;
            const next = [...prev];
            const familyMember = prev.find(i => i.family?.trim() === family);
            const familyImages = familyMember?.familyImages ?? [];
            const coolAvailable = familyMember?.coolAvailable ?? false;
            next.splice(lastIdx + 1, 0, { id: newId, name: "バリエーション名", stock: -1, price: null, shipType: "", hidden: false, deleted: false, nextShipment: "", badges: [], family, imageUrl: "", familyImages: [...familyImages], cost: null, profitRate: null, coolAvailable });
            return next;
        });
        setSavedInventory(false);
    };

    const visibleItems = items;

    // グローバルカスタムバッジ（プリセット以外で使われているバッジを全商品から収集）
    const [extraBadges, setExtraBadges] = useState<string[]>(() =>
        Array.from(new Set(
            initialInventory.flatMap((i) => (i.badges ?? []).filter((b) => !PRESET_BADGES.includes(b)))
        ))
    );
    const allBadges = Array.from(new Set([...PRESET_BADGES, ...extraBadges]));

    const addExtraBadge = (badge: string) => {
        if (!PRESET_BADGES.includes(badge) && !extraBadges.includes(badge)) {
            setExtraBadges((prev) => [...prev, badge]);
        }
    };

    const removeExtraBadge = (badge: string) => {
        setExtraBadges((prev) => prev.filter((b) => b !== badge));
        // そのバッジを使っている全商品からも除去
        setItems((prev) => prev.map((item) =>
            item.badges.includes(badge) ? { ...item, badges: item.badges.filter((b) => b !== badge) } : item
        ));
        setSavedInventory(false);
    };

    const [savingInventory, setSavingInventory] = useState(false);
    const [savedInventory, setSavedInventory] = useState(false);
    const [inventoryError, setInventoryError] = useState("");

    const [shipping, setShipping] = useState<ShippingItem[]>(
        initialShipping.length > 0 ? initialShipping : DEFAULT_SHIPPING
    );
    const [savingShipping, setSavingShipping] = useState(false);
    const [savedShipping, setSavedShipping] = useState(false);

    // 基準地域行（最後の行 = "それ以外"）の送料を取得
    const baseShipRow = shipping.length > 0 ? shipping[shipping.length - 1] : null;
    const getBaseShipFee = (shipType: string): number => {
        if (!baseShipRow || !shipType) return 0;
        const map: Record<string, keyof ShippingItem> = {
            "60": "s60", "80": "s80", "100": "s100", "120": "s120",
            "140": "s140", "160": "s160", "180": "s180", "200": "s200",
            "compact": "compact", "clickpost": "clickpost",
        };
        const key = map[shipType];
        return key ? (baseShipRow[key] as number) : 0;
    };

    // 販売価格を 原価 + 送料 + 原価×利益率/100 で算出（null返却→未設定）
    const calcSellPrice = (item: InventoryItem): number | null => {
        if (item.cost === null || item.profitRate === null) return null;
        const shipFee = getBaseShipFee(item.shipType);
        return Math.round(item.cost + shipFee + item.cost * item.profitRate / 100);
    };

    const updateItem = <K extends keyof InventoryItem>(id: string, field: K, value: InventoryItem[K]) => {
        setItems((prev) => prev.map((item) => {
            if (item.id !== id) return item;
            const updated = { ...item, [field]: value };
            // 原価・利益率・配送区分が変わったら販売価格を再計算
            if (field === "cost" || field === "profitRate" || field === "shipType") {
                const auto = calcSellPrice(updated);
                if (auto !== null) updated.price = auto;
            }
            return updated;
        }));
        setSavedInventory(false);
    };

    const copyItem = (id: string) => {
        const src = items.find((i) => i.id === id);
        if (!src) return;
        const newItem: InventoryItem = {
            ...src,
            id: `custom-${Date.now()}`,
            name: `${src.name} (コピー)`,
            deleted: false,
            badges: [...src.badges],
        };
        setItems((prev) => {
            const idx = prev.findIndex((i) => i.id === id);
            const next = [...prev];
            next.splice(idx + 1, 0, newItem);
            return next;
        });
        setSavedInventory(false);
    };

    const deleteItem = async (id: string) => {
        if (!confirm("この商品を削除しますか？\n※MicroCMSからも完全に削除されます。")) return;
        // MicroCMSから削除（custom-IDはスキップ）
        if (!id.startsWith("custom-")) {
            try {
                const res = await fetch("/api/microcms-delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                });
                const body = await res.json();
                if (!res.ok) {
                    alert(`MicroCMSからの削除に失敗しました。\nMicroCMSのAPIキーにDELETE権限が付与されているか確認してください。\n(${body?.error ?? res.status})`);
                    return;
                }
            } catch {
                alert("MicroCMSへの接続に失敗しました。");
                return;
            }
        }
        setItems((prev) => prev.filter((item) => item.id !== id));
        setSavedInventory(false);
    };

    const addItem = () => {
        const newId = `custom-${Date.now()}`;
        setItems((prev) => [...prev, {
            id: newId,
            name: "新しい商品",
            stock: -1,
            price: null,
            shipType: "",
            hidden: false,
            deleted: false,
            nextShipment: "",
            badges: [],
            family: "",
            imageUrl: "",
            familyImages: [],
            cost: null,
            profitRate: null,
            coolAvailable: false,
        }]);
        setSavedInventory(false);
    };

    const addFamily = () => {
        const ts = Date.now();
        setItems((prev) => [...prev, {
            id: `custom-${ts}`,
            name: "バリエーション名",
            stock: -1,
            price: null,
            shipType: "",
            hidden: false,
            deleted: false,
            nextShipment: "",
            badges: [],
            family: "新しいファミリー",
            imageUrl: "",
            familyImages: [],
            cost: null,
            profitRate: null,
            coolAvailable: false,
        }]);
        setSavedInventory(false);
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setItems((prev) => {
                const oldIndex = prev.findIndex((i) => i.id === active.id);
                const newIndex = prev.findIndex((i) => i.id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
            setSavedInventory(false);
        }
    };

    const saveInventory = async () => {
        setSavingInventory(true);
        setInventoryError("");
        try {
            const res = await fetch("/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setInventoryError(`保存失敗 (${res.status}): ${body?.error ?? "不明なエラー"}`);
                return;
            }
            setSavedInventory(true);
            setTimeout(() => setSavedInventory(false), 2000);
        } catch {
            setInventoryError("通信エラーが発生しました");
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
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={visibleItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                            {(() => {
                                const rendered: React.ReactNode[] = [];
                                const seenFamilies = new Set<string>();
                                visibleItems.forEach((item) => {
                                    const fam = item.family?.trim();
                                    if (fam) {
                                        if (!seenFamilies.has(fam)) {
                                            seenFamilies.add(fam);
                                            const familyItems = visibleItems.filter((i) => i.family?.trim() === fam);
                                            const collapsed = collapsedFamilies.has(fam);
                                            rendered.push(
                                                <div key={`fam-${fam}`} className="bg-white rounded-2xl shadow-sm mb-2">
                                                    {/* ── ヘッダー ── */}
                                                    {(() => {
                                                        const allHidden = familyItems.every((i) => i.hidden);
                                                        return (
                                                            <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-stone-100 rounded-t-2xl ${collapsed ? "rounded-b-2xl" : ""} ${allHidden ? "bg-stone-100 opacity-60" : "bg-stone-50"}`}>
                                                                <button onClick={() => toggleFamily(fam)} className="flex-shrink-0 p-0.5 text-stone-400 hover:text-stone-600">
                                                                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                                </button>
                                                                <FamilyNameInput
                                                                    value={fam}
                                                                    onCommit={(newName) => renameFamily(fam, newName)}
                                                                />
                                                                <span className="text-xs text-stone-400 whitespace-nowrap">{familyItems.length}バリエーション</span>
                                                                <button
                                                                    onClick={() => toggleFamilyCool(fam)}
                                                                    title={familyItems[0]?.coolAvailable ? "クール便OFFにする" : "クール便ONにする"}
                                                                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors border whitespace-nowrap flex-shrink-0 ${
                                                                        familyItems[0]?.coolAvailable
                                                                            ? "bg-blue-500 text-white border-blue-600"
                                                                            : "bg-stone-50 text-stone-400 border-stone-200 hover:bg-stone-100"
                                                                    }`}
                                                                >
                                                                    ❄ クール便
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleFamilyHidden(fam)}
                                                                    title={allHidden ? "全て表示する" : "全て非表示にする"}
                                                                    className={`p-1.5 rounded transition-colors flex-shrink-0 ${allHidden ? "text-primary" : "text-stone-300 hover:text-stone-600"}`}
                                                                >
                                                                    {allHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
                                                                {!collapsed && (
                                                                    <button
                                                                        onClick={() => addVariantToFamily(fam)}
                                                                        className="ml-auto flex items-center gap-1 text-xs text-stone-500 hover:text-primary border border-stone-200 hover:border-primary/50 px-2.5 py-1 rounded-full transition-colors whitespace-nowrap"
                                                                    >
                                                                        <Plus className="w-3 h-3" />
                                                                        バリエーションを追加
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                    {!collapsed && (
                                                        <>
                                                        <FamilyGallery
                                                            familyImages={familyItems[0]?.familyImages ?? []}
                                                            onUpdate={(imgs) => updateFamilyImages(fam, imgs)}
                                                        />
                                                        <div className="divide-y divide-stone-100">
                                                            {familyItems.map((fi) => (
                                                                <SortableRow
                                                                    key={fi.id}
                                                                    item={fi}
                                                                    shipTypes={SHIP_TYPES}
                                                                    allBadges={allBadges}
                                                                    onAddBadge={addExtraBadge}
                                                                    onRemoveBadge={removeExtraBadge}
                                                                    onUpdate={updateItem}
                                                                    onCopy={copyItem}
                                                                    onDelete={deleteItem}
                                                                />
                                                            ))}
                                                        </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        }
                                    } else {
                                        rendered.push(
                                            <div key={item.id} className="bg-white rounded-2xl shadow-sm mb-2">
                                                <SortableRow
                                                    item={item}
                                                    shipTypes={SHIP_TYPES}
                                                    allBadges={allBadges}
                                                    onAddBadge={addExtraBadge}
                                                    onRemoveBadge={removeExtraBadge}
                                                    onUpdate={updateItem}
                                                    onCopy={copyItem}
                                                    onDelete={deleteItem}
                                                />
                                            </div>
                                        );
                                    }
                                });
                                return rendered;
                            })()}
                        </SortableContext>
                    </DndContext>

                    {/* 下部に余白を確保（固定ボタンと被らないように） */}
                    <div className="h-24" />

                    {/* 固定アクションバー */}
                    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-stone-200 shadow-lg">
                        <div className="container mx-auto px-4 md:px-6 max-w-5xl py-3 flex items-center gap-3 flex-wrap">
                            <button onClick={saveInventory} disabled={savingInventory}
                                className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-full font-bold hover:bg-primary transition-colors disabled:opacity-50">
                                {savingInventory ? <Loader2 className="w-4 h-4 animate-spin" /> : savedInventory ? <Check className="w-4 h-4" /> : null}
                                {savedInventory ? "保存しました" : "一括保存"}
                            </button>
                            <button onClick={addItem}
                                className="flex items-center gap-2 border border-stone-300 text-stone-600 px-5 py-3 rounded-full text-sm font-bold hover:bg-stone-100 transition-colors">
                                <Plus className="w-4 h-4" />
                                商品を追加
                            </button>
                            <button onClick={addFamily}
                                className="flex items-center gap-2 border border-stone-300 text-stone-600 px-5 py-3 rounded-full text-sm font-bold hover:bg-stone-100 transition-colors">
                                <Plus className="w-4 h-4" />
                                ファミリーを追加
                            </button>
                            {inventoryError && <p className="text-red-500 text-sm">{inventoryError}</p>}
                        </div>
                    </div>
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

// ── ドラッグ可能な行コンポーネント ──────────────────────────────
function SortableRow({
    item,
    shipTypes,
    allBadges,
    onAddBadge,
    onRemoveBadge,
    onUpdate,
    onCopy,
    onDelete,
}: {
    item: InventoryItem;
    shipTypes: { value: string; label: string }[];
    allBadges: string[];
    onAddBadge: (badge: string) => void;
    onRemoveBadge: (badge: string) => void;
    onUpdate: <K extends keyof InventoryItem>(id: string, field: K, value: InventoryItem[K]) => void;
    onCopy: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };
    const isSoldOut = item.stock !== -1 && item.stock === 0;
    const statusLabel = item.hidden
        ? <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">非表示</span>
        : item.stock === -1
            ? <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">管理なし</span>
            : isSoldOut
                ? <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">売り切れ</span>
                : <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">販売中</span>;

    return (
        <div ref={setNodeRef} style={style}
            className={`px-3 py-3 ${item.hidden ? "opacity-50 bg-stone-50" : "hover:bg-stone-50/60"} ${isDragging ? "bg-primary/5 shadow-lg" : ""}`}>

            {/* 1行目: ドラッグ＋画像＋商品名＋ステータス＋操作ボタン */}
            <div className="flex items-center gap-2 mb-1.5">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 text-stone-300 hover:text-stone-500 transition-colors touch-none flex-shrink-0"
                >
                    <GripVertical className="w-4 h-4" />
                </button>
                <ImageUploadButton
                    currentImageUrl={item.imageUrl}
                    onUploaded={(url) => onUpdate(item.id, "imageUrl", url)}
                />
                <input
                    value={item.name}
                    onChange={(e) => onUpdate(item.id, "name", e.target.value)}
                    className="w-24 min-w-0 border border-stone-200 rounded-lg px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {/* 在庫数 */}
                <div className="flex items-center gap-1">
                    <span className="text-xs text-stone-400">在庫</span>
                    <input type="number" min={-1} value={item.stock}
                        onChange={(e) => { const v = parseInt(e.target.value, 10); onUpdate(item.id, "stock", isNaN(v) ? -1 : v); }}
                        className="w-14 text-center border border-stone-200 rounded-lg px-1 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                {/* 原価 */}
                <div className="flex items-center gap-1">
                    <span className="text-xs text-stone-400">原価</span>
                    <input type="number" min={0} value={item.cost ?? ""} placeholder="−"
                        onChange={(e) => onUpdate(item.id, "cost", e.target.value ? parseInt(e.target.value, 10) : null)}
                        className="w-20 text-center border border-stone-200 rounded-lg px-1 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                {/* 利益率 */}
                <div className="flex items-center gap-1">
                    <span className="text-xs text-stone-400">利益率</span>
                    <input type="number" min={0} step="0.1" value={item.profitRate ?? ""} placeholder="−"
                        onChange={(e) => onUpdate(item.id, "profitRate", e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-14 text-center border border-stone-200 rounded-lg px-1 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <span className="text-xs text-stone-400">%</span>
                </div>
                {/* 販売価格 */}
                <div className="flex items-center gap-1">
                    <span className="text-xs text-stone-400">販売</span>
                    <input type="number" min={0} value={item.price ?? ""} placeholder="−"
                        onChange={(e) => onUpdate(item.id, "price", e.target.value ? parseInt(e.target.value, 10) : null)}
                        title="原価・利益率・配送区分から自動算出されます（手動上書きも可）"
                        className="w-24 text-center border border-stone-200 rounded-lg px-1 py-1 text-sm font-medium bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                {/* 配送区分 */}
                <select value={item.shipType}
                    onChange={(e) => onUpdate(item.id, "shipType", e.target.value)}
                    className="border border-stone-200 rounded-lg px-1.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {shipTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
                {/* 次回出荷 */}
                <input
                    value={item.nextShipment}
                    onChange={(e) => onUpdate(item.id, "nextShipment", e.target.value)}
                    placeholder="次回入荷"
                    className="w-20 border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                    {statusLabel}
                    <button onClick={() => onUpdate(item.id, "hidden", !item.hidden)}
                        title={item.hidden ? "表示する" : "非表示にする"}
                        className={`p-1.5 rounded transition-colors ${item.hidden ? "text-primary" : "text-stone-300 hover:text-stone-600"}`}>
                        {item.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => onCopy(item.id)} title="コピー"
                        className="p-1.5 text-stone-300 hover:text-blue-500 rounded transition-colors">
                        <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(item.id)} title="削除"
                        className="p-1.5 text-stone-300 hover:text-red-500 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 2行目: ファミリー（未所属のみ）＋バッジ */}
            <div className="flex items-center gap-2 flex-wrap ml-7">
                {!item.family?.trim() && (
                    <FamilyInput value="" onCommit={(v) => onUpdate(item.id, "family", v)} />
                )}
                <BadgeSelector
                    badges={item.badges}
                    allBadges={allBadges}
                    onChange={(b) => onUpdate(item.id, "badges", b)}
                    onAddBadge={onAddBadge}
                    onRemoveBadge={onRemoveBadge}
                />
            </div>
        </div>
    );
}

// ── ギャラリースロット（ドラッグ可能） ──────────────────────────
function SortableGallerySlot({ url, onRemove }: { url: string; onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };
    return (
        <div ref={setNodeRef} style={style} className="relative flex-shrink-0 touch-none">
            <div
                {...attributes}
                {...listeners}
                className="w-10 h-10 rounded-lg border border-stone-200 overflow-hidden cursor-grab active:cursor-grabbing"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
            </div>
            <button
                onClick={onRemove}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] leading-none hover:bg-red-600 z-10"
            >×</button>
        </div>
    );
}

// ── ファミリーギャラリー（最大5枚・ドラッグ並び替え）────────────────
function FamilyGallery({ familyImages, onUpdate }: {
    familyImages: string[];
    onUpdate: (images: string[]) => void;
}) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const gallerySensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIdx = familyImages.indexOf(active.id as string);
            const newIdx = familyImages.indexOf(over.id as string);
            if (oldIdx !== -1 && newIdx !== -1) onUpdate(arrayMove(familyImages, oldIdx, newIdx));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const resized = await resizeImageFile(file);
            const form = new FormData();
            form.append("file", resized, file.name.replace(/\.[^.]+$/, ".jpg"));
            const res = await fetch("/api/upload-image", { method: "POST", body: form });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                alert(`画像アップロード失敗: ${body.error ?? res.status}`);
                return;
            }
            const { url } = await res.json();
            onUpdate([...familyImages, url].slice(0, 5));
        } catch (err) {
            alert(`アップロードエラー: ${err}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const emptyCount = Math.max(0, 5 - familyImages.length);

    return (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-stone-100 bg-stone-50/40">
            <span className="text-xs text-stone-400 whitespace-nowrap">ギャラリー</span>
            <div className="flex gap-1.5 items-center">
                <DndContext sensors={gallerySensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={familyImages} strategy={horizontalListSortingStrategy}>
                        {familyImages.map((url, i) => (
                            <SortableGallerySlot
                                key={url}
                                url={url}
                                onRemove={() => onUpdate(familyImages.filter((_, idx) => idx !== i))}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
                {/* 空スロット */}
                {Array.from({ length: emptyCount }, (_, i) => (
                    <button
                        key={`empty-${i}`}
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-10 h-10 rounded-lg border border-stone-200 bg-stone-100 hover:border-primary/60 flex items-center justify-center transition-colors"
                    >
                        {uploading && i === 0 ? (
                            <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                        ) : (
                            <Camera className="w-3.5 h-3.5 text-stone-300" />
                        )}
                    </button>
                ))}
            </div>
            <span className="text-xs text-stone-300">{familyImages.length}/5</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
    );
}

// Canvas でリサイズ＋JPEG変換（最大1920px・品質85%）
async function resizeImageFile(file: File, maxPx = 1920, quality = 0.85): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width: w, height: h } = img;
            if (w > maxPx || h > maxPx) {
                if (w >= h) { h = Math.round(h * maxPx / w); w = maxPx; }
                else { w = Math.round(w * maxPx / h); h = maxPx; }
            }
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) { reject(new Error("Canvas unavailable")); return; }
            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob(
                (blob) => blob ? resolve(blob) : reject(new Error("toBlob failed")),
                "image/jpeg", quality
            );
        };
        img.onerror = reject;
        img.src = url;
    });
}

// ── 画像アップロードボタン ──────────────────────────────────────
function ImageUploadButton({ currentImageUrl, onUploaded }: {
    currentImageUrl: string;
    onUploaded: (url: string) => void;
}) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const resized = await resizeImageFile(file);
            const formData = new FormData();
            formData.append("file", resized, file.name.replace(/\.[^.]+$/, ".jpg"));
            const res = await fetch("/api/upload-image", { method: "POST", body: formData });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                alert(`画像アップロード失敗: ${body.error ?? res.status}`);
                return;
            }
            const { url } = await res.json();
            onUploaded(url);
        } catch (err) {
            alert(`画像アップロード中にエラーが発生しました: ${err}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex-shrink-0">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="画像を変更（クリックしてアップロード）"
                className="w-9 h-9 rounded-lg border border-stone-200 overflow-hidden bg-stone-100 hover:border-primary/60 transition-colors flex-shrink-0 flex items-center justify-center"
            >
                {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                ) : currentImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <Camera className="w-4 h-4 text-stone-300" />
                )}
            </button>
        </div>
    );
}

// ── ファミリー名ヘッダー編集（クリックで編集可能）────────────────────
function FamilyNameInput({ value, onCommit }: { value: string; onCommit: (v: string) => void }) {
    const [editing, setEditing] = useState(false);
    const [local, setLocal] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    const commit = () => {
        setEditing(false);
        onCommit(local);
    };

    if (editing) {
        return (
            <input
                ref={inputRef}
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setLocal(value); setEditing(false); } }}
                autoFocus
                className="flex-1 min-w-0 font-bold text-stone-700 text-sm border border-primary/40 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            />
        );
    }
    return (
        <button
            onClick={(e) => { e.stopPropagation(); setLocal(value); setEditing(true); setTimeout(() => inputRef.current?.focus(), 0); }}
            className="flex-1 min-w-0 text-left font-bold text-stone-700 text-sm hover:text-primary transition-colors truncate"
            title="クリックして編集"
        >
            {value}
        </button>
    );
}

// ── ファミリー入力（再マウント防止のため内部stateで管理）────────────
function FamilyInput({ value, onCommit }: { value: string; onCommit: (v: string) => void }) {
    const [local, setLocal] = useState(value);
    // 外部から value が変わった場合（保存後など）に同期
    const prev = useRef(value);
    if (prev.current !== value) { prev.current = value; setLocal(value); }
    return (
        <div className="flex items-center gap-1">
            <span className="text-xs text-stone-400 whitespace-nowrap">ファミリー</span>
            <input
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                onBlur={() => onCommit(local)}
                onKeyDown={(e) => e.key === "Enter" && onCommit(local)}
                placeholder="例: ながいも"
                className="w-24 border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
        </div>
    );
}

// ── ドラッグ可能なバッジチップ ──────────────────────────────────
function SortableBadgeChip({ badge, onRemove }: { badge: string; onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: badge });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
        cursor: isDragging ? "grabbing" : "grab",
    };
    return (
        <span
            ref={setNodeRef}
            style={style}
            className={`inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full border select-none touch-none ${BADGE_COLORS[badge] ?? DEFAULT_BADGE_COLOR}`}
        >
            <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">{badge}</span>
            <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="ml-0.5 opacity-60 hover:opacity-100 leading-none"
            >×</button>
        </span>
    );
}

// ── バッジセレクター ────────────────────────────────────────────
function BadgeSelector({
    badges,
    allBadges,
    onChange,
    onAddBadge,
    onRemoveBadge,
}: {
    badges: string[];
    allBadges: string[];
    onChange: (badges: string[]) => void;
    onAddBadge: (badge: string) => void;
    onRemoveBadge: (badge: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [custom, setCustom] = useState("");
    const [openUp, setOpenUp] = useState(false);
    const [openLeft, setOpenLeft] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);

    const toggle = (badge: string) => {
        onChange(badges.includes(badge) ? badges.filter((b) => b !== badge) : [...badges, badge]);
    };

    const addCustom = () => {
        const t = custom.trim();
        if (!t) return;
        onAddBadge(t); // グローバルリストに追加
        if (!badges.includes(t)) onChange([...badges, t]);
        setCustom("");
    };

    const handleOpen = () => {
        if (!open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // 下に収まらない場合は上に開く（高さ約220px）
            setOpenUp(rect.bottom + 220 > window.innerHeight);
            // 右にはみ出す場合は右端揃えにする（幅288px = w-72）
            setOpenLeft(rect.left + 288 > window.innerWidth);
        }
        setOpen(!open);
    };

    const badgeSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleBadgeDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = badges.indexOf(active.id as string);
            const newIndex = badges.indexOf(over.id as string);
            onChange(arrayMove(badges, oldIndex, newIndex));
        }
    };

    return (
        <div className="relative">
            {/* 選択済みバッジ表示 & 開閉ボタン */}
            <div ref={triggerRef} className="flex flex-wrap gap-1 items-center">
                {badges.length === 0 ? (
                    <span className="text-xs text-stone-300 border border-dashed border-stone-200 px-2 py-0.5 rounded-full cursor-pointer" onClick={handleOpen}>＋ バッジ</span>
                ) : (
                    <>
                        <DndContext sensors={badgeSensors} collisionDetection={closestCenter} onDragEnd={handleBadgeDragEnd}>
                            <SortableContext items={badges} strategy={horizontalListSortingStrategy}>
                                {badges.map((b) => (
                                    <SortableBadgeChip
                                        key={b}
                                        badge={b}
                                        onRemove={() => onChange(badges.filter(x => x !== b))}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                        <span className="text-xs text-stone-300 border border-dashed border-stone-200 px-2 py-0.5 rounded-full cursor-pointer" onClick={handleOpen}>＋</span>
                    </>
                )}
            </div>

            {/* ドロップダウン */}
            {open && (
                <div className={`absolute z-[200] bg-white border border-stone-200 rounded-xl shadow-xl p-3 w-72 ${openUp ? "bottom-8" : "top-8"} ${openLeft ? "right-0" : "left-0"}`}>
                    <p className="text-xs text-stone-400 mb-2 font-bold">バッジを選択（複数可）</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {allBadges.map((badge) => {
                            const isPreset = PRESET_BADGES.includes(badge);
                            const isSelected = badges.includes(badge);
                            return (
                                <span key={badge} className="inline-flex items-center">
                                    <button
                                        onClick={() => toggle(badge)}
                                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${isPreset ? "" : "rounded-r-none border-r-0"} ${
                                            isSelected
                                                ? (BADGE_COLORS[badge] ?? DEFAULT_BADGE_COLOR) + " font-bold"
                                                : "border-stone-200 text-stone-500 hover:bg-stone-50"
                                        }`}
                                    >
                                        {isSelected ? "✓ " : ""}{badge}
                                    </button>
                                    {!isPreset && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onRemoveBadge(badge); }}
                                            title="バッジを削除"
                                            className={`text-xs px-1.5 py-1 rounded-r-full border border-l-0 transition-colors ${
                                                isSelected
                                                    ? (BADGE_COLORS[badge] ?? DEFAULT_BADGE_COLOR) + " opacity-60 hover:opacity-100"
                                                    : "border-stone-200 text-stone-400 hover:text-red-500 hover:bg-red-50"
                                            }`}
                                        >×</button>
                                    )}
                                </span>
                            );
                        })}
                    </div>
                    <div className="flex gap-1.5">
                        <input
                            value={custom}
                            onChange={(e) => setCustom(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addCustom()}
                            placeholder="カスタムバッジを追加"
                            className="flex-1 text-xs border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button onClick={addCustom} className="text-xs bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors">
                            追加
                        </button>
                    </div>
                    <button onClick={() => setOpen(false)} className="mt-2 text-xs text-stone-400 hover:text-stone-600 w-full text-center">
                        閉じる
                    </button>
                </div>
            )}
        </div>
    );
}
