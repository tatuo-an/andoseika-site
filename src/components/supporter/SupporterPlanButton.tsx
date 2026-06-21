"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

type PlanKey = "mebuking" | "minori" | "partner";

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
            if (data.url) {
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
