"use client";

import { useShoppingCart } from "use-shopping-cart";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Minus, Trash2, Calendar, MapPin, Star } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { earliestDeliveryDate } from "@/lib/shipSchedule";

type AddressItem = { label: string; name: string; postalCode: string; prefecture: string; city: string; street: string; building: string; phone: string };

type ShippingRow = {
    region: string; prefectures: string;
    s60: number; s80: number; s100: number; s120: number;
    s140: number; s160: number; s180: number; s200: number;
    compact: number; clickpost: number;
};
type InvItem = { id: string; name: string; price: number | null; family: string; coolAvailable?: boolean; shipType?: string; clickpostMax?: number; cost?: number | null; profitRate?: number | null; compactMax?: number };

function enrichItem<T extends { id: string }>(item: T, inventory: InvItem[]): T {
    const inv = inventory.find(v => v.id === item.id);
    if (!inv) return item;
    const it = item as T & { cost?: number | null; profitRate?: number | null; shipType?: string; coolAvailable?: boolean; clickpostMax?: number; compactMax?: number; family?: string };
    return {
        ...item,
        cost: it.cost ?? inv.cost ?? null,
        profitRate: it.profitRate ?? inv.profitRate ?? null,
        shipType: it.shipType || inv.shipType || "",
        coolAvailable: it.coolAvailable ?? inv.coolAvailable ?? false,
        clickpostMax: it.clickpostMax ?? inv.clickpostMax ?? 0,
        compactMax: it.compactMax ?? inv.compactMax ?? 0,
        family: it.family || inv.family || "",
    } as T;
}
type SuggestCard = { id: string; href: string; name: string; image: string; displayPrice: number; salePercent: number; isSoldOut: boolean; family: string };

// === 計算ユーティリティ ===
function getRate(row: ShippingRow, shipType: string): number {
    const map: Record<string, keyof ShippingRow> = {
        "60": "s60", "80": "s80", "100": "s100", "120": "s120",
        "140": "s140", "160": "s160", "180": "s180", "200": "s200",
        "compact": "compact", "clickpost": "clickpost",
    };
    const key = map[shipType];
    return key ? (row[key] as number) : 0;
}
function normPref(p: string) { return p.replace(/[都道府県]$/, ""); }
function findRegionRow(prefecture: string, rows: ShippingRow[]): ShippingRow | null {
    if (!rows.length) return null;
    const norm = normPref(prefecture);
    for (const row of rows) {
        const prefs = row.prefectures.split(",").map(p => normPref(p.trim()));
        if (prefs.includes(norm)) return row;
    }
    return rows[rows.length - 1];
}
function findBaseRow(rows: ShippingRow[]): ShippingRow | null {
    return rows.length ? rows[rows.length - 1] : null;
}
function extractWeightG(name: string): number {
    const kg = name.match(/(\d+(?:\.\d+)?)\s*kg/i);
    if (kg) return parseFloat(kg[1]) * 1000;
    const g = name.match(/(\d+(?:\.\d+)?)\s*g(?!l)/i);
    if (g) return parseFloat(g[1]);
    return 0;
}
function weightToShipSize(totalG: number): string {
    if (totalG <= 2000) return "60";
    if (totalG <= 5000) return "80";
    if (totalG <= 10000) return "100";
    if (totalG <= 15000) return "120";
    if (totalG <= 20000) return "140";
    if (totalG <= 25000) return "160";
    if (totalG <= 30000) return "180";
    return "200";
}
function shipTypeLabel(s: string | null): string {
    if (!s) return "";
    if (s === "compact") return "コンパクト";
    if (s === "clickpost") return "クリックポスト";
    return `${s}サイズ`;
}
function coolSurchargeBySize(shipType: string | null): number {
    if (!shipType) return 0;
    if (shipType === "60") return 250;
    if (shipType === "80") return 300;
    if (shipType === "100") return 400;
    if (shipType === "120") return 650;
    return 0;
}
type OptionEntry = { label: string; amount: number };
function parseFamilyOptions(s: string): OptionEntry[] {
    if (!s?.trim()) return [];
    return s.split("|").map(p => {
        const [label, amountStr] = p.split(":");
        return { label: label?.trim() ?? "", amount: parseInt(amountStr ?? "0", 10) || 0 };
    }).filter(e => e.label);
}

