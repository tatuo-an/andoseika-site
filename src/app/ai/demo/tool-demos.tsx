"use client";

import { useState } from "react";

const yen = (value: number) => `${value.toLocaleString("ja-JP")}円`;
const PAYROLL_SAMPLE = [
  { name: "スタッフA", hours: "120", rate: "1400" },
  { name: "スタッフB", hours: "88.5", rate: "1300" },
  { name: "スタッフC", hours: "64", rate: "1200" },
];

function validNumber(value: string, max: number, integer = false) {
  const number = Number(value);
  return value.trim() !== "" && Number.isFinite(number) && number >= 0 && number <= max && (!integer || Number.isInteger(number));
}

export function PayrollDemo() {
  const [rows, setRows] = useState(PAYROLL_SAMPLE);
  const [message, setMessage] = useState("まず、スタッフAの勤務時間を変えてみてください。");
  const valid = rows.every(row => validNumber(row.hours, 744) && validNumber(row.rate, 100000, true));
  const totalHours = rows.reduce((sum, row) => sum + Number(row.hours), 0);
  const total = rows.reduce((sum, row) => sum + Math.round(Number(row.hours) * Number(row.rate)), 0);
  function update(index: number, field: "hours" | "rate", value: string) {
    setRows(previous => previous.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
    setMessage("入力した数字で、自動的に集計しています。");
  }
  return (
    <section className="demo-section" id="payroll" aria-labelledby="payroll-title">
      <div className="demo-section-heading">
        <div><p className="demo-number">DEMO 01</p><h2 id="payroll-title">勤務時間から、給与を集計。</h2><p>表の数字を変えると、スタッフごとの金額と合計が変わります。</p></div>
        <span className="demo-sample-label">サンプルデータ</span>
      </div>
      <div className="demo-workspace">
        <div className="demo-toolbar"><h3>今月の勤務集計</h3><button type="button" className="demo-secondary" onClick={() => { setRows(PAYROLL_SAMPLE); setMessage("最初のサンプルに戻しました。"); }}>サンプルに戻す</button></div>
        <div className="demo-table-scroll" role="region" aria-label="勤務集計の表" tabIndex={0}>
          <table className="demo-table payroll-table">
            <thead><tr><th scope="col">スタッフ</th><th scope="col">勤務時間</th><th scope="col">時給（円）</th><th scope="col">集計額</th></tr></thead>
            <tbody>{rows.map((row, index) => {
              const hoursValid = validNumber(row.hours, 744);
              const rateValid = validNumber(row.rate, 100000, true);
              return <tr key={row.name}>
                <th scope="row">{row.name}</th>
                <td data-label="勤務時間"><label className="demo-sr-only" htmlFor={`hours-${index}`}>{row.name}の勤務時間</label><input id={`hours-${index}`} type="number" min="0" max="744" step="0.01" inputMode="decimal" value={row.hours} aria-invalid={!hoursValid} aria-describedby={!hoursValid ? "payroll-error" : undefined} onChange={event => update(index, "hours", event.target.value)} /></td>
                <td data-label="時給（円）"><label className="demo-sr-only" htmlFor={`rate-${index}`}>{row.name}の時給</label><input id={`rate-${index}`} type="number" min="0" max="100000" step="1" inputMode="numeric" value={row.rate} aria-invalid={!rateValid} aria-describedby={!rateValid ? "payroll-error" : undefined} onChange={event => update(index, "rate", event.target.value)} /></td>
                <td className="demo-amount" data-label="集計額">{hoursValid && rateValid ? yen(Math.round(Number(row.hours) * Number(row.rate))) : "—"}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
        {!valid && <p className="demo-error" id="payroll-error" role="alert">勤務時間は0〜744、時給は0〜100,000の整数で入力してください。空欄がある間は合計を表示しません。</p>}
        <div className="demo-total" aria-live="polite" aria-atomic="true"><div><span>3名の集計額</span><strong>{valid ? yen(total) : "入力を確認してください"}</strong></div><p>勤務時間の合計 <b>{valid ? `${Number(totalHours.toFixed(2)).toLocaleString("ja-JP")}時間` : "—"}</b></p></div>
        <p className="demo-feedback" role="status">{message}</p>
      </div>
      <p className="demo-footnote">勤務時間 × 時給の単純集計（1円未満四捨五入）です。残業・深夜の割増、税金、社会保険などは含みません。実際の給与明細ではありません。</p>
      <p className="demo-use-case"><strong>仕事に合わせて作れます</strong>時間・出来高など、使う項目と計算方法を確認して設計します。</p>
    </section>
  );
}

const SALES_SAMPLE = [
  { id: 1, name: "サンプル商店A", industry: "小売", area: "東エリア", phone: "000-0000-0001", status: "未対応", updated: "更新前" },
  { id: 2, name: "サンプル食堂B", industry: "飲食", area: "西エリア", phone: "000-0000-0002", status: "連絡済み", updated: "更新前" },
  { id: 3, name: "サンプル工房C", industry: "製造", area: "東エリア", phone: "000-0000-0003", status: "相談中", updated: "更新前" },
  { id: 4, name: "サンプル商店D", industry: "小売", area: "南エリア", phone: "000-0000-0004", status: "未対応", updated: "更新前" },
  { id: 5, name: "サンプル喫茶E", industry: "飲食", area: "西エリア", phone: "000-0000-0005", status: "未対応", updated: "更新前" },
];
const STATUS_OPTIONS = ["未対応", "連絡済み", "相談中"];

export function SalesDemo() {
  const [rows, setRows] = useState(SALES_SAMPLE);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("すべて");
  const [status, setStatus] = useState("すべて");
  const [refreshed, setRefreshed] = useState(false);
  const [message, setMessage] = useState("検索や絞り込みで営業先を探し、対応状況を変えてみてください。");
  const normalizedQuery = query.trim().normalize("NFKC").toLowerCase();
  const filtered = rows.filter(row => `${row.name} ${row.area} ${row.phone}`.normalize("NFKC").toLowerCase().includes(normalizedQuery) && (industry === "すべて" || row.industry === industry) && (status === "すべて" || row.status === status));
  function refresh() {
    setRows(previous => [...previous.map(row => row.id === 1 ? { ...row, area: "北エリア", updated: "情報更新" } : row), { id: 6, name: "サンプル食堂F", industry: "飲食", area: "北エリア", phone: "000-0000-0006", status: "未対応", updated: "新着" }]);
    setRefreshed(true);
    setMessage("更新の見本：新しい営業先を1件追加し、商店Aのエリアを更新しました。対応状況は引き継いでいます。外部サイトへの接続はしていません。");
  }
  function clearFilters() { setQuery(""); setIndustry("すべて"); setStatus("すべて"); }
  return (
    <section className="demo-section" id="sales" aria-labelledby="sales-title">
      <div className="demo-section-heading">
        <div><p className="demo-number">DEMO 02</p><h2 id="sales-title">営業先を探して、対応を記録。</h2><p>電話番号をひとつの一覧に。情報が増えても、対応の記録はそのまま。</p></div>
        <span className="demo-sample-label">架空の店舗・電話番号</span>
      </div>
      <div className="demo-workspace">
        <div className="demo-toolbar"><div><h3>営業先リスト</h3><p>{rows.length}件登録 · 未対応 {rows.filter(row => row.status === "未対応").length}件</p></div><div className="demo-button-group"><button className="demo-secondary" type="button" onClick={() => { setRows(SALES_SAMPLE); clearFilters(); setRefreshed(false); setMessage("最初のサンプルに戻しました。"); }}>サンプルに戻す</button><button className="demo-primary" type="button" disabled={refreshed} onClick={refresh}>{refreshed ? "更新の見本を反映済み" : "情報更新を試す"}</button></div></div>
        <div className="demo-filters">
          <label htmlFor="sales-query">名前・エリア・電話番号<input id="sales-query" type="search" value={query} placeholder="例：商店、東エリア" onChange={event => setQuery(event.target.value)} /></label>
          <label htmlFor="sales-industry">業種<select id="sales-industry" value={industry} onChange={event => setIndustry(event.target.value)}>{["すべて", "小売", "飲食", "製造"].map(value => <option key={value}>{value}</option>)}</select></label>
          <label htmlFor="sales-status">対応状況<select id="sales-status" value={status} onChange={event => setStatus(event.target.value)}>{["すべて", ...STATUS_OPTIONS].map(value => <option key={value}>{value}</option>)}</select></label>
        </div>
        <p className="demo-result-count" role="status">{rows.length}件中 {filtered.length}件を表示</p>
        <div className="demo-table-scroll" role="region" aria-label="営業先の表" tabIndex={0}>
          <table className="demo-table sales-table">
            <thead><tr><th scope="col">営業先・業種</th><th scope="col">エリア</th><th scope="col">電話番号（見本）</th><th scope="col">対応状況</th><th scope="col">情報更新</th></tr></thead>
            <tbody>{filtered.map(row => <tr key={row.id}>
              <th scope="row">{row.name}<span className="demo-table-sub">{row.industry}</span></th><td data-label="エリア">{row.area}</td><td className="demo-phone" data-label="電話番号（見本）">{row.phone}</td>
              <td data-label="対応状況"><select aria-label={`${row.name}の対応状況`} value={row.status} onChange={event => { const value = event.target.value; setRows(previous => previous.map(item => item.id === row.id ? { ...item, status: value } : item)); setMessage(`${row.name}を「${value}」に変更しました（デモ内のみ）。`); }}>{STATUS_OPTIONS.map(value => <option key={value}>{value}</option>)}</select></td>
              <td data-label="情報更新"><span className={row.updated === "更新前" ? "demo-update" : "demo-update is-new"}>{row.updated}</span></td>
            </tr>)}</tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="demo-empty"><p>この条件に合う営業先はありません。</p><button className="demo-secondary" type="button" onClick={clearFilters}>絞り込みを解除する</button></div>}
        <p className="demo-feedback" role="status">{message}</p>
      </div>
      <p className="demo-footnote">「情報更新」はサンプルを切り替える操作です。自動収集・電話発信・外部送信は行いません。電話番号はすべて架空です。</p>
      <p className="demo-use-case"><strong>定期更新も、ご相談ください</strong>更新元のデータ・利用条件・頻度を確認して、お客さまの仕事に合う形をご提案します。</p>
    </section>
  );
}
