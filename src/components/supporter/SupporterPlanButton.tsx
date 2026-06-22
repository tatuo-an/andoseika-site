"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

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

    useEffect(() => {
        fetch("/api/admin/settings")
            .then((r) => r.json())
            .then((d) => setSkipMode(d.skip_payment === "true"))
            .catch(() => {});
    }, []);

    const handleClick = async () => {
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

    return (
        <div>
            <details className="mb-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600">
                <summary className="cursor-pointer px-3 py-2 font-medium text-stone-700">
                    重要事項を確認する
                </summary>
                <ul className="px-3 pb-3 space-y-1 leading-relaxed list-disc list-inside text-stone-600">
                    <li>プラン：{PLAN_NAMES[plan]}</li>
                    <li>年会費：¥{PLAN_PRICES[plan].toLocaleString()}（税込）</li>
                    <li>契約期間：決済完了日から1年間</li>
                    <li>1年ごとに同じプランへ自動更新（次回更新日に同額を請求）</li>
                    <li>解約方法：マイページから「次回の自動更新を停止する」</li>
                    <li>解約期限：次回更新日の前日まで（以降は次年度分を請求）</li>
                    <li>年会費お支払い後の利用者都合による途中解約・日割り返金はありません</li>
                </ul>
            </details>
            {skipMode && (
                <div className="mb-2 flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-xs text-amber-800">
                    <span>🧪</span>
                    <span><b>スキップモード ON</b> — Stripeをスキップします</span>
                </div>
            )}
            <button
                onClick={handleClick}
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
        </div>
    );
}
