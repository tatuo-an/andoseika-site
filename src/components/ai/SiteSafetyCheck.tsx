// The dedicated tool handles URL input and checks. This LP only links to it.
export function SiteSafetyCheck() {
  return (
    <aside className="site-check" aria-labelledby="site-check-heading">
      <div className="site-check-heading">
        <h2 id="site-check-heading">URLでかんたん確認</h2>
        <span className="site-check-badge">無料</span>
      </div>
      <p className="site-check-intro">診断ツールの画面で、ご自身が管理するサイトのURLを入力してください。</p>
      <a className="site-check-open" href="https://wp-check.ando-seika.workers.dev/" aria-describedby="site-check-status">無料診断ツールを開く<span aria-hidden="true">→</span></a>
      <div className="site-check-status" id="site-check-status">
        <p>公開情報から、サイトの状態を確認します。サイト全体の安全性を保証する診断ではありません。</p>
      </div>
      <a className="site-check-migration" href="#wordpress-migration-price">
        <span>AND Uに引っ越しを頼む<small>移行の料金・ご相談について</small></span>
        <span aria-hidden="true">↓</span>
      </a>
    </aside>
  );
}
