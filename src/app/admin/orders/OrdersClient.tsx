"use client";

import { useState, useMemo } from "react";
import { Package, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, RefreshCw, Send, Search } from "lucide-react";
import type { Order } from "@/app/api/admin/orders/route";

type Message = { senderType: string; senderName: string; message: string; sentAt: string };

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid:             { label: "発送準備中",     color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  shipping:         { label: "発送済み",       color: "bg-blue-100 text-blue-800 border-blue-200" },
  delivered:        { label: "受取完了",       color: "bg-green-100 text-green-800 border-green-200" },
  cancelled:        { label: "キャンセル",     color: "bg-stone-100 text-stone-500 border-stone-200" },
  cancel_requested: { label: "キャンセル申請中", color: "bg-red-100 text-red-700 border-red-200" },
};

const TABS = [
  { key: "all",       label: "すべて" },
  { key: "active",    label: "取引中" },
  { key: "delivered", label: "完了" },
  { key: "cancelled", label: "キャンセル" },
] as const;

type Tab = typeof TABS[number]["key"];

function filterOrders(orders: Order[], tab: Tab): Order[] {
  if (tab === "all")       return orders;
  if (tab === "active")    return orders.filter((o) => o.status === "paid" || o.status === "shipping" || o.status === "cancel_requested");
  if (tab === "delivered") return orders.filter((o) => o.status === "delivered");
  if (tab === "cancelled") return orders.filter((o) => o.status === "cancelled");
  return orders;
}

const CANCEL_REASONS = [
  { value: "sold_out",       label: "完売・在庫切れ",       desc: "ご注文いただいた商品が完売となったため" },
  { value: "quality",        label: "品質基準外",           desc: "収穫物が品質基準を満たさなかったため" },
  { value: "harvest",        label: "収穫量不足",           desc: "天候不良等により収穫量が確保できないため" },
  { value: "weather",        label: "天候・自然災害の影響", desc: "台風・大雪等により発送・配送が困難なため" },
  { value: "delay",          label: "準備・発送の遅延",     desc: "商品準備や配送業者の都合により間に合わないため" },
  { value: "delivery",       label: "配送対応不可",         desc: "ご指定の日程・エリアへの配送が困難なため" },
  { value: "other",          label: "その他",               desc: "担当者よりメッセージにてご連絡いたします" },
] as const;

