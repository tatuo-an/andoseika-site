/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { InlineDemo } from "@/components/ai/InlineDemo";
import { SiteSafetyCheck } from "@/components/ai/SiteSafetyCheck";
import { BASIC_MEDIA, EXTRA_MEDIA, SNS_PLANS } from "@/lib/andu-plans";
import "./andu-lp.css";
import "./demo/demo.css";
import "@/components/ai/inline-demos.css";
import "./andu-professional.css";

// 下書きの仮表示（確認中のカード・お客さまの声の枠・下書きの帯）。公開する版では false のまま
const SHOW_DRAFT = false;

// 屋号（決まったら、ここの2行だけ直せば、ページ全体と題名が変わる）
const BRAND = "AND U";
const BRAND_SUB = "Web制作・移行・運用サポート";

const title = `サイトの管理見直し・WordPressからの移行｜${BRAND}`;
const description = "鳥取の会社・お店のサイト管理を、分かりやすく。無料の診断ツールで公開情報を確認し、サイト管理を見直すきっかけに。WordPressからの移行、ホームページ・ネットショップ制作、公開後の運用もお手伝いします。ご相談は初回60分無料です。";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  openGraph: {
    title,
    description,
    images: [{ url: "/ai/opengraph-image", alt: "AND U｜Web制作・移行・運用サポート" }],
  },
};

