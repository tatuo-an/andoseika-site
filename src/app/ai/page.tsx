/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { FlyingBee } from "@/components/home/FlyingBee";
import "./andu-lp.css";

// 下書きの仮表示（確認中のカード・お客さまの声の枠・下書きの帯）。公開する版では false のまま
const SHOW_DRAFT = false;

// 屋号（決まったら、ここの2行だけ直せば、ページ全体と題名が変わる）
const BRAND = "AND U";
const BRAND_SUB = "願いが叶う";

const title = `ホームページもLINEも、頼み先をひとつに｜${BRAND}`;
const description = "鳥取の会社・お店の方へ。ホームページ・予約の仕組み・LINE公式アカウント・SNSの投稿・小さなネットショップを、作るところから手直しまで、ひとつの窓口で引き受けます。まずは60分の無料相談から。";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  openGraph: {
    title,
    description,
    images: [{
      url: "/images/ai/ando-beekeeping.jpg",
      alt: "巣板を持つ安藤",
    }],
  },
};

export default function AiPage() {
  return (
    <div className="andu-lp">
      {SHOW_DRAFT && (<p className="draft-note">下書きです（未公開）。屋号・料金・「確認中」の所は、確認のうえ確定します。</p>)}

      <header className="site-header">
        <p className="brand"><span className="brand-name">{BRAND}</span><span className="brand-sub">{BRAND_SUB}</span></p>
        <nav className="header-nav" aria-label="ページ内の案内">
          <a href="#services">頼めること</a>
          <a href="#works">実際にやった仕事</a>
          <a href="#price">料金</a>
        </nav>
        <a className="header-cta" href="https://lin.ee/WfeFzfF" target="_blank" rel="noopener noreferrer">LINEで無料相談</a>
      </header>

      <main>

      <section className="hero" id="top">
        <div className="hero-text">
          <p className="eyebrow">鳥取の会社・お店の方へ</p>
          <h1><span className="ib">そのホームページ、</span><br /><span className="ib"><span className="mk">動いていますか？</span></span></h1>
          <p className="hero-lead">管理費は毎月払っているのに、直したい所はそのまま。ホームページも、ネットショップも、公式LINEも、窓口をひとつに。作ったあとの更新・手直しは、頼む場合は月1万〜3万円です（作るときの費用は別）。</p>
          <div className="hero-proof">
            <p className="hero-proof-title">実際にやった仕事</p>
            <ul className="hero-proof-list">
              <li><strong>某助産院さま</strong>｜LINEの予約を、予約のページへ</li>
              <li><strong>某ラーメン店さま</strong>｜SNSの投稿を、お店の代わりに</li>
              <li><strong>車屋さん</strong>｜LINEと、車の紹介サイト</li>
              <li><strong>うち自身</strong>｜ホームページとネット販売を運営</li>
            </ul>
            <p className="hero-proof-more"><a href="#works">くわしく見る</a></p>
          </div>
          <ul className="hero-badges"><li>相談は無料</li><li>60分</li><li>売り込みなし</li></ul>
          <p className="cta-wrap hero-cta-sp"><a className="cta" href="https://lin.ee/WfeFzfF" target="_blank" rel="noopener noreferrer">LINEで無料相談する（60分）</a></p>
        </div>
        <div className="hero-visual">
          <span className="hero-watermark" aria-hidden="true">{BRAND}</span>
          <figure className="hero-photo"><img src="/images/ai/ando-beekeeping.jpg" alt="巣板を持つ安藤" fetchPriority="high" /><figcaption className="hero-who">窓口は、安藤 匡志です。</figcaption></figure>
          <span className="bee" aria-hidden="true"><img src="/images/bee/flying-bee-v3.png" alt="" aria-hidden="true" width="384" height="384" /></span>
        </div>
      </section>

      <aside className="cta-band hero-contact">
          <p className="cta-band-title">友だち追加のあと、「相談したい」とひとこと送ってください。</p>
          <p className="cta-wrap"><a className="cta" href="https://lin.ee/WfeFzfF" target="_blank" rel="noopener noreferrer">LINEで無料相談する（60分）</a></p>
          <p className="cta-sub">電話でも大丈夫です　<a className="tel" href="tel:07084348124">070-8434-8124</a><span className="tel-hours">月〜土 9:00〜18:00（日曜・祝日は休み）</span></p>
      </aside>

      <section className="worries" id="worries">
        <div className="worry-panel">
        <div className="section-heading"><p className="section-label" aria-hidden="true">TROUBLE</p><h2>毎月の管理費、<br /><span className="ib">何に払っているか</span><span className="ib">分かりますか</span></h2></div>
        <ul className="worry-list">
          <li>何の分か分からない管理費を、毎月払い続けている</li>
          <li>営業時間や値段を直したいだけなのに、頼むたびに別の料金がかかる</li>
          <li>ホームページ・予約・LINE・ネットショップで、頼み先がばらばら</li>
        </ul>
        <p className="worry-close">ホームページ、ネットショップ、公式LINE。それぞれの会社に、月1万〜5万円ずつ払っていませんか。年にすると、まとまった金額です。</p>
        <p className="worry-close">うちは、作ったあとの更新・手直しを<span className="mk">月1万〜3万円</span>でお受けします。どこまで含むかは、見積もりに書きます。窓口は安藤ひとつです。</p>
        </div>
      </section>

      <div className="solution-ribbon"><p><span className="ib">それ、<span className="mk">まとめて</span></span><span className="ib">おまかせください。</span></p></div>

      <section className="change" id="change">
        <div className="section-heading"><p className="section-label" aria-hidden="true">SOLUTION</p><h2>困ったら、ここに1本。<br />そう言える相手ができます</h2></div>
        <div className="bundle" aria-hidden="true">
          <span className="bundle-in">ホームページ</span>
          <span className="bundle-in">LINE・SNS</span>
          <span className="bundle-in">予約</span>
          <span className="bundle-in">ネットショップ</span>
          <svg className="bundle-lines" viewBox="0 0 240 192" preserveAspectRatio="none" focusable="false" aria-hidden="true"><path d="M0 24 C110 24 105 96 160 96 M0 72 C110 72 110 96 160 96 M0 120 C110 120 110 96 160 96 M0 168 C110 168 105 96 160 96 M160 96 H232 M224 88 L232 96 L224 104"/><circle cx="160" cy="96" r="3"/></svg>
          <svg className="bundle-lines-mobile" viewBox="0 0 320 64" preserveAspectRatio="none" focusable="false" aria-hidden="true"><path d="M80 0 V16 Q80 30 100 30 H140 Q160 30 160 48 M240 0 V16 Q240 30 220 30 H180 Q160 30 160 48 M160 48 V62" /><circle cx="160" cy="58" r="4" /></svg><span className="bundle-out">窓口はひとつ</span>
        </div>
        <p className="change-one">「これ、どこに聞けばいい？」が、なくなります。</p>
      </section>

<section className="works" id="works">
        <div className="section-heading"><p className="section-label" aria-hidden="true">WORKS</p><h2>実際にやった仕事</h2></div>
        <p className="works-lead">お店から頼まれた仕事と、自分で作って使っているものです。</p>
        <div className="work-list">

          <article className="work work-main">
            <p className="work-record">仕事の記録 / 01</p>
            <p className="work-stamp">公開済み<span className="work-date">2026年9月</span></p>
            <p className="work-client">某助産院さま</p>
            <h3>LINEで1件ずつ受けていた予約を、予約のページに。</h3>
            <dl className="work-flow">
              <dt>前</dt>
              <dd>予約は公式LINEで、1件ずつやり取りしていました。毎月の受付開始も手作業でした。</dd>
              <dt>やったこと</dt>
              <dd>ホームページに予約ボタンを置き、既製の予約サービスで受付のページを作りました。公式LINEのメニューからも、予約のページへ行けるようにしました。</dd>
              <dt>今</dt>
              <dd>1日1組の枠は、予約が1件入ると自動で満席になります。毎月決まった日時に、翌月分の受付が自動で開きます。</dd>
            </dl>
            <div className="mini-flow booking-flow"><span className="diagram-box">ホームページ</span><span className="flow-arrow" aria-hidden="true">→</span><span className="diagram-box">予約のページ</span><span className="flow-arrow" aria-hidden="true">←</span><span className="diagram-box">公式LINE</span></div>
            <div className="work-shots">
              <figure className="phone-shot"><img src="/images/ai/matome/real_stores_m2.jpg" alt="某助産院さまの予約ページの画面" width="860" height="1720" loading="lazy" /><figcaption>予約のページ</figcaption></figure>
              <figure className="phone-shot"><img src="/images/ai/matome/real_sukusuku_top_m2.jpg" alt="某助産院さまのホームページをスマホで見た画面" width="860" height="1720" loading="lazy" /><figcaption>ホームページの予約ボタン</figcaption></figure>
            </div>
            {SHOW_DRAFT && (<p className="voice-slot todo" data-draft="voice">（お客さまの言葉は、ご本人の了承をいただいてから、ここに載せます）</p>)}
          </article>

          <article className="work">
            <p className="work-record">仕事の記録 / 02</p>
            <p className="work-stamp">担当中</p>
            <p className="work-client">某ラーメン店さま</p>
            <h3>SNSの投稿を、お店の代わりに。</h3>
            <p className="work-body">Threadsの運用を担当しています。美容室のSNSの運用もお受けしています。</p>
            <div className="work-shots">
              <figure className="phone-shot"><img src="/images/ai/matome/threads_ramen_m2.jpg" alt="某ラーメン店さまのThreadsのプロフィール画面" width="860" height="1520" loading="lazy" /><figcaption>プロフィール</figcaption></figure>
              <figure className="phone-shot"><img src="/images/ai/matome/real_threads_post_m2.jpg" alt="某ラーメン店さまのThreadsの投稿の画面" width="860" height="1600" loading="lazy" /><figcaption>はじめての投稿</figcaption></figure>
            </div>
            {SHOW_DRAFT && (<p className="voice-slot todo" data-draft="voice">（お客さまの言葉は、ご本人の了承をいただいてから、ここに載せます）</p>)}
          </article>

          <article className="work">
            <p className="work-record">仕事の記録 / 03</p>
            <p className="work-stamp">公開済み</p>
            <p className="work-client">車屋さん</p>
            <h3>LINEの窓口と、車の紹介サイトを作成。</h3>
            <p className="work-body">LINE公式アカウントを整え、友だち追加のあいさつと、「紹介中の車」「購入相談」「相談の流れ」の3つのメニューを作りました。紹介中の車を載せるサイトも作り、LINEからそのまま見られるようにしています。</p>
            <div className="work-shots">
              <figure className="phone-shot"><img src="/images/ai/matome/real_line_car_m2.jpg" alt="車屋さんのLINE公式アカウントの画面" width="869" height="1702" loading="lazy" /><figcaption>LINE公式アカウント（実際の画面）</figcaption></figure>
              <figure className="phone-shot"><img src="/images/ai/matome/real_car_m2.jpg" alt="車の紹介サイトをスマホで見た画面" width="860" height="1720" loading="lazy" /><figcaption>車の紹介サイト（実際の画面）</figcaption></figure>
            </div>
            {SHOW_DRAFT && (<p className="voice-slot todo" data-draft="voice">（お客さまの言葉は、ご本人の了承をいただいてから、ここに載せます）</p>)}
          </article>

          <article className="work work-timecard">
            <p className="work-record">仕事の記録 / 04</p>
            <p className="work-stamp">導入済み</p>
            <p className="work-client">就労継続支援B型の事業所さま</p>
            <h3>手入力だったタイムカードを、写真を撮るだけに。</h3>
            <p className="work-body">就労支援の事業所さんで、事務の仕事を楽にするお手伝いをしました。これまで手で入力していたタイムカードは、写真を撮るだけで表に反映されます。時間の合計と金額の計算まで、自動で出ます。</p>
            <figure className="work-diagram">
              <div className="timecard-comparison">
                <div className="timecard-panel">
                  <p className="timecard-title">紙のタイムカード</p>
                  <div className="timecard-stack">
                    <div className="timecard-paper timecard-back" aria-hidden="true"><span className="timecard-tab">Aさん</span></div>
                    <div className="timecard-paper timecard-back" aria-hidden="true"><span className="timecard-tab">Bさん</span></div>
                    <div className="timecard-paper timecard-back" aria-hidden="true"><span className="timecard-tab">Cさん</span></div>
                    <div className="timecard-paper timecard-back" aria-hidden="true"><span className="timecard-tab">Dさん</span></div>
                    <div className="timecard-paper timecard-back" aria-hidden="true" />
                    <div className="timecard-paper timecard-front">
                    <p className="timecard-paper-heading">タイムカード</p>
                    <table className="timecard-table" aria-label="紙のタイムカードの見本">
                      <thead><tr><th scope="col">日</th><th scope="col">出勤</th><th scope="col">退勤</th></tr></thead>
                      <tbody><tr><td>1</td><td>9:00</td><td>17:00</td></tr><tr><td>2</td><td>9:05</td><td>17:10</td></tr><tr><td>3</td><td>8:55</td><td>16:50</td></tr><tr><td>4</td><td>9:00</td><td>17:00</td></tr></tbody>
                    </table>
                    </div>
                  </div>
                </div>
                <div className="timecard-transfer"><span className="timecard-camera" aria-hidden="true" /><span>写真を撮る</span><span className="timecard-arrow" aria-hidden="true">→</span></div>
                <div className="timecard-panel">
                  <p className="timecard-title">表に反映・自動で計算</p>
                  <div className="timecard-sheet">
                    <p className="sheet-title">勤務の集計（見本）</p>
                    <div className="sheet-columns" aria-hidden="true"><span /><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span></div>
                    <table className="summary-table" aria-label="勤務時間と金額の集計の見本">
                      <colgroup><col className="sheet-index" /><col /><col /><col className="sheet-hours" /><col /><col className="sheet-amount" /></colgroup>
                      <thead><tr><td className="sheet-row-number" aria-hidden="true">1</td><th scope="col">名前</th><th scope="col">出勤</th><th scope="col">時間</th><th scope="col">単価</th><th scope="col">金額</th></tr></thead>
                      <tbody>
                        <tr><td className="sheet-row-number" aria-hidden="true">2</td><th scope="row">Aさん</th><td>20日</td><td>80時間</td><td>500円</td><td>40,000円</td></tr>
                        <tr><td className="sheet-row-number" aria-hidden="true">3</td><th scope="row">Bさん</th><td>18日</td><td>72時間</td><td>500円</td><td>36,000円</td></tr>
                        <tr><td className="sheet-row-number" aria-hidden="true">4</td><th scope="row">Cさん</th><td>22日</td><td>88時間</td><td>500円</td><td>44,000円</td></tr>
                        <tr><td className="sheet-row-number" aria-hidden="true">5</td><th scope="row">Dさん</th><td>15日</td><td>60時間</td><td>500円</td><td>30,000円</td></tr>
                      </tbody>
                      <tfoot><tr><td className="sheet-row-number" aria-hidden="true">6</td><th scope="row">合計</th><td /><td>300時間</td><td /><td>150,000円</td></tr></tfoot>
                    </table>
                  </div>
                  <p className="sheet-calculation"><span>自動で計算</span></p>
                </div>
              </div>
              <figcaption className="work-caption">イメージです（見本のデータ）。</figcaption>
            </figure>
            {SHOW_DRAFT && (<p className="voice-slot todo" data-draft="voice">（お客さまの言葉は、ご本人の了承をいただいてから、ここに載せます）</p>)}
          </article>

          <article className="work">
            <p className="work-record">仕事の記録 / 05</p>
            <p className="work-stamp">運営中</p>
            <p className="work-client">うち自身のお店（AND YOU 安藤青果）</p>
            <h3>ホームページとネット販売を、自分で作って運営。</h3>
            <p className="work-body">はちみつや野菜を売っている、うち自身のホームページです。商品のページも注文の受付も、自分で作って動かしています。飲食店や小売店からの、業務用の問い合わせフォームもあります。業種・欲しい商品・使う量などを、選ぶだけで送れる形です。毎日のSNSも自分で続けていて、Xのフォロワーは1.3万人です。</p>
            <div className="work-shots shop-shots">
              <figure className="browser-shot shop-desktop"><img src="/images/ai/matome/site_home_pc.jpg" alt="安藤青果のホームページをパソコンで見た画面" width="1280" height="640" loading="lazy" /><figcaption>ホームページ（パソコンで見た画面）</figcaption></figure>
              <figure className="phone-shot shop-main"><img src="/images/ai/matome/real_honey.jpg" alt="はちみつの商品ページをスマホで見た画面" width="860" height="1720" loading="lazy" /><figcaption>はちみつの商品ページ（実際の画面）</figcaption></figure>
              <figure className="phone-shot shop-secondary"><img src="/images/ai/matome/real_form1.jpg" alt="業務用の問い合わせフォームの画面" width="860" height="1720" loading="lazy" /><figcaption>業務用の問い合わせフォーム</figcaption></figure>
              <figure className="phone-shot shop-secondary"><img src="/images/ai/matome/real_form2.jpg" alt="業務用の問い合わせフォームの選ぶ項目の画面" width="860" height="1720" loading="lazy" /><figcaption>選ぶだけの項目</figcaption></figure>
            </div>
          </article>

          <article className="work work-tools">
            <p className="work-record">仕事の記録 / 06</p>
            <p className="work-stamp">使用中</p>
            <p className="work-client">うちで作って、使っているもの</p>
            <h3>営業・納品・ネット販売の道具を、自分で作って毎日使用。</h3>
            <p className="work-body">自分の仕事に合わせて、道具を作って毎日使っています。お客さんの仕事に合わせて、同じように作ることもできます。</p>
            <div className="work-shots tool-shots">
              <div className="tool-card">
                <p className="tool-name">営業ツール</p>
                <p className="tool-description">営業先の一覧と、電話の記録をまとめます。</p>
                <figure className="browser-shot"><img src="/images/ai/tools/sales-list.jpg" alt="営業ツールの画面" loading="lazy" /></figure>
              </div>
              <div className="tool-card">
                <p className="tool-name">納品ツール</p>
                <p className="tool-description">お店への納品と回収の数を記録します。</p>
                <figure className="browser-shot"><img src="/images/ai/tools/delivery.jpg" alt="納品ツールの画面" loading="lazy" /></figure>
              </div>
              <div className="tool-card">
                <p className="tool-name">オンラインツール</p>
                <p className="tool-description">ネット注文の一覧を読み込むと、販売の登録と発送の管理の表に反映されます。</p>
                <figure className="browser-shot"><img src="/images/ai/tools/online.jpg" alt="オンラインツールの画面" loading="lazy" /></figure>
              </div>
              <div className="tool-card">
                <p className="tool-name">市場ツール</p>
                <p className="tool-description">市場への出荷と仕入れを記録します。</p>
                <figure className="browser-shot"><img src="/images/ai/tools/market.jpg" alt="市場ツールの画面" loading="lazy" /></figure>
              </div>
            </div>
            <p className="work-caption">画面は、掲載用のサンプルデータを入れたものです。</p>
          </article>
          <article className="work work-castle">
            <p className="work-record">仕事の記録 / 07</p>
            <p className="work-stamp">公開済み</p>
            <p className="work-client">個人の方</p>
            <h3>会員だけが見られる、城めぐりの記録サイト。</h3>
            <p className="work-body">ログインした人だけが見られる形で、城めぐりの記録サイトを作りました。行った城の記録と写真をまとめられます。御城印を探すページもあります。公式サイトの新着を定期的に確かめる機能と、スマホで通知を受け取る設定もあります。手元の写真や旅の履歴を取り込む場所もあります。</p>
            <p className="members-chip"><span className="members-lock" aria-hidden="true" />ログインした人だけ</p>
            <div className="castle-shots">
              <figure className="browser-shot castle-lead"><img src="/images/ai/matome/castle_visits.jpg" width="860" height="766" alt="城と訪問記録の画面" loading="lazy" /><figcaption>城と訪問の記録</figcaption></figure>
              <figure className="browser-shot"><img src="/images/ai/matome/castle_goshuin.jpg" width="1251" height="875" alt="御城印を探す画面" loading="lazy" /><figcaption>御城印を探す</figcaption></figure>
              <figure className="browser-shot"><img src="/images/ai/matome/castle_news.jpg" width="1257" height="856" alt="新着のお知らせの画面" loading="lazy" /><figcaption>新着のお知らせ</figcaption></figure>
              <figure className="browser-shot"><img src="/images/ai/matome/castle_notice.jpg" width="1243" height="660" alt="スマホへの通知を受け取る画面" loading="lazy" /><figcaption>スマホへの通知</figcaption></figure>
              <figure className="browser-shot"><img src="/images/ai/matome/castle_data.jpg" width="1248" height="758" alt="写真と資料を取り込む画面" loading="lazy" /><figcaption>写真と資料の取り込み</figcaption></figure>
            </div>
            <p className="work-caption">実際の画面です。</p>
          </article>
        </div>
      </section>

      <aside className="cta-band">
        <p className="cta-band-title">うちの店だと、どうなるだろう。<br />そう思ったら、聞かせてください。</p>
        <p className="cta-wrap"><a className="cta" href="https://lin.ee/WfeFzfF" target="_blank" rel="noopener noreferrer">LINEで無料相談する（60分）</a></p>
        <p className="cta-sub">電話でも大丈夫です　<a className="tel" href="tel:07084348124">070-8434-8124</a></p>
      </aside>

      <section className="services" id="services">
        <div className="section-heading"><p className="section-label" aria-hidden="true">POINT</p><h2>頼めること</h2></div>
        <p className="service-note">全部でなくて大丈夫です。<span className="mk">必要なものだけ</span>選べます。</p>
        <ul className="service-list">
          <li className="service-tile">
            <span className="service-number" aria-hidden="true">01</span>
            <h3>ホームページ</h3>
            <p>新しく作る。今あるものを直す。</p>
          </li>
          <li className="service-tile">
            <span className="service-number" aria-hidden="true">02</span>
            <h3>予約の仕組み</h3>
            <p>電話だけに頼らない受付に。</p>
          </li>
          <li className="service-tile">
            <span className="service-number" aria-hidden="true">03</span>
            <h3>LINE公式アカウント</h3>
            <p>開設から、メニューづくりまで。</p>
          </li>
          <li className="service-tile">
            <span className="service-number" aria-hidden="true">04</span>
            <h3>SNSの投稿</h3>
            <p>写真を送るだけ。投稿はこちらで。</p>
          </li>
          <li className="service-tile">
            <span className="service-number" aria-hidden="true">05</span>
            <h3>小さなネットショップ</h3>
            <p>数点から売れる売り場を。</p>
          </li>
          <li className="service-tile">
            <span className="service-number" aria-hidden="true">06</span>
            <h3>作ったあとの更新・手直し</h3>
            <p>作って終わりにしません。</p>
          </li>
        </ul>
      </section>

      <section className="price" id="price">
        <div className="section-heading"><p className="section-label" aria-hidden="true">PRICE</p><h2>料金について</h2></div>
        <p className="price-lead">金額は、<span className="mk">内容を聞いてから</span>決めます。目安は次のとおりです。</p>
        <h3 className="price-step">作るとき（1回だけ）</h3>
        <p className="price-scope">下の表は、作るときの費用の目安です。列ごとに、含む作業の範囲は違います。</p>
        <div className="table-scroll">
          <table className="market-table">
            <thead><tr><th scope="col">頼むもの</th><th scope="col">フリーランスの場合（目安）</th><th scope="col">制作会社の場合（目安）</th><th scope="col"><span className="price-brand" aria-hidden="true">{BRAND}</span>うちの場合</th></tr></thead>
            <tbody>
              <tr><td data-label="頼むもの">ホームページの制作</td><td data-label="フリーランスの場合（目安）">10万〜60万円</td><td data-label="制作会社の場合（目安）">50万〜150万円</td><td data-label="うちの場合"><strong>3万〜5万円</strong></td></tr>
              <tr><td data-label="頼むもの">LINE公式アカウントの構築</td><td data-label="フリーランスの場合（目安）">10万〜30万円</td><td data-label="制作会社の場合（目安）">50万〜150万円</td><td data-label="うちの場合"><strong>3万〜5万円</strong></td></tr>
            </tbody>
          </table>
        </div>
        <p className="price-note">フリーランスと制作会社の金額は、公開されている記事から拾った目安です（2026年10月。atsoho.com、imitsu.jp）。内容や規模で変わるので、同じ条件で比べたものではありません。うちの金額は税込の目安で、内容を聞いてから決めます。</p>
        <div className="price-pack">
          <p className="price-pack-tag">まとめて頼むなら</p>
          <h3 className="price-pack-name">オールインパック</h3>
          <div className="price-pack-body">
            <p className="price-pack-amount"><strong>10万円</strong><span className="price-pack-once">払うのは最初の1回だけ</span></p>
            <ul className="price-pack-list">
              <li>ホームページの制作</li>
              <li>小さなネットショップ</li>
              <li>LINE公式アカウントの構築</li>
            </ul>
          </div>
          <p className="price-pack-scope">この3つを、まとめて作ります。小さなお店向けの内容で、ページ数や商品の数は、見積もりに書いてお渡しします。</p>
          <p className="price-pack-note">作ったあとの更新・手直しは、頼む場合だけ、別に月1万〜3万円です。SNSの運用は入りません。</p>
        </div>
        <h3 className="price-step">頼んだ場合に、毎月かかるもの</h3>
        <div className="price-monthly">
          <div className="price-monthly-item">
            <h4 className="price-monthly-name">作ったあとの更新・手直し</h4>
            <p className="price-monthly-amount"><strong>月1万〜3万円</strong></p>
            <p>更新、控え（バックアップ）の確認、文章や写真の差し替え。含む作業と回数は、見積もりに書きます。</p>
          </div>
          <div className="price-monthly-item">
            <h4 className="price-monthly-name">SNSの運用代行</h4>
            <p className="price-monthly-amount"><strong>月3万〜10万円</strong></p>
            <p>写真を送ってもらえば、文章づくりから投稿まで。投稿の本数と内容で決まります。</p>
            <p className="price-sns-more">プランは月3万円・5万円・10万円の3つです。中身は、別のページでくわしく案内しています。<Link href="/ai/sns">SNS運用代行のページを見る</Link></p>
          </div>
        </div>
        <p className="price-lead price-separate">予約の仕組みと、ネットショップだけのご依頼は、内容を聞いて見積もります。</p>
      </section>

      <aside className="cta-band">
        <p className="cta-band-title">金額は、話を聞いてからお伝えします。<br />相談だけでも大丈夫です。</p>
        <p className="cta-wrap"><a className="cta" href="https://lin.ee/WfeFzfF" target="_blank" rel="noopener noreferrer">LINEで無料相談する（60分）</a></p>
        <p className="cta-sub">電話でも大丈夫です　<a className="tel" href="tel:07084348124">070-8434-8124</a></p>
      </aside>

      <section className="about" id="about">
        <div className="section-heading"><p className="section-label" aria-hidden="true">ABOUT</p><h2>窓口は、安藤です</h2></div>
        <div className="about-layout">
          <figure className="about-photo"><img src="/images/ai/matome/profile_ando_bee.jpg" width="800" height="1000" alt="巣箱の前で巣板を持つ安藤" loading="lazy" /></figure>
        <div className="about-text">
          <p className="about-name">安藤 匡志<span className="about-role">養蜂家／鳥取の青果卸「安藤青果」運営責任者</span></p>
          <p>鳥取で農業と養蜂をやっています。現場の仕事をしながら、机の仕事も回す。その両方をやっているので、忙しいお店の事情に合わせた組み方を考えます。</p>
        </div>
        </div>
      </section>

      <section className="rules" id="rules">
        <div className="section-heading"><p className="section-label" aria-hidden="true">REASON</p><h2>引き受けるときの決まり</h2></div>
        <ul className="rule-list">
          <li><span className="reason-number" aria-hidden="true">01</span><p>見積もりに「含むもの・含まないもの」を書きます。</p></li>
          <li><span className="reason-number" aria-hidden="true">02</span><p>ドメインとサーバー（ホームページの住所と置き場所）は、お客さまの名義にします。こちらの名義にはしません。</p></li>
          <li><span className="reason-number" aria-hidden="true">03</span><p>今あるホームページを直すときは、先に丸ごと控えます。変えた内容は記録してお渡しします。</p></li>
          <li><span className="reason-number" aria-hidden="true">04</span><p>メールの設定には触りません。</p></li>
          <li><span className="reason-number" aria-hidden="true">05</span><p>止まったときの連絡先と、いつまでに対応を始めるかを、先に決めておきます。</p></li>
        </ul>
        <div className="honest">
          <h3>正直にお伝えすること</h3>
          <ul>
            <li>写真と文章は、お店でご用意いただくことがあります。</li>
            <li>売上や来店数をお約束するものではありません。</li>
          </ul>
        </div>
      </section>

      <section className="steps" id="steps">
        <div className="section-heading"><p className="section-label" aria-hidden="true">FLOW</p><h2>はじめ方</h2></div>
        <ol className="step-list">
          <li>
            <h3>無料相談（60分）</h3>
            <p>今、困っていることを、そのまま話してください。契約のことは、分からなくても一緒に確かめます。</p>
          </li>
          <li>
            <h3>見積もり</h3>
            <p>やること・やらないこと・金額を書いてお渡しします。</p>
          </li>
          <li>
            <h3>合意したところから開始</h3>
            <p>決めた内容と日にちで、始めます。</p>
          </li>
        </ol>
      </section>

      <section className="faq" id="faq">
        <div className="section-heading"><p className="section-label" aria-hidden="true">Q&A</p><h2>よくある質問</h2></div>
        <dl className="faq-list">
          <dt>今の業者さんとの契約が残っています。相談できますか。</dt>
          <dd>はい。契約の名義と期間を、一緒に確かめるところから始めます。今の契約を、こちらから勝手に変えることはありません。</dd>
          <dt>パソコンが苦手です。</dt>
          <dd>大丈夫です。専門の言葉はできるだけ使わず、使うときは説明します。「ここを直したい」と、いつもの言葉で言ってください。</dd>
          <dt>頼めば、売上は上がりますか。</dt>
          <dd>お約束はできません。できるのは、頼み先をひとつにして、直したいときにすぐ頼める状態を作ることです。</dd>
          <dt>鳥取の外からでも頼めますか。</dt>
          <dd>鳥取の近くのお店を優先していますが、オンラインでのやり取りなら、どこからでもご相談いただけます。</dd>
        </dl>
      </section>

      <section className="final-cta" id="contact">
        <div className="section-heading"><p className="section-label" aria-hidden="true">CONTACT</p><h2>まずは、今の状況を聞かせてください</h2></div>
        <p className="final-lead">60分・無料。お困りごとを聞いて、できること・できないことをお伝えします。</p>
        <div className="contact-box">
          <figure className="qr"><img src="/images/ai/matome/qr_line.png" alt="公式LINEのQRコード" width="400" height="400" loading="lazy" /><figcaption>公式LINE　@500ngbml</figcaption></figure>
          <div className="contact-actions">
            <p className="cta-wrap"><a className="cta" href="https://lin.ee/WfeFzfF" target="_blank" rel="noopener noreferrer">LINEで無料相談する（60分）</a></p>
            <p className="cta-sub">電話でも大丈夫です　<a className="tel" href="tel:07084348124">070-8434-8124</a><span className="tel-hours">月〜土 9:00〜18:00（日曜・祝日は休み）</span></p>
          </div>
        </div>
        <p className="tagline">{BRAND_SUB}</p>
      </section>

            <section className="legal" id="legal">
        <h2>お約束と、個人情報の扱い</h2>
        <ul>
          <li>ご相談でお預かりしたお名前・連絡先・お店の情報は、<Link href="/privacy">プライバシーポリシー</Link>に沿って扱います。</li>
          <li>ご依頼の内容・金額・範囲は、見積もりに書いてお渡しします。合意してから始めます。</li>
          <li>実績の画面は、お客さまが分からないように、一部を隠して載せています。</li>
        </ul>
        <p className="legal-links"><Link href="/terms">サイトの利用規約</Link><Link href="/privacy">プライバシーポリシー</Link><Link href="/tokusho">特定商取引法に基づく表示</Link></p>
      </section>

      </main>

      <footer className="site-footer">
        <p className="footer-shop">野菜やはちみつを売っている、うち自身のお店です。<Link href="/">安藤青果のホームページ（ando-seika.com）</Link></p>
        <p><span className="brand-name">{BRAND}</span><small className="brand-sub">{BRAND_SUB}</small></p>
        <p className="footer-legal"><Link href="/tokusho">特定商取引法に基づく表示</Link><Link href="/privacy">プライバシーポリシー</Link></p>
      </footer>
      <FlyingBee />
    </div>
  );
}
