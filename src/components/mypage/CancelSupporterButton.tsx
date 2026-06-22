"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelSupporterButton({ redirectTo }: { tierName: string; redirectTo?: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/my/cancel-tier", { method: "POST" });
      if (res.ok) {
        if (redirectTo) router.push(redirectTo);
        router.refresh();
      }
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  };

  if (confirm) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 border border-stone-200 rounded-lg p-3">
          自動更新を停止しても、現在の契約期間終了まではサポーター特典をご利用いただけます。次回更新日以降の年会費は請求されません。
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "処理中..." : "停止する"}
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-600 text-sm font-bold hover:bg-stone-200 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors"
    >
      次回の自動更新を停止する
    </button>
  );
}
