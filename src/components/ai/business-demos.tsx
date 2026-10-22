"use client";

import { useState } from "react";
import { DELIVERY_SAMPLE, MARKET_SAMPLE, ORDER_CSV, deliveryResult, lineAmount, money, parseOrders, type DeliveryRow, type MarketRow, type OrderRow } from "./demo-models";
import { DemoError, DemoFrame, Feedback } from "./demo-ui";

export function DeliveryDemo() {
  const [rows, setRows] = useState(DELIVERY_SAMPLE);
  const results = rows.map(deliveryResult);
  const update = (index: number, field: keyof DeliveryRow, value: string) => setRows(previous => previous.map((row, i) => i === index ? { ...row, [field]: value } : row));
  return <DemoFrame title="納品と回収を、ひとつの記録に。" reset={() => setRows(DELIVERY_SAMPLE)} note="納品と回収を記録する操作の見本です。実際のお店・在庫は更新されません。">
    <p>回収数を変えると、納品数から差し引いた数が変わります。</p>
    <div className="inline-item-list">{rows.map((row, index) => <div className="inline-item" key={row.name}><h5>{row.name}</h5><div className="inline-fields">
      <label>納品数<input aria-label={`${row.name}の納品数`} type="number" min="0" max="10000" step="1" value={row.delivered} onChange={event => update(index, "delivered", event.target.value)} aria-invalid={results[index] === null} /></label>
      <label>回収数<input aria-label={`${row.name}の回収数`} type="number" min="0" max="10000" step="1" value={row.returned} onChange={event => update(index, "returned", event.target.value)} aria-invalid={results[index] === null} /></label>
    </div><p className="inline-result">納品 − 回収 <strong>{results[index] === null ? "—" : `${results[index]}点`}</strong></p></div>)}</div>
    {results.includes(null) ? <DemoError>0〜10,000の整数を入力してください。回収数は納品数以下にしてください。</DemoError> : <Feedback>差し引きの合計は{results.reduce<number>((sum, value) => sum + value!, 0)}点です。</Feedback>}
  </DemoFrame>;
}

export function OnlineDemo() {
  const [csv, setCsv] = useState(ORDER_CSV);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("「見本を取り込む」を押すと、注文と発送準備の一覧ができます。");
  const reset = () => { setCsv(ORDER_CSV); setOrders([]); setError(""); setMessage("最初のサンプルに戻しました。"); };
  function importSample() {
    const result = parseOrders(csv);
    if (result.error !== undefined) { setError(result.error); setMessage("取り込めませんでした。一覧は前の状態を保っています。"); return; }
    setOrders(result.rows); setError(""); setMessage(`${result.rows.length}件の見本を取り込みました。もう一度取り込むと一覧を置き換えます。`);
  }
  return <DemoFrame title="注文の一覧から、発送の準備まで。" reset={reset} note="CSV形式の文字をこの画面だけで読み取ります。実際のネットショップ・販売台帳・配送会社には接続せず、伝票も発行しません。">
    <label className="inline-label">注文の見本（カンマ区切り・20件まで）<textarea aria-label="注文の見本" value={csv} maxLength={4000} rows={5} onChange={event => setCsv(event.target.value)} /></label>
    <button type="button" className="demo-primary" onClick={importSample}>見本を取り込む</button>
    {error && <DemoError>{error}</DemoError>}
    {orders.length > 0 && <div className="inline-item-list">{orders.map(row => <div className="inline-item" key={row.id}><h5>{row.id} · {row.product}</h5><p>{row.quantity}点 · {money(lineAmount(row.quantity, row.price)!)}</p><label className="inline-check"><input type="checkbox" checked={row.prepared} onChange={event => { const checked = event.target.checked; setOrders(previous => previous.map(item => item.id === row.id ? { ...item, prepared: checked } : item)); }} />発送準備済み（見本）</label></div>)}<p className="inline-result">発送準備済み <strong>{orders.filter(row => row.prepared).length} / {orders.length}件</strong></p></div>}
    <Feedback>{message}</Feedback>
  </DemoFrame>;
}

export function MarketDemo() {
  const [rows, setRows] = useState(MARKET_SAMPLE);
  const update = (id: number, field: keyof MarketRow, value: string) => setRows(previous => previous.map(row => row.id === id ? { ...row, [field]: value } : row));
  const valid = rows.every(row => lineAmount(row.quantity, row.price) !== null);
  return <DemoFrame title="市場への出荷と、仕入れを記録。" reset={() => setRows(MARKET_SAMPLE)} note="出荷・仕入れの入力と単純集計の見本です。運賃・手数料・税金は含みません。実際の会計や在庫を更新しません。">
    <div className="inline-item-list">{rows.map(row => <div className="inline-item" key={row.id}><h5>{row.name}</h5><div className="inline-fields">
      <label>区分<select aria-label={`${row.name}の区分`} value={row.type} onChange={event => update(row.id, "type", event.target.value)}><option>出荷</option><option>仕入れ</option></select></label>
      <label>数量<input aria-label={`${row.name}の数量`} type="number" min="0" max="10000" step="1" value={row.quantity} onChange={event => update(row.id, "quantity", event.target.value)} aria-invalid={lineAmount(row.quantity, row.price) === null} /></label>
      <label>単価（円）<input aria-label={`${row.name}の単価`} type="number" min="0" max="100000" step="1" value={row.price} onChange={event => update(row.id, "price", event.target.value)} aria-invalid={lineAmount(row.quantity, row.price) === null} /></label>
    </div><p className="inline-result">金額 <strong>{lineAmount(row.quantity, row.price) === null ? "—" : money(lineAmount(row.quantity, row.price)!)}</strong></p></div>)}</div>
    {!valid ? <DemoError>数量は0〜10,000、単価は0〜100,000の整数を入力してください。空欄がある間は合計を表示しません。</DemoError> : <div className="inline-totals" role="status">{["出荷", "仕入れ"].map(type => <p key={type}>{type}の合計 <strong>{money(rows.filter(row => row.type === type).reduce((sum, row) => sum + lineAmount(row.quantity, row.price)!, 0))}</strong></p>)}</div>}
  </DemoFrame>;
}
