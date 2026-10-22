import type { Metadata } from "next";
import Link from "next/link";
import { PayrollDemo, SalesDemo } from "./tool-demos";
import "./demo.css";

export const metadata: Metadata = {
  title: { absolute: "給与集計・営業ツールを試す｜AND U" },
  description: "勤務時間を変えて金額を集計。営業先を検索し、対応状況を更新。AND Uの業務ツールを、架空のデータで体験できます。",
};

export default function ToolDemoPage() {
  return (
    <main className="andu-demo">
      <header className="demo-header">
        <Link className="demo-brand" href="/ai">AND U<span>業務ツールの体験</span></Link>
        <Link className="demo-back" href="/ai#tool-examples">サービス紹介に戻る <span aria-hidden="true">↗</span></Link>
      </header>
      <div className="demo-content">
        <div className="demo-intro">
          <p className="demo-eyebrow">触って、仕事の変化を確かめる。</p>
          <h1>毎日の集計と、<br className="demo-mobile-break" />営業先の管理を、ひとつ楽に。</h1>
          <p>数字を変える。営業先を絞る。実際の操作で、道具を使う感覚を試せます。</p>
          <p className="demo-notice">架空のデータを使ったデモです。入力内容は保存・送信されません。実際のお名前や給与情報は入力しないでください。</p>
          <nav className="demo-nav" aria-label="試せるデモ">
            <a href="#payroll">01 給与集計</a><a href="#sales">02 営業先管理</a>
          </nav>
        </div>
        <PayrollDemo />
        <SalesDemo />
        <aside className="demo-contact">
          <p className="demo-eyebrow">自分の仕事なら、どう使える？</p>
          <h2>いつもの作業を、聞かせてください。</h2>
          <p>業務ツール制作は1万円〜（税抜）。機能を絞った小さなツールから、必要な範囲でお見積もりします。</p>
          <a className="demo-primary" href="https://lin.ee/WfeFzfF" target="_blank" rel="noopener noreferrer">LINEで無料相談する（60分） <span aria-hidden="true">↗</span></a>
          <Link className="demo-back" href="/ai#price">制作メニューと料金を見る</Link>
        </aside>
      </div>
      <footer className="demo-footer">AND U <span>仕事に合わせて、道具をつくる。</span><Link href="/privacy">プライバシーポリシー</Link></footer>
    </main>
  );
}
