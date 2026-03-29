"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

const SLIDES = [
    {
        // 白ネギ畑 (1280x1280)
        src: "/api/drive-image?id=155_m_uRTPQKnk32rI4aki525I-z3jXsL",
        alt: "白ネギの畑",
    },
    {
        // アカシアの花と蜜蜂 (1280x1280)
        src: "/api/drive-image?id=1TYiV8Wq6Qj6H9mdCreg0e1id_HWqlv0O",
        alt: "アカシアの花と蜜蜂",
    },
    {
        // らっきょうの花畑・風車 (1280x1280)
        src: "/api/drive-image?id=1F5aQn42WF4_nu8PH92eqfjHNMl9NN1q5",
        alt: "らっきょうの花畑",
    },
    {
        // 長芋の収穫 (1280x1280)
        src: "/api/drive-image?id=1150u3CyLASstZ_qS95Y-Yli-L1sDioKr",
        alt: "砂丘長芋の収穫",
    },
];

export function HeroSlideshow() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative h-[92vh] min-h-[640px] flex items-center justify-center overflow-hidden">
            {/* Slides */}
            {SLIDES.map((slide, i) => (
                <div
                    key={i}
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: i === current ? 1 : 0 }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={slide.src}
                        alt={slide.alt}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
            ))}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
                <p className="text-white/70 text-xs md:text-sm font-medium tracking-[0.25em] mb-8 uppercase">
                    Farmer Supporter Program
                </p>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.3] mb-8 drop-shadow-lg font-heading">
                    ただ野菜を買うだけの
                    <br />
                    生活から農家とつながる
                    <br />
                    やさしい暮らしへ。
                </h1>
                <p className="text-white/85 text-base md:text-lg leading-relaxed mb-12 max-w-xl mx-auto">
                    年会費
                    <span className="font-bold text-2xl md:text-3xl mx-1.5">
                        3,000
                    </span>
                    円〜で「親戚の農家」ができる。
                    <br />
                    安藤青果の農家サポーター制度
                    <span className="font-bold">「住民票」</span>
                </p>
                <a
                    href="#plans"
                    className="inline-flex items-center gap-2 bg-white text-stone-900 font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg"
                >
                    プランを見る
                    <ChevronRight className="h-5 w-5" />
                </a>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                            i === current
                                ? "bg-white w-8"
                                : "bg-white/40 hover:bg-white/60"
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
