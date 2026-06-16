"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

function getSessionId(): string {
  const key = "ando_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

async function ping(): Promise<number> {
  const res = await fetch("/api/online/ping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: getSessionId() }),
  });
  const data = await res.json();
  return data.online ?? 0;
}

function sendRemove() {
  const sid = sessionStorage.getItem("ando_sid");
  if (!sid) return;
  // sendBeacon はページ閉じても確実に送信される
  navigator.sendBeacon(
    "/api/online/remove",
    new Blob([JSON.stringify({ sessionId: sid })], { type: "application/json" })
  );
}

export function OnlineCounter({ isAdmin }: { isAdmin: boolean }) {
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    ping().then(setOnline);

    const interval = setInterval(() => {
      ping().then(setOnline);
    }, 30_000);

    // タブを閉じた・ページ離脱時に自分を削除
    window.addEventListener("beforeunload", sendRemove);

    // タブを隠した場合（別タブに切り替え）→ 30秒後にpingが途切れるので許容
    // タブに戻ってきたら再登録
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        ping().then(setOnline);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", sendRemove);
      document.removeEventListener("visibilitychange", handleVisibility);
      sendRemove();
    };
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm w-fit">
      <div className="relative">
        <Users className="w-5 h-5 text-primary" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>
      <div>
        <p className="text-xs text-stone-400 leading-none">現在オンライン</p>
        <p className="text-xl font-bold text-stone-900 leading-tight">
          {online === null ? "—" : online}
          <span className="text-sm font-normal text-stone-500 ml-1">人</span>
        </p>
      </div>
    </div>
  );
}
