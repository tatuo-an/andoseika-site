"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

export function DeleteAccountButton() {
  const [step, setStep] = useState<"idle" | "confirm" | "loading" | "done">("idle");
  const [error, setError] = useState("");

  async function handleDelete() {
    setStep("loading");
    setError("");
    try {
      const res = await fetch("/api/my/delete-account", { method: "POST" });
      if (!res.ok) throw new Error("エラーが発生しました");
      setStep("done");
      // 少し待ってからサインアウト
      setTimeout(() => signOut({ callbackUrl: "/" }), 1500);
    } catch {
      setError("退会処理に失敗しました。時間をおいて再度お試しいただくか、お問い合わせください。");
      setStep("confirm");
    }
  }

  if (step === "idle") {
    return (
      <button
        onClick={() => setStep("confirm")}
        className="text-xs text-stone-400 hover:text-red-500 transition-colors underline underline-offset-2"
      >
        退会する
      </button>
    );
  }

  if (step === "confirm") {
    return (
      <div className="border border-red-200 bg-red-50 rounded-xl p-5 space-y-3">
        <p className="text-sm font-bold text-red-700">本当に退会しますか？</p>
        <ul className="text-xs text-red-600 space-y-1 leading-relaxed list-disc list-inside">
          <li>保有ポイント・お気に入り・投稿履歴はすべて削除されます（復元不可）</li>
          <li>サポーター特典（自動更新を含む）は即時停止されます</li>
          <li>注文履歴は法令上の保存義務に従い保持されます</li>
        </ul>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
          >
            退会する
          </button>
          <button
            onClick={() => { setStep("idle"); setError(""); }}
            className="flex-1 py-2 rounded-lg border border-stone-300 text-stone-600 text-sm font-bold hover:bg-stone-50 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        退会処理中...
      </div>
    );
  }

  return (
    <p className="text-sm text-stone-500">退会が完了しました。ご利用ありがとうございました。</p>
  );
}
