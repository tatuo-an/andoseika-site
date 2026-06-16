"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";

export function SkipModeToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setEnabled(d.skip_payment === "true"))
      .finally(() => setLoading(false));
  }, []);

  async function toggle() {
    const next = !enabled;
    setEnabled(next);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "skip_payment", value: String(next) }),
    });
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer select-none transition-colors ${
        enabled ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-white border-stone-200 text-stone-600"
      } ${loading ? "opacity-50 pointer-events-none" : ""}`}
      onClick={toggle}
    >
      <FlaskConical className={`w-5 h-5 ${enabled ? "text-amber-500" : "text-stone-400"}`} />
      <div className="flex-1">
        <p className="text-sm font-bold">決済スキップモード</p>
        <p className="text-xs opacity-70">{enabled ? "全ユーザーの決済がスキップされています" : "ONにすると全員の決済をスキップ"}</p>
      </div>
      <div className={`w-10 h-6 rounded-full transition-colors relative ${enabled ? "bg-amber-400" : "bg-stone-200"}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-1"}`} />
      </div>
    </div>
  );
}
