"use client";

import { ChevronRight } from "lucide-react";
import type { SupporterFirstViewVariant } from "@/config/supporter-variants";

export function HeroSlideshow({
    variant,
}: {
    variant: SupporterFirstViewVariant;
}) {
    return (
        <section className="relative h-[92vh] min-h-[640px] flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={variant.image}
                alt={variant.alt}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
                <p className="text-white/70 text-xs md:text-sm font-medium tracking-[0.25em] mb-8 uppercase">
                    {variant.eyebrow}
                </p>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.3] mb-8 drop-shadow-lg font-heading">
                    {variant.titleLines.map((line) => (
                        <span key={line} className="block">
                            {line}
                        </span>
                    ))}
                </h1>
                <p className="text-white/85 text-base md:text-lg leading-relaxed mb-12 max-w-xl mx-auto">
                    {variant.descriptionLines.map((line) => (
                        <span key={line} className="block">
                            {line}
                        </span>
                    ))}
                </p>
                <a
                    href="#plans"
                    className="inline-flex items-center gap-2 bg-white text-stone-900 font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg"
                >
                    {variant.ctaLabel}
                    <ChevronRight className="h-5 w-5" />
                </a>
            </div>
        </section>
    );
}
