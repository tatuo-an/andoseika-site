"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import Link from "next/link";

type PlanKey = "mebuking" | "minori" | "partner";

const PLAN_NAMES: Record<PlanKey, string> = {
    mebuking: "芽吹きサポーター",
    minori: "実りサポーター",
    partner: "農園パートナー",
};
const PLAN_PRICES: Record<PlanKey, number> = {
    mebuking: 3000,
    minori: 5000,
    partner: 10000,
};

export function SupporterPlanButton({
    plan,
    popular,
    soldOut = false,
}: {
    plan: PlanKey;
    popular: boolean;
    soldOut?: boolean;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [skipMode, setSkipMode] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then((r) => r.json())
            .then((d) => setSkipMode(d.skip_payment === "true"))
            .catch(() => {});
    }, []);

    const handleProceed = async () => {
        setShowConfirm(false);
        setLoading(true);
        setError(null);
        try {
            if (skipMode) {
                const res = await fetch("/api/test-supporter", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ plan }),
                });
                const data = await res.json();
                if (data.success) {
                    window.location.href = `/supporter/success?plan=${plan}`;
                } else {
                    setError(data.error ?? "エラーが発生しました。");
                }
                return;
            }

            const res = await fetch("/api/supporter-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            });
            const data = await res.json();
            if (res.status === 409) {
                setError("定員に達しました。申し込みを受け付けられません。");
            } else if (data.url) {
                window.location.href = data.url;
            } else {
                setError("決済画面を開けませんでした。しばらくしてお試しください。");
            }
        } catch {
            setError("エラーが発生しました。しばらくしてお試しください。");
        } finally {
            setLoading(false);
        }
    };

    if (soldOut) {
        return (
            <div className="w-full py-3.5 rounded-full font-bold text-sm text-center bg-stone-100 text-stone-400 cursor-not-allowed">
                定員に達しました
            </div>
        );
    }

    const priceStr = `¥${PLAN_PRICES[plan].toLocaleString()}`;

    return (
        <>
            {skipMode && (
                <div className="mb-2 flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-xs text-amber-800">
                    <span>🧪</span>
                    <span><b>スキップモード ON</b> — Stripeをスキップします</span>
                </div>
            )}
            <button
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                className={`w-full py-3.5 rounded-full font-bold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                    skipMode
                        ? "bg-amber-400 hover:bg-amber-500 text-white"
                        : popular
                            ? "bg-primary text-white hover:bg-primary/90 shadow-md"
                            : "bg-stone-100 text-stone-800 hover:bg-stone-200"
                }`}
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        処理中...
                    </>
                ) : skipMode ? (
                    "🧪 テスト申し込み"
                ) : (
                    "このプランで申し込む"
                )}
            </button>
            {error && (
                <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
            )}

            {/* 最終確認モーダル（特商法必須表示） */}
            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}
                >
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 sticky top-0 bg-white">
                            <h3 className="font-bold text-stone-900 text-base">お申し込み内容の確認</h3>
                            <button onClick={() => setShowConfirm(false)} className="text-stone-400 hover:text-stone-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-5 py-4 space-y-4">
                            {/* 主要事項 */}
                            <div className="bg-stone-50 rounded-xl p-4 space-y-2.5">
                                <InfoRow label="プラン名" value={PLAN_NAMES[plan]} />
                                <InfoRow label="年会費" value={`${priceStr}（税込）`} highlight />
                                <InfoRow label="契約期間" value="決済完了日から1年間" />
                                <InfoRow label="支払方法" value="クレジットカード・銀行振込・PayPay（Stripe決済）" />
                                <InfoRow label="支払時期" value="カード・PayPay：申し込み時に即時確定。銀行振込：注文後7日以内" />
                                <InfoRow
                                    label="自動更新"
                                    value={`契約終了後、1年ごとに同プランへ自動更新。次回更新日に${priceStr}を請求します`}
                                />
                                <InfoRow label="解約方法" value="マイページ →「次回の自動更新を停止する」から手続き（解約手数料なし）" />
                                <InfoRow label="解約期限" value="次回更新日の前日まで。期限後は次年度分が請求されます" />
                                {plan === "minori" && (
                                    <InfoRow label="特典お届け" value="年1回（春または秋）・旬の詰め合わせ・送料込み" />
                                )}
                                {plan === "partner" && (
                                    <InfoRow label="特典お届け" value="年2回（春・秋）・旬の詰め合わせ・送料込み" />
                                )}
                                <InfoRow label="返金" value="お支払い後の利用者都合による途中解約・日割り返金はありません" warn />
                            </div>

                            <p className="text-[11px] text-stone-500 leading-relaxed">
                                お申し込み前に
                                <Link href="/tokusho" target="_blank" className="text-primary underline mx-0.5">特定商取引法に基づく表示</Link>
                                および
                                <Link href="/supporter-terms" target="_blank" className="text-primary underline mx-0.5">サポーター会員規約</Link>
                                をご確認ください。「同意して決済へ進む」を押すと、上記内容および各規約に同意したものとみなします。
                            </p>
                        </div>

                        <div className="px-5 pb-6 space-y-2 sticky bottom-0 bg-white pt-2 border-t border-stone-100">
                            <button
                                onClick={handleProceed}
                                className="w-full py-3.5 rounded-full font-bold bg-primary text-white hover:bg-primary/90 transition-colors text-sm"
                            >
                                同意して決済へ進む
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="w-full py-2.5 rounded-full font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors text-sm"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function InfoRow({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
    return (
        <div className="flex gap-2">
            <span className="text-stone-500 shrink-0 w-20 text-[11px] pt-0.5 leading-relaxed">{label}</span>
            <span className={`flex-1 text-[11px] leading-relaxed ${highlight ? "font-bold text-stone-900 text-sm" : warn ? "text-red-600" : "text-stone-700"}`}>
                {value}
            </span>
        </div>
    );
}
