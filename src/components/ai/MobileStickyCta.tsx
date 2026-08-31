"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * モバイル幅のみで表示する追従CTAバー。
 * - ヒーローを過ぎたら表示（id="hero-end-sentinel" が画面上端より上に出たら）
 * - フッターに到達したら非表示（id="footer-sentinel" が画面に入ったら）
 * - デスクトップ(md以上)は常に非表示（md:hidden）
 * IntersectionObserverのみで実装し、スクロールイベントのポーリングは行わない。
 */
export function MobileStickyCta() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const heroSentinel = document.getElementById("hero-end-sentinel");
        const footerSentinel = document.getElementById("footer-sentinel");
        if (!heroSentinel || !footerSentinel) return;

        let pastHero = false;
        let nearFooter = false;
        const update = () => setVisible(pastHero && !nearFooter);

        const heroObserver = new IntersectionObserver(
            ([entry]) => {
                pastHero = entry.boundingClientRect.top < 0;
                update();
            },
            { threshold: 0 }
        );
        const footerObserver = new IntersectionObserver(
            ([entry]) => {
                nearFooter = entry.isIntersecting;
                update();
            },
            { threshold: 0 }
        );

        heroObserver.observe(heroSentinel);
        footerObserver.observe(footerSentinel);

        return () => {
            heroObserver.disconnect();
            footerObserver.disconnect();
        };
    }, []);

    return (
        <div
            className={`md:hidden fixed inset-x-0 bottom-0 z-40 bg-primary shadow-[0_-4px_12px_rgba(0,0,0,0.15)] transition-transform duration-200 ease-out ${
                visible ? "translate-y-0" : "translate-y-full"
            }`}
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            <Link
                href="/contact/personal?subject=sns-line"
                className="flex items-center justify-center gap-1.5 py-3 text-sm font-bold text-white"
            >
                無料相談に申し込む
                <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}
