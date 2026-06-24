"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const LINE_FRIEND_URL = "https://lin.ee/xzQv9l5";
const DISMISS_KEY = "lineFriendBannerDismissed_v1";

export function LineFriendBanner() {
  const { status } = useSession();
  const [isLineUser, setIsLineUser] = useState<boolean | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY) === "1") {
      setClosed(true);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/my/line-status")
      .then((r) => r.json())
      .then((d) => setIsLineUser(!!d.isLineUser))
      .catch(() => setIsLineUser(false));
  }, [status]);

  function handleDismiss() {
    setClosed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(DISMISS_KEY, "1");
    }
  }

  if (status !== "authenticated" || !isLineUser || closed) return null;

  return (
    <div className="sticky top-0 z-50 bg-[#06C755] text-white px-4 py-2.5 flex items-center justify-between gap-3">
      <p className="text-sm font-medium leading-snug">
        💬 注文確認をLINEで受け取るには、公式アカウントを友だち追加してください
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <a
          href={LINE_FRIEND_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-[#06C755] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors whitespace-nowrap"
        >
          友だち追加する
        </a>
        <button onClick={handleDismiss} aria-label="閉じる">
          <X className="w-4 h-4 text-white/80 hover:text-white" />
        </button>
      </div>
    </div>
  );
}
