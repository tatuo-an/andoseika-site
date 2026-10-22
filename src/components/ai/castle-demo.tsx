"use client";

import { useState } from "react";
import { CASTLE_SAMPLE, includesQuery } from "./demo-models";
import { DemoFrame, Feedback } from "./demo-ui";

const VIEWS = ["城と訪問記録", "御城印を探す", "お知らせ・通知", "取込みの見本"];

export default function CastleDemo() {
  const [view, setView] = useState(VIEWS[0]), [rows, setRows] = useState(CASTLE_SAMPLE), [query, setQuery] = useState(""), [filter, setFilter] = useState("すべて"), [notice, setNotice] = useState(false), [imported, setImported] = useState(false), [message, setMessage] = useState("架空の城と御城印で、使い方を体験できます。");
  const filtered = rows.filter(row => includesQuery(`${row.name} ${row.area} ${row.seal}`, query) && (filter === "すべて" || (filter === "訪問済み" ? row.visited : !row.visited)));
  const reset = () => { setView(VIEWS[0]); setRows(CASTLE_SAMPLE); setQuery(""); setFilter("すべて"); setNotice(false); setImported(false); setMessage("最初のサンプルに戻しました。"); };
  const toggleVisit = (id: string) => setRows(previous => previous.map(row => row.id === id ? { ...row, visited: !row.visited } : row));
  return <DemoFrame title="城の記録も、御城印探しも、ひとつに。" reset={reset} note="架空の城・御城印・お知らせを使った操作見本です。会員ログイン、実際の販売情報の取得・巡回、スマホ通知、写真や資料のアップロードは行いません。">
    <div className="inline-view-buttons" aria-label="お城デモの表示切替">{VIEWS.map(item => <button className="demo-secondary" aria-pressed={view === item} type="button" key={item} onClick={() => setView(item)}>{item}</button>)}</div>
    {(view === VIEWS[0] || view === VIEWS[1]) && <>
      <div className="inline-fields"><label>城・地域・御城印を探す<input aria-label="城の見本を検索" type="search" value={query} maxLength={80} onChange={event => setQuery(event.target.value)} placeholder="例：見本城A、限定" /></label><label>訪問状況<select aria-label="城の訪問状況" value={filter} onChange={event => setFilter(event.target.value)}><option>すべて</option><option>訪問済み</option><option>未訪問</option></select></label></div>
      <div className="inline-item-list">{filtered.map(row => <div className="inline-item" key={row.id}><h5>{row.name} <span className="inline-muted">{row.area}</span></h5><p>{row.seal}</p><button type="button" className="demo-secondary" aria-pressed={row.visited} onClick={() => toggleVisit(row.id)}>{row.visited ? "訪問済み ✓" : "訪問済みにする"}</button></div>)}</div>
      {filtered.length === 0 && <div className="demo-empty"><p>この条件の見本はありません。</p><button className="demo-secondary" type="button" onClick={() => { setQuery(""); setFilter("すべて"); }}>絞り込みを解除する</button></div>}
      <p className="inline-result" role="status">{filtered.length}件表示 · 訪問済み{rows.filter(row => row.visited).length}城</p>
    </>}
    {view === VIEWS[2] && <div className="inline-item"><h5>見本城A · 新着の表示例</h5><p>「限定御城印のお知らせが届きました」という画面内の見本です。実際の販売告知ではありません。</p><button className="demo-primary" type="button" onClick={() => { setNotice(previous => !previous); setMessage(notice ? "通知の見本を閉じました。" : "通知の見本を画面内に表示しました。端末へは送っていません。"); }}>{notice ? "通知の表示例を閉じる" : "通知の表示例を見る"}</button>{notice && <div className="inline-notification" role="status"><strong>通知の見本</strong><p>見本城Aからのお知らせがあります。端末の通知設定は変更していません。</p></div>}</div>}
    {view === VIEWS[3] && <div className="inline-item"><h5>写真と旅の記録の取込み</h5><p>同梱の架空ファイル名と訪問記録を使います。お手元のファイルは読みません。</p><button className="demo-primary" type="button" disabled={imported} onClick={() => { setRows(previous => previous.map(row => row.id === "b" ? { ...row, visited: true } : row)); setImported(true); setMessage("見本城Bの訪問記録と写真名の見本を反映しました。実ファイルの取込みはしていません。"); }}>{imported ? "見本を反映済み" : "同梱の取込み見本を試す"}</button>{imported && <p className="inline-notification">見本城B · 訪問済み<br />写真名：sample-castle-b.jpg（ファイル名の見本）</p>}</div>}
    <Feedback>{message}</Feedback>
  </DemoFrame>;
}
