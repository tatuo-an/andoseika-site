"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronLeft, Send, XCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

type Order = {
  orderNumber: string; createdAt: string; name: string; productNames: string;
  amount: number; status: string; address: string; desiredDate: string; desiredTime: string;
};
type Message = { senderType: string; senderName: string; message: string; sentAt: string };

const STEPS = ["注文", "支払い", "発送準備", "発送済み", "受取完了"];
const STATUS_STEP: Record<string, number> = { paid: 2, shipping: 3, delivered: 4, cancelled: -1 };

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/my/orders/${orderNumber}`)
      .then((r) => r.json())
      .then((d) => { setOrder(d.order); setMessages(d.messages ?? []); })
      .finally(() => setLoading(false));
  }, [orderNumber]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!msgText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/my/orders/${orderNumber}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msgText }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages((prev) => [...prev, { senderType: "user", senderName: "お客様", message: msgText.trim(), sentAt: data.sentAt }]);
        setMsgText("");
      }
    } finally { setSending(false); }
  }

  async function cancelOrder() {
    if (!confirm("注文をキャンセルしますか？")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/my/orders/${orderNumber}/cancel`, { method: "POST" });
      if (res.ok) setOrder((prev) => prev ? { ...prev, status: "cancelled" } : prev);
    } finally { setCancelling(false); }
  }

  const step = order ? (STATUS_STEP[order.status] ?? 0) : 0;

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-stone-50"><Header />
      <main className="flex-1 flex items-center justify-center"><p className="text-stone-400">読み込み中...</p></main>
    <Footer /></div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col bg-stone-50"><Header />
      <main className="flex-1 flex items-center justify-center"><p className="text-stone-500">注文が見つかりません</p></main>
    <Footer /></div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Link href="/mypage" className="flex items-center gap-1 text-stone-500 hover:text-stone-700 text-sm mb-6">
            <ChevronLeft className="w-4 h-4" />マイページに戻る
          </Link>

          <div className="flex flex-col md:flex-row gap-6">
            {/* 左カラム */}
            <div className="flex-1 space-y-4">
              {/* 発送状況 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-stone-900 mb-5">発送状況</h2>
                {order.status === "cancelled" ? (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <XCircle className="w-5 h-5" />
                    <span className="font-bold">キャンセル済み</span>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Progress line */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-stone-200 mx-8" />
                    <div
                      className="absolute top-4 left-0 h-0.5 bg-green-500 mx-8 transition-all"
                      style={{ width: `calc(${(step / (STEPS.length - 1)) * 100}% - 4rem * ${step / (STEPS.length - 1)})`, maxWidth: "calc(100% - 4rem)" }}
                    />
                    <div className="relative flex justify-between">
                      {STEPS.map((s, i) => (
                        <div key={s} className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${
                            i < step ? "bg-green-500 border-green-500" :
                            i === step ? "bg-white border-green-500" :
                            "bg-white border-stone-300"
                          }`}>
                            {i < step && <span className="text-white text-xs">✓</span>}
                            {i === step && <span className="w-3 h-3 rounded-full bg-green-500 block" />}
                          </div>
                          <span className={`text-xs whitespace-nowrap ${i <= step ? "text-stone-800 font-medium" : "text-stone-400"}`}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 取引メッセージ */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-stone-900 mb-4">取引メッセージ</h2>
                <div className="space-y-3 mb-4 min-h-[80px]">
                  {messages.length === 0 && (
                    <p className="text-sm text-stone-400">メッセージはありません</p>
                  )}
                  {messages.map((m, i) => {
                    const retracted = m.message === "__retracted__";
                    return (
                      <div key={i} className={`flex gap-3 group ${m.senderType === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          m.senderType === "admin" ? "bg-green-100 text-green-800" : "bg-primary/10 text-primary"
                        }`}>
                          {m.senderType === "admin" ? "店" : "客"}
                        </div>
                        <div className={`max-w-[75%] ${m.senderType === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-stone-500 font-medium">{m.senderName}</span>
                            <span className="text-[10px] text-stone-400">{m.sentAt}</span>
                            {m.senderType === "user" && !retracted && (
                              <button
                                onClick={async () => {
                                  if (!confirm("このメッセージを取り消しますか？")) return;
                                  const res = await fetch(`/api/my/orders/${orderNumber}/message`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ sentAt: m.sentAt }),
                                  });
                                  if (res.ok) setMessages((prev) => prev.map((msg, j) => j === i ? { ...msg, message: "__retracted__" } : msg));
                                }}
                                className="text-[10px] text-stone-400 hover:text-red-400 transition-colors"
                              >
                                取り消し
                              </button>
                            )}
                          </div>
                          {retracted ? (
                            <p className="text-xs text-stone-400 italic px-1">このメッセージは取り消されました</p>
                          ) : (
                            <div className={`rounded-2xl px-4 py-2 text-sm ${
                              m.senderType === "user"
                                ? "bg-primary text-white rounded-tr-sm"
                                : "bg-stone-100 text-stone-800 rounded-tl-sm"
                            }`}>
                              {m.message}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {order.status !== "cancelled" && (
                  <div className="flex gap-2 border-t border-stone-100 pt-4">
                    <textarea
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      placeholder="メッセージを入力（Enterで送信）"
                      rows={2}
                      className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !msgText.trim()}
                      className="px-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 右カラム */}
            <div className="md:w-72 space-y-4">
              {/* 注文情報 */}
              <div className="bg-white rounded-2xl shadow-sm p-5 text-sm">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-stone-100">
                      <td className="py-2 text-stone-500">注文日</td>
                      <td className="py-2 text-right text-primary font-medium">{order.createdAt.slice(0, 10)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-stone-500">注文番号</td>
                      <td className="py-2 text-right font-mono text-xs text-stone-700 break-all">{order.orderNumber}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 注文内容 */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-bold text-stone-900 mb-3 text-sm">注文内容</h3>
                <p className="text-sm text-stone-700 mb-3">{order.productNames}</p>
                <div className="border-t border-stone-100 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between font-bold text-stone-900">
                    <span>合計</span>
                    <span>¥{order.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 配送情報 */}
              <div className="bg-white rounded-2xl shadow-sm p-5 text-sm space-y-1">
                <h3 className="font-bold text-stone-900 mb-2">配送情報</h3>
                <p className="text-stone-600">{order.address}</p>
                {order.desiredDate && <p className="text-stone-500">希望日: {order.desiredDate}</p>}
                {order.desiredTime && order.desiredTime !== "指定なし" && <p className="text-stone-500">時間帯: {order.desiredTime}</p>}
              </div>

              {/* 受取完了ボタン */}
              {order.status === "shipping" && (
                <button
                  onClick={async () => {
                    if (!confirm("商品を受け取りましたか？")) return;
                    setCompleting(true);
                    try {
                      const res = await fetch(`/api/my/orders/${orderNumber}/delivered`, { method: "POST" });
                      if (res.ok) setOrder((prev) => prev ? { ...prev, status: "delivered" } : prev);
                    } finally { setCompleting(false); }
                  }}
                  disabled={completing}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-bold disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {completing ? "処理中..." : "受取完了"}
                </button>
              )}

              {/* キャンセルボタン */}
              {order.status === "paid" && (
                <button
                  onClick={cancelOrder}
                  disabled={cancelling}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  {cancelling ? "処理中..." : "注文をキャンセルする"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
