"use client";

import { useEffect, useState } from "react";
import { Star, TrendingUp, ShoppingBag, Cake, LogIn, Camera } from "lucide-react";

type HistoryItem = {
  date: string;
  type: string;
  points: number;
  memo: string;
};

const TYPE_LABEL: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  login:    { label: "ログインボーナス", icon: LogIn,       color: "text-blue-500" },
  birthday: { label: "誕生日ボーナス",   icon: Cake,        color: "text-pink-500" },
  post:     { label: "料理投稿ボーナス", icon: Camera,      color: "text-green-500" },
  use:      { label: "ポイント利用",     icon: ShoppingBag, color: "text-orange-500" },
};

export function PointsCard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Fetch balance
    fetch("/api/my/points")
      .then((r) => r.json())
      .then((d) => {
        if (d.balance !== undefined) setBalance(d.balance);
        if (d.history) setHistory(d.history);
      })
      .catch(() => {});

    // Daily login bonus
    fetch("/api/my/points/login", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.earned) {
          setBalance((prev) => (prev ?? 0) + d.points);
          setHistory((prev) => [{ date: "", type: "login", points: d.points, memo: "ログインボーナス" }, ...prev]);
          setToast(`ログインボーナス +${d.points}pt 獲得！`);
          setTimeout(() => setToast(null), 4000);
        }
      })
      .catch(() => {});

    // Birthday bonus
    fetch("/api/my/points/birthday", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.earned) {
          setBalance((prev) => (prev ?? 0) + d.points);
          setHistory((prev) => [{ date: "", type: "birthday", points: d.points, memo: `誕生日ボーナス` }, ...prev]);
          setTimeout(() => setToast(`🎂 誕生日ボーナス +${d.points}pt 獲得！`), 1000);
          setTimeout(() => setToast(null), 6000);
        }
      })
      .catch(() => {});
  }, []);

  if (balance === null) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 relative">
      {toast && (
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce z-10">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <h2 className="font-bold text-stone-900">ポイント</h2>
        </div>
        {history.length > 0 && (
          <button onClick={() => setShowHistory((s) => !s)} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <TrendingUp className="w-3.5 h-3.5" />
            履歴
          </button>
        )}
      </div>

      <p className="text-3xl font-bold text-stone-900">
        {balance.toLocaleString()}<span className="text-sm font-normal text-stone-500 ml-1">pt</span>
      </p>
      <p className="text-xs text-stone-400 mt-1">
        1pt = 1円として通常商品の商品代金にご利用いただけます（
        <a href="/point-terms" className="text-primary hover:underline">利用条件</a>
        ）
      </p>

      {showHistory && history.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-stone-100 pt-3">
          {history.slice(0, 10).map((h, i) => {
            const info = TYPE_LABEL[h.type] ?? { label: h.memo || h.type, icon: Star, color: "text-stone-400" };
            const Icon = info.icon;
            return (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${info.color}`} />
                  <span className="text-stone-600">{info.label}</span>
                  {h.date && <span className="text-[10px] text-stone-400">{h.date.slice(0, 10)}</span>}
                </div>
                <span className={`font-bold ${h.points >= 0 ? "text-primary" : "text-orange-500"}`}>
                  {h.points >= 0 ? "+" : ""}{h.points}pt
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
