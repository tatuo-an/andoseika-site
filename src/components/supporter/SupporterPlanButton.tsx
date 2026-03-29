"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type PlanKey = "light" | "standard" | "premium";

export function SupporterPlanButton({
    plan,
    popular,
}: {
    plan: PlanKey;
    popular: boolean;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        setLoading(true);
        setError(null);
        try {
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

    return (
        <div>
            <button
                onClick={handleClick}
                disabled={loading}
                className={`w-full py-3.5 rounded-full font-bold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                    popular
                        ? "bg-primary text-white hover:bg-primary/90 shadow-md"
                        : "bg-stone-100 text-stone-800 hover:bg-stone-200"
                }`}
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        移動中...
                    </>
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
