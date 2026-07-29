import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
    title: "急に足りない、また買いに走る｜業務用白ネギの仕入れ相談｜安藤青果",
    description:
        "仕込みの途中で足りない。今週は入らない。相場が読めない。飲食店・給食・加工の仕入れの困りごとを、鳥取県北栄町の安藤青果へ。週1回15kgから、県内は毎週木曜に配達します。量も規格も決まっていなくて大丈夫です。",
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
.negi-lp .nav-links{display:flex;align-items:center;gap:16px;font-size:13px}
.negi-lp .hero-inner{position:relative;z-index:2;padding:64px 0 76px;width:min(58%,660px)}
.negi-lp .eyebrow{display:inline-block;font-size:14px;letter-spacing:.14em;font-weight:900;color:#f0d172}
.negi-lp .hero h1{font-size:clamp(36px,5vw,60px);line-height:1.15;margin:18px 0 20px}
.negi-lp .hero p{font-size:17px;line-height:1.8;color:#eff4f1}
.negi-lp .hero p.hero-facts{margin:18px 0 0;font-size:15px;font-weight:800;color:#f0d172}
.negi-lp .hero-photo{display:none}
.negi-lp section{padding:64px 0}
.negi-lp .section-head{max-width:820px;margin:0 auto 36px;text-align:center}
.negi-lp .section-head .mini{font-size:13px;font-weight:900;letter-spacing:.12em;color:#14713e}
.negi-lp .section-head h2{font-size:clamp(26px,4vw,38px);line-height:1.3;margin:12px 0 12px}
.negi-lp .section-head p{line-height:1.85;color:#5d6c62}
.negi-lp .products{background:#f5f7f6}
.negi-lp .product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.negi-lp .product{background:#fff;border:1px solid #dbe8de;border-radius:14px;overflow:hidden}
.negi-lp .product img{width:100%;height:300px;object-fit:cover;object-position:center}
.negi-lp .product-body{padding:22px}
.negi-lp .tag{display:inline-block;padding:5px 10px;border-radius:999px;background:#e9f5ec;color:#176d3d;font-size:12px;font-weight:900}
.negi-lp .product h3{font-size:22px;line-height:1.25;margin:12px 0 8px}
.negi-lp .product ul{padding-left:18px;font-size:14px;line-height:1.8;color:#526158}
.negi-lp .product-body > p{margin:0;font-size:14px;line-height:1.8;color:#526158}
.negi-lp .product details.spec{background:transparent;border:none;border-top:1px solid #e4ece6;border-radius:0;padding:12px 0 0;margin:14px 0 0}
.negi-lp .product details.spec summary{font-size:13px;color:#14713e;font-weight:800}
.negi-lp .product details.spec p{margin:10px 0 0;font-size:14px;line-height:1.8;color:#526158}
.negi-lp .statement{margin:28px 0 0;text-align:center;font-weight:800;font-size:18px;color:#14713e}
.negi-lp .note{font-size:12px;color:#607167;line-height:1.8;margin-top:18px;text-align:center}
.negi-lp .worry-main{background:#f3f8f4;border-left:6px solid #14713e;border-radius:14px;padding:28px 26px;margin:0 0 16px}
.negi-lp .worry-main p{margin:0 0 6px;font-size:20px;font-weight:700;line-height:1.9;color:#20331d}
.negi-lp .worry-main p:last-child{margin-bottom:0}
.negi-lp .worry-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.negi-lp .worry-card{background:#f3f8f4;border-radius:14px;padding:26px 22px;text-align:center}
.negi-lp .worry-role{display:block;font-size:12px;font-weight:900;color:#14713e;letter-spacing:.06em;margin-bottom:8px}
.negi-lp .worry-card p{margin:0;font-size:19px;font-weight:700;line-height:1.9;color:#20331d;text-wrap:balance}
/* 未使用。前後対比 .ba-card に置き換え済み（メディアクエリ・印刷CSSにクラス名が残るため定義は消さない） */
.negi-lp .change-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.negi-lp .change-card{background:#fff;border:1px solid #dbe8de;border-radius:14px;padding:24px 22px}
.negi-lp .change-feature{display:block;font-size:13px;font-weight:900;letter-spacing:.04em;color:#7a8a80;margin-bottom:10px}
.negi-lp .change-card p{margin:0;font-size:16px;line-height:1.85;color:#20331d;text-wrap:balance}
.negi-lp .reason{background:#173a28;color:#fff;padding:48px 0}
.negi-lp .reason-inner{max-width:680px;margin:0 auto;text-align:center}
.negi-lp .reason h2{font-size:clamp(24px,3.6vw,32px);line-height:1.3;margin:0 0 18px}
.negi-lp .reason p{line-height:1.9;color:#dbe7df;margin:0 0 8px;font-size:15px}
.negi-lp .reason-lead{font-weight:800;color:#fff}
.negi-lp .reason-actions{display:flex;justify-content:center;flex-wrap:wrap;gap:12px;margin-top:24px}
.negi-lp .mid-cta{display:flex;justify-content:center;flex-wrap:wrap;gap:12px;margin-top:28px}
.negi-lp .week-flow{background:#eaf5ee;border:1px solid #cfe4d6;border-radius:14px;padding:22px 24px;margin:4px 0 0}
.negi-lp .week-flow strong{display:block;font-size:15px;font-weight:900;color:#14713e;margin-bottom:8px}
.negi-lp .week-flow p{margin:0;font-size:16px;line-height:1.9;color:#20331d}
.negi-lp .sticky-cta{display:none}
.negi-lp .proof-block{margin:0 0 44px}
.negi-lp .proof-block:last-child{margin-bottom:0}
.negi-lp .proof-block-title{font-size:20px;font-weight:900;text-align:center;margin:0 0 22px;color:#183022}
.negi-lp .proof-text{max-width:780px;margin:0 auto;font-size:15px;line-height:1.9;color:#5b6a60;text-align:center}
.negi-lp .ba-card{display:flex;flex-wrap:wrap;border:1px solid #dbe7dd;border-radius:14px;overflow:hidden;margin:0 0 16px;background:#fff}
.negi-lp .ba-tag{flex:1 0 100%;background:#173a28;color:#fff;font-size:14px;font-weight:900;letter-spacing:.04em;padding:12px 24px}
.negi-lp .ba-before,.negi-lp .ba-after{flex:1 1 260px;padding:22px 24px}
.negi-lp .ba-before{background:#f2f3f4}
.negi-lp .ba-after{background:#eaf5ee;border-left:3px solid #cfe4d6}
.negi-lp .ba-before span,.negi-lp .ba-after span{display:block;font-size:12px;font-weight:900;letter-spacing:.08em;margin-bottom:8px;color:#7a8a80}
.negi-lp .ba-after span{color:#14713e}
.negi-lp .ba-before p,.negi-lp .ba-after p{margin:0;font-size:15px;line-height:1.85;color:#20331d}
.negi-lp .ba-card cite{flex:1 0 100%;display:block;font-style:normal;font-size:12px;color:#7a8a80;text-align:right;padding:10px 24px;background:#fff;border-top:1px solid #eef1ee}
.negi-lp .usecase-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.negi-lp .usecase-card{background:#fff;border:1px solid #dbe8de;border-radius:14px;overflow:hidden}
.negi-lp .usecase-card img{width:100%;height:200px;object-fit:cover;object-position:center}
.negi-lp .usecase-body{padding:20px 22px}
.negi-lp .usecase-card h4{font-size:18px;line-height:1.3;margin:0 0 8px;color:#183022}
.negi-lp .img-note{display:inline-block;background:#eef1ef;color:#7a8a80;font-size:11px;font-weight:900;border-radius:999px;padding:3px 9px;margin-bottom:8px}
.negi-lp .usecase-card p{font-size:14px;line-height:1.8;color:#526158;margin:0}
.negi-lp .client-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin:0 auto 14px;max-width:760px}
.negi-lp .client-card{background:#fff;border:1px solid #dbe7dd;border-radius:14px;overflow:hidden}
.negi-lp .client-card img{width:100%;height:200px;object-fit:cover;object-position:center}
.negi-lp .client-card-body{padding:14px 16px;text-align:center}
.negi-lp .client-card-body strong{display:block;font-size:16px;color:#183022}
.negi-lp .client-card-body span{display:block;margin-top:4px;font-size:12px;color:#7a8a80}
.negi-lp .voice-source{display:block;font-size:11px;font-weight:900;color:#7a8a80;letter-spacing:.04em;margin:14px 0 4px}
.negi-lp .achv-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.negi-lp .achv-item{background:#fff;border:1px solid #dbe7dd;border-radius:10px;padding:16px 14px;text-align:center;font-weight:800;font-size:15px;color:#20331d}
.negi-lp .voice{background:#fff;border:1px solid #dbe7dd;border-radius:14px;padding:22px 24px}
.negi-lp .voice p{margin:0;font-size:16px;line-height:1.85;color:#20331d}
.negi-lp .voice p::before{content:"\\201C";margin-right:4px;font-size:24px;font-weight:900;color:#f3c54a}
.negi-lp .voice span{display:block;margin-top:10px;font-size:12px;color:#7a8a80}
.negi-lp .sample-note{text-align:center;font-size:13px;color:#7a8a80;margin:0 0 18px}
.negi-lp .voice-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.negi-lp .voice-sample{background:#fff;border:2px dashed #c8d4cc;border-radius:14px;padding:22px 24px;position:relative}
.negi-lp .sample-badge{display:inline-block;background:#fdf3e3;color:#b07a1e;font-size:12px;font-weight:900;border-radius:999px;padding:4px 10px;margin-bottom:12px}
.negi-lp .voice-sample p{margin:0;font-size:16px;line-height:1.85;color:#5b6a60}
.negi-lp .voice-sample p::before{content:"\\201C";margin-right:4px;font-size:24px;font-weight:900;color:#f3c54a}
.negi-lp .voice-sample cite{display:block;font-style:normal;font-size:12px;color:#7a8a80;text-align:right;margin-top:12px}
.negi-lp .ask-note{background:#f3f8f4;border-radius:14px;padding:20px 24px;margin:24px auto 0;max-width:760px}
.negi-lp .ask-note strong{display:block;font-weight:800;font-size:15px;color:#183022;margin-bottom:10px}
.negi-lp .ask-note ol{margin:0;padding-left:20px;font-size:14px;line-height:1.9;color:#3a4a40}
.negi-lp .ask-note ol li{margin-bottom:4px}
.negi-lp .ask-note p{margin:10px 0 0;font-size:13px;color:#7a8a80}
.negi-lp .faq{background:#f3f7f4}
.negi-lp .faq-list{max-width:900px;margin:0 auto}
.negi-lp details{background:#fff;border:1px solid #dbe7dd;border-radius:12px;padding:18px 22px;margin:12px 0}
.negi-lp summary{cursor:pointer;font-weight:900}
.negi-lp details p{line-height:1.85;color:#5b6a60;margin:12px 0 0}
.negi-lp .cta{background:#176a3c;color:#fff;text-align:center}
.negi-lp .cta h2{font-size:clamp(28px,4vw,40px);margin:0 0 14px}
.negi-lp .cta p{line-height:1.85;color:#dfece4;max-width:760px;margin:0 auto}
.negi-lp .cta-check{list-style:none;padding:0;margin:20px 0 0;display:flex;justify-content:center;gap:6px 22px;flex-wrap:wrap;font-size:15px;line-height:1.9;color:#dfece4}
.negi-lp .cta-actions{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:28px}
.negi-lp .cta p.cta-note{margin:14px auto 0;font-size:13px;color:#dfece4}
.negi-lp .cta-qr{display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:32px}
.negi-lp .cta-qr img{width:130px;height:130px;border-radius:10px;background:#fff;padding:8px}
.negi-lp .qr-placeholder{width:130px;height:130px;border:2px dashed #ffffff66;border-radius:10px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:11px;line-height:1.5;color:#dfece4;padding:8px}
.negi-lp .cta-qr span{font-size:12px;color:#dfece4}
.negi-lp footer{background:#10281c;color:#c9d8cf;padding:30px 0}
.negi-lp footer .container{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;font-size:13px}
@media(max-width:960px){
  .negi-lp .hero::after{content:none}
  /* 背景色は .hero のグラデーションに任せる。ここで背景を敷くと .container の左右4%分だけ
     色が変わって帯が二重に見えるため、背景は指定しない */
  .negi-lp .hero-inner{width:100%;padding:52px 0 36px}
  .negi-lp .hero-photo{display:block;width:100%;height:220px;overflow:hidden}
  .negi-lp .hero-photo img{width:100%;height:100%;object-fit:cover;display:block}
  .negi-lp .nav-links a:not(.btn){display:none}
  /* 電話はスマホでは下の固定バーが受け持つ。ヘッダーに2つ並べない */
  .negi-lp .nav-tel{display:none}
  .negi-lp .product-grid,.negi-lp .worry-grid,.negi-lp .change-grid,.negi-lp .achv-grid,.negi-lp .usecase-grid,.negi-lp .client-grid,.negi-lp .voice-grid{grid-template-columns:1fr}
  .negi-lp .ba-before,.negi-lp .ba-after{flex-basis:100%}
  .negi-lp .ba-after{border-left:none;border-top:3px solid #cfe4d6}
  /* スマホは縦に長い。読んでいる途中どこからでも相談へ行けるよう、画面下に固定で出す */
  .negi-lp .sticky-cta{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;gap:8px;padding:10px 12px;background:#ffffffee;border-top:1px solid #dbe7dd;box-shadow:0 -2px 12px rgba(0,0,0,.10)}
  .negi-lp .sticky-cta .btn{flex:1 1 0;padding:13px 8px;font-size:15px;white-space:nowrap}
  .negi-lp .sticky-cta .btn.outline{border:1px solid #14713e;color:#14713e;background:#fff}
  .negi-lp footer{padding-bottom:96px}
}
@media print{
  @page{size:1280px 1810px;margin:0}
  html,body{background:#fff}
  *,*::before,*::after{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;color-adjust:exact !important}
  /* 画面幅に関係なくデスクトップの段組みを強制 */
  .negi-lp .worry-grid{grid-template-columns:repeat(3,1fr) !important}
  .negi-lp .product-grid,.negi-lp .usecase-grid,.negi-lp .voice-grid,.negi-lp .related-grid{grid-template-columns:repeat(3,1fr) !important}
  .negi-lp .client-grid{grid-template-columns:repeat(2,1fr) !important}
  .negi-lp .achv-grid{grid-template-columns:repeat(4,1fr) !important}
  .negi-lp .info-grid{grid-template-columns:repeat(4,1fr) !important}
  .negi-lp .delivery-grid{grid-template-columns:1.1fr .9fr !important}
  .negi-lp .delivery-list{grid-template-columns:1fr 1fr !important}
  /* 前後対比は紙でも必ず左右に並べる（縦積みになると対比が消える） */
  .negi-lp .ba-before,.negi-lp .ba-after{flex:1 1 260px !important}
  /* 折りたたみは紙では開いた状態で出す。
     いまのChromeは閉じた details の中身を display:none ではなく ::details-content の
     content-visibility で隠すため、display:block だけでは紙に出ない（実測で確認済み）。
     両方書いて、古いブラウザと新しいブラウザのどちらでも中身が印字されるようにする */
  .negi-lp details > :not(summary){display:block !important}
  .negi-lp details::details-content{content-visibility:visible !important;block-size:auto !important;height:auto !important;opacity:1 !important}
  .negi-lp .hero::after{content:"" !important}
  .negi-lp .hero-inner{width:min(58%,660px) !important;background:none !important}
  .negi-lp .hero-photo{display:none !important}
  .negi-lp .nav-links a:not(.btn){display:inline-flex !important}
  .negi-lp .nav-tel{display:inline-flex !important}
  .negi-lp footer{padding-bottom:30px !important}
  .negi-lp section{padding:36px 0 !important}
  /* グローバルCSS（Tailwind）の .container が持つ max-width:48rem に負けて
     紙の本文が中央60%まで細るため、max-width を明示的に解除する */
  .negi-lp .container{width:96% !important;max-width:none !important}
  /* 濃い背景セクションは「背景のグラフィック」チェックが外れていても色を出す */
  .negi-lp .hero{background:linear-gradient(115deg,#0d6135 0%,#143b27 60%,#11281e 100%) !important}
  .negi-lp .reason{background:#173a28 !important}
  .negi-lp .cta{background:#176a3c !important}
  .negi-lp footer{background:#10281c !important}
  /* サイト共通のフローティングUI（会員バナー・LINE友だちバナー・チャット）を印刷から消す */
  body > header,body > nav,[class*="fixed"],[class*="sticky"],[aria-label*="チャット"],[id*="chat"],[class*="chat"],nextjs-portal{display:none !important}
  /* 印刷に出さないもの */
  #negi-edit-toolbar{display:none !important}
  #negi-old-edit-toolbar{display:none !important}
  .negi-lp .sticky-cta{display:none !important}
  .negi-lp details{break-inside:avoid}
  .negi-lp .usecase-card,.negi-lp .client-card,.negi-lp .product,.negi-lp .worry-card,.negi-lp .worry-main,.negi-lp .ba-card,.negi-lp .change-card,.negi-lp .voice-sample,.negi-lp .week-flow{break-inside:avoid}
  .negi-lp section{break-inside:auto}
}
`;

const CONTACT_HREF = "/contact/business?from=negi-lp";

export default function NegiLPPage() {
    return (
        <div className="negi-lp">
            <style dangerouslySetInnerHTML={{ __html: NEGI_LP_CSS }} />
            {/* 開発画面（localhost）限定の編集ツールバー。文字サイズ・太さ調整・取り消し(Undo)とlocalStorageへの下書き保存ができる。本番ビルドでは描画されない */}
            {process.env.NODE_ENV === "development" && (
                <Script
                    id="negi-edit-mode"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
(function(){
  if (window.__negiEditToolbarInit) return;
  window.__negiEditToolbarInit = true;

  var STORAGE_KEY = 'negi-lp-draft';
  var TOOLBAR_ID = 'negi-edit-toolbar';
  var VERSION_LABEL = '新版';
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
                            <a href="#worry">困りごと</a>
                            <a href="#choose">選び方</a>
                            <a href="#change">変わること</a>
                            <a href="#proof">お取引先</a>
                            <a className="btn outline nav-tel" href="tel:07084348124">
                                070-8434-8124
                            </a>
                            <a className="btn primary" href={CONTACT_HREF}>
                                仕入れを相談する
                            </a>
                        </div>
                    </nav>
                    <div className="hero-inner">
                        <span className="eyebrow">飲食店・給食・加工の仕入れ担当さんへ</span>
                        <h1>
                            急な具材不足
                            <br />
                            困ってませんか
                        </h1>
                        <p>
                            仕入れ先が安定しない。相場も読めない。
                            <br />
                            その困りごと、聞かせてください。
                        </p>
                        <p className="hero-facts">
                            鳥取県北栄町から、一年中配達可能。
                        </p>
                    </div>
                </div>
                <div className="hero-photo" aria-hidden="true">
                    <img
                        src="/images/negi-lp/negi-regai-dai.jpg"
                        alt=""
                    />
                </div>
            </header>

            <section id="worry">
                <div className="container">
                    <div className="section-head">
                        <div className="mini">現場で起きていること</div>
                        <h2>急に足りない日は、全てが止まります。</h2>
                    </div>
                    <div className="worry-grid">
                        <div className="worry-card">
                            <span className="worry-role">仕入れ担当</span>
                            <p>近所を何軒も回り、電話をかけ続けても、見つかりません。</p>
                        </div>
                        <div className="worry-card">
                            <span className="worry-role">店長</span>
                            <p>出せないメニューが出ます。</p>
                            <p>お客様への説明と、売上が下がります。</p>
                        </div>
                        <div className="worry-card">
                            <span className="worry-role">経営者</span>
                            <p>急いで買い足すと、</p>
                            <p>その時だけ原価が跳ねます。</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="reason">
                <div className="container">
                    <div className="reason-inner">
                        <h2>あなたの段取りのせいではありません。</h2>
                        <p>どの現場でも起きています。</p>
                        <p>同じ条件で毎週届く先が、少ないだけです。</p>
                        <p className="reason-lead">決まった先が1つあれば、走らずに済みます。</p>
                        <div className="reason-actions">
                            <a className="btn primary" href={CONTACT_HREF}>
                                困っていることを伝える
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="choose" className="products">
                <div className="container">
                    <div className="section-head">
                        <div className="mini">選び方</div>
                        <h2>何に使うかで選べます。</h2>
                        <p>規格ではなく、使い道で決めてください。</p>
                    </div>
                    <div className="product-grid">
                        <article className="product">
                            <img
                                src="/images/negi-lp/negi-shuhin.jpg"
                                alt="3kg秀品の白ネギ（実物）"
                            />
                            <div className="product-body">
                                <span className="tag">見栄え重視</span>
                                <h3>店頭に並べる</h3>
                                <p>サイズごとに選ぶことができ、見た目も品質も問題ありません。</p>
                                <details className="spec">
                                    <summary>サイズと本数を見る</summary>
                                    <p>3kg入り。2L 約20本（太めで食べ応えがあります）／L 約30本／L4 約40本／M 約50本</p>
                                </details>
                            </div>
                        </article>

                        <article className="product">
                            <img
                                src="/images/negi-lp/negi-regai-dai.jpg"
                                alt="5kg規格外・大の白ネギ（実物）"
                            />
                            <div className="product-body">
                                <span className="tag">焼き物・カット向け</span>
                                <h3>切って火を通す</h3>
                                <p>焼き鳥、鍋、カット野菜に。太さがそろっていなくても、切ってしまえば気になりません。</p>
                                <details className="spec">
                                    <summary>サイズと本数を見る</summary>
                                    <p>5kg入り。規格外・大。約45〜50本。市販の3〜4本束くらいの太さです。</p>
                                </details>
                            </div>
                        </article>

                        <article className="product">
                            <img
                                src="/images/negi-lp/negi-regai-sho.jpg"
                                alt="5kg規格外・小の白ネギ（実物）"
                            />
                            <div className="product-body">
                                <span className="tag">本数重視</span>
                                <h3>刻んで量を使う</h3>
                                <p>薬味、惣菜、大量調理に。刻むので、一本ずつの見栄えは関係ありません。本数が多く、原価を抑えやすくなります。</p>
                                <details className="spec">
                                    <summary>サイズと本数を見る</summary>
                                    <p>5kg入り。規格外・小。約60〜70本。市販の4〜5本束くらいの太さです。</p>
                                </details>
                            </div>
                        </article>
                    </div>
                    <div className="note">
                        3つに当てはまらないときは、そのまま言ってください。細いもの、太いもの、100kg単位、訳あり品、青い部分だけ。ご要望に合わせます。
                    </div>
                    <p className="statement">商品写真は、すべて実物です。</p>
                    <div className="mid-cta">
                        <a className="btn primary" href={CONTACT_HREF}>
                            使い道を伝えて相談する
                        </a>
                    </div>
                </div>
            </section>

            {/* 導入前と導入後の対比。ここに書けるのは、出せる時期・届く曜日・選べる規格・いちばん小さい単位から
                そのまま導けることだけ。お客様の感想・実績・数字を足さないこと。 */}
            <section id="change">
                <div className="container">
                    <div className="section-head">
                        <div className="mini">いちばん大事なところ</div>
                        <h2>いまの仕入れと、切り替えたあと。</h2>
                        <p>変わるのは、ネギの味ではありません。1週間の動き方です。</p>
                    </div>

                    <div className="ba-card">
                        <span className="ba-tag">一年中、出せます</span>
                        <div className="ba-before">
                            <span>いまの仕入れ</span>
                            <p>季節ごとに、仕入れ先を探し直しています。急に足りない日は、当てがありません。</p>
                        </div>
                        <div className="ba-after">
                            <span>切り替えたあと</span>
                            <p>電話する先が1つ決まります。買いに走る日が減ります。季節ごとに探し直す手間もなくなります。</p>
                        </div>
                    </div>

                    <div className="ba-card">
                        <span className="ba-tag">県内は毎週木曜に配達します</span>
                        <div className="ba-before">
                            <span>いまの仕入れ</span>
                            <p>いつ入るか読めません。仕込みの予定は、その日にならないと決まりません。</p>
                        </div>
                        <div className="ba-after">
                            <span>切り替えたあと</span>
                            <p>届く曜日が決まります。発注日と在庫のルールを作れます。</p>
                        </div>
                    </div>

                    <div className="ba-card">
                        <span className="ba-tag">規格外もあります</span>
                        <div className="ba-before">
                            <span>いまの仕入れ</span>
                            <p>刻んで使う料理にも、綺麗なネギを購入しています。</p>
                        </div>
                        <div className="ba-after">
                            <span>切り替えたあと</span>
                            <p>切る料理は規格外に回せます。見た目にかけていた分を、抑えられます。</p>
                        </div>
                    </div>

                    <div className="ba-card">
                        <span className="ba-tag">週1回15kgから</span>
                        <div className="ba-before">
                            <span>いまの仕入れ</span>
                            <p>新しい仕入れ先は、まとまった量を約束しないと始められません。</p>
                        </div>
                        <div className="ba-after">
                            <span>切り替えたあと</span>
                            <p>週1回15kg（5kg箱×3箱）から。まず1回だけ試せます。合わなければ、そこで終わりにできます。毎週納品数は変更可能です。</p>
                        </div>
                    </div>

                    <div className="week-flow">
                        <strong>切り替えたあとの1週間</strong>
                        <p>
                            届く曜日が先に決まります。だから、在庫を数える日と発注する日を決められます。買いに走る日を、予定表から減らせます。
                        </p>
                    </div>

                    <div className="mid-cta">
                        <a className="btn primary" href={CONTACT_HREF}>
                            量が決まっていなくても相談する
                        </a>
                    </div>

                    <div className="note">
                        ここに並べたのは、お客様の感想ではありません。出せる時期、届く曜日、選べる規格、いちばん小さい単位から、そのまま導けることだけを書いています。
                    </div>
                    <div className="note">
                        県外へは毎週木曜日に発送し、翌日又は翌々日に届きます（一部地域を除く）。天候不良が1週間以上続かなければ、一年中出せます。時期によっては、ご希望の量に届かないこともあります。
                    </div>
                </div>
            </section>

            <section id="usecase">
                <div className="container">
                    <div className="section-head">
                        <div className="mini">使い方</div>
                        <h2>切って使う。刻んで使う。並べて売る。</h2>
                    </div>
                    <div className="usecase-grid">
                        <article className="usecase-card">
                            <img
                                src="/images/negi-lp/use-yakimono.jpg"
                                alt="焼き白ネギと鍋料理のイメージ画像"
                            />
                            <div className="usecase-body">
                                <span className="img-note">イメージ画像</span>
                                <h4>焼き物・鍋に</h4>
                                <p>規格外・大。太さがそろわなくても、切れば気になりません。加熱する料理に向きます。</p>
                            </div>
                        </article>
                        <article className="usecase-card">
                            <img
                                src="/images/negi-lp/use-yakumi.jpg"
                                alt="小口切りと白髪ねぎのイメージ画像"
                            />
                            <div className="usecase-body">
                                <span className="img-note">イメージ画像</span>
                                <h4>薬味・惣菜に</h4>
                                <p>規格外・小。本数が多く、刻んで使う現場と合います。一本ずつの見栄えは問題になりません。</p>
                            </div>
                        </article>
                        <article className="usecase-card">
                            <img
                                src="/images/negi-lp/use-tento.jpg"
                                alt="店頭に並ぶ白ネギの束のイメージ画像"
                            />
                            <div className="usecase-body">
                                <span className="img-note">イメージ画像</span>
                                <h4>店頭に並べるなら</h4>
                                <p>3kg秀品。丸ごと見せる売り場に。贈答や、見た目を大事にしたい料理にも向きます。</p>
                            </div>
                        </article>
                    </div>
                    <div className="note">
                        この3枚はイメージ画像です。商品そのものの写真は、ひとつ上の3枚が実物です。
                    </div>
                </div>
            </section>

            <section id="proof">
                <div className="container">
                    <div className="section-head">
                        <div className="mini">お取引先の声</div>
                        <h2>証拠になるものだけ、並べます。</h2>
                        <p>実際にお取引のあるお店から、直接いただいた言葉です。</p>
                    </div>

                    <div className="client-grid">
                        <div className="client-card">
                            <img
                                src="/images/negi-lp/client-akiyoshi.jpg"
                                alt="秋吉様"
                            />
                            <div className="client-card-body">
                                <strong>秋吉 様</strong>
                                <span>業務用のお取引先</span>
                                <p>「値段が手頃で、太さも同じくらいのものをそろえて納めてくれるので助かっています」</p>
                                <p>「量がまとまって仕入れられるのもありがたいです」</p>
                                <p>価格だけでなく、鳥取県産を農家から直接仕入れられる安心感でも選んでいただいています。</p>
                            </div>
                        </div>
                        <div className="client-card">
                            <img
                                src="/images/negi-lp/client-yottette.jpg"
                                alt="産直市場よってって様の店舗"
                            />
                            <div className="client-card-body">
                                <strong>産直市場 よってって 様</strong>
                                <span>県外の産直市場</span>
                                <p>「鳥取県産の野菜が少ないなかで、コンスタントに送ってもらえるのがいいですね」</p>
                                <p>「店舗数が多いのですが、途切れずに届くので、お客さんにも喜ばれています」</p>
                                <p>毎週、店頭からの要望数がPDFで届き、できる限りその数に合わせて出荷しています。</p>
                                <span className="voice-source">売り場のお客様から</span>
                                <p>「年中手に入るのは本当に助かります」</p>
                            </div>
                        </div>
                    </div>
                    <p className="note">※お取引のやり取りのなかで、直接いただいた言葉です。</p>

                    <p className="note">そのほかのお取引先</p>
                    <div className="achv-grid">
                        <div className="achv-item">道の駅 北条 様</div>
                        <div className="achv-item">お台場 様</div>
                        <div className="achv-item">地元スーパー・直売所</div>
                        <div className="achv-item">市場出荷（通年）</div>
                    </div>
                    <div className="note">
                        市場へ通年で出しながら、業務用と直売所にお届けしています。
                    </div>
                </div>
            </section>

            <section id="faq" className="faq">
                <div className="container">
                    <div className="section-head">
                        <h2>よくある質問</h2>
                    </div>
                    <div className="faq-list">
                        <details open>
                            <summary>量が決まっていなくても相談できますか。</summary>
                            <p>
                                はい。「何に使うか」「どれくらいの頻度か」だけで大丈夫です。量はこちらで一緒に決めます。
                            </p>
                        </details>
                        <details>
                            <summary>どの規格を頼めばいいか分かりません。</summary>
                            <p>
                                決めていただかなくて結構です。用途をうかがって、こちらから規格をご提案します。
                            </p>
                        </details>
                        <details>
                            <summary>見積もりだけでも大丈夫ですか。</summary>
                            <p>大丈夫です。いくらになるか知りたいだけ、で構いません。</p>
                        </details>
                        <details>
                            <summary>少ない量でも、1回だけでも頼めますか。</summary>
                            <p>
                                週1回15kg（5kg箱×3箱）から出せます。1回だけのお試しも受けています。
                            </p>
                        </details>
                        <details>
                            <summary>話を聞いたあとに断っても大丈夫ですか。</summary>
                            <p>
                                大丈夫です。条件が合わなければ、そう言ってください。こちらから繰り返しお電話することはありません。
                            </p>
                        </details>
                        <details>
                            <summary>本当に一年中ありますか。</summary>
                            <p>
                                天候不良が1週間以上続かなければ、一年中出せます。時期によっては収穫が少なく、ご希望の量に届かないこともあります。そのときは早めにお伝えします。
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            <section className="cta">
                <div className="container">
                    <h2>困っていることだけ、教えてください。</h2>
                    <p>
                        数量も規格も、決まっていなくて大丈夫です。何にどれくらい使うかだけ、聞かせてください。こちらで整理して、規格と量をご提案します。
                    </p>
                    <ul className="cta-check">
                        <li>・量が決まっていなくても大丈夫です</li>
                        <li>・見積もりだけでも大丈夫です</li>
                        <li>・1回だけのお試しでも大丈夫です</li>
                    </ul>
                    <div className="cta-actions">
                        <a className="btn primary" href={CONTACT_HREF}>
                            仕入れを相談する
                        </a>
                        <a className="btn outline" href="tel:07084348124">
                            電話で聞く 070-8434-8124
                        </a>
                    </div>
                    <p className="cta-note">電話でも、フォームでも。</p>
                    <div className="cta-qr">
                        <img
                            src="/images/negi-lp/qr-contact.png"
                            alt="相談フォームのQRコード"
                            width={130}
                            height={130}
                        />
                        <span>スマホで読み取ると相談フォームが開きます</span>
                    </div>
                </div>
            </section>

            <footer>
                <div className="container">
                    <div>
                        <strong>安藤青果</strong>
                        <br />
                        白ネギ・洗いらっきょう・甘酢らっきょう・業務用長芋
                        <br />
                        鳥取県北栄町
                    </div>
                    <div>
                        TEL：070-8434-8124
                        <br />
                        <a href={CONTACT_HREF}>仕入れの相談はこちら</a>
                    </div>
                </div>
            </footer>

            {/* スマホ専用の固定バー。CSSで幅960px以下のときだけ表示する。
                クラス名に sticky を含めているため、印刷CSSの [class*="sticky"] で紙には出ない */}
            <div className="sticky-cta">
                <a className="btn outline" href="tel:07084348124">
                    電話する
                </a>
                <a className="btn primary" href={CONTACT_HREF}>
                    仕入れを相談する
                </a>
            </div>
        </div>
    );
}
