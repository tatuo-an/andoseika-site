"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Send, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";

type RescueItem = {
  id: string; title: string; description: string; stock: string;
  deadline: string; productId: string; active: boolean; notified: boolean;
};

export default function AdminRescuePage() {
  const [items, setItems] = useState<RescueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notifying, setNotifying] = useState<string | null>(null);

  const [form, setForm] = useState({ title: "", description: "", stock: "", deadline: "", productId: "" });

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    const res = await fetch("/api/admin/rescue");
    const d = await res.json();
    setItems(d.items ?? []);
    setLoading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/admin/rescue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: "", description: "", stock: "", deadline: "", productId: "" });
      setShowForm(false);
      await loadItems();
    }
    setSubmitting(false);
  }

  async function toggleActive(item: RescueItem) {
    await fetch(`/api/admin/rescue/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    await loadItems();
  }

  async function sendNotify(item: RescueItem) {
    if (!confirm(`「${item.title}」のLINE一斉通知を送信しますか？\n全ての友だちに送信されます。`)) return;
    setNotifying(item.id);
    const res = await fetch(`/api/admin/rescue/${item.id}/notify`, { method: "POST" });
    const d = await res.json();
    if (d.ok) {
      alert("LINE通知を送信しました");
      await loadItems();
    } else {
      alert(`送信失敗: ${d.error}`);
    }
    setNotifying(null);
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-stone-400 hover:text-stone-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            畑のレスキュー便
          </h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> 新規追加
          </button>
        </div>

        {/* 新規追加フォーム */}
        {showForm && (
          <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4 border border-stone-200">
            <h2 className="font-bold text-stone-800">レスキュー便を追加</h2>
            <div>
              <label className="block text-xs text-stone-500 mb-1">タイトル（例：曲がり白ネギ 30箱分）<span className="text-red-500">*</span></label>
              <input
                type="text" required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="曲がりのある白ネギ 約30箱分"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">説明文（LINE通知にも使用）</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="雨で曲がりが出てしまいましたが、味は通常品と変わりません。"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1">残数（点・箱など）</label>
                <input
                  type="text"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">販売期限日 <span className="text-red-500">*</span></label>
                <input
                  type="date" required
                  value={form.deadline}
                  onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">商品ID（購入ボタンのリンク先・任意）</label>
              <input
                type="text"
                value={form.productId}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="negi-3kg"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={submitting}
                className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "追加中..." : "追加する"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-stone-200 text-stone-600 text-sm rounded-xl hover:bg-stone-50">
                キャンセル
              </button>
            </div>
          </form>
        )}

        {/* 一覧 */}
        {loading ? (
          <div className="text-center py-10 text-stone-400 text-sm">読み込み中...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-sm">レスキュー便はありません</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className={`bg-white rounded-2xl shadow-sm p-5 border ${item.active ? "border-red-200" : "border-stone-100 opacity-60"}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.active && <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">公開中</span>}
                      {item.notified && <span className="text-[10px] font-bold bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">LINE通知済</span>}
                    </div>
                    <p className="font-bold text-stone-900 text-sm">{item.title}</p>
                    {item.description && <p className="text-xs text-stone-500 mt-1 leading-relaxed">{item.description}</p>}
                  </div>
                  <button
                    onClick={() => toggleActive(item)}
                    className="text-stone-400 hover:text-primary transition-colors shrink-0"
                    title={item.active ? "非表示にする" : "公開する"}
                  >
                    {item.active ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs text-stone-400 mb-3">
                  {item.stock && <span>残数: {item.stock}</span>}
                  {item.deadline && <span>期限: {item.deadline}</span>}
                  {item.productId && <span>商品ID: {item.productId}</span>}
                </div>
                {item.active && !item.notified && (
                  <button
                    onClick={() => sendNotify(item)}
                    disabled={notifying === item.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {notifying === item.id ? "送信中..." : "LINE一斉通知を送る"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
