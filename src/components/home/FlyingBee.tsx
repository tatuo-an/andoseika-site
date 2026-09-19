"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

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

type SwarmBee = {
  id: number;
  startX: number;
  startY: number;
  midX: number;
  midY: number;
  endX: number;
  endY: number;
  delay: number;
  duration: number;
  size: number;
  spin: number;
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
  const [swarm, setSwarm] = useState<SwarmBee[]>([]);
  const positionRef = useRef({ x: -BEE_SIZE, y: 140 });
  const swarmTimerRef = useRef<number | undefined>(undefined);

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

  useEffect(
    () => () => {
      if (swarmTimerRef.current !== undefined) {
        window.clearTimeout(swarmTimerRef.current);
      }
    },
    [],
  );

  const releaseSwarm = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const seed = Date.now();

    const bees = Array.from({ length: 28 }, (_, index) => {
      const angle = (Math.PI * 2 * index) / 28 + Math.random() * 0.45;
      const burstDistance = 110 + Math.random() * 210;
      const size = 38 + Math.round(Math.random() * 34);
      return {
        id: seed + index,
        startX: startX - size / 2,
        startY: startY - size / 2,
        midX: Math.max(8, Math.min(width - size - 8, startX + Math.cos(angle) * burstDistance)),
        midY: Math.max(68, Math.min(height - size - 8, startY + Math.sin(angle) * burstDistance)),
        endX: Math.random() * Math.max(1, width - size),
        endY: 68 + Math.random() * Math.max(1, height - size - 76),
        delay: Math.round(Math.random() * 500),
        duration: 3_700 + Math.round(Math.random() * 2_000),
        size,
        spin: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.round(Math.random() * 360)),
      };
    });

    setSwarm(bees);
    if (swarmTimerRef.current !== undefined) window.clearTimeout(swarmTimerRef.current);
    swarmTimerRef.current = window.setTimeout(() => setSwarm([]), 6_500);
  };

  if (!active) return null;

  return (
    <>
      <button
        type="button"
        aria-label="蜂をたくさん呼ぶ"
        className="flying-bee fixed left-0 top-0 z-[45] h-[58px] w-[58px] cursor-pointer border-0 bg-transparent p-0 md:h-[72px] md:w-[72px]"
        style={{
          transform: `translate3d(${flight.x}px, ${flight.y}px, 0) rotate(${flight.rotation}deg)`,
          transitionDuration: `${flight.duration}ms`,
        }}
        onClick={releaseSwarm}
      >
        <span className="flying-bee__bob relative block h-full w-full">
          <Image
            src="/images/bee/flying-bee-v3.png"
            alt=""
            fill
            sizes="72px"
            className="object-contain drop-shadow-[0_4px_5px_rgba(72,53,26,0.24)]"
            draggable={false}
          />
        </span>
      </button>

      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[44] overflow-hidden">
        {swarm.map((bee) => {
          const style = {
            width: `${bee.size}px`,
            height: `${bee.size}px`,
            "--start-x": `${bee.startX}px`,
            "--start-y": `${bee.startY}px`,
            "--mid-x": `${bee.midX}px`,
            "--mid-y": `${bee.midY}px`,
            "--end-x": `${bee.endX}px`,
            "--end-y": `${bee.endY}px`,
            "--swarm-delay": `${bee.delay}ms`,
            "--swarm-duration": `${bee.duration}ms`,
            "--swarm-half-spin": `${bee.spin / 2}deg`,
            "--swarm-spin": `${bee.spin}deg`,
          } as CSSProperties;

          return (
            <span key={bee.id} className="flying-bee__swarm fixed left-0 top-0" style={style}>
              <Image
                src="/images/bee/flying-bee-v3.png"
                alt=""
                fill
                sizes="72px"
                className="object-contain drop-shadow-[0_3px_4px_rgba(72,53,26,0.2)]"
                draggable={false}
              />
            </span>
          );
        })}
      </div>
    </>
  );
}
