import type { Metadata } from "next";
import Link from "next/link";
import { Shippori_Mincho } from "next/font/google";
import "./castles.css";

const mincho = Shippori_Mincho({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-castles-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | 全国の城 図鑑",
    default: "全国の城 図鑑 ― 現存12天守から模擬天守まで",
  },
  description:
    "現存12天守を筆頭に、木造復元・外観復元・復興・模擬の天守種別ごと、都道府県順に全国66城の写真と歴史（歴代城主・年表・焼失と復元の経緯）をまとめた図鑑。",
  robots: { index: false, follow: false }, // 制作中のため検索エンジンには載せない
};

export default function CastlesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`castles-root ${mincho.variable}`}>
      <nav className="castles-nav" aria-label="図鑑ナビゲーション">
        <Link href="/castles" className="castles-nav__brand">
          全国の城 図鑑
        </Link>
        <div className="castles-nav__links">
          <Link href="/castles#toc">目次</Link>
          <Link href="/castles/book">通読（本）</Link>
          <Link href="/">サイトTOP</Link>
        </div>
      </nav>
      <div className="castles-container">{children}</div>
    </div>
  );
}
