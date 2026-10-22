// The dedicated tool handles URL input and checks. This LP only links to it.
export function SiteSafetyCheck() {
  return (
    <aside className="site-check" aria-labelledby="site-check-heading">
      <div className="site-check-heading">
        <h2 id="site-check-heading">URLでかんたん確認</h2>
        <span className="site-check-badge">無料</span>
      </div>
      <p className="site-check-intro">点検キットの画面で、ご自身が管理するサイトのURLを入力してください。WordPress以外も確認できます。</p>
      <a className="site-check-open" href="https://wp-check.ando-seika.workers.dev/" aria-describedby="site-check-status">無料のサイト点検を始める<span aria-hidden="true">→</span></a>
      <div className="site-check-status" id="site-check-status">
        <p>公開情報から状態を確認し、気になる点はAND Uに相談できます。サイト全体の安全性を保証する点検ではありません。</p>
      </div>
      <a className="site-check-migration" href="#wordpress-migration-price">
        <span>AND Uに引っ越しを頼む<small>移行の料金・ご相談について</small></span>
        <span aria-hidden="true">↓</span>
      </a>
    </aside>
  );
}
