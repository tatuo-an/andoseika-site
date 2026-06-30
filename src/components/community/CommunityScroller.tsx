"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

type Post = {
  id: string;
  displayName: string;
  productName: string;
  imageUrl: string;
  likeCount: number;
};

export function CommunityScroller() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/community")
      .then((r) => r.json())
      .then((d) => setPosts((d.posts ?? []).slice(0, 12)));
  }, []);

  if (posts.length === 0) return null;

  // 無限ループ用に2倍に複製
  const doubled = [...posts, ...posts];

  return (
    <section className="py-6 bg-stone-50 border-y border-stone-100 overflow-hidden">
      <div className="flex items-center gap-3 px-4 md:px-6 mb-4 container mx-auto">
        <h2 className="text-base font-bold text-stone-900">みんなの料理</h2>
        <Link href="/community" className="text-xs text-primary font-medium hover:underline ml-auto">
          もっと見る →
        </Link>
      </div>
      <div className="relative">
        <div
          className="flex gap-3 w-max"
          style={{ animation: "scroll-left 30s linear infinite" }}
          onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
          onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
        >
          {doubled.map((post, i) => (
            <Link
              key={`${post.id}-${i}`}
              href={`/community/${post.id}`}
              className="shrink-0 w-36 group"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-stone-200 mb-1.5">
                <img
                  src={post.imageUrl}
                  alt={post.productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-[11px] text-stone-500 truncate px-0.5">🥬 {post.productName}</p>
              <div className="flex items-center gap-1 px-0.5">
                <Heart className="w-3 h-3 text-red-400" />
                <span className="text-[10px] text-stone-400">{post.likeCount}</span>
                <span className="text-[10px] text-stone-400 ml-1 truncate">{post.displayName || "匿名"}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scroll-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
