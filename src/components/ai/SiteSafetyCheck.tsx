/**
 * Presentation only until the WordPress kit's handoff supplies the component
 * and endpoint. Do not submit URLs or invent diagnostic results here.
 */
export function SiteSafetyCheck() {
  return (
    <aside className="site-check" aria-labelledby="site-check-heading">
      <div className="site-check-heading">
        <h2 id="site-check-heading">URLでかんたん確認</h2>
        <span className="site-check-badge">公開準備中</span>
      </div>
      <label htmlFor="site-check-url">ご自身が管理するサイトのURL</label>
      <input
        id="site-check-url"
        type="url"
        placeholder="https://example.com"
        aria-describedby="site-check-status"
        disabled
      />
      <button type="button" disabled aria-describedby="site-check-status">準備中</button>
      <div className="site-check-status" id="site-check-status">
        <p>診断機能は準備中です。</p>
        <p>現在はURLの送信・保存・診断は行いません。公開情報だけで、サイト全体の安全性を保証するものではありません。</p>
      </div>
      <a className="site-check-migration" href="#wordpress-migration-price">
        <span>安藤青果に引っ越しを頼む<small>移行の料金・ご相談について</small></span>
        <span aria-hidden="true">↓</span>
      </a>
    </aside>
  );
}
