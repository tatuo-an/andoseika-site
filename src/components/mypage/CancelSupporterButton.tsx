"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelSupporterButton({ tierName }: { tierName: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/my/cancel-tier", { method: "POST" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  };

  if (confirm) {
    return (
      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm">
        <p className="text-red-700 font-medium mb-2">{tierName}を解約しますか？</p>
        <p className="text-red-500 text-xs mb-3">解約すると即時に一般会員へ変更されます。</p>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "処理中..." : "解約する"}
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="flex-1 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs font-bold hover:bg-stone-200"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="mt-3 text-xs text-stone-400 hover:text-red-500 transition-colors underline underline-offset-2"
    >
      プランを解約する
    </button>
  );
}
