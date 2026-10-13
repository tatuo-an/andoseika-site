"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Review = { id: string; createdAt: string; displayName: string; rating: number; body: string };

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "読み込みに失敗しました");
        if (active) setReviews(data.reviews ?? []);
      })
      .catch(error => { if (active) setLoadError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, orderNumber, displayName, rating, body }),
      });
      const data = await response.json();
      setMessage(data.message || data.error || "送信できませんでした");
      if (response.ok) { setOrderNumber(""); setBody(""); }
    } catch {
      setMessage("通信に失敗しました。時間をおいて再度お試しください");
    } finally { setSubmitting(false); }
  }

  return (
    <section id="reviews" className="container mx-auto max-w-5xl px-4 md:px-6 py-12 border-t border-stone-200">
      <h2 className="text-2xl font-bold text-stone-900 mb-2">お客様のレビュー</h2>
      <p className="text-sm text-stone-500 mb-6">このサイトで購入された方のレビューを、確認後に掲載しています。</p>
      {loading ? <p className="text-stone-500">読み込み中…</p> : loadError ? <p role="alert" className="text-red-700">{loadError}</p> :
        reviews.length === 0 ? <p className="text-stone-500">この商品のレビューはまだありません。</p> :
        <div className="space-y-4 mb-10">
          {reviews.map(review => (
            <article key={review.id} className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="font-bold text-stone-900">{review.displayName}</span>
                <span className="text-amber-500" aria-label={`5点中${review.rating}点`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                <time className="text-xs text-stone-500" dateTime={review.createdAt}>{review.createdAt.slice(0, 10)}</time>
                <span className="text-xs text-primary">購入者</span>
              </div>
              <p className="whitespace-pre-wrap break-words text-stone-700">{review.body}</p>
            </article>
          ))}
        </div>}
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 md:p-6 mt-8">
        <h3 className="font-bold text-lg text-stone-900 mb-2">レビューを書く</h3>
        <p className="text-sm text-stone-600 mb-4">レビューは1人につき1商品1回まで。承認・公開後に100ポイントを付与します。ログイン後、配達完了した注文の注文番号を入力してください。注文番号は<Link href="/mypage" className="text-primary underline">マイページ</Link>で確認できます。</p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium text-stone-700">注文番号
            <input required maxLength={17} pattern="ORD-[0-9]{8}-[0-9]{4}" placeholder="ORD-20261013-1234" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} className="mt-1 block w-full rounded-lg border border-stone-300 bg-white p-3" />
          </label>
          <label className="block text-sm font-medium text-stone-700">公開するお名前（本名は入力しないでください）
            <input required maxLength={30} value={displayName} onChange={e => setDisplayName(e.target.value)} className="mt-1 block w-full rounded-lg border border-stone-300 bg-white p-3" />
          </label>
          <label className="block text-sm font-medium text-stone-700">評価
            <select value={rating} onChange={e => setRating(Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-stone-300 bg-white p-3">
              {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} / 5</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-stone-700">レビュー（10〜1000文字）
            <textarea required minLength={10} maxLength={1000} rows={4} value={body} onChange={e => setBody(e.target.value)} className="mt-1 block w-full rounded-lg border border-stone-300 bg-white p-3" />
          </label>
          <button disabled={submitting} className="rounded-full bg-primary px-8 py-3 font-bold text-white disabled:opacity-50">{submitting ? "送信中…" : "レビューを投稿"}</button>
          {message && <p role="status" className="text-sm text-stone-700">{message}</p>}
        </form>
      </div>
    </section>
  );
}