// キャンセル理由モーダル
function CancelModal({ onConfirm, onCancel, loading }: {
  onConfirm: (reason: string, reasonLabel: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [selected, setSelected] = useState<string>("");
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-stone-900 mb-1">注文をキャンセルする</h3>
        <p className="text-sm text-stone-500 mb-4">キャンセル理由を選択してください。お客様へ自動でメッセージが送信されます。</p>
        <div className="space-y-2 mb-5">
          {CANCEL_REASONS.map((r) => (
            <label key={r.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selected === r.value ? "border-red-400 bg-red-50" : "border-stone-200 hover:border-stone-300"}`}>
              <input type="radio" name="reason" value={r.value} checked={selected === r.value} onChange={() => setSelected(r.value)} className="mt-0.5 accent-red-500" />
              <div>
                <p className="text-sm font-medium text-stone-800">{r.label}</p>
                <p className="text-xs text-stone-500">{r.desc}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50 transition-colors">
            戻る
          </button>
          <button
            onClick={() => {
              const r = CANCEL_REASONS.find((r) => r.value === selected);
              if (r) onConfirm(r.value, r.label);
            }}
            disabled={!selected || loading}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? "処理中..." : "キャンセルする"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 追跡番号入力モーダル
function ShippingModal({ onConfirm, onCancel, loading }: {
  onConfirm: (trackingNumber: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [trackingNumber, setTrackingNumber] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-stone-900 mb-1">発送済みにする</h3>
        <p className="text-sm text-stone-500 mb-4">追跡番号を入力してください。お客様へ自動でメッセージが送信されます。</p>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="例：1234-5678-9012"
          autoFocus
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => { if (trackingNumber.trim()) onConfirm(trackingNumber.trim()); }}
            disabled={!trackingNumber.trim() || loading}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "処理中..." : "発送する"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [tab, setTab] = useState<Tab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [msgLoading, setMsgLoading] = useState<string | null>(null);
  const [msgText, setMsgText] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [shippingModal, setShippingModal] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const searched = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.name.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      o.phone?.includes(q) ||
      o.productNames.toLowerCase().includes(q) ||
      o.createdAt.includes(q) ||
      o.address?.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const filtered = filterOrders(searched, tab);
  const countOf = (t: Tab) => filterOrders(searched, t).length;

  async function updateStatus(orderNumber: string, status: string) {
    setUpdating(orderNumber);
    try {
      await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => o.orderNumber === orderNumber ? { ...o, status } : o));
    } finally {
      setUpdating(null);
    }
  }

  async function handleShipConfirm(orderNumber: string, trackingNumber: string) {
    setUpdating(orderNumber);
    try {
      // ステータス更新
      await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "shipping" }),
      });
      setOrders((prev) => prev.map((o) => o.orderNumber === orderNumber ? { ...o, status: "shipping" } : o));

      // 自動メッセージ送信
      const autoMsg = `商品を発送しました。\n追跡番号：${trackingNumber}\n\nお届けまでしばらくお待ちください。`;
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: autoMsg }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages((prev) => ({
          ...prev,
          [orderNumber]: [...(prev[orderNumber] ?? []), { senderType: "admin", senderName: "安藤青果", message: autoMsg, sentAt: data.sentAt }],
        }));
      }
    } finally {
      setUpdating(null);
      setShippingModal(null);
    }
  }

  async function handleCancelConfirm(orderNumber: string, _reason: string, reasonLabel: string) {
    setUpdating(orderNumber);
    try {
      await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancel_requested" }),
      });
      setOrders((prev) => prev.map((o) => o.orderNumber === orderNumber ? { ...o, status: "cancel_requested" } : o));

      const autoMsg = `誠に申し訳ございません。\n以下の理由によりキャンセルをお願いしたい状況です。\n\n【理由】${reasonLabel}\n\nご同意いただける場合は注文詳細画面の「同意する」を押してください。\nご不明な点はメッセージよりお問い合わせください。`;
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: autoMsg }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages((prev) => ({
          ...prev,
          [orderNumber]: [...(prev[orderNumber] ?? []), { senderType: "admin", senderName: "安藤青果", message: autoMsg, sentAt: data.sentAt }],
        }));
      }
    } finally {
      setUpdating(null);
      setCancelModal(null);
    }
  }

  async function toggleExpand(orderNumber: string) {
    const isExpanded = expandedId === orderNumber;
    setExpandedId(isExpanded ? null : orderNumber);
    if (!isExpanded && !messages[orderNumber]) {
      setMsgLoading(orderNumber);
      try {
        const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}/message`);
        const data = await res.json();
        setMessages((prev) => ({ ...prev, [orderNumber]: data.messages ?? [] }));
      } finally {
        setMsgLoading(null);
      }
    }
  }

  async function sendAdminMessage(orderNumber: string) {
    const text = (msgText[orderNumber] ?? "").trim();
    if (!text) return;
    setSending(orderNumber);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages((prev) => ({
          ...prev,
          [orderNumber]: [...(prev[orderNumber] ?? []), { senderType: "admin", senderName: "安藤青果", message: text, sentAt: data.sentAt }],
        }));
        setMsgText((prev) => ({ ...prev, [orderNumber]: "" }));
      }
    } finally { setSending(null); }
  }

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div>
      {lightboxUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="拡大画像" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
      {/* キャンセル理由モーダル */}
      {cancelModal && (
        <CancelModal
          loading={updating === cancelModal}
          onConfirm={(reason, reasonLabel) => handleCancelConfirm(cancelModal, reason, reasonLabel)}
          onCancel={() => setCancelModal(null)}
        />
      )}

      {/* 追跡番号モーダル */}
      {shippingModal && (
        <ShippingModal
          loading={updating === shippingModal}
          onConfirm={(trackingNumber) => handleShipConfirm(shippingModal, trackingNumber)}
          onCancel={() => setShippingModal(null)}
        />
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="注文番号・氏名・商品名・日付などで検索"
          className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs">✕</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-stone-200 pb-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            {t.label}
            <span className="ml-1 text-xs text-stone-400">({countOf(t.key)})</span>
          </button>
        ))}
        <div className="ml-auto mb-1">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            更新
          </button>
        </div>
      </div>

      {/* Order list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-stone-400 text-sm">注文がありません</div>
        )}
        {filtered.map((order) => {
          const st = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-stone-100 text-stone-600 border-stone-200" };
          const isExpanded = expandedId === order.orderNumber;
          const isUpdating = updating === order.orderNumber;

          return (
            <div key={order.orderNumber} className={`bg-white rounded-xl overflow-hidden shadow-sm border ${order.status === "cancel_requested" ? "border-red-300" : "border-stone-200"}`}>
              {/* キャンセル申請バナー */}
              {order.status === "cancel_requested" && (
                <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  お客様よりキャンセル申請が届いています。内容を確認してください。
                </div>
              )}
              {/* 問題報告バナー */}
              {order.complaint && (
                <div className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  問題報告：{order.complaint}
                </div>
              )}
              {/* Header row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => toggleExpand(order.orderNumber)}
              >
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-900 truncate">{order.productNames}</p>
                  <p className="text-xs text-stone-400">{order.createdAt} · {order.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-stone-900">¥{order.amount.toLocaleString()}</p>
                  <p className="text-xs text-stone-400">{order.orderNumber}</p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
              </div>

              {/* Detail panel */}
              {isExpanded && (
                <div className="border-t border-stone-100 px-4 py-4 bg-stone-50">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* 左：注文情報＋ステータス */}
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-stone-400 mb-0.5">注文番号</p>
                          <p className="font-mono text-xs text-stone-700">{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-400 mb-0.5">注文日時</p>
                          <p className="text-stone-700">{order.createdAt}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-400 mb-0.5">金額</p>
                          <p className="font-bold text-stone-900">¥{order.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-400 mb-0.5">氏名</p>
                          <p className="text-stone-700">{order.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-400 mb-0.5">電話</p>
                          <p className="text-stone-700">{order.phone || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-400 mb-0.5">メール</p>
                          <p className="text-stone-700 text-xs break-all">{order.email || "—"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-stone-400 mb-0.5">お届け先</p>
                          <p className="text-stone-700">{order.address || "—"}</p>
                        </div>
                        {(order.desiredDate || order.desiredTime) && (
                          <div className="col-span-2">
                            <p className="text-xs text-stone-400 mb-0.5">配達希望</p>
                            <p className="text-stone-700">{order.desiredDate} {order.desiredTime}</p>
                          </div>
                        )}
                        <div className="col-span-2">
                          <p className="text-xs text-stone-400 mb-0.5">商品</p>
                          <p className="text-stone-700">{order.productNames}</p>
                        </div>
                      </div>

                      {/* Status actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200">
                        <p className="text-xs text-stone-500 w-full">ステータス変更：</p>
                        {order.complaint?.includes("再送希望") && (
                          <button
                            onClick={async () => {
                              if (!confirm("再送対応しますか？ステータスを発送前に戻します。")) return;
                              setUpdating(order.orderNumber);
                              try {
                                const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.orderNumber)}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "paid" }),
                                });
                                if (res.ok) setOrders((prev) => prev.map((o) => o.orderNumber === order.orderNumber ? { ...o, status: "paid" } : o));
                              } finally { setUpdating(null); }
                            }}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            <Truck className="w-4 h-4" />
                            再送する
                          </button>
                        )}
                        {order.complaint?.includes("返金希望") && (
                          <button
                            onClick={async () => {
                              if (!confirm("返金処理を実行しますか？この操作は取り消せません。")) return;
                              setUpdating(order.orderNumber);
                              try {
                                const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.orderNumber)}/refund`, { method: "POST" });
                                const data = await res.json();
                                if (res.ok) {
                                  setOrders((prev) => prev.map((o) => o.orderNumber === order.orderNumber ? { ...o, status: "cancelled", complaint: "" } : o));
                                  alert("返金処理が完了しました");
                                } else {
                                  alert("返金に失敗しました: " + (data.error ?? ""));
                                }
                              } finally { setUpdating(null); }
                            }}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            返金する
                          </button>
                        )}

                        {order.status === "paid" && (
                          <button
                            onClick={() => setShippingModal(order.orderNumber)}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            <Truck className="w-4 h-4" />
                            {isUpdating ? "処理中…" : "発送済みにする"}
                          </button>
                        )}
                        {order.status !== "cancelled" && order.status !== "delivered" && (
                          <button
                            onClick={() => setCancelModal(order.orderNumber)}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 text-stone-600 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            キャンセル
                          </button>
                        )}
                        {order.status === "paid" && (
                          <p className="w-full text-xs text-amber-600 flex items-center gap-1">
                            <Package className="w-3.5 h-3.5" />
                            発送後、「発送済みにする」を押して追跡番号を入力してください
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 右：取引メッセージ */}
                    <div className="md:w-80 border-t md:border-t-0 md:border-l border-stone-200 pt-4 md:pt-0 md:pl-4">
                      <p className="text-xs text-stone-400 mb-2 font-medium">取引メッセージ</p>
                      {msgLoading === order.orderNumber ? (
                        <p className="text-xs text-stone-400">読み込み中...</p>
                      ) : (
                        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                          {(messages[order.orderNumber] ?? []).length === 0 && (
                            <p className="text-xs text-stone-400">メッセージなし</p>
                          )}
                          {(messages[order.orderNumber] ?? []).map((m, i) => {
                            const retracted = m.message === "__retracted__";
                            return (
                              <div key={i} className={`flex gap-2 group ${m.senderType === "admin" ? "flex-row-reverse" : ""}`}>
                                <div className={`max-w-[75%] flex flex-col gap-0.5 ${m.senderType === "admin" ? "items-end" : "items-start"}`}>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-[10px] text-stone-400">{m.senderName} · {m.sentAt}</span>
                                    {m.senderType === "admin" && !retracted && (
                                      <button
                                        onClick={async () => {
                                          if (!confirm("このメッセージを取り消しますか？")) return;
                                          const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.orderNumber)}/message`, {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ sentAt: m.sentAt }),
                                          });
                                          if (res.ok) setMessages((prev) => ({
                                            ...prev,
                                            [order.orderNumber]: (prev[order.orderNumber] ?? []).map((msg, j) => j === i ? { ...msg, message: "__retracted__" } : msg),
                                          }));
                                        }}
                                        className="text-[9px] text-stone-400 hover:text-red-400 transition-colors"
                                      >
                                        取り消し
                                      </button>
                                    )}
                                  </div>
                                  {retracted ? (
                                    <p className="text-[10px] text-stone-400 italic px-1">このメッセージは取り消されました</p>
                                  ) : (
                                    <div className={`rounded-xl px-3 py-1.5 text-xs whitespace-pre-wrap ${m.senderType === "admin" ? "bg-primary text-white rounded-tr-none" : "bg-white border border-stone-200 text-stone-700 rounded-tl-none"}`}>
                                      {m.message.split("\n").map((line: string, li: number) => {
                                        const urlMatch = line.match(/https?:\/\/\S+/);
                                        if (urlMatch && /\.(png|jpg|jpeg|gif|webp)/i.test(urlMatch[0])) {
                                          const before = line.slice(0, urlMatch.index);
                                          return <span key={li}>{before && <span>{before}</span>}<img src={urlMatch[0]} alt="添付画像" onClick={() => setLightboxUrl(urlMatch[0])} className="mt-1 rounded-lg max-w-[180px] max-h-40 object-contain block cursor-zoom-in" /></span>;
                                        }
                                        return <span key={li}>{line}{li < m.message.split("\n").length - 1 && <br />}</span>;
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={msgText[order.orderNumber] ?? ""}
                          onChange={(e) => setMsgText((p) => ({ ...p, [order.orderNumber]: e.target.value }))}
                          placeholder="お客様へメッセージを送る"
                          className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white resize-none"
                        />
                        <button
                          onClick={() => sendAdminMessage(order.orderNumber)}
                          disabled={sending === order.orderNumber || !(msgText[order.orderNumber] ?? "").trim()}
                          className="px-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
