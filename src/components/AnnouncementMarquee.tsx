"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = { text: string; link?: string };

export function AnnouncementMarquee() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.items) ? d.items : []))
      .catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  // 全メッセージを区切りで連結。seamless loop のため2回繰り返す。
  const SEPARATOR = "　・　";
  const renderInline = (key: string) => (
    <span key={key} className="inline-flex items-center gap-0">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center">
          {it.link ? (
            <Link href={it.link} className="hover:underline">
              {it.text}
            </Link>
          ) : (
            <span>{it.text}</span>
          )}
          {i < items.length - 1 && <span aria-hidden="true">{SEPARATOR}</span>}
        </span>
      ))}
      <span aria-hidden="true">{SEPARATOR}</span>
    </span>
  );

  return (
    <div className="bg-primary text-white text-sm overflow-hidden border-b border-primary/20">
      <div className="marquee-track flex whitespace-nowrap py-2">
        {renderInline("a")}
        {renderInline("b")}
      </div>
      <style jsx>{`
        .marquee-track {
          animation: marquee 40s linear infinite;
          width: max-content;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
