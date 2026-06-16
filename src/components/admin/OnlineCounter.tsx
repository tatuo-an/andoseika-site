"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

export function OnlineCounter() {
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    const fetch_ = () =>
      fetch("/api/online/count")
        .then((r) => r.json())
        .then((d) => setOnline(d.online ?? 0))
        .catch(() => {});

    fetch_();
    const interval = setInterval(fetch_, 30_000);
    return () => clearInterval(interval);
  }, []);

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
