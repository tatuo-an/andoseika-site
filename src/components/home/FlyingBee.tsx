"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type FlyingBeeProps = {
  /** ISO形式の終了日時。未指定ならテスト用として常時表示する。 */
  activeUntil?: string;
};

type Flight = {
  x: number;
  y: number;
  duration: number;
  rotation: number;
};

const BEE_SIZE = 72;

export function FlyingBee({ activeUntil }: FlyingBeeProps) {
  const [active, setActive] = useState(!activeUntil);
  const [flight, setFlight] = useState<Flight>({
    x: -BEE_SIZE,
    y: 140,
    duration: 0,
    rotation: 0,
  });
  const positionRef = useRef({ x: -BEE_SIZE, y: 140 });

  useEffect(() => {
    if (!activeUntil) return;
    const endAt = new Date(activeUntil).getTime();
    const update = () => setActive(Number.isFinite(endAt) && Date.now() < endAt);
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [activeUntil]);

  useEffect(() => {
    if (!active) return;

    let timer: number | undefined;
    let cancelled = false;

    const flyToNextPoint = () => {
      if (cancelled) return;

      const margin = 12;
      const minY = 76;
      const maxX = Math.max(margin, window.innerWidth - BEE_SIZE - margin);
      const maxY = Math.max(minY, window.innerHeight - BEE_SIZE - margin);
      const x = margin + Math.random() * Math.max(1, maxX - margin);
      const y = minY + Math.random() * Math.max(1, maxY - minY);
      const distance = Math.hypot(x - positionRef.current.x, y - positionRef.current.y);
      const duration = Math.min(8_000, Math.max(3_200, distance * 8 + 1_800));
      const rotation = Math.max(-14, Math.min(14, (y - positionRef.current.y) / 18));

      positionRef.current = { x, y };
      setFlight({ x, y, duration, rotation });
      timer = window.setTimeout(flyToNextPoint, duration + 350);
    };

    const startTimer = window.setTimeout(flyToNextPoint, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="flying-bee pointer-events-none fixed left-0 top-0 z-[45] h-[58px] w-[58px] md:h-[72px] md:w-[72px]"
      style={{
        transform: `translate3d(${flight.x}px, ${flight.y}px, 0) rotate(${flight.rotation}deg)`,
        transitionDuration: `${flight.duration}ms`,
      }}
    >
      <div className="flying-bee__bob relative h-full w-full">
        <Image
          src="/images/bee/flying-bee-v3.png"
          alt=""
          fill
          sizes="72px"
          className="object-contain drop-shadow-[0_4px_5px_rgba(72,53,26,0.24)]"
          draggable={false}
        />
      </div>
    </div>
  );
}
