"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical, Save, Loader2, Check, Megaphone, ChevronDown, ChevronUp } from "lucide-react";

type Item = { text: string; link: string; active: boolean };

export function AnnouncementsEditor() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!open || items.length > 0) return;
    fetch("/api/announcements", { method: "PUT" })
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.items) ? d.items : []))
      .finally(() => setLoading(false));
  }, [open, items.length]);

  const update = (i: number, patch: Partial<Item>) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
    setDirty(true);
    setSaved(false);
  };

  const add = () => {
    setItems((prev) => [...prev, { text: "", link: "", active: true }]);
    setDirty(true);
    setSaved(false);
  };

  const remove = (i: number) => {
    if (!confirm("このお知らせを削除しますか？")) return;
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    setDirty(true);
    setSaved(false);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setDirty(true);
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const filtered = items.filter((it) => it.text.trim());
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: filtered }),
      });
      if (res.ok) {
        setItems(filtered);
        setSaved(true);
        setDirty(false);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-stone-50 transition-colors text-left"
      >
        <Megaphone className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <p className="font-bold text-stone-900">お知らせ（マーキー）編集</p>
          <p className="text-xs text-stone-500 mt-0.5">ヘッダー下に流れる一行メッセージを管理</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>

      {open && (
        <div className="border-t border-stone-100 p-5 space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-stone-500 py-6 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              読み込み中...
            </div>
          ) : (
            <>
              {items.length === 0 && (
                <p className="text-sm text-stone-400 text-center py-6">まだお知らせがありません。「+ 追加」から作成してください。</p>
              )}

              {items.map((it, i) => (
                <div key={i} className="border border-stone-200 rounded-xl p-3 bg-stone-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="p-0.5 text-stone-400 hover:text-stone-700 disabled:opacity-30">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <GripVertical className="w-3 h-3 text-stone-300" />
                      <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-0.5 text-stone-400 hover:text-stone-700 disabled:opacity-30">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={it.text}
                      onChange={(e) => update(i, { text: e.target.value })}
                      placeholder="メッセージ本文（例：春の梨予約受付中）"
                      className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={it.active}
                        onChange={(e) => update(i, { active: e.target.checked })}
                        className="accent-primary"
                      />
                      公開
                    </label>
                    <button onClick={() => remove(i)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pl-7">
                    <span className="text-[11px] text-stone-400 whitespace-nowrap">リンク（任意）</span>
                    <input
                      type="text"
                      value={it.link}
                      onChange={(e) => update(i, { link: e.target.value })}
                      placeholder="/products や https://... など"
                      className="flex-1 border border-stone-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={add}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  追加
                </button>
                <div className="flex items-center gap-3">
                  {saved && <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" />保存しました</span>}
                  <button
                    onClick={save}
                    disabled={saving || !dirty}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "保存中..." : "保存"}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-stone-400 leading-relaxed pt-1">
                ※ 「公開」のチェックを外すと非表示になります（削除しなくてOK）。並び順は上から順に流れます。リンクを設定するとクリック可能になります。
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
