"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Review = {
  id: string; createdAt: string; productId: string; orderNumber: string;
  email: string; displayName: string; rating: number; body: string; status: string;
};

const statusLabel: Record<string, string> = { pending: "承認待ち", approved: "公開中", rejected: "非公開", duplicate: "重複" };

export function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updating, setUpdating] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/reviews", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "読み込みに失敗しました");
      setReviews(data.reviews ?? []);
      setError("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "読み込みに失敗しました"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function update(id: string, status: "approved" | "rejected") {
    setUpdating(id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "更新に失敗しました");
      await load();
      setNotice(status === "approved"
        ? data.pointsAwarded ? "レビューを公開し、100ポイントを付与しました。" : "レビューは公開中です。ポイントは付与済みです。"
        : "レビューを非公開にしました。");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "更新に失敗しました"); }
    finally { setUpdating(""); }
  }

  const ordered = [...reviews].sort((a, b) => Number(a.status !== "pending") - Number(b.status !== "pending"));
  return <>
    <div className="flex items-center justify-between gap-3 mb-8">
      <div><h1 className="text-2xl font-bold text-stone-900">商品レビュー管理</h1><p className="text-sm text-stone-500">承認したレビューだけ商品ページに表示されます。</p></div>
      <Link href="/admin" className="text-primary underline">管理画面へ戻る</Link>
    </div>
    {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 text-primary">{notice}</p>}
    {loading ? <p>読み込み中…</p> : ordered.length === 0 ? <p>レビューはまだありません。</p> :
      <div className="space-y-4">{ordered.map(review => <article key={review.id} className="rounded-xl border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3 mb-2 text-sm">
          <span className="rounded bg-stone-100 px-2 py-1 font-bold">{statusLabel[review.status] ?? review.status}</span>
          <Link href={`/products/${encodeURIComponent(review.productId)}#reviews`} className="text-primary underline">商品を確認</Link>
          <span>{review.productId}</span><span>{review.orderNumber}</span>
          <span>{review.createdAt.slice(0, 10)}</span>
        </div>
        <p className="font-bold text-stone-900">{review.displayName}　<span className="text-amber-500">{"★".repeat(Math.max(0, Math.min(5, review.rating)))}</span></p>
        <p className="text-xs text-stone-500">投稿者: {review.email}</p>
        <p className="my-4 whitespace-pre-wrap break-words text-stone-700">{review.body}</p>
        <div className="flex gap-3">
          {review.status !== "approved" && review.status !== "duplicate" && <button disabled={updating === review.id} onClick={() => update(review.id, "approved")} className="rounded-lg bg-primary px-4 py-2 font-bold text-white disabled:opacity-50">承認・公開＋100pt</button>}
          {review.status === "approved" && <button disabled={updating === review.id} onClick={() => update(review.id, "approved")} className="rounded-lg border border-primary px-4 py-2 font-bold text-primary disabled:opacity-50">ポイント付与を再確認</button>}
          {review.status !== "rejected" && <button disabled={updating === review.id} onClick={() => update(review.id, "rejected")} className="rounded-lg border border-stone-300 px-4 py-2 font-bold text-stone-700 disabled:opacity-50">非公開</button>}
        </div>
      </article>)}</div>}
  </>;
}
