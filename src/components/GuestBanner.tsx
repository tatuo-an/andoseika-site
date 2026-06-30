"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export function GuestBanner() {
  const { status } = useSession();
  const [closed, setClosed] = useState(false);

  if (status === "loading" || status === "authenticated" || closed) return null;

  return (
    <div className="sticky top-0 z-50 bg-primary text-white px-4 py-2.5 flex items-center justify-between gap-3">
      <p className="text-sm font-medium">
        🌿 無料会員登録で、ポイント・お気に入り・体験予約が利用できます！
        <Link href="/guide" className="underline underline-offset-2 ml-2 font-bold whitespace-nowrap">
          使い方を見る →
        </Link>
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/login"
          className="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors whitespace-nowrap"
        >
          ログイン / 登録
        </Link>
        <button onClick={() => setClosed(true)} aria-label="閉じる">
          <X className="w-4 h-4 text-white/80 hover:text-white" />
        </button>
      </div>
    </div>
  );
}
