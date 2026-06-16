"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";

const KEY = "ando_skip_payment";

export function SkipModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(localStorage.getItem(KEY) === "true");
  }, []);

  function toggle() {
    const next = !enabled;
    if (next) {
      localStorage.setItem(KEY, "true");
    } else {
      localStorage.removeItem(KEY);
    }
    setEnabled(next);
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer select-none transition-colors ${
        enabled
          ? "bg-amber-50 border-amber-300 text-amber-800"
          : "bg-white border-stone-200 text-stone-600"
      }`}
      onClick={toggle}
    >
      <FlaskConical className={`w-5 h-5 ${enabled ? "text-amber-500" : "text-stone-400"}`} />
      <div className="flex-1">
        <p className="text-sm font-bold">決済スキップモード</p>
        <p className="text-xs opacity-70">カート決済をスキップしてテスト注文を作成</p>
      </div>
      <div className={`w-10 h-6 rounded-full transition-colors relative ${enabled ? "bg-amber-400" : "bg-stone-200"}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-1"}`} />
      </div>
    </div>
  );
}
