"use client";

import { useEffect, useState } from "react";
import { Package } from "lucide-react";

type Item = {
  cycle: string;
  cycleLabel: string;
  shippedAt: string;
  trackingNumber: string;
};

export function DeliveryHistory() {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/my/deliveries")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.items) ? d.items : []))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">詰め合わせ発送履歴</p>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={`${it.cycle}-${it.shippedAt}`} className="flex items-start gap-3">
            <Package className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800">{it.cycleLabel}</p>
              <p className="text-xs text-stone-500 mt-0.5">
                発送日：{it.shippedAt.split(" ")[0]}
                {it.trackingNumber && (
                  <>
                    <span className="mx-1.5">／</span>
                    追跡番号：<code className="bg-stone-100 px-1.5 py-0.5 rounded text-[10px]">{it.trackingNumber}</code>
                  </>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
