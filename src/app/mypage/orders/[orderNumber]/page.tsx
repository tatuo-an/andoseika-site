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
  complaint: string;
  estimatedDate: string;
};
type Message = { senderType: string; senderName: string; message: string; sentAt: string };

const REASONS_BEFORE_SHIP = [
  { value: "wrong_item",  label: "注文の間違い",       desc: "商品・数量を誤って注文してしまったため",   requireImage: false },
  { value: "change_date", label: "配達日・時間の変更", desc: "都合により受け取り日時を変更したいため",   requireImage: false },
  { value: "no_longer",   label: "不要になった",       desc: "諸事情により商品が不要になったため",       requireImage: false },
  { value: "bought_else", label: "他で購入した",       desc: "別の方法で同商品を購入したため",           requireImage: false },
  { value: "other",       label: "その他",             desc: "担当者へメッセージにてお伝えします",       requireImage: false },
] as const;

const REASONS_SHIPPING = [
  { value: "late",        label: "商品が届かない",                         desc: "お届け予定日を過ぎても商品が届いていないため",         requireImage: false },
  { value: "change_date", label: "お届け日変更", desc: "お届け予定日に受け取ることができないため", requireImage: false },
] as const;

const REASONS_AFTER_RECEIVE = [
  { value: "defect",  label: "商品の不具合", desc: "破損・品質不良など（写真の添付が必要です）", requireImage: true  },
  { value: "other",   label: "その他",       desc: "担当者へメッセージにてお伝えします",         requireImage: false },
] as const;

type Reason = { value: string; label: string; desc: string; requireImage: boolean };

