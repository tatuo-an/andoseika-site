import { Metadata } from "next";
import Script from "next/script";

// 【保管用ページ】改善前の旧LP。講義で「旧版→新版」の比較に使うため残しています。
// 検索結果には出さない（お客様が古い価格のページに迷い込まないようにするため）。
export const metadata: Metadata = {
    title: "【旧版・保管用】業務用白ネギの仕入れ｜安藤青果",
    description:
        "改善前の旧ランディングページです。講義用に保管しています。最新のご案内は /business/negi をご覧ください。",
    robots: { index: false, follow: false },
};

// このページは独立したLP（ランディングページ）です。
// サイト共通のHeader/Footerは使わず、LP自身の完結したデザインをそのまま表示します。
// スタイルは他ページに影響しないよう、すべて .negi-lp 配下にスコープしています。
const NEGI_LP_CSS = `
.negi-lp *{box-sizing:border-box}
.negi-lp{margin:0;font-family:"Hiragino Sans","Yu Gothic","Noto Sans JP",sans-serif;color:#183022;background:#fff}
.negi-lp a{text-decoration:none;color:inherit}
.negi-lp img{display:block;max-width:100%}
.negi-lp .container{width:min(1120px,92%);margin:auto}
.negi-lp .btn{display:inline-flex;align-items:center;justify-content:center;padding:14px 24px;border-radius:999px;font-weight:800;transition:.2s}
.negi-lp .btn.primary{background:#f3c54a;color:#20331d}
.negi-lp .btn.outline{border:1px solid #ffffff88;color:#fff}
.negi-lp .hero{background:linear-gradient(115deg,#0d6135 0%,#143b27 60%,#11281e 100%);color:#fff;position:relative;overflow:hidden}
.negi-lp .hero::after{content:"";position:absolute;inset:0 0 0 48%;background:linear-gradient(90deg,#143b27 0%,transparent 44%),url('/images/negi-lp/negi-regai-dai.jpg') center/cover;opacity:.82}
.negi-lp .nav{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:22px 0}
.negi-lp .brand{font-weight:900;font-size:22px}
.negi-lp .nav-links{display:flex;align-items:center;gap:22px;font-size:14px}
.negi-lp .hero-inner{position:relative;z-index:2;padding:72px 0 90px;width:min(58%,660px)}
.negi-lp .eyebrow{display:inline-block;font-size:14px;letter-spacing:.14em;font-weight:900;color:#f0d172}
.negi-lp .hero h1{font-size:clamp(38px,5vw,68px);line-height:1.1;margin:18px 0 20px}
.negi-lp .hero p{font-size:18px;line-height:1.8;color:#eff4f1}
.negi-lp .hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:28px}
.negi-lp .hero-points{display:flex;gap:14px;flex-wrap:wrap;margin-top:36px}
.negi-lp .hero-point{min-width:150px;background:#ffffff10;border:1px solid #ffffff22;border-radius:15px;padding:14px 18px}
.negi-lp .hero-point b{display:block;font-size:24px;color:#ffe283}
.negi-lp .hero-point span{display:block;font-size:12px;color:#d7e7de;margin-top:3px}
.negi-lp .hero-photo{display:none}
.negi-lp section{padding:82px 0}
.negi-lp .section-head{max-width:820px;margin:0 auto 44px;text-align:center}
.negi-lp .section-head .mini{font-size:13px;font-weight:900;letter-spacing:.12em;color:#14713e}
.negi-lp .section-head h2{font-size:clamp(28px,4vw,42px);line-height:1.25;margin:12px 0 14px}
.negi-lp .section-head p{line-height:1.85;color:#5d6c62}
.negi-lp .info-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.negi-lp .info-card{background:#f3f8f4;border-radius:18px;padding:28px;text-align:center}
.negi-lp .info-card .big{font-size:34px;font-weight:900;color:#186f3e}
.negi-lp .info-card p{font-size:14px;line-height:1.75;color:#5c6d61}
.negi-lp .products{background:#f5f7f6}
.negi-lp .product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.negi-lp .product{background:#fff;border:1px solid #dbe8de;border-radius:22px;overflow:hidden;box-shadow:0 8px 28px rgba(24,56,31,.08)}
.negi-lp .product img{width:100%;height:320px;object-fit:cover;object-position:center}
.negi-lp .product-body{padding:24px;display:grid;grid-template-rows:minmax(46px,auto) minmax(62px,auto) auto auto auto;align-items:start}
.negi-lp .tag{display:inline-block;padding:5px 10px;border-radius:999px;background:#e9f5ec;color:#176d3d;font-size:12px;font-weight:900}
.negi-lp .product h3{font-size:24px;line-height:1.25;margin:14px 0 8px}
.negi-lp .product .price{font-size:34px;font-weight:900;color:#d06a1b}
.negi-lp .product .price small{font-size:13px;color:#6b716e}
.negi-lp .product ul{padding-left:18px;font-size:14px;line-height:1.8;color:#526158}
.negi-lp .perpiece{margin-top:14px;padding:12px 14px;border-radius:12px;background:#f9f4e8;color:#795100;font-size:13px;font-weight:700}
.negi-lp .delivery{background:#173a28;color:#fff}
.negi-lp .delivery-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:42px;align-items:center}
.negi-lp .delivery h2{font-size:clamp(30px,4vw,44px);line-height:1.25;margin:12px 0 16px}
.negi-lp .delivery p{line-height:1.9;color:#dbe7df}
.negi-lp .delivery-list{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:28px}
.negi-lp .delivery-item{background:#ffffff10;border:1px solid #ffffff22;border-radius:14px;padding:18px}
.negi-lp .delivery-item b{display:block;font-size:22px;color:#f2cf72}
.negi-lp .delivery-item span{display:block;font-size:13px;color:#d8e7de;margin-top:4px;line-height:1.6}
.negi-lp .related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.negi-lp .related{border-radius:22px;overflow:hidden;background:#fff;border:1px solid #dbe7dd;box-shadow:0 8px 28px rgba(24,56,31,.07)}
.negi-lp .related img{width:100%;height:260px;object-fit:cover}
.negi-lp .related-body{padding:24px}
.negi-lp .related h3{font-size:24px;margin:0 0 10px}
.negi-lp .related .season{font-size:13px;font-weight:900;color:#166b3b;margin-bottom:8px}
.negi-lp .related .price{font-size:22px;font-weight:900;color:#cb681d;margin:8px 0 12px}
.negi-lp .related p{font-size:14px;line-height:1.8;color:#55645b;margin:0}
.negi-lp .faq{background:#f3f7f4}
.negi-lp .faq-list{max-width:900px;margin:0 auto}
.negi-lp details{background:#fff;border:1px solid #dbe7dd;border-radius:14px;padding:18px 22px;margin:12px 0}
.negi-lp summary{cursor:pointer;font-weight:900}
.negi-lp details p{line-height:1.85;color:#5b6a60;margin:12px 0 0}
.negi-lp .cta{background:#176a3c;color:#fff;text-align:center}
.negi-lp .cta h2{font-size:clamp(30px,4vw,44px);margin:0 0 14px}
.negi-lp .cta p{line-height:1.85;color:#dfece4;max-width:760px;margin:0 auto}
.negi-lp .cta-actions{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:28px}
.negi-lp footer{background:#10281c;color:#c9d8cf;padding:30px 0}
.negi-lp footer .container{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;font-size:13px}
.negi-lp .note{font-size:12px;color:#607167;line-height:1.8;margin-top:18px}
@media(max-width:960px){
  .negi-lp .hero::after{content:none}
  .negi-lp .hero-inner{width:100%;padding:58px 0 40px;background:#143b27}
  .negi-lp .hero-point{background:#0d3320;border:1px solid #ffffff26}
  .negi-lp .hero-photo{display:block;width:100%;height:220px;overflow:hidden}
  .negi-lp .hero-photo img{width:100%;height:100%;object-fit:cover;display:block}
  .negi-lp .nav-links a:not(.btn){display:none}
  .negi-lp .info-grid,.negi-lp .product-grid,.negi-lp .related-grid,.negi-lp .delivery-list{grid-template-columns:1fr}
  .negi-lp .delivery-grid{grid-template-columns:1fr}
}
@media print{
  @page{size:1280px 1810px;margin:0}
  html,body{background:#fff}
  *,*::before,*::after{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;color-adjust:exact !important}
  /* 画面幅に関係なくデスクトップの段組みを強制 */
  .negi-lp .worry-grid{grid-template-columns:repeat(4,1fr) !important}
  .negi-lp .product-grid,.negi-lp .usecase-grid,.negi-lp .client-grid,.negi-lp .achv-grid,.negi-lp .voice-grid,.negi-lp .related-grid{grid-template-columns:repeat(3,1fr) !important}
  .negi-lp .info-grid{grid-template-columns:repeat(4,1fr) !important}
  .negi-lp .delivery-grid{grid-template-columns:1.1fr .9fr !important}
  .negi-lp .delivery-list{grid-template-columns:1fr 1fr !important}
  .negi-lp .hero::after{content:"" !important}
  .negi-lp .hero-inner{width:min(58%,660px) !important;background:none !important}
  .negi-lp .hero-photo{display:none !important}
  .negi-lp .nav-links a:not(.btn){display:inline-flex !important}
  .negi-lp section{padding:36px 0 !important}
  .negi-lp .container{width:96% !important}
  /* 濃い背景セクションは「背景のグラフィック」チェックが外れていても色を出す */
  .negi-lp .hero{background:linear-gradient(115deg,#0d6135 0%,#143b27 60%,#11281e 100%) !important}
  .negi-lp .delivery{background:#173a28 !important}
  .negi-lp .cta{background:#176a3c !important}
  .negi-lp footer{background:#10281c !important}
  /* サイト共通のフローティングUI（会員バナー・LINE友だちバナー・チャット）を印刷から消す */
  body > header,body > nav,[class*="fixed"],[class*="sticky"],[aria-label*="チャット"],[id*="chat"],[class*="chat"],nextjs-portal{display:none !important}
  /* 印刷に出さないもの */
  #negi-old-edit-toolbar{display:none !important}
  #negi-edit-toolbar{display:none !important}
  .negi-lp details{break-inside:avoid}
  .negi-lp .usecase-card,.negi-lp .client-card,.negi-lp .product,.negi-lp .worry-card,.negi-lp .voice-sample{break-inside:avoid}
  .negi-lp section{break-inside:auto}
}
`;

