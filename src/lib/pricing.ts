// カート合計金額の計算ロジック（サーバー側の正規計算用）。
// src/app/cart/page.tsx の表示用計算と同じ式を、クライアント入力を信頼しない形で再実装したもの。
// 価格・原価・利益率・セール率・オプション金額は必ずサーバーで取得した商品在庫（inventory）から参照し、
// クライアントから送られてくる価格情報は一切使用しない。

import { getEffectiveSalePercent } from "@/lib/sale";

export type ShippingRow = {
    region: string; prefectures: string;
    s60: number; s80: number; s100: number; s120: number;
    s140: number; s160: number; s180: number; s200: number;
    compact: number; clickpost: number;
};

export type InvItem = {
    id: string;
    name: string;
    price: number | null;
    family: string;
    shipType?: string;
    coolAvailable?: boolean;
    clickpostMax?: number;
    compactMax?: number;
    cost?: number | null;
    profitRate?: number | null;
    options?: string;
    salePercent?: number;
    saleStart?: string; // YYYY-MM-DD
    saleEnd?: string;   // YYYY-MM-DD
};

export type OptionEntry = { label: string; amount: number };

export function getRate(row: ShippingRow, shipType: string): number {
    const map: Record<string, keyof ShippingRow> = {
        "60": "s60", "80": "s80", "100": "s100", "120": "s120",
        "140": "s140", "160": "s160", "180": "s180", "200": "s200",
        "compact": "compact", "clickpost": "clickpost",
    };
    const key = map[shipType];
    return key ? (row[key] as number) : 0;
}

function normPref(p: string) { return p.replace(/[都道府県]$/, ""); }

export function findRegionRow(prefecture: string, rows: ShippingRow[]): ShippingRow | null {
    if (!rows.length) return null;
    const norm = normPref(prefecture);
    for (const row of rows) {
        const prefs = row.prefectures.split(",").map(p => normPref(p.trim()));
        if (prefs.includes(norm)) return row;
    }
    return rows[rows.length - 1];
}

export function findBaseRow(rows: ShippingRow[]): ShippingRow | null {
    return rows.length ? rows[rows.length - 1] : null;
}

export function extractWeightG(name: string): number {
    const kg = name.match(/(\d+(?:\.\d+)?)\s*kg/i);
    if (kg) return parseFloat(kg[1]) * 1000;
    const g = name.match(/(\d+(?:\.\d+)?)\s*g(?!l)/i);
    if (g) return parseFloat(g[1]);
    return 0;
}

export function weightToShipSize(totalG: number): string {
    if (totalG <= 2000) return "60";
    if (totalG <= 5000) return "80";
    if (totalG <= 10000) return "100";
    if (totalG <= 15000) return "120";
    if (totalG <= 20000) return "140";
    if (totalG <= 25000) return "160";
    if (totalG <= 30000) return "180";
    return "200";
}

export function shipTypeLabel(s: string | null): string {
    if (!s) return "";
    if (s === "compact") return "コンパクト";
    if (s === "clickpost") return "クリックポスト";
    return `${s}サイズ`;
}

export function coolSurchargeBySize(shipType: string | null): number {
    if (!shipType) return 0;
    if (shipType === "60") return 250;
    if (shipType === "80") return 300;
    if (shipType === "100") return 400;
    if (shipType === "120") return 650;
    return 0;
}

export function parseFamilyOptions(s: string | undefined): OptionEntry[] {
    if (!s?.trim()) return [];
    return s.split("|").map(p => {
        const [label, amountStr] = p.split(":");
        return { label: label?.trim() ?? "", amount: parseInt(amountStr ?? "0", 10) || 0 };
    }).filter(e => e.label);
}

function itemTaxedUnit(price: number, cost: number | null | undefined): number {
    const c = cost ?? price;
    const others = Math.max(0, price - c);
    return Math.round(c * 1.08 + others * 1.10);
}

export type ServerCartLine = { id: string; quantity: number };

export type ItemDisplay = {
    id: string;
    quantity: number;
    displayUnitPrice: number; // 税込・セール適用後の単価（原価は含まない）
};

