"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import Link from "next/link";

type Address = {
  label: string;
  name: string;
  birthday: string;
};

function daysUntilBirthday(birthday: string): number | null {
  const match = birthday.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  const month = parseInt(match[1], 10) - 1;
  const day = parseInt(match[2], 10);
  const now = new Date();
  const year = now.getFullYear();
  let next = new Date(year, month, day);
  if (next.getTime() - now.getTime() < 0) {
    next = new Date(year + 1, month, day);
  }
  const diffMs = next.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function BirthdayBanner() {
  const [upcoming, setUpcoming] = useState<{ label: string; name: string; days: number }[]>([]);

  useEffect(() => {
    fetch("/api/address")
      .then((r) => r.json())
      .then((data) => {
        const addresses: Address[] = data.addresses ?? [];
        const results = addresses
          .filter((a) => a.birthday)
          .flatMap((a) => {
            const days = daysUntilBirthday(a.birthday);
            if (days !== null && days <= 14) {
              return [{ label: a.label, name: a.name, days }];
            }
            return [];
          })
          .sort((a, b) => a.days - b.days);
        setUpcoming(results);
      })
      .catch(() => {});
  }, []);

  if (upcoming.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {upcoming.map((item) => (
        <div
          key={item.label}
          className="bg-pink-50 border border-pink-200 rounded-2xl px-5 py-4 flex items-start gap-3"
        >
          <Gift className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-pink-800">
              {item.name}さんの誕生日まで{item.days === 0 ? "今日！" : `${item.days}日`}
            </p>
            <p className="text-xs text-pink-600 mt-0.5">
              ご家族やお友達に誕生日プレゼントを送りませんか？
            </p>
          </div>
          <Link
            href="/products"
            className="flex-shrink-0 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 transition-colors px-3 py-1.5 rounded-full"
          >
            商品を見る
          </Link>
        </div>
      ))}
    </div>
  );
}
