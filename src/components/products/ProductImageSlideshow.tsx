"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductImageSlideshow({ images, alt }: { images: string[]; alt: string }) {
    const [current, setCurrent] = useState(0);
    const touchStartX = useRef<number | null>(null);

    if (images.length === 0) {
        return <div className="aspect-square w-full flex items-center justify-center text-stone-400 bg-stone-100">No Image</div>;
    }

    const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length);
    const next = () => setCurrent((i) => (i + 1) % images.length);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
        touchStartX.current = null;
    };

    return (
        <div className="flex flex-col gap-2">
            {/* メイン画像 */}
            <div
                className="relative aspect-square bg-stone-100 overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <Image
                    src={images[current]}
                    alt={`${alt} ${current + 1}`}
                    fill
                    className="object-cover"
                    priority={current === 0}
                />
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            aria-label="前の画像"
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-stone-700" />
                        </button>
                        <button
                            onClick={next}
                            aria-label="次の画像"
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-stone-700" />
                        </button>
                        {/* ドットインジケーター */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/50"}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* サムネイル */}
            {images.length > 1 && (
                <div className="flex gap-2 px-1">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                                i === current
                                    ? "ring-2 ring-primary ring-offset-1"
                                    : "opacity-50 hover:opacity-80"
                            }`}
                        >
                            <Image src={img} alt={`${alt} ${i + 1}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
