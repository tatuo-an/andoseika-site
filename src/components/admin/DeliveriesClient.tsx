"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, Truck, Check, X, Copy, Download, RotateCcw, Send, ChevronDown } from "lucide-react";
import { cycleLabel, parseCycleId, approximateShipMonth, type CycleId } from "@/lib/deliveryCycle";

type Item = {
  email: string;
  displayName: string;
  tier: "free" | "mebuking" | "minori" | "partner";
  tierExpiry: string;
  preferredSeason: string;
  primaryAddress: {
    email: string; label: string; name: string; postalCode: string;
    prefecture: string; city: string; street: string; building: string; phone: string;
  } | null;
  shipped: boolean;
  shippedAt: string;
  trackingNumber: string;
  memo: string;
};

const TIER_LABEL: Record<string, string> = {
  partner: "農園パートナー",
  minori: "実りサポーター",
};
const TIER_COLOR: Record<string, string> = {
  partner: "bg-amber-100 text-amber-700 border-amber-300",
  minori: "bg-purple-100 text-purple-700 border-purple-300",
};

export function DeliveriesClient({ cycles, initialCycle }: { cycles: CycleId[]; initialCycle: CycleId }) {
  const [cycle, setCycle] = useState<CycleId>(initialCycle);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("ヤマト運輸");
  const [memo, setMemo] = useState("");
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/deliveries?cycle=${cycle}`)
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.items) ? d.items : []))
      .finally(() => setLoading(false));
  }, [cycle]);

  const counts = useMemo(() => {
    const total = items.length;
    const shipped = items.filter((i) => i.shipped).length;
    return { total, shipped, pending: total - shipped };
  }, [items]);

  function fmtAddress(it: Item): string {
    const a = it.primaryAddress;
    if (!a) return "（住所未登録）";
    return `${a.name} 〒${a.postalCode} ${a.prefecture}${a.city}${a.street}${a.building ? " " + a.building : ""}${a.phone ? ` TEL ${a.phone}` : ""}`;
  }

  async function copyToClipboard(text: string) {
    try { await navigator.clipboard.writeText(text); } catch {}
  }

  function openMarkShipped(it: Item) {
    setEditing(it.email);
    setTracking(it.trackingNumber || "");
    setCarrier("ヤマト運輸");
    setMemo(it.memo || "");
    setNotify(!it.shipped); // 既発送なら通知デフォルトOFF（追跡番号更新だけ）
  }

  async function markShipped() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editing,
          cycle,
          trackingNumber: tracking,
          carrier,
          memo,
          notify,
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({} as { notification?: { channel: string; status: string; detail?: string }[] }));
        const r = await fetch(`/api/admin/deliveries?cycle=${cycle}`);
        const d = await r.json();
        setItems(Array.isArray(d.items) ? d.items : []);
        setEditing(null);

        // 通知結果サマリーを表示
        const log = data.notification ?? [];
        const sent = log.find((l) => l.status === "sent");
        if (sent) {
          alert(`✅ 発送記録しました\n通知送信：${sent.channel}（${sent.detail ?? "成功"}）`);
        } else if (log.some((l) => l.channel === "none")) {
          alert("✅ 発送記録しました（通知OFFで保存）");
        } else {
          const reasons = log.map((l) => `${l.channel}：${l.status}${l.detail ? "（" + l.detail + "）" : ""}`).join("\n");
          alert(`✅ 発送記録しました\n\n⚠ ただし通知は送信されていません：\n${reasons}`);
        }
      } else {
        const d = await res.json().catch(() => ({}));
        alert(`発送記録に失敗しました\n${d.error ?? ""}\n${d.detail ?? ""}`);
      }
    } finally {
      setSaving(false);
    }
  }

  async function undoShipped(email: string) {
    if (!confirm("発送記録を取り消します。よろしいですか？\n（通知は取り消せません）")) return;
    const res = await fetch(`/api/admin/deliveries?email=${encodeURIComponent(email)}&cycle=${cycle}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setItems((prev) => prev.map((it) => it.email === email ? { ...it, shipped: false, shippedAt: "", trackingNumber: "" } : it));
    }
  }

  function exportCsv() {
    const header = ["氏名", "郵便番号", "都道府県", "市区町村", "番地", "建物", "電話", "プラン", "メール", "発送済み"];
    const rows = items.map((it) => {
      const a = it.primaryAddress;
      return [
        a?.name ?? "",
        a?.postalCode ?? "",
        a?.prefecture ?? "",
        a?.city ?? "",
        a?.street ?? "",
        a?.building ?? "",
        a?.phone ?? "",
        TIER_LABEL[it.tier] ?? it.tier,
        it.email,
        it.shipped ? "○" : "",
      ];
    });
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cycle}_配送先.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* サイクル選択 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 flex-wrap">
        <span className="text-sm text-stone-500">配送回：</span>
        <div className="relative">
          <select
            value={cycle}
            onChange={(e) => setCycle(e.target.value)}
            className="appearance-none pl-3 pr-9 py-2 border border-stone-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          >
            {cycles.map((c) => (
              <option key={c} value={c}>{cycleLabel(c)}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
        <span className="text-xs text-stone-400">{approximateShipMonth(cycle)}</span>
        <div className="flex-1" />
        <div className="text-xs text-stone-600 flex items-center gap-2">
          <span>対象 <strong className="text-stone-900">{counts.total}</strong>人</span>
          <span className="text-stone-300">/</span>
          <span className="text-emerald-700">発送済み <strong>{counts.shipped}</strong></span>
          <span className="text-stone-300">/</span>
          <span className="text-amber-700">未発送 <strong>{counts.pending}</strong></span>
        </div>
        <button
          onClick={exportCsv}
          disabled={items.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          CSV出力
        </button>
      </div>

      {/* 対象者リスト */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-stone-500 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          読み込み中...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-stone-400">
          <Truck className="w-10 h-10 mx-auto mb-3 text-stone-300" />
          <p className="text-sm">この配送回の対象会員はいません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => {
            const a = it.primaryAddress;
            return (
              <div key={it.email} className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${it.shipped ? "border-emerald-200" : "border-stone-100"}`}>
                <div className={`px-5 py-3 border-b flex items-center gap-3 ${it.shipped ? "bg-emerald-50/50 border-emerald-100" : "bg-stone-50 border-stone-100"}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-stone-900">{it.displayName || a?.name || "（未設定）"}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TIER_COLOR[it.tier] ?? "bg-stone-100 text-stone-700 border-stone-300"}`}>
                        {TIER_LABEL[it.tier] ?? it.tier}
                      </span>
                      {it.tier === "minori" && (
                        <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                          {it.preferredSeason === "autumn" ? "🍂秋希望" : "🌸春希望"}
                        </span>
                      )}
                      {it.shipped && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          発送済み
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">{it.email} ／ 契約 〜 {it.tierExpiry}</p>
                  </div>
                  {!it.shipped ? (
                    <button
                      onClick={() => openMarkShipped(it)}
                      disabled={!a}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      発送済みにする
                    </button>
                  ) : (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openMarkShipped(it)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => undoShipped(it.email)}
                        className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium border border-stone-200 rounded-lg hover:bg-red-50 text-red-600"
                        title="発送記録を取り消す"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="px-5 py-3 text-sm text-stone-700 flex items-start gap-2">
                  <div className="flex-1">
                    {a ? (
                      <>
                        <p className="font-medium">{a.name} {a.phone && <span className="text-xs text-stone-400 ml-2">{a.phone}</span>}</p>
                        <p className="text-stone-600">〒{a.postalCode} {a.prefecture}{a.city}{a.street}{a.building && ` ${a.building}`}</p>
                      </>
                    ) : (
                      <p className="text-stone-400 text-xs">配送先住所が登録されていません</p>
                    )}
                    {it.shipped && it.shippedAt && (
                      <p className="text-[11px] text-emerald-700 mt-1.5">
                        発送日時：{it.shippedAt}
                        {it.trackingNumber && <span className="ml-2">／ 追跡番号：<code className="bg-emerald-50 px-1.5 py-0.5 rounded">{it.trackingNumber}</code></span>}
                      </p>
                    )}
                  </div>
                  {a && (
                    <button
                      onClick={() => copyToClipboard(fmtAddress(it))}
                      className="text-stone-400 hover:text-stone-700 p-1"
                      title="住所をコピー"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 発送モーダル */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => !saving && setEditing(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h2 className="font-bold text-stone-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                発送情報を記録
              </h2>
              <button onClick={() => !saving && setEditing(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">追跡番号（任意）</label>
                <input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="例：1234-5678-9012"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">配送業者</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option>ヤマト運輸</option>
                  <option>佐川急便</option>
                  <option>日本郵便</option>
                  <option>その他</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">メモ（任意）</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={2}
                  placeholder="同梱内容や特記事項"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                />
              </div>
              <label className="flex items-center gap-2 text-sm bg-stone-50 px-3 py-2 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  className="accent-primary"
                />
                <Send className="w-3.5 h-3.5 text-stone-500" />
                発送通知を送信（LINE優先・なければメール）
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-stone-100 bg-stone-50">
              <button
                onClick={() => setEditing(null)}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-200 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={markShipped}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {saving ? "保存中..." : "発送済みとして保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
