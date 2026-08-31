import type { NextConfig } from "next";

// Stripe(決済) / Google・LINE(ログイン) / microCMS(画像) など、現在利用している
// 外部サービスとの通信を壊さない範囲で設定したセキュリティヘッダー。
const CSP = [
  "default-src 'self'",
  // 'unsafe-eval' は開発時のReactデバッグ機能に必要（本番のReactはevalを使わない）
  // challenges.cloudflare.com は /newsletter.html のbot対策(Cloudflare Turnstile)用
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://platform.twitter.com https://*.twimg.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // rondo.ando-seika.workers.dev は /newsletter.html のメール登録送信先(Rondo)
  "connect-src 'self' https://api.stripe.com https://m.stripe.network https://js.stripe.com https://syndication.twitter.com https://cdn.syndication.twimg.com https://rondo.ando-seika.workers.dev",
  "frame-src https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://www.youtube-nocookie.com https://www.youtube.com https://platform.twitter.com https://syndication.twitter.com https://challenges.cloudflare.com",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
      },
      {
        protocol: "https",
        hostname: "*.microcms-assets.io",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
