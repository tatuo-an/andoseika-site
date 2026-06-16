export const CANCEL_POLICY = [
    {
        title: "お客様都合によるキャンセル",
        items: [
            "予約日の3日前まで：キャンセル料無料",
            "予約日の2日前・前日：体験料金の50%",
            "予約日当日・無断キャンセル：体験料金の100%",
        ],
    },
    {
        title: "主催者都合によるキャンセル",
        items: [
            "天候・蜂や作物の状態・安全上の理由により中止する場合は、キャンセル料なし・全額返金。希望があれば別日への振替も対応します。",
        ],
    },
];

export function calcCancelFee(bookingDate: string, totalPrice: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bDate = new Date(bookingDate + "T00:00:00");
    const diffDays = Math.round((bDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 3) {
        return { ratePct: 0, fee: 0, refund: totalPrice, label: "無料（3日前以前）" };
    }
    if (diffDays >= 1) {
        return { ratePct: 50, fee: Math.round(totalPrice * 0.5), refund: Math.round(totalPrice * 0.5), label: "料金の50%（2日前〜前日）" };
    }
    return { ratePct: 100, fee: totalPrice, refund: 0, label: "料金の100%（当日・無断）" };
}

export function basePrice(experienceName: string): number {
    if (experienceName.includes("養蜂")) return 7000;
    if (experienceName.includes("芋")) return 3000;
    return 0;
}
