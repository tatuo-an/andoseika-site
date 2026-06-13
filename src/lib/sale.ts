/**
 * セールが現在有効か判定
 * @param salePercent 割引率(%)
 * @param saleStart 開始日 (YYYY-MM-DD, 空ならStartなし=過去から有効)
 * @param saleEnd 終了日 (YYYY-MM-DD, 空ならEndなし=未来まで有効)
 * @param now 判定基準日時（省略時は現在時刻）
 */
export function isSaleActive(salePercent: number, saleStart: string, saleEnd: string, now: Date = new Date()): boolean {
    if (!salePercent || salePercent <= 0) return false;
    const today = now.toISOString().slice(0, 10); // YYYY-MM-DD (UTC基準だが日付比較なので実用十分)
    if (saleStart && today < saleStart) return false;
    if (saleEnd && today > saleEnd) return false;
    return true;
}

/** セール価格 = 通常販売価格 × (1 - 割引率/100)、切り上げ */
export function calcSalePrice(originalPrice: number, salePercent: number): number {
    return Math.ceil(originalPrice * (1 - salePercent / 100));
}
