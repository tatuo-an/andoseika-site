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

export function OnlineCounter({ isAdmin }: { isAdmin: boolean }) {
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    // 初回ping（自分を登録しつつカウント取得）
    ping().then(setOnline);

    // 30秒ごとにハートビート
    const interval = setInterval(() => {
      ping().then(setOnline);
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  // 管理者のみ表示
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
