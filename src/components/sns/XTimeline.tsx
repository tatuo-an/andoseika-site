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

// X（旧Twitter）公式の埋め込みタイムラインウィジェット。
// 常に最新の投稿が自動反映される（widgets.js がポーリングして更新）。
export function XTimeline({ username }: { username: string }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // スクリプトが既に読み込み済み（別ページから遷移してきた等）の場合は明示的に再描画する
        if (window.twttr && containerRef.current) {
            window.twttr.widgets.load(containerRef.current);
        }
    }, [username]);

    return (
        <div ref={containerRef}>
            <a
                className="twitter-timeline"
                data-height="600"
                data-theme="light"
                href={`https://twitter.com/${username}?ref_src=twsrc%5Etfw`}
            >
                Tweets by {username}
            </a>
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