const DEFAULT_SHIPPING: ShippingRow[] = [
    { region: "北海道", prefectures: "北海道", s60: 1200, s80: 1400, s100: 1600, s120: 1750, s140: 2000, s160: 2200, s180: 2400, s200: 2600, compact: 990, clickpost: 185 },
    { region: "東北", prefectures: "青森県,岩手県,宮城県,秋田県,山形県,福島県", s60: 800, s80: 1000, s100: 1200, s120: 1400, s140: 1600, s160: 1800, s180: 2000, s200: 2200, compact: 790, clickpost: 185 },
    { region: "沖縄", prefectures: "沖縄県", s60: 1200, s80: 1700, s100: 2200, s120: 2700, s140: 3200, s160: 3700, s180: 4200, s200: 4900, compact: 790, clickpost: 185 },
    { region: "それ以外", prefectures: "東京都,神奈川県,埼玉県,千葉県,茨城県,栃木県,群馬県,新潟県,富山県,石川県,福井県,山梨県,長野県,岐阜県,静岡県,愛知県,三重県,滋賀県,京都府,大阪府,兵庫県,奈良県,和歌山県,鳥取県,島根県,岡山県,広島県,山口県,徳島県,香川県,愛媛県,高知県,福岡県,佐賀県,長崎県,熊本県,大分県,宮崎県,鹿児島県", s60: 600, s80: 700, s100: 800, s120: 1000, s140: 1200, s160: 1400, s180: 1600, s200: 1800, compact: 690, clickpost: 185 },
];

// 配送希望時間帯
const TIME_SLOTS = ["指定なし", "午前中", "14:00〜16:00", "16:00〜18:00", "18:00〜20:00", "19:00〜21:00"];