const CONTACT_HREF = "/contact/business?from=negi-lp";

export default function NegiLPOldPage() {
    return (
        <div className="negi-lp">
            <style dangerouslySetInnerHTML={{ __html: NEGI_LP_CSS }} />
            {/* 開発画面（localhost）限定の編集ツールバー（新版と同じ機能）。文字サイズ・太さ調整・取り消し(Undo)とlocalStorageへの下書き保存ができる。本番ビルドでは描画されない */}
            {process.env.NODE_ENV === "development" && (
                <Script
                    id="negi-old-edit-mode"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
(function(){
  if (window.__negiOldEditToolbarInit) return;
  window.__negiOldEditToolbarInit = true;

  var STORAGE_KEY = 'negi-old-lp-draft';
  var TOOLBAR_ID = 'negi-old-edit-toolbar';
  var VERSION_LABEL = '旧版';
  var MAX_HISTORY = 50;
  var DEBOUNCE_MS = 600;

  function getLp(){
    return document.querySelector('.negi-lp');
  }

  function formatSavedAt(iso){
    try {
      var d = new Date(iso);
      var mm = d.getMonth() + 1;
      var dd = d.getDate();
      var hh = ('0' + d.getHours()).slice(-2);
      var mi = ('0' + d.getMinutes()).slice(-2);
      return mm + '/' + dd + ' ' + hh + ':' + mi;
    } catch (e) {
      return '';
    }
  }

  function readSaved(){
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function restoreIfSaved(){
    var data = readSaved();
    var lp = getLp();
    if (data && data.html && lp && lp.innerHTML !== data.html) {
      lp.innerHTML = data.html;
      return true;
    }
    return false;
  }

  // ページ読み込み時、保存済みの下書きがあれば.negi-lpの中身を差し替えて復元する。
  // 注意: Next.js(React)のハイドレーションが後から元の内容へ描き直すため、
  //       ハイドレーション完了を待ってから復元し、数回だけ再確認する。
  // ツールバーは document.body 直下に置くため、この差し替えでは消えない。
  function scheduleRestore(){
    if (!readSaved()) return;
    var tries = 0;
    function attempt(){
      tries++;
      restoreIfSaved();
      if (tries < 4) setTimeout(attempt, 250 * tries);
    }
    if (document.readyState === 'complete') {
      setTimeout(attempt, 150);
    } else {
      window.addEventListener('load', function(){ setTimeout(attempt, 150); });
    }
  }
  scheduleRestore();

  function getTargetElement(){
    var sel = window.getSelection();
    if (!sel || !sel.anchorNode) return null;
    var node = sel.anchorNode;
    var el = node.nodeType === 1 ? node : node.parentElement;
    var lp = getLp();
    var toolbarEl = document.getElementById(TOOLBAR_ID);
    if (!el || !lp) return null;
    if (toolbarEl && toolbarEl.contains(el)) return null;
    if (el === lp || !lp.contains(el)) return null;
    return el;
  }

  // ---- 編集履歴（Undo）----
  // document.designMode 下の編集は execCommand('undo') が効かないことがあるため、
  // .negi-lp の innerHTML スナップショットを自前の配列に積んで戻す方式にする。
  var history = [];

  function pushHistory(){
    var lp = getLp();
    if (!lp) return;
    var html = lp.innerHTML;
    if (history.length && history[history.length - 1] === html) return;
    history.push(html);
    if (history.length > MAX_HISTORY) history.shift();
    refreshUndoStatus();
  }

  function isInsideLp(target){
    var lp = getLp();
    if (!lp || !target) return false;
    var el = target.nodeType === 1 ? target : target.parentElement;
    return !!(el && lp.contains(el));
  }

  var burstActive = false;
  var burstTimer = null;

  function endBurst(){
    burstActive = false;
    burstTimer = null;
  }

  function noteTypingActivity(){
    if (!burstActive) {
      burstActive = true;
      pushHistory();
    }
    if (burstTimer) clearTimeout(burstTimer);
    burstTimer = setTimeout(endBurst, DEBOUNCE_MS);
  }

  var toolbar = document.createElement('div');
  toolbar.id = TOOLBAR_ID;
  toolbar.style.cssText = 'position:fixed;bottom:16px;left:16px;z-index:99999;background:#143b27;color:#fff;border-radius:14px;box-shadow:0 4px 18px rgba(0,0,0,.35);padding:12px 16px;font-family:"Hiragino Sans","Yu Gothic","Noto Sans JP",sans-serif;max-width:min(92vw,560px)';

  var verLabel = document.createElement('div');
  verLabel.style.cssText = 'font-size:11px;font-weight:900;letter-spacing:.08em;color:#f0d172;margin-bottom:6px';
  verLabel.textContent = VERSION_LABEL;
  toolbar.appendChild(verLabel);

  var help = document.createElement('div');
  help.style.cssText = 'font-size:13px;line-height:1.6;margin-bottom:8px;color:#dfece4';
  help.textContent = '文字をクリックしてから A+ / A- / B を押してください。編集が終わったら 💾保存 を押します。';
  toolbar.appendChild(help);

  var row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap';
  toolbar.appendChild(row);

  function makeButton(label){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.style.cssText = 'padding:10px 14px;font-size:13px;border-radius:8px;border:none;cursor:pointer;font-weight:700;background:#1f5a3a;color:#fff';
    row.appendChild(btn);
    return btn;
  }

  var editBtn = makeButton('✏️ 編集 OFF');
  var smallerBtn = makeButton('A- 小さく');
  var biggerBtn = makeButton('A+ 大きく');
  var boldBtn = makeButton('B 太く');
  var saveBtn = makeButton('💾 保存');
  var pdfBtn = makeButton('📄 PDFで保存');
  var undoBtn = makeButton('↩️ 取り消し');
  var resetBtn = makeButton('🗑 全部リセット');

  var status = document.createElement('span');
  status.style.cssText = 'font-size:11px;color:#c9d8cf;margin-left:4px';
  row.appendChild(status);

  var undoStatus = document.createElement('div');
  undoStatus.style.cssText = 'font-size:11px;color:#c9d8cf;margin-top:6px';
  toolbar.appendChild(undoStatus);

  var pdfHelp = document.createElement('div');
  pdfHelp.style.cssText = 'font-size:11px;line-height:1.6;margin-top:8px;color:#c9d8cf';
  pdfHelp.textContent = 'PDFで保存 → 送信先「PDFに保存」／「背景のグラフィック」にチェック（用紙サイズは自動）';
  toolbar.appendChild(pdfHelp);

  function refreshStatus(){
    var data = readSaved();
    if (data && data.savedAt) {
      status.textContent = '保存済み（' + formatSavedAt(data.savedAt) + '）';
    } else {
      status.textContent = '未保存';
    }
  }
  refreshStatus();

  function refreshUndoStatus(){
    undoStatus.textContent = '取り消し可能: ' + history.length;
    var empty = history.length === 0;
    undoBtn.disabled = empty;
    undoBtn.style.opacity = empty ? '.5' : '1';
    undoBtn.style.cursor = empty ? 'default' : 'pointer';
  }

  editBtn.onclick = function(){
    var turningOn = document.designMode !== 'on';
    if (turningOn) pushHistory();
    document.designMode = turningOn ? 'on' : 'off';
    editBtn.textContent = turningOn ? '✏️ 編集 ON' : '✏️ 編集 OFF';
    editBtn.style.background = turningOn ? '#c0392b' : '#1f5a3a';
  };

  // A-/A+/Bのボタンをmousedownの時点でpreventDefaultし、クリックしても選択中のカーソル位置が失われないようにする
  function keepSelectionOnMouseDown(btn){
    btn.addEventListener('mousedown', function(e){ e.preventDefault(); });
  }
  keepSelectionOnMouseDown(smallerBtn);
  keepSelectionOnMouseDown(biggerBtn);
  keepSelectionOnMouseDown(boldBtn);

  smallerBtn.onclick = function(){
    var el = getTargetElement();
    if (!el) return;
    pushHistory();
    var current = parseFloat(window.getComputedStyle(el).fontSize) || 16;
    el.style.fontSize = Math.max(8, current - 2) + 'px';
  };

  biggerBtn.onclick = function(){
    var el = getTargetElement();
    if (!el) return;
    pushHistory();
    var current = parseFloat(window.getComputedStyle(el).fontSize) || 16;
    el.style.fontSize = (current + 2) + 'px';
  };

  boldBtn.onclick = function(){
    var el = getTargetElement();
    if (!el) return;
    pushHistory();
    var current = parseInt(window.getComputedStyle(el).fontWeight, 10) || 400;
    el.style.fontWeight = current >= 700 ? '400' : '700';
  };

  saveBtn.onclick = function(){
    var lp = getLp();
    if (!lp) return;
    var data = { html: lp.innerHTML, savedAt: new Date().toISOString() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      refreshStatus();
    } catch (e) {
      window.alert('保存に失敗しました。');
    }
  };

  pdfBtn.onclick = function(){
    window.print();
  };

  undoBtn.onclick = function(){
    if (!history.length) return;
    var html = history.pop();
    var lp = getLp();
    if (lp) lp.innerHTML = html;
    burstActive = false;
    if (burstTimer) { clearTimeout(burstTimer); burstTimer = null; }
    refreshUndoStatus();
  };

  resetBtn.onclick = function(){
    if (!window.confirm('保存した編集内容を消して、元のページに戻します。よろしいですか？')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    location.reload();
  };

  document.body.appendChild(toolbar);

  // 初期状態をUndo履歴の1件目として積む
  pushHistory();

  document.addEventListener('keydown', function(e){
    if (!isInsideLp(e.target)) return;
    if (e.key === 'Enter') {
      pushHistory();
      burstActive = true;
      if (burstTimer) clearTimeout(burstTimer);
      burstTimer = setTimeout(endBurst, DEBOUNCE_MS);
      return;
    }
    noteTypingActivity();
  }, true);

  document.addEventListener('input', function(e){
    if (!isInsideLp(e.target)) return;
    noteTypingActivity();
  }, true);
})();`,
                    }}
                />
            )}

            <header className="hero">
                <div className="container">
                    <nav className="nav">
                        <div className="brand">安藤青果</div>
                        <div className="nav-links">
                            <a href="#negi">白ネギ</a>
                            <a href="#others">らっきょう・長芋</a>
                            <a href="#faq">Q&amp;A</a>
                            <a className="btn primary" href={CONTACT_HREF}>
                                業務用フォームで相談する
                            </a>
                        </div>
                    </nav>
                    <div className="hero-inner">
                        <span className="eyebrow">飲食店・加工業者・業務用向け</span>
                        <h1>
                            白ネギを
                            <br />
                            年中出荷できます。
                        </h1>
                        <p>
                            白ネギを中心に、洗いらっきょう・甘酢らっきょう・業務用長芋まで。用途、数量、配送方法に合わせて、現場で使いやすい条件をご提案します。
                        </p>
                        <div className="hero-actions">
                            <a className="btn primary" href={CONTACT_HREF}>
                                業務用フォームで相談する
                            </a>
                            <a className="btn outline" href="tel:07084348124">
                                電話する 070-8434-8124
                            </a>
                            <a
                                className="btn outline"
                                href="mailto:tatuo.an@gmail.com?subject=白ネギの試験導入相談"
                            >
                                メールで相談する
                            </a>
                        </div>
                        <div className="hero-points">
                            <div className="hero-point">
                                <b>年中</b>
                                <span>白ネギを出荷可能</span>
                            </div>
                            <div className="hero-point">
                                <b>15kg〜</b>
                                <span>週1回15kgから配送</span>
                            </div>
                            <div className="hero-point">
                                <b>木曜</b>
                                <span>毎週木曜日に配送します</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-photo" aria-hidden="true">
                    <img
                        src="/images/negi-lp/negi-regai-dai.jpg"
                        alt=""
                        loading="lazy"
                    />
                </div>
            </header>

            <section>
                <div className="container">
                    <div className="section-head">
                        <div className="mini">仕入れ条件のポイント</div>
                        <h2>
                            必要量と使い方に合わせて、
                            <br />
                            仕入れしやすい形でご案内します。
                        </h2>
                        <p>
                            見栄え重視の秀品から、カット用途で使いやすい規格外まで。年中、週1回15kgから配送できます。毎週木曜日に配送します。
                        </p>
                    </div>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="big">年中</div>
                            <p>白ネギを年中出荷できます。</p>
                        </div>
                        <div className="info-card">
                            <div className="big">15kg〜</div>
                            <p>週1回15kgから配送できます。</p>
                        </div>
                        <div className="info-card">
                            <div className="big">毎週木曜</div>
                            <p>毎週木曜日に配送します。</p>
                        </div>
                        <div className="info-card">
                            <div className="big">1,600円〜</div>
                            <p>白ネギの参考価格は1,600円からです。</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="negi" className="products">
                <div className="container">
                    <div className="section-head">
                        <div className="mini">白ネギラインナップ</div>
                        <h2>白ネギの参考価格は1,600円から。</h2>
                        <p>画像はすべて実物写真です。規格、数量、時期、配送条件に応じて正式なお見積をご案内します。</p>
                    </div>
                    <div className="product-grid">
                        <article className="product">
                            <img
                                src="/images/negi-lp/negi-shuhin.jpg"
                                alt="3kg秀品の白ネギ"
                                loading="lazy"
                            />
                            <div className="product-body">
                                <span className="tag">見栄え重視</span>
                                <h3>3kg 秀品</h3>
                                <div className="price">
                                    1,600円〜 <small>参考価格</small>
                                </div>
                                <ul>
                                    <li>2L：約20本</li>
                                    <li>L：約30本</li>
                                    <li>L4：約40本</li>
                                    <li>M：約50本</li>
                                    <li>用途：飲食店、店舗販売、見栄え重視の仕入れ向け</li>
                                </ul>
                            </div>
                        </article>

                        <article className="product">
                            <img
                                src="/images/negi-lp/negi-regai-dai.jpg"
                                alt="5kg規格外大の白ネギ"
                                loading="lazy"
                            />
                            <div className="product-body">
                                <span className="tag">焼き物・カット向け</span>
                                <h3>5kg 規格外・大</h3>
                                <div className="price">
                                    2,000円〜 <small>参考価格</small>
                                </div>
                                <ul>
                                    <li>約45〜50本</li>
                                    <li>市販の3〜4本束程度の太さ</li>
                                    <li>焼き鳥、鍋、カット野菜に使いやすい規格です</li>
                                </ul>
                                <div className="perpiece">1本あたりの目安：約40〜45円</div>
                            </div>
                        </article>

                        <article className="product">
                            <img
                                src="/images/negi-lp/negi-regai-sho.jpg"
                                alt="5kg規格外小の白ネギ"
                                loading="lazy"
                            />
                            <div className="product-body">
                                <span className="tag">本数重視</span>
                                <h3>5kg 規格外・小</h3>
                                <div className="price">
                                    1,600円〜 <small>参考価格</small>
                                </div>
                                <ul>
                                    <li>約60〜70本</li>
                                    <li>市販の4〜5本束程度の太さ</li>
                                    <li>薬味、惣菜、大量調理に向いています</li>
                                </ul>
                                <div className="perpiece">1本あたりの目安：約23〜27円</div>
                            </div>
                        </article>
                    </div>
                    <div className="note">
                        ※参考価格は相場、数量、配送条件、時期によって変動します。正式価格はお見積でご案内します。
                    </div>
                </div>
            </section>

            <section className="delivery">
                <div className="container">
                    <div className="delivery-grid">
                        <div>
                            <div className="eyebrow">配達・配送の考え方</div>
                            <h2>
                                年中、週1回15kgから
                                <br />
                                配送できます。
                            </h2>
                            <p>
                                白ネギは年中出荷できます。毎週木曜日に配送します。必要量、使い方、納品先に合わせて、定期取引・試験導入のどちらもご相談いただけます。
                            </p>
                        </div>
                        <div className="delivery-list">
                            <div className="delivery-item">
                                <b>15kg〜</b>
                                <span>週1回15kgから配送できます。</span>
                            </div>
                            <div className="delivery-item">
                                <b>週1回</b>
                                <span>年中、週1回のペースで配送します。</span>
                            </div>
                            <div className="delivery-item">
                                <b>木曜便</b>
                                <span>毎週木曜日に配送します。</span>
                            </div>
                            <div className="delivery-item">
                                <b>相談対応</b>
                                <span>定期利用、試験導入、用途別の規格相談に対応します。</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="others">
                <div className="container">
                    <div className="section-head">
                        <div className="mini">白ネギ以外の業務用商材</div>
                        <h2>らっきょうと長芋も、あわせて提案できます。</h2>
                        <p>
                            白ネギの営業先でも、使い方によってはらっきょうや長芋が刺さります。季節と用途に応じて、あわせてご案内できるようにしています。
                        </p>
                    </div>
                    <div className="related-grid">
                        <article className="related">
                            <img
                                src="/images/negi-lp/arai-rakkyo.jpg"
                                alt="洗いらっきょう"
                                loading="lazy"
                            />
                            <div className="related-body">
                                <div className="season">5月〜6月</div>
                                <h3>洗いらっきょう</h3>
                                <div className="price">1kg：1,200円〜</div>
                                <p>実需向けの業務用提案です。まとめ買いにも対応しやすく、加工前の素材として使いたい方向けです。</p>
                            </div>
                        </article>

                        <article className="related">
                            <img
                                src="/images/negi-lp/amazu-rakkyo.jpg"
                                alt="甘酢らっきょう"
                                loading="lazy"
                            />
                            <div className="related-body">
                                <div className="season">年中</div>
                                <h3>甘酢らっきょう</h3>
                                <div className="price">180g：800円〜 / 500g：1,800円〜</div>
                                <p>そのまま使える商品として、通年で提案できます。小売向けだけでなく、飲食店や贈答向けの提案にも使えます。</p>
                            </div>
                        </article>

                        <article className="related">
                            <img
                                src="/images/negi-lp/nagaimo.jpg"
                                alt="業務用長芋"
                                loading="lazy"
                            />
                            <div className="related-body">
                                <div className="season">11月上旬〜4月下旬</div>
                                <h3>業務用長芋</h3>
                                <div className="price">5kg：3,000円〜 / 10kg：5,000円〜</div>
                                <p>曲がりや短めの分留まり品も含めて提案できます。業務用で使いやすい箱単位でご案内します。</p>
                            </div>
                        </article>
                    </div>
                    <div className="note">
                        ※参考価格は相場、数量、配送条件、時期によって変動します。正式価格はお見積でご案内します。
                    </div>
                </div>
            </section>

            <section id="faq" className="faq">
                <div className="container">
                    <div className="section-head">
                        <div className="mini">よくある質問</div>
                        <h2>商談前によく聞かれること</h2>
                    </div>
                    <div className="faq-list">
                        <details open>
                            <summary>白ネギは本当に年中出荷できますか？</summary>
                            <p>
                                はい。白ネギは年中出荷できます。天候や収穫状況によって数量調整をお願いする場合はありますが、通年での取引を前提にご相談いただけます。
                            </p>
                        </details>
                        <details>
                            <summary>最低ロットはどれくらいですか？</summary>
                            <p>1回15kgから配達・配送に対応します。まずは試験導入として少量から始めることも可能です。</p>
                        </details>
                        <details>
                            <summary>県内の配達はいつですか？</summary>
                            <p>毎週木曜の配送を基本に、地域により個別調整します。</p>
                        </details>
                        <details>
                            <summary>規格外品はどんな用途に向いていますか？</summary>
                            <p>
                                焼き鳥、鍋、惣菜、カット野菜、薬味など、現場で切って使う用途と相性が良いです。見栄えより歩留まりや原価を重視する現場に向いています。
                            </p>
                        </details>
                        <details>
                            <summary>白ネギ以外も一緒に提案できますか？</summary>
                            <p>はい。洗いらっきょう、甘酢らっきょう、業務用長芋など、営業先に合いそうな商材をあわせて提案できます。</p>
                        </details>
                    </div>
                </div>
            </section>

            <section className="cta">
                <div className="container">
                    <h2>
                        白ネギ・らっきょう・長芋の仕入れ、
                        <br />
                        まとめて相談できます。
                    </h2>
                    <p>
                        まずは使い方、必要量、納品先をお聞かせください。試験導入、定期取引、季節商品の提案まで、現場に合わせてご案内します。
                    </p>
                    <div className="cta-actions">
                        <a className="btn primary" href={CONTACT_HREF}>
                            業務用フォームで相談する
                        </a>
                        <a className="btn outline" href="tel:07084348124">
                            070-8434-8124
                        </a>
                        <a
                            className="btn outline"
                            href="mailto:tatuo.an@gmail.com?subject=業務用野菜の仕入れ相談"
                        >
                            メールで相談する
                        </a>
                    </div>
                </div>
            </section>

            <footer>
                <div className="container">
                    <div>
                        <strong>安藤青果</strong>
                        <br />
                        白ネギ・洗いらっきょう・甘酢らっきょう・業務用長芋
                    </div>
                    <div>
                        TEL：070-8434-8124
                        <br />
                        E-mail：tatuo.an@gmail.com
                    </div>
                </div>
            </footer>
        </div>
    );
}
