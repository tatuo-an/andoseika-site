"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
    interface Window {
        twttr?: {
            widgets: {
                load: (el?: HTMLElement) => void;
            };
        };
    }
}

// X（旧Twitter）公式の埋め込みツイート。タイムライン全体の埋め込みはXの制限で
// 描画に失敗することが多いため、個別ツイートのURLを指定する方式にしている。
// 投稿を追加・更新したい場合は tweetUrls に URL を足すだけでよい。
export function XTimeline({ tweetUrls }: { tweetUrls: string[] }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.twttr && containerRef.current) {
            window.twttr.widgets.load(containerRef.current);
        }
    }, [tweetUrls]);

    return (
        <div ref={containerRef} className="space-y-6">
            {tweetUrls.map((url) => (
                <blockquote key={url} className="twitter-tweet" data-theme="light">
                    <a href={url}>{url}</a>
                </blockquote>
            ))}
            <Script
                src="https://platform.twitter.com/widgets.js"
                strategy="afterInteractive"
                onLoad={() => {
                    if (containerRef.current) window.twttr?.widgets.load(containerRef.current);
                }}
            />
        </div>
    );
}
