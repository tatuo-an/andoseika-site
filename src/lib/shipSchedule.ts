// 発送モード→表示用テキストを生成
const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const DELIVERY_BUFFER_DAYS = 2; // 発送から到着までの目安

export type ScheduleDisplay = {
    shippingLabel: string; // 例: "ご注文後 3〜5日以内に発送"
    deliveryLabel: string; // 例: "お届け予定: 6/17〜6/19頃"
};

/**
 * 発送モードに応じた発送・お届け予定の表示テキスト
 */
export function computeShipSchedule(shipMode: string, shipValue: string, now: Date = new Date()): ScheduleDisplay | null {
    if (!shipMode) return null;

    if (shipMode === "arrival") {
        return {
            shippingLabel: "入荷後順次発送",
            deliveryLabel: "発送後 1〜2日程度でお届け",
        };
    }

    if (!shipValue) return null;

    if (shipMode === "days") {
        const [minStr, maxStr] = shipValue.split("-");
        const minN = parseInt(minStr, 10);
        const maxN = parseInt(maxStr, 10);
        if (isNaN(minN) || isNaN(maxN)) return null;
        return {
            shippingLabel: minN === maxN
                ? `ご注文後 ${minN}日以内に発送`
                : `ご注文後 ${minN}〜${maxN}日以内に発送`,
            deliveryLabel: `発送後 1〜2日程度でお届け`,
        };
    }

    if (shipMode === "weekdays") {
        const selectedLabels = shipValue.split(",").map(s => s.trim()).filter(Boolean);
        const selectedIndices = selectedLabels
            .map(l => WEEKDAY_LABELS.indexOf(l))
            .filter(i => i >= 0);
        if (selectedIndices.length === 0) return null;
        return {
            shippingLabel: `毎週 ${selectedLabels.join("・")}曜日に発送`,
            deliveryLabel: `発送後1〜2日程度でお届け`,
        };
    }

    return null;
}

/**
 * 最早のお届け開始日（Dateオブジェクト）を返す。発送日 + バッファ日数。
 */
export function earliestDeliveryDate(shipMode: string, shipValue: string, now: Date = new Date()): Date | null {
    if (!shipMode || !shipValue) return null;
    if (shipMode === "days") {
        const [minStr] = shipValue.split("-");
        const minN = parseInt(minStr, 10);
        if (isNaN(minN)) return null;
        const d = new Date(now);
        d.setDate(now.getDate() + minN + DELIVERY_BUFFER_DAYS);
        return d;
    }
    if (shipMode === "weekdays") {
        const selected = shipValue.split(",").map(s => s.trim()).filter(Boolean);
        const indices = selected.map(l => WEEKDAY_LABELS.indexOf(l)).filter(i => i >= 0);
        if (indices.length === 0) return null;
        for (let i = 1; i <= 14; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() + i);
            if (indices.includes(d.getDay())) {
                d.setDate(d.getDate() + DELIVERY_BUFFER_DAYS);
                return d;
            }
        }
    }
    return null;
}
