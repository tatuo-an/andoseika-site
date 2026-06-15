"use client";

import { useShoppingCart } from "use-shopping-cart";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

type ShippingRow = {
    region: string;
    prefectures: string;
    s60: number; s80: number; s100: number; s120: number;
    s140: number; s160: number; s180: number; s200: number;
    compact: number; clickpost: number;
};

function getRate(row: ShippingRow, shipType: string): number {
    const map: Record<string, keyof ShippingRow> = {
        "60": "s60", "80": "s80", "100": "s100", "120": "s120",
        "140": "s140", "160": "s160", "180": "s180", "200": "s200",
        "compact": "compact", "clickpost": "clickpost",
    };
    const key = map[shipType];
    return key ? (row[key] as number) : 0;
}

// 都道府県の末尾「都道府県」を除いて正規化（例:「沖縄」「沖縄県」→「沖縄」）
function normPref(p: string) { return p.replace(/[都道府県]$/, ""); }

function findRegionRow(prefecture: string, rows: ShippingRow[]): ShippingRow | null {
    if (!rows.length) return null;
    const norm = normPref(prefecture);
    for (const row of rows) {
        const prefs = row.prefectures.split(",").map(p => normPref(p.trim()));
        if (prefs.includes(norm)) return row;
    }
    return rows[rows.length - 1]; // それ以外
}

function findBaseRow(rows: ShippingRow[]): ShippingRow | null {
    return rows.length ? rows[rows.length - 1] : null;
}

// 商品名から重量(g)を抽出
function extractWeightG(name: string): number {
    const kg = name.match(/(\d+(?:\.\d+)?)\s*kg/i);
    if (kg) return parseFloat(kg[1]) * 1000;
    const g = name.match(/(\d+(?:\.\d+)?)\s*g(?!l)/i); // "g"のみ (glは除外)
    if (g) return parseFloat(g[1]);
    return 0;
}