export default function CartPage() {
    const { cartDetails, removeItem, incrementItem, decrementItem, cartCount } = useShoppingCart();

    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
    const [addressPickerOpen, setAddressPickerOpen] = useState(false);
    const [shippingRows, setShippingRows] = useState<ShippingRow[]>([]);
    const [inventory, setInventory] = useState<InvItem[]>([]);
    const [suggestions, setSuggestions] = useState<SuggestCard[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [coolRequested, setCoolRequested] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

    // お届け希望日時
    const [desiredDate, setDesiredDate] = useState("");
    const [desiredTime, setDesiredTime] = useState("指定なし");
    const [skipMode, setSkipMode] = useState(false);
    const [pointsBalance, setPointsBalance] = useState(0);
    const [pointsToUse, setPointsToUse] = useState(0);
    const [tierDiscountRate, setTierDiscountRate] = useState(0);
    const [tierName, setTierName] = useState("");

    useEffect(() => {
        fetch("/api/admin/settings")
            .then((r) => r.json())
            .then((d) => setSkipMode(d.skip_payment === "true"))
            .catch(() => {});
        fetch("/api/my/points")
            .then((r) => r.json())
            .then((d) => { if (d.balance !== undefined) setPointsBalance(d.balance); })
            .catch(() => {});
        fetch("/api/my/tier")
            .then((r) => r.json())
            .then((d) => {
                const RATES: Record<string, number> = { mebuking: 0.03, minori: 0.05, partner: 0.08 };
                const NAMES: Record<string, string> = { mebuking: "芽吹きサポーター", minori: "実りサポーター", partner: "農園パートナー" };
                if (d.tier && d.tier !== "free") {
                    setTierDiscountRate(RATES[d.tier] ?? 0);
                    setTierName(NAMES[d.tier] ?? "");
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        Promise.all([
            fetch("/api/address").then(r => r.json()).catch(() => ({ addresses: [] })),
            fetch("/api/shipping").then(r => r.json()).catch(() => ({ shipping: [] })),
            fetch("/api/inventory-public").then(r => r.json()).catch(() => ({ inventory: [] })),
            fetch("/api/products-list").then(r => r.json()).catch(() => ({ products: [] })),
        ]).then(([addrData, shipData, invData, prodData]) => {
            setAddresses(addrData.addresses ?? []);
            setShippingRows(shipData.shipping?.length ? shipData.shipping : DEFAULT_SHIPPING);
            setInventory(invData.inventory ?? []);
            setSuggestions(prodData.products ?? []);
            setLoaded(true);
        });
    }, []);

    const selectedAddress = addresses[selectedAddressIdx] ?? null;
    const prefecture = selectedAddress?.prefecture ?? null;
    const regionRow = prefecture ? findRegionRow(prefecture, shippingRows) : null;
    const baseRow = findBaseRow(shippingRows);
    const isExtraRegion = regionRow && baseRow && regionRow !== baseRow;

    const rawCartItems = Object.values(cartDetails ?? {});
    const cartItems = rawCartItems.map(item => enrichItem(item, inventory));
    const totalWeightG = cartItems.reduce((sum, item) => {
        const inv = inventory.find(v => v.id === item.id);
        const weightName = inv?.name || item.name;
        return sum + extractWeightG(weightName) * item.quantity;
    }, 0);
    const weightBasedShipType = totalWeightG > 0 ? weightToShipSize(totalWeightG) : null;

    const cartFamilies = new Set(cartItems.map(i => (i as { family?: string }).family).filter(Boolean) as string[]);
    const matchedVariant: InvItem | null = (() => {
        if (cartFamilies.size !== 1 || inventory.length === 0) return null;
        if (totalWeightG <= 0) return null;
        const family = [...cartFamilies][0];
        const variants = inventory.filter(v => v.family === family);
        const match = variants.find(v => extractWeightG(v.name) === totalWeightG && v.price !== null);
        if (variants.length === 1 && cartItems.length === 1 && cartItems[0].quantity === 1) return null;
        return match ?? null;
    })();
    const matchedInv = matchedVariant ? inventory.find(v => v.id === matchedVariant.id) : null;
    const matchedIsCompact = matchedInv?.shipType === "compact";

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const clickpostMaxes = cartItems.map(i => (i as { clickpostMax?: number }).clickpostMax ?? 0);
    const allClickpostable = clickpostMaxes.length > 0 && clickpostMaxes.every(m => m > 0);
    const minClickpostMax = allClickpostable ? Math.min(...clickpostMaxes) : 0;
    // 全商品が clickpost 同梱可能（clickpostMax > 0）かつ 合計数量 ≤ 最小同梱数 → クリックポスト送り
    // 宅配便/コンパクト商品（clickpostMax = 0）が混じれば自動的に宅配便扱いになる
    const isClickpost = allClickpostable && totalQuantity <= minClickpostMax;

    const singleItemShipType = cartItems.length === 1
        ? ((cartItems[0] as { shipType?: string }).shipType || matchedInv?.shipType || "")
        : "";
    const isCompactOverflow = (() => {
        if (cartItems.length === 0) return false;
        if (!cartItems.every(i => (i as { shipType?: string }).shipType === "compact")) return false;
        const compactMaxes = cartItems.map(i => (i as { compactMax?: number }).compactMax ?? 0);
        if (compactMaxes.some(m => m <= 0)) return false;
        const minMax = Math.min(...compactMaxes);
        return totalQuantity > minMax;
    })();
    const effectiveShipType = isClickpost
        ? "clickpost"
        : isCompactOverflow
            ? weightBasedShipType
            : singleItemShipType
                ? singleItemShipType
                : weightBasedShipType;

    const itemsTotalCost = cartItems.reduce((sum, item) => {
        const cost = (item as { cost?: number | null }).cost;
        return sum + (cost ?? item.price) * item.quantity;
    }, 0);
    const minProfitRate = cartItems.reduce<number | null>((min, item) => {
        const pr = (item as { profitRate?: number | null }).profitRate;
        if (pr === null || pr === undefined) return min;
        return min === null ? pr : Math.min(min, pr);
    }, null);

    const baseShipFee = effectiveShipType && baseRow ? getRate(baseRow, effectiveShipType) : 0;
    const profit = (minProfitRate !== null && minProfitRate < 100)
        ? Math.ceil((itemsTotalCost + baseShipFee) * (minProfitRate / 100) / (1 - minProfitRate / 100))
        : 0;

    const surcharge = (() => {
        if (!isExtraRegion || !regionRow || !baseRow || !effectiveShipType) return 0;
        return Math.max(0, getRate(regionRow, effectiveShipType) - getRate(baseRow, effectiveShipType));
    })();

    const coolEligible = !matchedIsCompact && effectiveShipType !== null
        && coolSurchargeBySize(effectiveShipType) > 0
        && cartItems.some(i => (i as { coolAvailable?: boolean }).coolAvailable);
    const coolFee = coolEligible && coolRequested ? coolSurchargeBySize(effectiveShipType) : 0;

    const familyOptionsMap = new Map<string, OptionEntry[]>();
    cartItems.forEach(i => {
        const fam = (i as { family?: string }).family;
        const opts = (i as { familyOptions?: string }).familyOptions;
        if (fam && opts && !familyOptionsMap.has(fam)) {
            const parsed = parseFamilyOptions(opts);
            if (parsed.length > 0) familyOptionsMap.set(fam, parsed);
        }
    });
    const optionsAdjustment = (() => {
        let sum = 0;
        familyOptionsMap.forEach((opts, fam) => {
            opts.forEach(o => { if (selectedOptions.has(`${fam}:${o.label}`)) sum += o.amount; });
        });
        return sum;
    })();
    // 商品名に表示する用：割引（amount < 0）以外のオプションラベルを抽出
    const displayOptionLabels: string[] = [];
    familyOptionsMap.forEach((opts, fam) => {
        opts.forEach(o => {
            if (selectedOptions.has(`${fam}:${o.label}`) && o.amount >= 0) {
                displayOptionLabels.push(o.label);
            }
        });
    });

    const itemTaxedUnit = (item: { price: number; cost?: number | null }) => {
        const cost = item.cost ?? item.price;
        const others = Math.max(0, item.price - cost);
        return Math.round(cost * 1.08 + others * 1.10);
    };
    const saleDiscountTaxedTotal = cartItems.reduce((sum, item) => {
        const pct = (item as { salePercent?: number }).salePercent ?? 0;
        if (pct <= 0) return sum;
        const original = itemTaxedUnit(item as { price: number; cost?: number | null });
        const after = Math.ceil(original * (1 - pct / 100));
        return sum + (original - after) * item.quantity;
    }, 0);

    const itemsBodyNet = itemsTotalCost;
    const shipFeeNet = baseShipFee;
    const profitNet = matchedVariant
        ? Math.max(0, matchedVariant.price! - itemsTotalCost - baseShipFee)
        : profit;

    const itemsBodyShown = Math.round(itemsBodyNet * 1.08);
    const shipFeeShown = Math.round(shipFeeNet * 1.10);
    const profitShown = Math.round(profitNet * 1.10);
    const surchargeTaxed = Math.round(surcharge * 1.10);
    const coolFeeTaxed = Math.round(coolFee * 1.10);
    const optionsAdjustmentTaxed = Math.round(optionsAdjustment * 1.08);
    const saleDiscountTaxed = saleDiscountTaxedTotal;
    // サポーター割引はセール品を除いた通常商品代のみ
    const tierDiscountBase = cartItems.reduce((sum, item) => {
        const pct = (item as { salePercent?: number }).salePercent ?? 0;
        if (pct > 0) return sum;
        return sum + itemTaxedUnit(item as { price: number; cost?: number | null }) * item.quantity;
    }, 0);
    const tierDiscountAmount = tierDiscountRate > 0 ? Math.floor(tierDiscountBase * tierDiscountRate) : 0;

    const grandTotalBeforePoints = itemsBodyShown + shipFeeShown + profitShown + surchargeTaxed + coolFeeTaxed + optionsAdjustmentTaxed - saleDiscountTaxed - tierDiscountAmount;
    // ポイントは通常商品代金（割引後）・送料・サービス料に利用可。セール商品分のみ対象外。
    const saleItemsTaxedTotal = cartItems.reduce((sum, item) => {
        const pct = (item as { salePercent?: number }).salePercent ?? 0;
        if (pct <= 0) return sum;
        const original = itemTaxedUnit(item as { price: number; cost?: number | null });
        const after = Math.ceil(original * (1 - pct / 100));
        return sum + after * item.quantity;
    }, 0);
    const pointEligibleAmount = Math.max(0, grandTotalBeforePoints - saleItemsTaxedTotal);
    const maxPointsUsable = Math.min(pointsBalance, pointEligibleAmount);
    const effectivePointsToUse = Math.min(pointsToUse, maxPointsUsable);
    const grandTotal = Math.max(0, grandTotalBeforePoints - effectivePointsToUse);

    // カート内全商品の中で最も遅い「お届け開始日」を計算
    const cartEarliestDelivery = (() => {
        let latest: Date | null = null;
        for (const item of cartItems) {
            const mode = (item as { shipMode?: string }).shipMode ?? "";
            const val = (item as { shipValue?: string }).shipValue ?? "";
            const d = earliestDeliveryDate(mode, val);
            if (!d) continue;
            if (!latest || d > latest) latest = d;
        }
        return latest;
    })();

    // お届け希望日候補（最早お届け日から21日間、または通常は3日後〜21日後）
    const dateOptions = (() => {
        const arr: { value: string; label: string }[] = [];
        const WD = ["日", "月", "火", "水", "木", "金", "土"];
        const start = cartEarliestDelivery ?? (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d; })();
        for (let i = 0; i < 21; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const v = d.toISOString().slice(0, 10);
            const label = `${d.getMonth() + 1}/${d.getDate()}（${WD[d.getDay()]}）`;
            arr.push({ value: v, label });
        }
        return arr;
    })();

    const handleCheckout = async () => {
        if (!selectedAddress) {
            alert("配送先を選択してください");
            return;
        }

        const firstWithShip = cartItems.find(i => (i as { shipMode?: string }).shipMode);
        const cartShipMode = (firstWithShip as { shipMode?: string } | undefined)?.shipMode ?? "";
        const cartShipValue = (firstWithShip as { shipValue?: string } | undefined)?.shipValue ?? "";

        // 決済スキップモード
        if (skipMode) {
            try {
                const res = await fetch("/api/test-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cartDetails,
                        shippingAddress: selectedAddress,
                        desiredDeliveryDate: desiredDate,
                        desiredDeliveryTime: desiredTime,
                        grandTotal,
                        shipMode: cartShipMode,
                        shipValue: cartShipValue,
                    }),
                });
                if (!res.ok) { alert("テスト注文の作成に失敗しました"); return; }
                window.location.href = "/success";
            } catch (error) {
                console.error(error);
            }
            return;
        }

        try {
            const response = await fetch("/api/checkout_sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cartDetails,
                    shippingAddress: selectedAddress,
                    desiredDeliveryDate: desiredDate,
                    desiredDeliveryTime: desiredTime,
                    shipMode: cartShipMode,
                    shipValue: cartShipValue,
                    pointsUsed: effectivePointsToUse,
                    tierDiscount: tierDiscountAmount,
                    quote: {
                        matchedVariantId: matchedVariant?.id ?? null,
                        matchedVariantName: matchedVariant
                            ? (matchedVariant.family && !matchedVariant.name.includes(matchedVariant.family)
                                ? `${matchedVariant.family} ${matchedVariant.name}`
                                : matchedVariant.name)
                            : null,
                        itemsTotal: itemsBodyShown,
                        baseShipFee: shipFeeShown,
                        profit: profitShown,
                        surcharge: surchargeTaxed,
                        surchargeLabel: isExtraRegion ? `追加送料(${regionRow!.region})` : null,
                        coolFee: coolFeeTaxed,
                        shipSizeLabel: shipTypeLabel(effectiveShipType),
                        optionsAdjustment: optionsAdjustmentTaxed,
                        optionLabels: Array.from(selectedOptions),
                        optionDisplayLabels: displayOptionLabels,
                        saleDiscount: saleDiscountTaxed,
                    },
                }),
            });
            if (!response.ok) { console.error(await response.json()); return; }
            const { url } = await response.json();
            if (url) window.location.href = url;
        } catch (error) {
            console.error(error);
        }
    };

    if (cartCount === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-stone-50">
                <Header />
                <main className="flex-1 py-16">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
                        <p className="text-stone-500 mb-6">カートに商品は入っていません</p>
                        <Link href="/products" className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors">商品を探す</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-stone-50">
            <Header />
            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                    <Link href="/products" className="flex items-center gap-1 text-stone-500 hover:text-stone-700 text-sm mb-6">
                        <ChevronLeft className="w-4 h-4" />
                        買い物を続ける
                    </Link>
                    <h1 className="text-2xl font-bold text-stone-900 mb-4">カート</h1>

                    {/* サポーター割引バナー */}
                    {tierDiscountRate > 0 && (
                        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
                            <span className="text-lg">🌿</span>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-emerald-800">
                                    {tierName}会員割引が適用されます
                                </p>
                                <p className="text-xs text-emerald-600">
                                    通常商品に {Math.round(tierDiscountRate * 100)}% OFF（セール品・送料除く）
                                </p>
                            </div>
                            <span className="text-emerald-700 font-bold text-sm">
                                −¥{tierDiscountAmount.toLocaleString()}
                            </span>
                        </div>
                    )}

                    {/* 商品一覧 */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
                        {cartItems.map(item => {
                            const original = itemTaxedUnit(item as { price: number; cost?: number | null });
                            const pct = (item as { salePercent?: number }).salePercent ?? 0;
                            const display = pct > 0 ? Math.ceil(original * (1 - pct / 100)) : original;
                            return (
                                <div key={item.id} className="flex gap-4 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                                    <div className="h-20 w-20 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h3 className="font-bold text-stone-900">{item.name}</h3>
                                        <p className="text-sm text-stone-500">¥{display.toLocaleString()}</p>
                                        <div className="flex items-center gap-3 pt-2">
                                            <div className="flex items-center border border-stone-200 rounded-full">
                                                <button onClick={() => decrementItem(item.id)} className="p-1 hover:bg-stone-100 rounded-l-full">
                                                    <Minus className="h-4 w-4 text-stone-600" />
                                                </button>
                                                <span className="px-2 text-sm font-medium w-8 text-center">{item.quantity}</span>
                                                <button onClick={() => incrementItem(item.id)} className="p-1 hover:bg-stone-100 rounded-r-full">
                                                    <Plus className="h-4 w-4 text-stone-600" />
                                                </button>
                                            </div>
                                            <button onClick={() => removeItem(item.id)} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                                                <Trash2 className="h-3 w-3" />
                                                削除
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 配送先 */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                        <h2 className="font-bold text-stone-900 flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-primary" />
                            お届け先
                        </h2>
                        {!loaded ? (
                            <p className="text-sm text-stone-400">読み込み中...</p>
                        ) : addresses.length === 0 ? (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
                                <p className="text-orange-700 mb-2 font-medium">配送先が登録されていません</p>
                                <Link href="/mypage/address" className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-colors">
                                    配送先を登録する
                                </Link>
                            </div>
                        ) : !addressPickerOpen ? (
                            <div>
                                <div className="text-sm mb-2">
                                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full mr-2">{selectedAddress?.label}</span>
                                    <span className="text-stone-700 font-medium">{selectedAddress?.name}</span>
                                </div>
                                <p className="text-sm text-stone-500 mb-3">
                                    〒{selectedAddress?.postalCode} {selectedAddress?.prefecture}{selectedAddress?.city}{selectedAddress?.street}
                                    {selectedAddress?.building && ` ${selectedAddress.building}`}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-3 border-t border-stone-100">
                                    {addresses.length > 1 && (
                                        <button
                                            onClick={() => setAddressPickerOpen(true)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold rounded-lg transition-colors"
                                        >
                                            <MapPin className="w-3.5 h-3.5" />
                                            別の住所を選ぶ
                                        </button>
                                    )}
                                    <Link
                                        href="/mypage/address"
                                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-sm font-bold rounded-lg transition-colors"
                                    >
                                        住所を編集・追加する
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {addresses.map((addr, i) => (
                                    <div key={addr.label}
                                        onClick={() => { setSelectedAddressIdx(i); setAddressPickerOpen(false); }}
                                        className={`p-3 rounded-lg cursor-pointer border transition-colors ${i === selectedAddressIdx ? "border-primary bg-primary/5" : "border-stone-200 hover:bg-stone-50"}`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{addr.label}</span>
                                            <span className="text-sm font-medium text-stone-800">{addr.name}</span>
                                        </div>
                                        <p className="text-xs text-stone-500">{addr.prefecture}{addr.city}{addr.street}</p>
                                    </div>
                                ))}
                                <Link href="/mypage/address" className="block text-center border border-dashed border-stone-300 rounded-lg py-2 text-xs text-stone-500 hover:border-primary/50 hover:text-primary transition-colors">+ 配送先を追加</Link>
                            </div>
                        )}
                    </div>

                    {/* お届け希望日時（クリックポスト時は非表示） */}
                    {!isClickpost && (
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                            <h2 className="font-bold text-stone-900 flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5 text-primary" />
                                お届け希望日時
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-stone-500 mb-1">日付</label>
                                    <select value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)}
                                        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                        <option value="">指定なし</option>
                                        {dateOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-stone-500 mb-1">時間帯</label>
                                    <select value={desiredTime} onChange={(e) => setDesiredTime(e.target.value)}
                                        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <p className="text-xs text-stone-400 mt-2">※ 配送状況により希望どおりお届けできない場合があります</p>
                        </div>
                    )}
                    {isClickpost && (
                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6 text-sm text-stone-500">
                            ※ クリックポスト発送のため、お届け日時の指定はできません
                        </div>
                    )}

                    {/* オプション */}
                    {familyOptionsMap.size > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-2">
                            <h2 className="font-bold text-stone-900 mb-3">オプション</h2>
                            {Array.from(familyOptionsMap.entries()).map(([fam, opts]) => (
                                <div key={fam} className="space-y-1">
                                    {familyOptionsMap.size > 1 && <p className="text-xs text-stone-400">{fam}</p>}
                                    {opts.map(o => {
                                        const key = `${fam}:${o.label}`;
                                        const checked = selectedOptions.has(key);
                                        return (
                                            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer p-2 hover:bg-stone-50 rounded">
                                                <input type="checkbox" checked={checked} onChange={(e) => {
                                                    const next = new Set(selectedOptions);
                                                    if (e.target.checked) next.add(key); else next.delete(key);
                                                    setSelectedOptions(next);
                                                }} className="accent-primary" />
                                                <span className="flex-1 text-stone-700">{o.label}</span>
                                                <span className={`text-xs font-medium ${o.amount < 0 ? "text-emerald-600" : "text-orange-600"}`}>
                                                    {o.amount > 0 ? "+" : ""}¥{Math.round(o.amount * 1.08).toLocaleString()}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* まとめてお得！ */}
                    {(() => {
                        const cartFamiliesSet = new Set(cartItems.map(i => (i as { family?: string }).family).filter(Boolean) as string[]);
                        const cartIds = new Set(cartItems.map(i => i.id));
                        const filtered = suggestions.filter(s => {
                            if (s.isSoldOut) return false;
                            if (s.family && cartFamiliesSet.has(s.family)) return false;
                            if (cartIds.has(s.id)) return false;
                            return true;
                        }).slice(0, 6);
                        if (filtered.length === 0) return null;
                        return (
                            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                                <h2 className="font-bold text-stone-900 mb-4">まとめてお得！</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {filtered.map(s => (
                                        <Link key={s.id} href={s.href} className="group block">
                                            <div className="relative aspect-square bg-stone-100 rounded-lg overflow-hidden mb-2">
                                                {s.image && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={s.image} alt={s.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                                                )}
                                                {s.salePercent > 0 && (
                                                    <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                                        {s.salePercent}% OFF
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs font-medium text-stone-800 line-clamp-1 group-hover:text-primary">{s.name}</p>
                                            <p className={`text-sm font-bold ${s.salePercent > 0 ? "text-red-500" : "text-stone-900"}`}>
                                                ¥{s.displayPrice.toLocaleString()}{s.family ? "〜" : ""}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* クール便 */}
                    {coolEligible && effectiveShipType && coolSurchargeBySize(effectiveShipType) > 0 && (
                        <label className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={coolRequested} onChange={(e) => setCoolRequested(e.target.checked)} className="accent-blue-600" />
                            <span className="text-sm text-blue-800 flex-1">
                                ❄ クール便で配送（+¥{Math.round(coolSurchargeBySize(effectiveShipType) * 1.10).toLocaleString()}）
                            </span>
                        </label>
                    )}

                    {/* ポイント利用 */}
                    {pointsBalance > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                <h2 className="font-bold text-stone-900">ポイントを使う</h2>
                                <span className="text-xs text-stone-400 ml-auto">残高 {pointsBalance.toLocaleString()}pt</span>
                            </div>
                            {maxPointsUsable > 0 ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min={0}
                                            max={maxPointsUsable}
                                            step={1}
                                            value={pointsToUse}
                                            onChange={(e) => {
                                                const v = Math.max(0, Math.min(maxPointsUsable, parseInt(e.target.value) || 0));
                                                setPointsToUse(v);
                                            }}
                                            className="w-32 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                        <span className="text-sm text-stone-500">pt</span>
                                        <button
                                            onClick={() => setPointsToUse(maxPointsUsable)}
                                            className="text-xs text-primary hover:underline font-medium"
                                        >
                                            全て使う
                                        </button>
                                    </div>
                                    <p className="text-xs text-stone-500 mt-2">
                                        この注文では最大 {maxPointsUsable.toLocaleString()}pt（= ¥{maxPointsUsable.toLocaleString()}）まで利用できます。
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-stone-500">
                                    この注文ではポイントを利用できません。
                                </p>
                            )}
                            <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                                ポイントは通常商品の商品代金・送料・サービス料にご利用いただけます。セール商品・年会費・農業体験は対象外です。詳細は
                                <Link href="/point-terms" className="text-primary hover:underline">ポイント利用条件</Link>
                                をご覧ください。
                            </p>
                        </div>
                    )}

                    {/* 合計 */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-2 text-sm">
                        <div className="bg-stone-100/60 rounded-lg p-3 space-y-1">
                            <p className="text-stone-500 font-medium text-xs mb-1">内訳</p>
                            <div className="flex justify-between text-stone-600"><span>商品本体価格</span><span>¥{itemsBodyShown.toLocaleString()}</span></div>
                            {shipFeeShown > 0 && <div className="flex justify-between text-stone-600"><span>送料({shipTypeLabel(effectiveShipType)})</span><span>¥{shipFeeShown.toLocaleString()}</span></div>}
                            {profitShown > 0 && <div className="flex justify-between text-stone-600"><span>サービス料</span><span>¥{profitShown.toLocaleString()}</span></div>}
                        </div>
                        {tierDiscountAmount > 0 && <div className="flex justify-between text-emerald-600 font-medium"><span>🌿 {tierName}割引（{Math.round(tierDiscountRate * 100)}%OFF・セール品除く）</span><span>−¥{tierDiscountAmount.toLocaleString()}</span></div>}
                        {saleDiscountTaxed > 0 && <div className="flex justify-between text-red-500 font-medium"><span>セール割引</span><span>−¥{saleDiscountTaxed.toLocaleString()}</span></div>}
                        {effectivePointsToUse > 0 && <div className="flex justify-between text-yellow-600 font-medium"><span>⭐ ポイント割引</span><span>−¥{effectivePointsToUse.toLocaleString()}</span></div>}
                        {optionsAdjustmentTaxed !== 0 && <div className={`flex justify-between ${optionsAdjustmentTaxed < 0 ? "text-emerald-600" : "text-orange-600"} font-medium`}><span>オプション調整</span><span>{optionsAdjustmentTaxed > 0 ? "+" : "−"}¥{Math.abs(optionsAdjustmentTaxed).toLocaleString()}</span></div>}
                        {isExtraRegion && surchargeTaxed > 0 && <div className="flex justify-between text-orange-600"><span>追加送料({regionRow!.region})</span><span>+¥{surchargeTaxed.toLocaleString()}</span></div>}
                        {coolFeeTaxed > 0 && <div className="flex justify-between text-blue-600"><span>❄ クール便</span><span>+¥{coolFeeTaxed.toLocaleString()}</span></div>}
                        <div className="flex items-center justify-between text-lg font-bold text-stone-900 border-t border-stone-200 pt-3 mt-3">
                            <span>お支払い合計</span>
                            <span>¥{grandTotal.toLocaleString()}<span className="text-xs font-normal text-stone-500 ml-1">(税込)</span></span>
                        </div>
                    </div>

                    {skipMode && (
                        <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-sm text-amber-800">
                            <span className="text-base">🧪</span>
                            <span><b>決済スキップモード ON</b> — Stripeをスキップしてテスト注文を作成します</span>
                        </div>
                    )}
                    <button onClick={handleCheckout} disabled={!selectedAddress}
                        className={`w-full py-4 font-bold rounded-full transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                            skipMode
                                ? "bg-amber-400 hover:bg-amber-500 text-white"
                                : "bg-primary hover:bg-primary/90 text-white"
                        }`}>
                        {skipMode
                            ? (selectedAddress ? "🧪 テスト注文を作成" : "配送先を登録してください")
                            : (selectedAddress ? "お支払いへ進む" : "配送先を登録してください")}
                    </button>
                    {!skipMode && (
                        <p className="text-xs text-center text-stone-500 mt-3">
                            Stripeのセキュアな決済画面へ移動します。ご注文前に
                            <Link href="/tokusho" className="font-medium text-primary hover:underline">特定商取引法に基づく表示</Link>
                            をご確認ください。
                        </p>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