export type PricingResult = {
    itemsBodyShown: number;
    shipFeeShown: number;
    profitShown: number;
    surchargeTaxed: number;
    coolFeeTaxed: number;
    optionsAdjustmentTaxed: number;
    saleDiscountTaxed: number;
    tierDiscountAmount: number;
    effectivePointsToUse: number;
    maxPointsUsable: number;
    grandTotal: number;
    shipSizeLabel: string;
    displayOptionLabels: string[];
    matchedVariantId: string | null;
    surchargeLabel: string | null;
    isClickpost: boolean;
    coolEligible: boolean;
    items: ItemDisplay[];
};

// クライアントからは商品ID・数量・希望オプション・クール便希望のみを受け取り、
// 金額に関わる値（単価・原価・セール率・オプション金額・tier割引率・保有ポイント）は
// すべてサーバー側で取得した inventory / shippingRows / tierDiscountRate / pointsBalance から算出する。
export function computeCartPricing(params: {
    cartLines: ServerCartLine[];
    inventory: InvItem[];
    shippingRows: ShippingRow[];
    prefecture: string | null;
    selectedOptionKeys: Set<string>; // "family:label"
    coolRequested: boolean;
    tierDiscountRate: number;
    pointsBalance: number;
    pointsToUse: number;
    seasonalDiscountPercent?: number; // 現在有効な季節セールの割引率（商品個別セールとは二重取りせず高い方を採用）
}): PricingResult {
    const { cartLines, inventory, shippingRows, prefecture, selectedOptionKeys, coolRequested, tierDiscountRate, pointsBalance, pointsToUse, seasonalDiscountPercent = 0 } = params;

    const cartItems = cartLines
        .map(line => {
            const inv = inventory.find(v => v.id === line.id);
            if (!inv || inv.price === null) return null;
            const effectivePercent = getEffectiveSalePercent(inv.salePercent ?? 0, inv.saleStart ?? "", inv.saleEnd ?? "", seasonalDiscountPercent);
            return { ...inv, price: inv.price, quantity: Math.max(1, Math.floor(line.quantity)), salePercent: effectivePercent };
        })
        .filter((x): x is InvItem & { price: number; quantity: number; salePercent: number } => x !== null);

    const regionRow = prefecture ? findRegionRow(prefecture, shippingRows) : null;
    const baseRow = findBaseRow(shippingRows);
    const isExtraRegion = !!(regionRow && baseRow && regionRow !== baseRow);

    const totalWeightG = cartItems.reduce((sum, item) => sum + extractWeightG(item.name) * item.quantity, 0);
    const weightBasedShipType = totalWeightG > 0 ? weightToShipSize(totalWeightG) : null;

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartFamilies = new Set(cartItems.map(i => i.family).filter(Boolean));

    const matchedVariant: InvItem | null = (() => {
        if (cartFamilies.size !== 1 || inventory.length === 0) return null;
        if (totalWeightG <= 0) return null;
        const family = [...cartFamilies][0];
        const variants = inventory.filter(v => v.family === family);
        const match = variants.find(v => extractWeightG(v.name) === totalWeightG && v.price !== null);
        if (variants.length === 1 && cartItems.length === 1 && cartItems[0].quantity === 1) return null;
        return match ?? null;
    })();
    const matchedIsCompact = matchedVariant?.shipType === "compact";

    const clickpostMaxes = cartItems.map(i => i.clickpostMax ?? 0);
    const allClickpostable = clickpostMaxes.length > 0 && clickpostMaxes.every(m => m > 0);
    const minClickpostMax = allClickpostable ? Math.min(...clickpostMaxes) : 0;
    const isClickpost = allClickpostable && totalQuantity <= minClickpostMax;

    const singleItemShipType = cartItems.length === 1 ? (cartItems[0].shipType || "") : "";
    const isCompactOverflow = (() => {
        if (cartItems.length === 0) return false;
        if (!cartItems.every(i => i.shipType === "compact")) return false;
        const compactMaxes = cartItems.map(i => i.compactMax ?? 0);
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

    const itemsTotalCost = cartItems.reduce((sum, item) => sum + (item.cost ?? item.price) * item.quantity, 0);
    const minProfitRate = cartItems.reduce<number | null>((min, item) => {
        const pr = item.profitRate;
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
        && cartItems.some(i => i.coolAvailable);
    const coolFee = coolEligible && coolRequested ? coolSurchargeBySize(effectiveShipType) : 0;

    const familyOptionsMap = new Map<string, OptionEntry[]>();
    cartItems.forEach(i => {
        if (i.family && i.options && !familyOptionsMap.has(i.family)) {
            const parsed = parseFamilyOptions(i.options);
            if (parsed.length > 0) familyOptionsMap.set(i.family, parsed);
        }
    });
    const optionsAdjustment = (() => {
        let sum = 0;
        familyOptionsMap.forEach((opts, fam) => {
            opts.forEach(o => { if (selectedOptionKeys.has(`${fam}:${o.label}`)) sum += o.amount; });
        });
        return sum;
    })();
    const displayOptionLabels: string[] = [];
    familyOptionsMap.forEach((opts, fam) => {
        opts.forEach(o => {
            if (selectedOptionKeys.has(`${fam}:${o.label}`) && o.amount >= 0) {
                displayOptionLabels.push(o.label);
            }
        });
    });

    const saleDiscountTaxedTotal = cartItems.reduce((sum, item) => {
        const pct = item.salePercent ?? 0;
        if (pct <= 0) return sum;
        const original = itemTaxedUnit(item.price, item.cost);
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

    const tierDiscountBase = cartItems.reduce((sum, item) => {
        const pct = item.salePercent ?? 0;
        if (pct > 0) return sum;
        return sum + itemTaxedUnit(item.price, item.cost) * item.quantity;
    }, 0);
    const tierDiscountAmount = tierDiscountRate > 0 ? Math.floor(tierDiscountBase * tierDiscountRate) : 0;

    const grandTotalBeforePoints = itemsBodyShown + shipFeeShown + profitShown + surchargeTaxed + coolFeeTaxed + optionsAdjustmentTaxed - saleDiscountTaxed - tierDiscountAmount;

    const saleItemsTaxedTotal = cartItems.reduce((sum, item) => {
        const pct = item.salePercent ?? 0;
        if (pct <= 0) return sum;
        const original = itemTaxedUnit(item.price, item.cost);
        const after = Math.ceil(original * (1 - pct / 100));
        return sum + after * item.quantity;
    }, 0);
    const pointEligibleAmount = Math.max(0, grandTotalBeforePoints - saleItemsTaxedTotal);
    const maxPointsUsable = Math.min(Math.max(0, pointsBalance), pointEligibleAmount);
    const effectivePointsToUse = Math.min(Math.max(0, Math.floor(pointsToUse)), maxPointsUsable);

    const grandTotal = Math.max(0, grandTotalBeforePoints - effectivePointsToUse);

    const items: ItemDisplay[] = cartItems.map(item => {
        const original = itemTaxedUnit(item.price, item.cost);
        const pct = item.salePercent ?? 0;
        const displayUnitPrice = pct > 0 ? Math.ceil(original * (1 - pct / 100)) : original;
        return { id: item.id, quantity: item.quantity, displayUnitPrice };
    });

    return {
        itemsBodyShown,
        shipFeeShown,
        profitShown,
        surchargeTaxed,
        coolFeeTaxed,
        optionsAdjustmentTaxed,
        saleDiscountTaxed,
        tierDiscountAmount,
        effectivePointsToUse,
        maxPointsUsable,
        grandTotal,
        shipSizeLabel: shipTypeLabel(effectiveShipType),
        displayOptionLabels,
        matchedVariantId: matchedVariant?.id ?? null,
        surchargeLabel: isExtraRegion && regionRow ? `追加送料(${regionRow.region})` : null,
        isClickpost,
        coolEligible,
        items,
    };
}
