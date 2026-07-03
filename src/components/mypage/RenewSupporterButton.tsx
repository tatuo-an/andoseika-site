"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { TierKey } from "@/lib/tiers";

type RenewPlanKey = Exclude<TierKey, "free">;

export function RenewSupporterButton({
  plan,
  price,
}: {
  plan: RenewPlanKey;
  price: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRenew() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/supporter-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setError("定員に達しました。更新手続きを受け付けられません。");
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
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleRenew}
        disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-center hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        サポーターを更新する（年会費 ¥{price.toLocaleString()}）
      </button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
