import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New, Outfit } from "next/font/google";
import "./globals.css";

const zenKaku = Zen_Kaku_Gothic_New({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-zen-kaku",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | &YOU 安藤青果",
    default: "&YOU 安藤青果 | 鳥取の畑みんなで、まじめにふざける、おいしい毎日。",
  },
  description: "鳥取県倉吉市・北栄町で、白ネギ・長芋・梨・蜂蜜・らっきょうを育てる農家「安藤青果」。B型就労支援の仲間と共に、遊ぶように働きながら、みんなが幸せになれる農業を目指しています。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://andoseika.jp",
    siteName: "&YOU 安藤青果",
    images: [
      {
        url: "/images/hero/hero_sand_dunes.jpg",
        width: 1200,
        height: 630,
        alt: "&YOU 安藤青果",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

import { CartProvider } from "@/components/providers/CartProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${zenKaku.variable} ${outfit.variable} antialiased`}
      >
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

