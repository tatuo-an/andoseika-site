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

// 送料マスタが未設定の場合のデフォルト値（ヤマト運輸 中国エリア発）
const DEFAULT_SHIPPING: ShippingRow[] = [
    { region: "北海道", prefectures: "北海道", s60: 1200, s80: 1400, s100: 1600, s120: 1750, s140: 2000, s160: 2200, s180: 2400, s200: 2600, compact: 990, clickpost: 185 },
    { region: "東北", prefectures: "青森県,岩手県,宮城県,秋田県,山形県,福島県", s60: 800, s80: 1000, s100: 1200, s120: 1400, s140: 1600, s160: 1800, s180: 2000, s200: 2200, compact: 790, clickpost: 185 },
    { region: "沖縄", prefectures: "沖縄県", s60: 1200, s80: 1700, s100: 2200, s120: 2700, s140: 3200, s160: 3700, s180: 4200, s200: 4900, compact: 790, clickpost: 185 },
    { region: "それ以外", prefectures: "東京都,神奈川県,埼玉県,千葉県,茨城県,栃木県,群馬県,新潟県,富山県,石川県,福井県,山梨県,長野県,岐阜県,静岡県,愛知県,三重県,滋賀県,京都府,大阪府,兵庫県,奈良県,和歌山県,鳥取県,島根県,岡山県,広島県,山口県,徳島県,香川県,愛媛県,高知県,福岡県,佐賀県,長崎県,熊本県,大分県,宮崎県,鹿児島県", s60: 600, s80: 700, s100: 800, s120: 1000, s140: 1200, s160: 1400, s180: 1600, s200: 1800, compact: 690, clickpost: 185 },
];

export function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { cartDetails, removeItem, incrementItem, decrementItem, totalPrice, cartCount } = useShoppingCart();

    const [prefecture, setPrefecture] = useState<string | null>(null);
    const [shippingRows, setShippingRows] = useState<ShippingRow[]>([]);
    const [addressLoaded, setAddressLoaded] = useState(false);

    useEffect(() => {
        if (!isOpen || addressLoaded) return;
        Promise.all([
            fetch("/api/address").then(r => r.json()).catch(() => ({ address: null })),
            fetch("/api/shipping").then(r => r.json()).catch(() => ({ shipping: [] })),
        ]).then(([addrData, shipData]) => {
            setPrefecture(addrData.address?.prefecture ?? null);
            setShippingRows(shipData.shipping?.length ? shipData.shipping : DEFAULT_SHIPPING);
            setAddressLoaded(true);
        });
    }, [isOpen, addressLoaded]);

    const regionRow = prefecture ? findRegionRow(prefecture, shippingRows) : null;
    const baseRow = findBaseRow(shippingRows);
    const isExtraRegion = regionRow && baseRow && regionRow !== baseRow;

    // カート合計重量から宅配便サイズを決定
    const totalWeightG = Object.values(cartDetails ?? {}).reduce((sum, item) => {
        return sum + extractWeightG(item.name) * item.quantity;
    }, 0);
    const weightBasedShipType = totalWeightG > 0 ? weightToShipSize(totalWeightG) : null;

    // 重量が取れた場合は合計重量ベース、取れない場合はアイテムごとの shipType で計算
    const surcharge = (() => {
        if (!isExtraRegion || !regionRow || !baseRow) return 0;
        if (weightBasedShipType) {
            const diff = getRate(regionRow, weightBasedShipType) - getRate(baseRow, weightBasedShipType);
            return Math.max(0, diff);
        }
        return Object.values(cartDetails ?? {}).reduce((sum, item) => {
            const shipType = (item as any).shipType as string;
            if (!shipType) return sum;
            const diff = getRate(regionRow, shipType) - getRate(baseRow, shipType);
            return sum + Math.max(0, diff) * item.quantity;
        }, 0);
    })();

    // デバッグ
    if (typeof window !== "undefined" && isOpen) {
        console.log("[CartModal] prefecture:", prefecture, "| region:", regionRow?.region, "| isExtra:", isExtraRegion);
        console.log("[CartModal] totalWeightG:", totalWeightG, "| shipSize:", weightBasedShipType);
        console.log("[CartModal] surcharge:", surcharge);
    }

    if (!isOpen) return null;

    const handleCheckout = async () => {
        try {
            const response = await fetch("/api/checkout_sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cartDetails,
                    surcharge: surcharge > 0 ? surcharge : undefined,
                    surchargeLabel: isExtraRegion ? `追加送料（${regionRow!.region}）` : undefined,
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
                                    <p className="text-sm text-stone-500">¥{item.price.toLocaleString()}</p>
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
                        {/* 送料表示 */}
                        {prefecture && addressLoaded && (
                            <div className="text-sm space-y-1">
                                <div className="flex justify-between text-stone-600">
                                    <span>商品合計</span>
                                    <span>¥{totalPrice?.toLocaleString()}</span>
                                </div>
                                {isExtraRegion && surcharge > 0 ? (
                                    <div className="flex justify-between text-orange-600">
                                        <span>追加送料（{regionRow!.region}）</span>
                                        <span>+¥{surcharge.toLocaleString()}</span>
                                    </div>
                                ) : (
                                    <div className="flex justify-between text-stone-400 text-xs">
                                        <span>送料</span>
                                        <span>商品代金に含まれています</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {addressLoaded && !prefecture && (
                            <p className="text-xs text-orange-500">
                                <Link href="/mypage/address" className="underline font-medium">住所を登録</Link>すると正確な送料が計算されます
                            </p>
                        )}

                        <div className="flex items-center justify-between text-lg font-bold text-stone-900 border-t border-stone-200 pt-3">
                            <span>合計</span>
                            <span>¥{((totalPrice ?? 0) + surcharge).toLocaleString()}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors shadow-lg"
                        >
                            お支払いへ進む
                        </button>
                        <p className="text-xs text-center text-stone-500">
                            Stripeのセキュアな決済画面へ移動します。ご注文前に
                            <Link href="/tokusho" className="font-medium text-primary hover:underline">
                                特定商取引法に基づく表示
                            </Link>
                            をご確認ください。
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
