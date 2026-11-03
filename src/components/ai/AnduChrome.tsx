import Link from "next/link";

const BRAND_SUB = "ホームページ制作・SNS運用サポート";

export function AnduHeader({ current }: { current: "website" | "sns" }) {
  return <>
    <header className="site-header">
      <p className="brand"><span className="brand-name">AND U</span><span className="brand-sub">{BRAND_SUB}</span></p>
      <nav className="header-nav" aria-label="サービスの切り替え">
        <Link href="/ai" aria-current={current === "website" ? "page" : undefined}>ホームページ</Link>
        <Link href="/ai/sns" aria-current={current === "sns" ? "page" : undefined}>SNS代行</Link>
      </nav>
      <a className="header-cta" href="https://lin.ee/WfeFzfF" target="_blank" rel="noopener noreferrer">LINEで無料相談</a>
    </header>
    <p className="service-promise">鳥取のお店の、ホームページとSNSをまるごと引き受けます。</p>
  </>;
}

export function AnduFooter() {
  return <footer className="site-footer">
    <p className="footer-shop">運営：安藤青果 <Link href="/">事業者ホームページ（ando-seika.com）</Link></p>
    <p><span className="brand-name">AND U</span><small className="brand-sub">{BRAND_SUB}</small></p>
    <p className="footer-legal"><Link href="/tokusho">特定商取引法に基づく表示</Link><Link href="/privacy">プライバシーポリシー</Link></p>
  </footer>;
}

export function AnduSocialProof() {
  return <p className="social-proof">僕は自分の店のSNSを、毎日続けています。<span>X 13,824人（2026年10月26日）・Threads 76人から1,869人（2026年10月26日）・Threadsの1投稿で1.4万いいね（2026年8月）</span></p>;
}
