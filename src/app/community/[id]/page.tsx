"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Bookmark, ArrowLeft, ShoppingCart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type Post = {
  id: string;
  displayName: string;
  productName: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  likeCount: number;
  liked: boolean;
  saved: boolean;
  isOwner: boolean;
  productFamily: string;
  productId: string;
};

export default function CommunityPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/community/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.post) { setPost(d.post); setRelated(d.related ?? []); }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleLike() {
    if (!post) return;
    const res = await fetch(`/api/community/${post.id}/like`, { method: "POST" });
    const data = await res.json();
    if (data.ok) setPost((p) => p ? { ...p, liked: data.liked, likeCount: data.likeCount } : p);
  }

  async function handleSave() {
    if (!post) return;
    const res = await fetch(`/api/community/${post.id}/bookmark`, { method: "POST" });
    const data = await res.json();
    if (data.ok) setPost((p) => p ? { ...p, saved: data.saved } : p);
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 py-6">
        <div className="container mx-auto px-4 max-w-lg">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 戻る
          </button>

          {loading && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-square w-full bg-stone-100 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-24 bg-stone-100 rounded animate-pulse" />
                <div className="h-4 w-full bg-stone-100 rounded animate-pulse" />
              </div>
            </div>
          )}

          {!loading && !post && (
            <div className="text-center py-16 text-stone-400">投稿が見つかりませんでした</div>
          )}

          {post && (
            <>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4">
                <div className="aspect-square w-full bg-stone-100">
                  <img src={post.imageUrl} alt="料理写真" className="w-full h-full object-cover" />
                </div>

                <div className="p-5">
                  {post.productFamily && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.productFamily.split(",").map((f) => (
                        <span key={f} className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          🥬 {f.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {post.caption && (
                    <p className="text-sm text-stone-700 whitespace-pre-wrap mb-4 leading-relaxed">{post.caption}</p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked ? "text-red-500" : "text-stone-400 hover:text-red-400"}`}
                      >
                        <Heart className={`w-5 h-5 ${post.liked ? "fill-red-500" : ""}`} />
                        <span className="text-xs font-medium">{post.likeCount}</span>
                      </button>
                      <button
                        onClick={handleSave}
                        className={`transition-colors ${post.saved ? "text-primary" : "text-stone-400 hover:text-primary"}`}
                      >
                        <Bookmark className={`w-5 h-5 ${post.saved ? "fill-primary" : ""}`} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-stone-700">{post.displayName || "匿名"}</p>
                      <p className="text-[10px] text-stone-400">{post.createdAt.slice(0, 10)}</p>
                    </div>
                  </div>

                  {post.productId && (
                    <div className="flex flex-col gap-2">
                      {post.productId.split(",").map((pid, i) => {
                        const fname = post.productFamily.split(",")[i]?.trim() ?? "";
                        return (
                          <Link
                            key={pid}
                            href={`/products/${pid.trim()}`}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {fname ? `${fname}を購入する` : "この商品を購入する"}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {related.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-stone-700 mb-3">
                    {post.productFamily ? `${post.productFamily}を使った料理` : "同じ商品を使った料理"}
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {related.map((r) => (
                      <Link key={r.id} href={`/community/${r.id}`} className="group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 mb-1.5">
                          <img src={r.imageUrl} alt="料理" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">{r.displayName || "匿名"}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