export default function AiPage() {
  return (
    <div className="andu-lp andu-professional">
      {SHOW_DRAFT && (<p className="draft-note">下書きです（未公開）。屋号・料金・「確認中」の所は、確認のうえ確定します。</p>)}

      <header className="site-header">
        <p className="brand"><span className="brand-name">{BRAND}</span><span className="brand-sub">{BRAND_SUB}</span></p>
        <nav className="header-nav" aria-label="ページ内の案内">
          <a href="#security-support">見直しの進め方</a>
          <a href="#works">制作・運用実績</a>
          <a href="#price">料金</a>
        </nav>
        <a className="header-cta" href="https://lin.ee/WfeFzfF" target="_blank" rel="noopener noreferrer">LINEで無料相談</a>
      </header>

      <main>

      <section className="hero hero-with-check" id="top">
        <div className="hero-text">
          <p className="eyebrow">鳥取の事業者のための、Web制作・運用サポート</p>
          <p className="hero-overline" aria-hidden="true">WEBSITE CARE &amp; DEVELOPMENT</p>
          <h1 className="security-headline">サイトの安全診断<span className="check-free">（無料）</span></h1>
          <p className="hero-lead">サイトの状態を知るところから。<br />URLから公開情報を確かめ、管理を見直すきっかけに。</p>
          <p className="hero-consultation-note">WordPressからの引っ越し・ホームページ制作・ネットショップ開設も、ご相談いただけます。</p>
        </div>
        <SiteSafetyCheck />
      </section>

      <aside className="cta-band hero-contact">
          <p className="cta-band-title">まずはサイトのURLと、気になっていることを送ってください。</p>
          <p className="cta-wrap"><a className="cta" href="https://lin.ee/WfeFzfF" target="_blank" rel="noopener noreferrer">LINEで無料相談する（60分）</a></p>
          <p className="cta-sub">電話でも大丈夫です　<a className="tel" href="tel:07084348124">070-8434-8124</a><span className="tel-hours">月〜土 9:00〜18:00（日曜・祝日は休み）</span></p>
      </aside>

      <section className="worries" id="worries">
        <div className="worry-panel">
          <div className="section-heading"><p className="section-label" aria-hidden="true">CHECK</p><h2>作ったあとの管理、<br />誰が担当していますか</h2></div>
          <ul className="worry-list">
            <li>WordPressの更新通知が出ているけれど、触ってよいか分からない</li>
            <li>管理費は払っている。でも、何を確認してもらっているか分からない</li>
            <li>バックアップがあるか、止まったときに誰に連絡するか、分からない</li>
          </ul>
          <p className="worry-close">専門の言葉を覚えてから、相談する必要はありません。今のサイトと管理の状況を、一緒に整理します。</p>
        </div>
      </section>

      <section className="security-support" id="security-support">
        <div className="section-heading"><p className="section-label" aria-hidden="true">SUPPORT</p><h2>「よく分からない」を、<br />頼める窓口に。</h2></div>
        <p className="security-intro">今のサイトを確かめ、必要なら作り直す。<br />公開したあとの担当まで、最初に決めます。</p>
        <ol className="security-steps">
          <li><span className="security-step-number" aria-hidden="true">01</span><h3>まず、今の状態を整理。</h3><p>何で作られているか。更新やバックアップは誰の担当か。無料相談ではURLと分かる範囲の情報から整理し、詳しい確認が必要なところをお伝えします。</p></li>
          <li><span className="security-step-number" aria-hidden="true">02</span><h3>Cloudflareを使う構成へ。</h3><p>紹介ページを中心としたサイトなら、公開側でWordPressやPHPを動かさない構成を検討できます。今の機能を確かめ、Cloudflareでの作り直し・移行をご提案します。</p></li>
          <li><span className="security-step-number" aria-hidden="true">03</span><h3>公開後の担当も、明確に。</h3><p>どの仕組みを管理するか、確認の頻度、バックアップ、止まったときの連絡先。引き受ける範囲を見積もりに書き、安藤が窓口になります。</p></li>
        </ol>
        <div className="security-scope"><h3>お店の機能に合わせて、移行方法を決めます。</h3><p>ホームページ・ネットショップの制作は、これまでどおりお受けします。予約・フォーム・会員機能・決済がある場合は、そのまま移せるとは限りません。必要な機能と、作り直す範囲を先に確かめます。</p><p className="security-honesty">Cloudflareの利用だけで、すべての危険がなくなるわけではありません。使う仕組みの更新や認証の管理は必要です。移行しないほうがよい場合も、その理由をお伝えします。</p><p className="security-source"><a href="https://developers.cloudflare.com/pages/how-to/deploy-a-wordpress-site/" target="_blank" rel="noopener noreferrer">Cloudflare公式：WordPressの静的化と制限 ↗</a></p></div>
        <p className="cta-wrap"><a className="cta" href="https://lin.ee/WfeFzfF" target="_blank" rel="noopener noreferrer">サイトのURLを送って無料相談（60分）</a></p>
        <p className="security-caption">最初の相談に、パスワードは必要ありません。</p>
      </section>

<section className="works" id="works">
        <div className="section-heading"><p className="section-label" aria-hidden="true">WORKS</p><h2>制作・運用実績</h2></div>
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
            <InlineDemo kind="booking" label="予約の操作見本" />
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
            <InlineDemo kind="sns" label="SNS投稿の見本" />
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
            <InlineDemo kind="car" label="車の紹介と問い合わせの見本" />
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
            <InlineDemo kind="timecard" label="タイムカード集計の見本" />
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
            <InlineDemo kind="shop" label="ネットショップの見本" />
          </article>

          <article className="work work-tools" id="tool-examples">
            <p className="work-record">仕事の記録 / 06</p>
            <p className="work-stamp">使用中</p>
            <p className="work-client">うちで作って、使っているもの</p>
            <h3>営業・納品・給与集計。自分の仕事で使う道具を、制作。</h3>
            <p className="work-body">自分の仕事に合わせて、道具を作って毎日使っています。お客さんの仕事に合わせて、同じように作ることもできます。</p>
            <div className="inline-tool-list">
              <div><h4>営業ツール</h4><p>営業先を探して、対応状況を記録。情報更新の見本も試せます。</p><InlineDemo kind="sales" label="営業ツール" /></div>
              <div><h4>給与の集計ツール</h4><p>勤務時間と時給を変えると、金額と合計が変わります。</p><InlineDemo kind="payroll" label="給与集計" /></div>
              <div><h4>納品ツール</h4><p>納品と回収の数を記録し、差し引きを確かめます。</p><InlineDemo kind="delivery" label="納品と回収" /></div>
              <div><h4>オンラインツール</h4><p>注文の一覧を取り込んで、発送準備の状況を確認します。</p><InlineDemo kind="online" label="注文と発送準備" /></div>
              <div><h4>市場ツール</h4><p>市場への出荷と仕入れを分けて記録し、金額を集計します。</p><InlineDemo kind="market" label="市場の出荷・仕入れ" /></div>
            </div>
            <p className="work-caption">画面・デモはサンプルデータです。デモは操作体験用で、実際の給与情報・営業先とはつながっていません。</p>
          </article>
          <article className="work work-castle">
            <p className="work-record">仕事の記録 / 07</p>
            <p className="work-stamp">公開済み</p>
            <p className="work-client">個人の方</p>
            <h3>会員だけが見られる、城めぐりの記録サイト。</h3>
            <p className="work-body">ログインした人だけが見られる形で、城めぐりの記録サイトを作りました。行った城の記録と写真をまとめられます。御城印を探すページもあります。公式サイトの新着を定期的に確かめる機能と、スマホで通知を受け取る設定もあります。手元の写真や旅の履歴を取り込む場所もあります。</p>
            <p className="members-chip"><span className="members-lock" aria-hidden="true" />ログインした人だけ</p>
            <InlineDemo kind="castle" label="城めぐりの記録サイト" />
            <details className="work-screen-gallery"><summary>実際の画面も見る</summary><div className="castle-shots">
              <figure className="browser-shot castle-lead"><img src="/images/ai/matome/castle_visits.jpg" width="860" height="766" alt="城と訪問記録の画面" loading="lazy" /><figcaption>城と訪問の記録</figcaption></figure>
              <figure className="browser-shot"><img src="/images/ai/matome/castle_goshuin.jpg" width="1251" height="875" alt="御城印を探す画面" loading="lazy" /><figcaption>御城印を探す</figcaption></figure>
              <figure className="browser-shot"><img src="/images/ai/matome/castle_news.jpg" width="1257" height="856" alt="新着のお知らせの画面" loading="lazy" /><figcaption>新着のお知らせ</figcaption></figure>
              <figure className="browser-shot"><img src="/images/ai/matome/castle_notice.jpg" width="1243" height="660" alt="スマホへの通知を受け取る画面" loading="lazy" /><figcaption>スマホへの通知</figcaption></figure>
              <figure className="browser-shot"><img src="/images/ai/matome/castle_data.jpg" width="1248" height="758" alt="写真と資料を取り込む画面" loading="lazy" /><figcaption>写真と資料の取り込み</figcaption></figure>
            </div>
            </details><p className="work-caption">掲載画面は実際のもの、操作見本は架空のデータです。</p>
          </article>
        </div>
      </section>

      <aside className="cta-band">
        <p className="cta-band-title">うちの店だと、どうなるだろう。<br />そう思ったら、聞かせてください。</p>
        <p className="cta-wrap"><a className="cta" href="https://lin.ee/WfeFzfF" target="_blank" rel="noopener noreferrer">LINEで無料相談する（60分）</a></p>
        <p className="cta-sub">電話でも大丈夫です　<a className="tel" href="tel:07084348124">070-8434-8124</a></p>
      </aside>

      <section className="price price-compact" id="price">
        <div className="section-heading"><p className="section-label" aria-hidden="true">PRICE</p><h2>料金について</h2></div>
        <p className="price-lead">移行・管理は、今の機能と必要な作業を確認して見積もります。<strong>表示はすべて税抜</strong>です。</p>
        <div className="security-price-note"><h3>移行も、制作も。必要なところから。</h3><p>ウェブサーバーの移行は下記の料金から。Cloudflareへの移行可否や、残す機能を確認してお見積もりします。保守管理は作業・回数を決めて別にご契約いただく形です。</p><p>無料相談は60分の状況整理です。脆弱性診断、侵入調査、緊急復旧、24時間の監視は含みません。必要な場合は専門の対応先への相談をご案内します。</p></div>
        <div className="price-groups">
          <div className="price-group price-once">
            <p className="price-type">単発・買い切り</p>
            <h3>作るとき · 1回だけ</h3>
            <dl className="price-rows">
              <div id="wordpress-migration-price"><dt>ウェブサーバーの移行<small>WordPressからの引っ越し・Cloudflareへの移行など</small></dt><dd>3万円〜</dd></div>
              <div><dt>ホームページの制作</dt><dd>3万円〜</dd></div>
              <div><dt>ネットショップの開設</dt><dd>3万円〜</dd></div>
              <div><dt>LINE公式アカウントの構築</dt><dd>3万円〜</dd></div>
            </dl>
            <div className="price-bundle"><p>上の4つを、まとめてご依頼なら</p><p className="price-bundle-before">個別の最低目安：3万円 × 4つ ＝ 12万円〜</p><h4>4つ合わせて<br /><strong>10万円</strong>で買い切り</h4><small>税抜。制作・設定の範囲はご契約前に決めます。外部サービス利用料・公開後の保守管理は別途。</small></div>
            <h4 className="price-other-title">こちらも単発で頼めます</h4>
            <dl className="price-rows">
              <div><dt>業務ツールの制作<small>給与の集計・営業先リスト・注文の転記など。<br /><a href="#tool-examples">道具・デモを見る →</a></small></dt><dd>1万円〜</dd></div>
              <div><dt>SNSの仕組みを買い切り<small>SNS設計・公式LINE構築・投稿の仕組みと説明</small></dt><dd>10万円</dd></div>
            </dl>
          </div>
          <div className="price-group price-recurring">
            <p className="price-type">継続・月額</p>
            <h3>運用を頼むとき · 月額</h3>
            <dl className="price-rows">
              <div><dt>更新・手直し<small>必要な場合のみ</small></dt><dd>1万〜3万円</dd></div>
              {SNS_PLANS.map(plan => <div key={plan.key}><dt>SNS {plan.name}<small>{plan.media}（{plan.key === "full" ? "最大" : "計"}{plan.total}媒体）<br />{plan.frequency}{plan.key === "standard" && "・LINEを選ぶ場合は週1回程度"}</small></dt><dd>{plan.price}</dd></div>)}
            </dl>
            <p className="price-media-note">ライトは{BASIC_MEDIA.join("・")}の3媒体。スタンダードはその3媒体＋希望2媒体の計5媒体、おまかせフルは基本3媒体を含めて最大10媒体です。追加は{EXTRA_MEDIA}から、対応可否を確認して選びます。LINE配信も選んだ媒体数に含みます。</p>
            <Link className="price-detail-link" href="/ai/sns">SNSのプラン・提供内容を詳しく見る <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <details className="price-conditions">
          <summary>料金に含まれる範囲と、別にかかるもの</summary>
          <ul>
            <li>制作はページ数・商品数・設定・直しの回数を確認して、見積もりに含む範囲を書きます。業務ツールの連携・定期更新・保守、予約の仕組みなどは内容別のお見積もりです。</li>
            <li>4つまとめて10万円の対象は、ウェブサーバーの移行・ホームページの制作・ネットショップの開設・LINE公式アカウントの構築です。SNS運用は含みません。SNS買い切りはアカウント設計、公式LINE構築、毎日の投稿が回る仕組みと使い方の説明まで。投稿文・写真の準備や予約の変更方法もご案内します。買い切り後の修正は都度お見積もりです。</li>
            <li>月額の更新・手直しは、更新、控えの確認、文章・写真の差し替え。作業と回数を見積もりに書きます。SNS月額は3か月を1つの区切りとし、新規アカウント開設が必要な場合のみ初期設定費＋3万円です。</li>
            <li>サーバー・ドメイン・投稿やLINE配信などの外部サービス利用料が必要な場合は、ご契約前に内容と金額をお伝えします。消費税は別途かかります。</li>
          </ul>
        </details>
      </section>

      <aside className="cta-band">
        <p className="cta-band-title">金額は、話を聞いてからお伝えします。<br />相談だけでも大丈夫です。</p>
        <p className="cta-wrap"><a className="cta" href="https://lin.ee/WfeFzfF" target="_blank" rel="noopener noreferrer">LINEで無料相談する（60分）</a></p>
        <p className="cta-sub">電話でも大丈夫です　<a className="tel" href="tel:07084348124">070-8434-8124</a></p>
      </aside>

      <section className="about" id="about">
        <div className="section-heading"><p className="section-label" aria-hidden="true">YOUR CONTACT</p><h2>ご相談から、公開後まで。<br />窓口は、安藤です。</h2></div>
        <div className="about-layout">
          <figure className="about-photo"><img src="/images/ai/matome/profile_ando_bee.jpg" width="800" height="1000" alt="巣箱の前で巣板を持つ安藤" loading="lazy" /></figure>
        <div className="about-text">
          <p className="about-name">安藤 匡志<span className="about-role">AND U 制作・運用の相談窓口</span></p>
          <p>自社のホームページ・ネット販売の運営と、お店の予約受付・LINE・SNSの制作や運用に取り組んでいます。ご相談内容を伺い、作るものと管理する範囲を、見積もりにまとめてお渡しします。</p>
          <p className="about-background">鳥取で「安藤青果」を運営し、農業・養蜂にも携わっています。事業を続ける立場から、日々の更新や管理の負担を一緒に整理します。</p>
          <a className="about-link" href="#rules">管理と引き渡しについての方針を見る →</a>
        </div>
        </div>
      </section>

      <section className="rules" id="rules">
        <div className="section-heading"><p className="section-label" aria-hidden="true">REASON</p><h2>引き受けるときの決まり</h2></div>
        <ul className="rule-list">
          <li><span className="reason-number" aria-hidden="true">01</span><p>見積もりに「含むもの・含まないもの」を書きます。</p></li>
          <li><span className="reason-number" aria-hidden="true">02</span><p>ドメイン（ホームページの住所）は、お客さまの名義にします。Cloudflareの管理方法・アクセス権・解約時の引き渡しは、始める前に決めます。</p></li>
          <li><span className="reason-number" aria-hidden="true">03</span><p>今あるホームページを直すときは、先に丸ごと控えます。変えた内容は記録してお渡しします。</p></li>
          <li><span className="reason-number" aria-hidden="true">04</span><p>メールの設定には触りません。</p></li>
          <li><span className="reason-number" aria-hidden="true">05</span><p>管理する対象、確認の頻度、バックアップの方法、止まったときの連絡先と対応を始める目安を、先に決めておきます。</p></li>
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
            <p>サイトのURLと、更新・管理で気になることを聞かせてください。管理画面のパスワードは送らなくて大丈夫です。</p>
          </li>
          <li>
            <h3>見積もり</h3>
            <p>機能・管理する範囲・切り替え手順・費用を書いてお渡しします。</p>
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
          <dt>Cloudflareに移せば、セキュリティ対策は終わりですか。</dt><dd>終わりではありません。WordPressやPHPを公開側で使わない構成にできる場合は、その部分の管理負担を減らせます。ただし、使う仕組みの更新、認証、設定、データの保管は引き続き必要です。侵入や停止が起きないことを保証するものではありません。</dd>
          <dt>どんなWordPressサイトでも移せますか。</dt><dd>先に機能を確認します。会員・予約・問い合わせ・決済などは、別の仕組みへの置き換えが必要な場合があります。ドメイン・メール・検索からの入口も確認し、移行する範囲と切り替え手順を決めます。</dd>
          <dt>すでに不正アクセスを受けているかもしれません。</dt><dd>緊急の侵入調査や復旧を行うサービスではありません。まず契約中のサーバー会社や専門の対応先に連絡してください。復旧後の作り直しや管理体制の見直しは、ご相談いただけます。</dd>
          <dt>今の業者さんとの契約が残っています。相談できますか。</dt>
          <dd>はい。契約の名義と期間を、一緒に確かめるところから始めます。今の契約を、こちらから勝手に変えることはありません。</dd>
          <dt>パソコンが苦手です。</dt>
          <dd>大丈夫です。専門の言葉はできるだけ使わず、使うときは説明します。「ここを直したい」と、いつもの言葉で言ってください。</dd>
          <dt>頼めば、売上は上がりますか。</dt>
          <dd>お約束はできません。できるのは、サイトの作りと管理の担当を整理し、更新・手直しを頼める窓口を作ることです。</dd>
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
        <p className="footer-shop">運営：安藤青果 <Link href="/">事業者ホームページ（ando-seika.com）</Link></p>
        <p><span className="brand-name">{BRAND}</span><small className="brand-sub">{BRAND_SUB}</small></p>
        <p className="footer-legal"><Link href="/tokusho">特定商取引法に基づく表示</Link><Link href="/privacy">プライバシーポリシー</Link></p>
      </footer>
    </div>
  );
}