function UserCancelModal({ onConfirm, onCancel, loading, orderStatus }: {
  onConfirm: (reasonLabel: string, imageUrl?: string) => void;
  onCancel: () => void;
  loading: boolean;
  orderStatus: string;
}) {
  const isAfterReceive = orderStatus === "delivered";
  const isShipping = orderStatus === "shipping";
  const reasons: readonly Reason[] = isAfterReceive ? REASONS_AFTER_RECEIVE : isShipping ? REASONS_SHIPPING : REASONS_BEFORE_SHIP;

  const [selected, setSelected] = useState("");
  const [desiredAction, setDesiredAction] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const MAX_SIZE = 5 * 1024 * 1024;
  const reason = reasons.find((r) => r.value === selected);
  const needsImage = reason?.requireImage ?? false;
  const displayFile = compressedFile ?? imageFile;
  const canSubmit = selected && (!needsImage || displayFile) && !loading && !uploading && !compressing && (!isAfterReceive || desiredAction);

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        // 長辺を最大 2048px に縮小
        const maxDim = 2048;
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

        // quality を下げながら 5MB 以下になるまで試す
        let quality = 0.85;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (!blob) { resolve(file); return; }
            if (blob.size <= MAX_SIZE || quality <= 0.1) {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
            } else {
              quality -= 0.1;
              tryCompress();
            }
          }, "image/jpeg", quality);
        };
        tryCompress();
      };
      img.src = url;
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setCompressedFile(null);
    setUploadError(null);
    setPreview(URL.createObjectURL(f));

    if (f.size > MAX_SIZE) {
      setCompressing(true);
      try {
        const compressed = await compressImage(f);
        setCompressedFile(compressed);
        setPreview(URL.createObjectURL(compressed));
      } finally {
        setCompressing(false);
      }
    }
  }

  async function handleConfirm() {
    if (!reason) return;
    const fileToUpload = compressedFile ?? imageFile;
    if (needsImage && fileToUpload) {
      setUploading(true);
      setUploadError(null);
      try {
        const fd = new FormData();
        fd.append("file", fileToUpload);
        const res = await fetch("/api/my/upload-image", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data.url) {
          setUploadError((data.error ?? "画像のアップロードに失敗しました") + (data.detail ? `\n${data.detail}` : ""));
          return;
        }
        const actionLabel = desiredAction === "resend" ? "再送希望" : desiredAction === "refund" ? "返金希望" : "どちらでもよい";
        onConfirm(`${reason.label}（${actionLabel}）`, data.url);
      } catch {
        setUploadError("通信エラーが発生しました。もう一度お試しください。");
      } finally { setUploading(false); }
    } else {
      const actionLabel = desiredAction === "resend" ? "再送希望" : desiredAction === "refund" ? "返金希望" : desiredAction === "either" ? "どちらでもよい" : "";
      onConfirm(actionLabel ? `${reason.label}（${actionLabel}）` : reason.label);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-stone-900 mb-1">
          {isAfterReceive ? "問題を報告する" : isShipping ? "配送について問い合わせる" : "注文をキャンセルする"}
        </h3>
        <p className="text-sm text-stone-500 mb-4">
          {isAfterReceive ? "問題の内容を選択してください。" : isShipping ? "お問い合わせ内容を選択してください。" : "キャンセル理由を選択してください。"}
        </p>
        <div className="space-y-2 mb-4">
          {reasons.map((r) => (
            <label key={r.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selected === r.value ? "border-red-400 bg-red-50" : "border-stone-200 hover:border-stone-300"}`}>
              <input type="radio" name="user_reason" value={r.value} checked={selected === r.value} onChange={() => { setSelected(r.value); setImageFile(null); setPreview(null); }} className="mt-0.5 accent-red-500" />
              <div>
                <p className="text-sm font-medium text-stone-800">{r.label}</p>
                <p className="text-xs text-stone-500">{r.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {needsImage && (
          <div className="mb-4 space-y-2">
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl">
              <p className="text-xs font-bold text-amber-800 mb-1">⚠️ 写真の撮影をお願いします</p>
              <p className="text-xs text-amber-700">商品の不具合（破損・変色・異物など）がわかるよう、現在の状態を撮影した写真を添付してください。写真がない場合は対応できかねる場合があります。</p>
            </div>
            <div className="p-3 border border-stone-200 rounded-xl">
              <p className="text-xs text-stone-500 mb-2">写真を添付（必須・5MB以下、超えた場合は自動圧縮）</p>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="complaint-image-input" />
              <label htmlFor="complaint-image-input" className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-xl cursor-pointer transition-colors">
                📷 写真を選択
              </label>
              {compressing && (
                <p className="text-xs mt-1 text-amber-600 font-medium">圧縮中...</p>
              )}
              {imageFile && !compressing && (
                <p className="text-xs mt-1 text-stone-400">
                  {compressedFile
                    ? `${formatSize(imageFile.size)} → ${formatSize(compressedFile.size)}（自動圧縮済み）`
                    : `ファイルサイズ：${formatSize(imageFile.size)}`}
                </p>
              )}
              {preview && <img src={preview} alt="preview" className="mt-2 rounded-lg max-h-36 object-contain w-full border border-stone-100" />}
            </div>
          </div>
        )}

        {isAfterReceive && selected && (
          <div className="mb-4">
            <p className="text-sm font-medium text-stone-800 mb-2">ご希望の対応</p>
            <div className="space-y-2">
              {[
                { value: "resend", label: "再送希望", desc: "同じ商品を再度お届けします" },
                { value: "refund", label: "返金希望", desc: "ご購入金額を返金します" },
              ].map((a) => (
                <label key={a.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${desiredAction === a.value ? "border-red-400 bg-red-50" : "border-stone-200 hover:border-stone-300"}`}>
                  <input type="radio" name="desired_action" value={a.value} checked={desiredAction === a.value} onChange={() => setDesiredAction(a.value)} className="mt-0.5 accent-red-500" />
                  <div>
                    <p className="text-sm font-medium text-stone-800">{a.label}</p>
                    <p className="text-xs text-stone-500">{a.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {uploadError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 whitespace-pre-wrap break-all">{uploadError}</p>
        )}
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50 transition-colors">戻る</button>
          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {compressing ? "圧縮中..." : uploading ? "アップロード中..." : loading ? "処理中..." : isAfterReceive ? "報告する" : isShipping ? "問い合わせる" : "キャンセルする"}
          </button>
        </div>
      </div>
    </div>
  );
}

const STEPS = ["注文", "支払い", "発送準備", "発送済み", "受取完了"];
const STATUS_STEP: Record<string, number> = { paid: 2, shipping: 3, delivered: 4, completed: 4, cancelled: -1, cancel_requested: 2, admin_cancel_requested: 2 };

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [responding, setResponding] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`/api/my/orders/${orderNumber}`)
      .then((r) => r.json())
      .then((d) => { setOrder(d.order); setMessages(d.messages ?? []); })
      .finally(() => setLoading(false));
  }, [orderNumber]);

  function scrollToBottom() {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

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
        scrollToBottom();
      }
    } finally { setSending(false); }
  }

  async function cancelOrder(reasonLabel: string, imageUrl?: string) {
    setCancelling(true);
    const isAfterReceive = order?.status === "delivered";
    const isShipping = order?.status === "shipping";
    try {
      if (isAfterReceive || isShipping) {
        // 受取後は問題報告メッセージのみ送信（ステータス変更なし）
        const prefix = isShipping ? "【配送問い合わせ】" : "【問題報告】";
        const msgBody = imageUrl
          ? `${prefix}${reasonLabel}\n【写真】${imageUrl}`
          : `${prefix}${reasonLabel}`;
        const res = await fetch(`/api/my/orders/${orderNumber}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msgBody }),
        });
        const data = await res.json();
        if (data.ok) {
          setMessages((prev) => [...prev, {
            senderType: "user", senderName: "お客様", message: msgBody,
            sentAt: data.sentAt,
          }]);
        }
      } else {
        // 発送前はキャンセル処理
        const res = await fetch(`/api/my/orders/${orderNumber}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reasonLabel, imageUrl }),
        });
        if (res.ok) {
          setOrder((prev) => prev ? { ...prev, status: "cancel_requested" } : prev);
          const msgText = imageUrl
            ? `キャンセルを申請しました。\n【理由】${reasonLabel}\n【写真】${imageUrl}`
            : `キャンセルを申請しました。\n【理由】${reasonLabel}`;
          setMessages((prev) => [...prev, {
            senderType: "user", senderName: "お客様", message: msgText,
            sentAt: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
          }]);
        }
      }
    } finally { setCancelling(false); setShowCancelModal(false); }
  }

  const step = order ? (STATUS_STEP[order.status] ?? 0) : 0;

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-stone-50"><Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-2xl space-y-4">
          <div className="h-6 w-32 bg-stone-200 rounded animate-pulse" />
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div className="h-5 w-24 bg-stone-200 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-16 bg-stone-100 rounded animate-pulse" />
                  <div className="h-4 w-28 bg-stone-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
            <div className="h-5 w-24 bg-stone-200 rounded animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-10 rounded-xl bg-stone-100 animate-pulse ${i % 2 === 0 ? "ml-auto w-2/3" : "w-2/3"}`} />
            ))}
          </div>
        </div>
      </main>
    <Footer /></div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col bg-stone-50"><Header />
      <main className="flex-1 flex items-center justify-center"><p className="text-stone-500">注文が見つかりません</p></main>
    <Footer /></div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {lightboxUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="拡大画像" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
      {showCancelModal && (
        <UserCancelModal
          loading={cancelling}
          orderStatus={order?.status ?? "paid"}
          onConfirm={(reasonLabel, imageUrl) => cancelOrder(reasonLabel, imageUrl)}
          onCancel={() => setShowCancelModal(false)}
        />
      )}
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Link href="/mypage" className="flex items-center gap-1 text-stone-500 hover:text-stone-700 text-sm mb-6">
            <ChevronLeft className="w-4 h-4" />マイページに戻る
          </Link>

          <div className="flex flex-col md:flex-row gap-6">
            {/* 左カラム：発送状況＋注文情報 */}
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
                {order.estimatedDate && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-stone-600">
                      お届け予定日：<span className="font-bold text-stone-900">{order.estimatedDate}</span>
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">※発送は予告なく前倒しする場合があります</p>
                  </div>
                )}
                {order.complaint && (
                  <div className="mt-5 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                    <XCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-orange-700">問題報告中</p>
                      <p className="text-xs text-orange-600">{order.complaint}</p>
                    </div>
                  </div>
                )}
                {order.status === "cancel_requested" && (
                  <div className="mt-5 border border-red-200 bg-red-50 rounded-xl p-4">
                    <p className="text-sm font-bold text-red-700 mb-1">キャンセル申請中</p>
                    <p className="text-xs text-red-600">店舗が確認しています。しばらくお待ちください。</p>
                  </div>
                )}
                {order.status === "admin_cancel_requested" && (
                  <div className="mt-5 border border-red-200 bg-red-50 rounded-xl p-4">
                    <p className="text-sm font-bold text-red-700 mb-1">キャンセルのご依頼が届いています</p>
                    <p className="text-xs text-red-600 mb-4">店舗よりキャンセルのご依頼があります。取引メッセージをご確認の上、同意または拒否してください。</p>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          if (!confirm("キャンセルに同意しますか？")) return;
                          setResponding(true);
                          try {
                            const res = await fetch(`/api/my/orders/${orderNumber}/cancel-response`, {
                              method: "POST", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "approve" }),
                            });
                            if (res.ok) setOrder((prev) => prev ? { ...prev, status: "cancelled" } : prev);
                          } finally { setResponding(false); }
                        }}
                        disabled={responding}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        同意する
                      </button>
                      <button
                        onClick={async () => {
                          setResponding(true);
                          try {
                            const res = await fetch(`/api/my/orders/${orderNumber}/cancel-response`, {
                              method: "POST", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "reject" }),
                            });
                            if (res.ok) {
                              setOrder((prev) => prev ? { ...prev, status: "paid" } : prev);
                              setMessages((prev) => [...prev, { senderType: "user", senderName: "お客様", message: "キャンセルを拒否しました。引き続きよろしくお願いします。", sentAt: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) }]);
                            }
                          } finally { setResponding(false); }
                        }}
                        disabled={responding}
                        className="flex-1 py-2 bg-white border border-stone-300 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
                      >
                        拒否する
                      </button>
                    </div>
                  </div>
                )}
                {order.status === "paid" && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    注文をキャンセルする
                  </button>
                )}
                {order.status === "shipping" && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors text-sm font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    配送について問い合わせる
                  </button>
                )}
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
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-bold disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {completing ? "処理中..." : "受取完了"}
                  </button>
                )}
                {order.status === "delivered" && !order.complaint && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-bold"
                  >
                    <XCircle className="w-4 h-4" />
                    問題を報告する
                  </button>
                )}
                {order.status === "delivered" && order.complaint && (
                  <button
                    onClick={async () => {
                      if (!confirm("問題報告を取り消しますか？")) return;
                      const complaintMsg = [...messages].reverse().find((m) => /^【問題報告】/.test(m.message));
                      if (!complaintMsg) return;
                      const res = await fetch(`/api/my/orders/${orderNumber}/message`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sentAt: complaintMsg.sentAt }),
                      });
                      if (res.ok) {
                        setMessages((prev) => prev.map((m) => m.sentAt === complaintMsg.sentAt ? { ...m, message: "__retracted__" } : m));
                        setOrder((prev) => prev ? { ...prev, complaint: "" } : prev);
                      }
                    }}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3 border border-stone-300 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors text-sm font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    問題報告を取り消す
                  </button>
                )}
              </div>

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


            </div>

            {/* 右カラム：取引メッセージ */}
            <div className="md:w-96 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
                <h2 className="font-bold text-stone-900 mb-4">取引メッセージ</h2>
                <div className="space-y-3 mb-4 min-h-[80px] flex-1">
                  {messages.length === 0 && (
                    <p className="text-sm text-stone-400">メッセージはありません</p>
                  )}
                  {messages.map((m, i) => {
                    const retracted = m.message === "__retracted__";
                    return (
                      <div key={i} className={`flex gap-3 group ${m.senderType === "user" ? "flex-row-reverse" : ""}`}>
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
                              {m.message.split("\n").map((line, li) => {
                                const isUrl = line.startsWith("https://") && /\.(png|jpg|jpeg|gif|webp)(\?|$)/i.test(line);
                                if (isUrl) return <img key={li} src={line} alt="添付画像" onClick={() => setLightboxUrl(line)} className="mt-1 rounded-lg max-w-[200px] max-h-48 object-contain cursor-zoom-in" />;
                                const urlMatch = line.match(/https?:\/\/\S+/);
                                if (urlMatch && /\.(png|jpg|jpeg|gif|webp)/i.test(urlMatch[0])) {
                                  const before = line.slice(0, urlMatch.index);
                                  return <span key={li}>{before && <span>{before}</span>}<img src={urlMatch[0]} alt="添付画像" onClick={() => setLightboxUrl(urlMatch[0])} className="mt-1 rounded-lg max-w-[200px] max-h-48 object-contain block cursor-zoom-in" /></span>;
                                }
                                return <span key={li}>{line}{li < m.message.split("\n").length - 1 && <br />}</span>;
                              })}
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
                      placeholder="メッセージを入力"
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
