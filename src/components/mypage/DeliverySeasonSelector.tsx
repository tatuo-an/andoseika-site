"use client";

import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";

type Season = "spring" | "autumn" | "";

export function DeliverySeasonSelector() {
  const [season, setSeason] = useState<Season>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/my/delivery-season")
      .then((r) => r.json())
      .then((d) => setSeason((d.season as Season) ?? ""))
      .finally(() => setLoading(false));
  }, []);

  async function pick(s: Exclude<Season, "">) {
    if (s === season) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/my/delivery-season", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season: s }),
      });
      if (res.ok) {
        setSeason(s);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-stone-400">
        <Loader2 className="w-3 h-3 animate-spin" />
        読み込み中...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500">お届け時期</p>
        {saved && <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" />保存しました</span>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => pick("spring")}
          disabled={saving}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
            season === "spring"
              ? "bg-primary text-white border-primary"
              : "bg-white text-stone-700 border-stone-200 hover:border-primary/50"
          } disabled:opacity-50`}
        >
          🌸 春便り（3月頃）
        </button>
        <button
          onClick={() => pick("autumn")}
          disabled={saving}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
            season === "autumn"
              ? "bg-primary text-white border-primary"
              : "bg-white text-stone-700 border-stone-200 hover:border-primary/50"
          } disabled:opacity-50`}
        >
          🍂 秋便り（9月頃）
        </button>
      </div>
      <p className="text-[11px] text-stone-400 leading-relaxed">
        ※ お選びいただいた時期に、年1回お届けします。発送時期は収穫状況により前後する場合があります。マイページからいつでも変更できます。
      </p>
    </div>
  );
}
