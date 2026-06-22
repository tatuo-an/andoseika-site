"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Save, Loader2 } from "lucide-react";

export function LineBotKeywordEditor() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("おしえて安藤さん");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.line_bot_keyword) setKeyword(d.line_bot_keyword);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "line_bot_keyword", value: keyword }),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors"
      >
        <MessageCircle className="w-5 h-5 text-stone-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-stone-700">LINE bot キーワード</p>
          <p className="text-xs text-stone-400">このキーワードを含むメッセージにbotが返答します</p>
        </div>
        <span className="text-stone-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className={`border-t border-stone-100 px-4 py-4 space-y-3 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
          <div>
            <label className="text-xs text-stone-400">キーワード</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setSaved(false); }}
              className="w-full mt-0.5 border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="おしえて安藤さん"
            />
            <p className="text-xs text-stone-400 mt-1">例：「おしえて安藤さん 送料は？」と送るとbotが返答します</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "保存中..." : saved ? "✓ 保存しました" : "保存する"}
          </button>
        </div>
      )}
    </div>
  );
}
