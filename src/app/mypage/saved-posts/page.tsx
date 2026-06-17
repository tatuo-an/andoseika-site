"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Heart, Bookmark, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
};

export default function SavedPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/my/saved-posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleUnsave(id: string) {
    await fetch(`/api/community/${id}/bookmark`, { method: "POST" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/mypage" className="text-stone-400 hover:text-stone-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-stone-900">記録した料理</h1>
            {!loading && <span className="text-sm text-stone-400">{posts.length}件</span>}
          </div>

          {loading && (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-100">
                  <div className="aspect-square bg-stone-100 animate-pulse" />
                  <div className="p-3 space-y-1.5">
                    <div className="h-3 w-16 bg-stone-100 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-stone-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-16 text-stone-400">
              <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="mb-1">記録した料理がありません</p>
              <Link href="/community" className="text-sm text-primary hover:underline">みんなの料理を見る →</Link>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
                <div className="aspect-square bg-stone-100 relative">
                  <img src={post.imageUrl} alt="料理" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleUnsave(post.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-primary shadow-sm hover:bg-white transition-colors"
                    title="記録を解除"
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-primary" />
                  </button>
                </div>
                <div className="p-3">
                  <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">🥬 {post.productName}</span>
                  {post.caption && <p className="text-xs text-stone-600 mt-1.5 line-clamp-2">{post.caption}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-stone-400">
                      <Heart className={`w-3.5 h-3.5 ${post.liked ? "fill-red-400 text-red-400" : ""}`} />
                      <span className="text-[10px]">{post.likeCount}</span>
                    </div>
                    <p className="text-[10px] text-stone-400">{post.displayName || "匿名"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