// 合計重量(g) → ヤマト宅配便サイズ
function weightToShipSize(totalG: number): string {
    if (totalG <=  2000) return "60";
    if (totalG <=  5000) return "80";
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

// クール便加算（税抜）。140以上はクール便対応外（0を返す）
function coolSurchargeBySize(shipType: string | null): number {
    if (!shipType) return 0;
    if (shipType === "60") return 250;
    if (shipType === "80") return 300;
    if (shipType === "100") return 400;
    if (shipType === "120") return 650;
    return 0; // 140以上はクール便なし
}

// 送料マスタが未設定の場合のデフォルト値（ヤマト運輸 中国エリア発）
const DEFAULT_SHIPPING: ShippingRow[] = [
    { region: "北海道", prefectures: "北海道", s60: 1200, s80: 1400, s100: 1600, s120: 1750, s140: 2000, s160: 2200, s180: 2400, s200: 2600, compact: 990, clickpost: 185 },
    { region: "東北", prefectures: "青森県,岩手県,宮城県,秋田県,山形県,福島県", s60: 800, s80: 1000, s100: 1200, s120: 1400, s140: 1600, s160: 1800, s180: 2000, s200: 2200, compact: 790, clickpost: 185 },
    { region: "沖縄", prefectures: "沖縄県", s60: 1200, s80: 1700, s100: 2200, s120: 2700, s140: 3200, s160: 3700, s180: 4200, s200: 4900, compact: 790, clickpost: 185 },
    { region: "それ以外", prefectures: "東京都,神奈川県,埼玉県,千葉県,茨城県,栃木県,群馬県,新潟県,富山県,石川県,福井県,山梨県,長野県,岐阜県,静岡県,愛知県,三重県,滋賀県,京都府,大阪府,兵庫県,奈良県,和歌山県,鳥取県,島根県,岡山県,広島県,山口県,徳島県,香川県,愛媛県,高知県,福岡県,佐賀県,長崎県,熊本県,大分県,宮崎県,鹿児島県", s60: 600, s80: 700, s100: 800, s120: 1000, s140: 1200, s160: 1400, s180: 1600, s200: 1800, compact: 690, clickpost: 185 },
];

type InvItem = { id: string; name: string; price: number | null; family: string; coolAvailable?: boolean; shipType?: string; clickpostMax?: number; cost?: number | null; profitRate?: number | null };

// カートのitemに保存されたフィールドが欠落していても、inventoryから復元する
function enrichItem<T extends { id: string }>(item: T, inventory: InvItem[]): T {
    const inv = inventory.find(v => v.id === item.id);
    if (!inv) return item;
    const it = item as T & { cost?: number | null; profitRate?: number | null; shipType?: string; coolAvailable?: boolean; clickpostMax?: number; family?: string };
    return {
        ...item,
        cost: it.cost ?? inv.cost ?? null,
        profitRate: it.profitRate ?? inv.profitRate ?? null,
        shipType: it.shipType || inv.shipType || "",
        coolAvailable: it.coolAvailable ?? inv.coolAvailable ?? false,
        clickpostMax: it.clickpostMax ?? inv.clickpostMax ?? 0,
        family: it.family || inv.family || "",
    } as T;
}
type OptionEntry = { label: string; amount: number };
function parseFamilyOptions(s: string): OptionEntry[] {
    if (!s?.trim()) return [];
    return s.split("|").map(p => {
        const [label, amountStr] = p.split(":");
        return { label: label?.trim() ?? "", amount: parseInt(amountStr ?? "0", 10) || 0 };
    }).filter(e => e.label);
}
type AddressItem = { label: string; name: string; postalCode: string; prefecture: string; city: string; street: string; building: string; phone: string };

export function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { cartDetails, removeItem, incrementItem, decrementItem, cartCount } = useShoppingCart();

    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
    const [addressPickerOpen, setAddressPickerOpen] = useState(false);
    const [shippingRows, setShippingRows] = useState<ShippingRow[]>([]);
    const [inventory, setInventory] = useState<InvItem[]>([]);
    const [addressLoaded, setAddressLoaded] = useState(false);
    const [coolRequested, setCoolRequested] = useState(false);
    // 選択中のファミリーオプション: { "family名:ラベル": true }
    const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!isOpen || addressLoaded) return;
        Promise.all([
            fetch("/api/address").then(r => r.json()).catch(() => ({ addresses: [] })),
            fetch("/api/shipping").then(r => r.json()).catch(() => ({ shipping: [] })),
            fetch("/api/inventory-public").then(r => r.json()).catch(() => ({ inventory: [] })),
        ]).then(([addrData, shipData, invData]) => {
            setAddresses(addrData.addresses ?? []);
            setSelectedAddressIdx(0);
            setShippingRows(shipData.shipping?.length ? shipData.shipping : DEFAULT_SHIPPING);
            setInventory(invData.inventory ?? []);
            setAddressLoaded(true);
        });
    }, [isOpen, addressLoaded]);

    const selectedAddress = addresses[selectedAddressIdx] ?? null;
    const prefecture = selectedAddress?.prefecture ?? null;
    const regionRow = prefecture ? findRegionRow(prefecture, shippingRows) : null;
    const baseRow = findBaseRow(shippingRows);
    const isExtraRegion = regionRow && baseRow && regionRow !== baseRow;

    const rawCartItems = Object.values(cartDetails ?? {});
    // inventory から原価・利益率などを復元
    const cartItems = rawCartItems.map(item => enrichItem(item, inventory));
    const totalWeightG = cartItems.reduce((sum, item) => sum + extractWeightG(item.name) * item.quantity, 0);
    const weightBasedShipType = totalWeightG > 0 ? weightToShipSize(totalWeightG) : null;

    // ファミリーマッチ判定: 全アイテムが同ファミリーで、合計重量が単一バリエーションと一致
    const cartFamilies = new Set(cartItems.map(i => (i as { family?: string }).family).filter(Boolean) as string[]);
    const matchedVariant: InvItem | null = (() => {
        if (cartFamilies.size !== 1 || inventory.length === 0) return null;
        if (totalWeightG <= 0) return null; // 重量が取れない商品名（"1玉"等）はマッチング無効
        const family = [...cartFamilies][0];
        const variants = inventory.filter(v => v.family === family);
        return variants.find(v => extractWeightG(v.name) === totalWeightG && v.price !== null) ?? null;
    })();

    // 原価合計・最低利益率
    const itemsTotalCost = cartItems.reduce((sum, item) => {
        const cost = (item as { cost?: number | null }).cost;
        return sum + (cost ?? item.price) * item.quantity;
    }, 0);
    const minProfitRate = cartItems.reduce<number | null>((min, item) => {
        const pr = (item as { profitRate?: number | null }).profitRate;
        if (pr === null || pr === undefined) return min;
        return min === null ? pr : Math.min(min, pr);
    }, null);

    // 単体×nでマッチした場合はそのバリエーションの配送区分を優先する
    const matchedInv = matchedVariant ? inventory.find(v => v.id === matchedVariant.id) : null;
    const matchedIsCompact = matchedInv?.shipType === "compact";

    // クリックポスト判定:
    // - カート内の全アイテムに clickpostMax > 0 が設定されている
    // - 合計数量 <= min(clickpostMax)
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const clickpostMaxes = cartItems.map(i => (i as { clickpostMax?: number }).clickpostMax ?? 0);
    const allClickpostable = clickpostMaxes.length > 0 && clickpostMaxes.every(m => m > 0);
    const minClickpostMax = allClickpostable ? Math.min(...clickpostMaxes) : 0;
    const isClickpost = allClickpostable && totalQuantity <= minClickpostMax;

    const effectiveShipType = isClickpost
        ? "clickpost"
        : (cartItems.length === 1 && matchedInv?.shipType)
            ? matchedInv.shipType
            : weightBasedShipType;

    const baseShipFee = effectiveShipType && baseRow ? getRate(baseRow, effectiveShipType) : 0;
    // サービス料は 販売価格 = (原価+送料) / (1 - 利益率/100) から逆算した利益分
    // 利益 = 販売価格 - (原価+送料) = (原価+送料) × 利益率/100 / (1 - 利益率/100)
    const profit = (minProfitRate !== null && minProfitRate < 100)
        ? Math.ceil((itemsTotalCost + baseShipFee) * (minProfitRate / 100) / (1 - minProfitRate / 100))
        : 0;

    const surcharge = (() => {
        if (!isExtraRegion || !regionRow || !baseRow || !effectiveShipType) return 0;
        return Math.max(0, getRate(regionRow, effectiveShipType) - getRate(baseRow, effectiveShipType));
    })();

    // クール便判定:
    //   1. カート内のいずれかが coolAvailable=true
    //   2. かつ「実効発送サイズ」が60~120（コンパクト/クリックポスト/140以上は不可）
    const coolEligible = !matchedIsCompact
        && effectiveShipType !== null
        && coolSurchargeBySize(effectiveShipType) > 0
        && cartItems.some(i => (i as { coolAvailable?: boolean }).coolAvailable);
    const coolFee = coolEligible && coolRequested ? coolSurchargeBySize(effectiveShipType) : 0;

    // ファミリーオプションを集約: { familyName: OptionEntry[] }
    const familyOptionsMap = new Map<string, OptionEntry[]>();
    cartItems.forEach(i => {
        const fam = (i as { family?: string }).family;
        const opts = (i as { familyOptions?: string }).familyOptions;
        if (fam && opts && !familyOptionsMap.has(fam)) {
            const parsed = parseFamilyOptions(opts);
            if (parsed.length > 0) familyOptionsMap.set(fam, parsed);
        }
    });

    // 選択されたオプションの合計（税抜）
    const optionsAdjustment = (() => {
        let sum = 0;
        familyOptionsMap.forEach((opts, fam) => {
            opts.forEach(o => {
                if (selectedOptions.has(`${fam}:${o.label}`)) sum += o.amount;
            });
        });
        return sum;
    })();

    // 税込み単価計算（item.price は割引前の税抜き販売価格）
    const itemTaxedUnit = (item: { price: number; cost?: number | null }) => {
        const cost = item.cost ?? item.price;
        const others = Math.max(0, item.price - cost);
        return Math.round(cost * 1.08 + others * 1.10);
    };
    // セール割引合計（税込）= Σ((元税込単価 - セール後税込単価) × qty)
    const saleDiscountTaxedTotal = cartItems.reduce((sum, item) => {
        const pct = (item as { salePercent?: number }).salePercent ?? 0;
        if (pct <= 0) return sum;
        const original = itemTaxedUnit(item as { price: number; cost?: number | null });
        const after = Math.ceil(original * (1 - pct / 100));
        return sum + (original - after) * item.quantity;
    }, 0);

    // 税抜きの内訳（本体・送料・サービス料）
    const itemsBodyNet = itemsTotalCost;
    const shipFeeNet = baseShipFee;
    const profitNet = matchedVariant
        ? Math.max(0, matchedVariant.price! - itemsTotalCost - baseShipFee)
        : profit;

    // 税込み変換: 本体=8%, 送料/サービス料/追加送料/クール便=10%
    const itemsBodyShown = Math.round(itemsBodyNet * 1.08);
    const shipFeeShown = Math.round(shipFeeNet * 1.10);
    const profitShown = Math.round(profitNet * 1.10);
    const surchargeTaxed = Math.round(surcharge * 1.10);
    const coolFeeTaxed = Math.round(coolFee * 1.10);
    // オプション調整（本体価格扱い: 8%）
    const optionsAdjustmentTaxed = Math.round(optionsAdjustment * 1.08);
    // セール割引（税込）
    const saleDiscountTaxed = saleDiscountTaxedTotal;

    const grandTotal = itemsBodyShown + shipFeeShown + profitShown + surchargeTaxed + coolFeeTaxed + optionsAdjustmentTaxed - saleDiscountTaxed;

    if (!isOpen) return null;

    const handleCheckout = async () => {
        if (!selectedAddress) {
            alert("配送先を選択してください");
            return;
        }
        try {
            const response = await fetch("/api/checkout_sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cartDetails,
                    shippingAddress: selectedAddress,
                    quote: {
                        matchedVariantId: matchedVariant?.id ?? null,
                        matchedVariantName: matchedVariant?.name ?? null,
                        itemsTotal: itemsBodyShown,
                        baseShipFee: shipFeeShown,
                        profit: profitShown,
                        surcharge: surchargeTaxed,
                        surchargeLabel: isExtraRegion ? `追加送料（${regionRow!.region}）` : null,
                        coolFee: coolFeeTaxed,
                        shipSizeLabel: shipTypeLabel(effectiveShipType),
                        optionsAdjustment: optionsAdjustmentTaxed,
                        optionLabels: Array.from(selectedOptions),
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

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                        ショッピングカート
                        <span className="text-sm font-normal text-stone-500">({cartCount}点)</span>
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                        <X className="h-5 w-5 text-stone-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cartCount === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-stone-500 space-y-4">
                            <p>カートに商品は入っていません</p>
                            <button onClick={onClose} className="text-primary font-bold hover:underline">
                                買い物を続ける
                            </button>
                        </div>
                    ) : (
                        Object.values(cartDetails ?? {}).map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="h-20 w-20 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-bold text-stone-900">{item.name}</h3>
                                    <p className="text-sm text-stone-500">¥{(() => {
                                        const original = itemTaxedUnit(item as { price: number; cost?: number | null });
                                        const pct = (item as { salePercent?: number }).salePercent ?? 0;
                                        const display = pct > 0 ? Math.ceil(original * (1 - pct / 100)) : original;
                                        return display.toLocaleString();
                                    })()}</p>
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
                        ))
                    )}
                </div>

                {cartCount! > 0 && (
                    <div className="p-6 border-t border-stone-100 bg-stone-50 space-y-3">
                        {/* 内訳表示 */}
                        {addressLoaded && (() => {
                            // 単品購入時価格の合計（税込・セール反映）
                            const singlePurchaseTotal = cartItems.reduce((sum, item) => {
                                const original = itemTaxedUnit(item as { price: number; cost?: number | null });
                                const pct = (item as { salePercent?: number }).salePercent ?? 0;
                                const display = pct > 0 ? Math.ceil(original * (1 - pct / 100)) : original;
                                return sum + display * item.quantity;
                            }, 0);
                            const bundledTotal = itemsBodyShown + shipFeeShown + profitShown; // 追加送料・クール抜きの本体合計（税込）
                            const bundleDiscount = singlePurchaseTotal - bundledTotal;
                            // カートが「1種類のみ」の場合は同梱割引を表示しない
                            const isSingleVariantPurchase = cartItems.length === 1;
                            const showBundleDiscount = bundleDiscount !== 0 && !isSingleVariantPurchase;

                            return (
                                <div className="text-sm space-y-2">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-stone-600">
                                            <span>単品購入時価格の合計</span>
                                            <span>¥{singlePurchaseTotal.toLocaleString()}</span>
                                        </div>
                                        {showBundleDiscount && (
                                            <div className="flex justify-between text-emerald-600 font-medium">
                                                <span>同梱割引</span>
                                                <span>{bundleDiscount > 0 ? "−" : "+"}¥{Math.abs(bundleDiscount).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 内訳 */}
                                    <div className="bg-stone-100/60 rounded-lg p-3 space-y-1 text-xs">
                                        <p className="text-stone-500 font-medium mb-1">内訳</p>
                                        <div className="flex justify-between text-stone-600">
                                            <span>商品本体価格</span>
                                            <span>¥{itemsBodyShown.toLocaleString()}</span>
                                        </div>
                                        {shipFeeShown > 0 && (
                                            <div className="flex justify-between text-stone-600">
                                                <span>送料（{shipTypeLabel(effectiveShipType)}）</span>
                                                <span>¥{shipFeeShown.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {profitShown > 0 && (
                                            <div className="flex justify-between text-stone-600">
                                                <span>サービス料</span>
                                                <span>¥{profitShown.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {saleDiscountTaxed > 0 && (
                                        <div className="flex justify-between text-red-500 font-medium">
                                            <span>セール割引</span>
                                            <span>−¥{saleDiscountTaxed.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {optionsAdjustmentTaxed !== 0 && (
                                        <div className={`flex justify-between ${optionsAdjustmentTaxed < 0 ? "text-emerald-600" : "text-orange-600"} font-medium`}>
                                            <span>オプション調整</span>
                                            <span>{optionsAdjustmentTaxed > 0 ? "+" : "−"}¥{Math.abs(optionsAdjustmentTaxed).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {isExtraRegion && surchargeTaxed > 0 && (
                                        <div className="flex justify-between text-orange-600">
                                            <span>追加送料（{regionRow!.region}）</span>
                                            <span>+¥{surchargeTaxed.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {coolFeeTaxed > 0 && (
                                        <div className="flex justify-between text-blue-600">
                                            <span>❄ クール便</span>
                                            <span>+¥{coolFeeTaxed.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                        {/* ファミリーオプション */}
                        {familyOptionsMap.size > 0 && (
                            <div className="bg-white border border-stone-200 rounded-lg p-3 space-y-2">
                                <p className="text-xs font-bold text-stone-500">オプション</p>
                                {Array.from(familyOptionsMap.entries()).map(([fam, opts]) => (
                                    <div key={fam} className="space-y-1">
                                        {familyOptionsMap.size > 1 && (
                                            <p className="text-[10px] text-stone-400">{fam}</p>
                                        )}
                                        {opts.map(o => {
                                            const key = `${fam}:${o.label}`;
                                            const checked = selectedOptions.has(key);
                                            return (
                                                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            const next = new Set(selectedOptions);
                                                            if (e.target.checked) next.add(key);
                                                            else next.delete(key);
                                                            setSelectedOptions(next);
                                                        }}
                                                        className="accent-primary"
                                                    />
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

                        {/* クール便オプション */}
                        {coolEligible && effectiveShipType && coolSurchargeBySize(effectiveShipType) > 0 && (
                            <label className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={coolRequested}
                                    onChange={(e) => setCoolRequested(e.target.checked)}
                                    className="accent-blue-600"
                                />
                                <span className="text-sm text-blue-800 flex-1">
                                    ❄ クール便で配送（+¥{Math.round(coolSurchargeBySize(effectiveShipType) * 1.10).toLocaleString()}）
                                </span>
                            </label>
                        )}

                        {addressLoaded && !prefecture && (
                            <p className="text-xs text-orange-500">
                                <Link href="/mypage/address" className="underline font-medium">住所を登録</Link>すると正確な送料が計算されます
                            </p>
                        )}

                        <div className="flex items-center justify-between text-lg font-bold text-stone-900 border-t border-stone-200 pt-3">
                            <span>お支払い合計</span>
                            <span>¥{grandTotal.toLocaleString()}<span className="text-xs font-normal text-stone-500 ml-1">（税込）</span></span>
                        </div>

                        <Link
                            href="/cart"
                            onClick={onClose}
                            className="block w-full py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors shadow-lg text-center"
                        >
                            カートを見る
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
