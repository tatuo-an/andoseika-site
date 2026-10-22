"use client";

import { useState } from "react";
import { BASIC_MEDIA } from "@/lib/andu-plans";
import { TIME_SAMPLE, includesQuery, lineAmount, money, numberValue, workMinutes } from "./demo-models";
import { DemoError, DemoFrame, Feedback } from "./demo-ui";

export function BookingDemo() {
  const slots = ["見本日A · 10:00", "見本日B · 10:00", "見本日C · 10:00"];
  const [reserved, setReserved] = useState<string[]>([]), [choice, setChoice] = useState(""), [error, setError] = useState("");
  return <DemoFrame title="1組の予約で、枠が満席に。" reset={() => { setReserved([]); setChoice(""); setError(""); }} note="予約画面の操作見本です。実際の予約受付やLINE送信は行いません。受付開始の自動化や既製サービスの連携は再現していません。">
    <label className="inline-label">試す予約枠<select aria-label="試す予約枠" value={choice} onChange={event => { setChoice(event.target.value); setError(""); }}><option value="">枠を選んでください</option>{slots.map(slot => <option key={slot} disabled={reserved.includes(slot)}>{slot}</option>)}</select></label>
    <button type="button" className="demo-primary" onClick={() => { if (!slots.includes(choice) || reserved.includes(choice)) { setError("空いている枠を選んでください。"); return; } setReserved(previous => previous.includes(choice) ? previous : [...previous, choice]); setChoice(""); setError(""); }}>予約の見本を試す</button>
    {error && <DemoError>{error}</DemoError>}
    <ul className="inline-item-list">{slots.map(slot => <li className="inline-item inline-split" key={slot}><span>{slot} · <strong>{reserved.includes(slot) ? "満席（見本）" : "空き1組"}</strong></span>{reserved.includes(slot) && <button type="button" className="demo-secondary" onClick={() => setReserved(previous => previous.filter(item => item !== slot))}>この枠を空きに戻す</button>}</li>)}</ul>
    <Feedback>{reserved.length}枠の予約を画面内で再現しています。</Feedback>
  </DemoFrame>;
}

export function SnsDemo() {
  const sample = "今日は、季節の商品が届きました。お近くにお越しの際は、お立ち寄りください。";
  const [text, setText] = useState(sample), [preview, setPreview] = useState(""), [error, setError] = useState("");
  return <DemoFrame title="お知らせを、投稿の形に。" reset={() => { setText(sample); setPreview(""); setError(""); }} note="投稿内容を確認する操作の見本です。文章の自動生成や各媒体への投稿・予約は行いません。">
    <label className="inline-label">投稿文の見本<textarea aria-label="投稿文の見本" rows={4} maxLength={500} value={text} onChange={event => setText(event.target.value)} /></label>
    <button type="button" className="demo-primary" onClick={() => { if (!text.trim()) { setPreview(""); setError("見本の投稿文を入力してください。"); return; } setPreview(text.trim()); setError(""); }}>投稿の見た目を確認する</button>
    {error && <DemoError>{error}</DemoError>}
    {preview && <div className="inline-item-list">{BASIC_MEDIA.map(media => <div className="inline-item" key={media}><h5>{media} · 投稿見本</h5><p className="inline-preview-text">{preview}</p></div>)}</div>}
    <Feedback>{preview ? "3媒体の投稿見本です。外部へは投稿されていません。" : "文章を変えて、見た目を確かめられます。"}</Feedback>
  </DemoFrame>;
}

export function CarDemo() {
  const cars = [{ name: "見本車A", type: "軽自動車" }, { name: "見本車B", type: "コンパクト" }, { name: "見本車C", type: "軽自動車" }];
  const [query, setQuery] = useState(""), [type, setType] = useState("すべて"), [selected, setSelected] = useState("");
  const filtered = cars.filter(car => includesQuery(car.name, query) && (type === "すべて" || car.type === type));
  return <DemoFrame title="車を探して、問い合わせ内容を確認。" reset={() => { setQuery(""); setType("すべて"); setSelected(""); }} note="車の紹介サイトとLINE窓口の操作見本です。車はすべて架空です。在庫確認・購入・問い合わせ送信・LINE連携は行いません。">
    <div className="inline-fields"><label>車名を探す<input type="search" aria-label="見本の車名" value={query} maxLength={60} onChange={event => setQuery(event.target.value)} /></label><label>種類<select aria-label="見本車の種類" value={type} onChange={event => setType(event.target.value)}><option>すべて</option><option>軽自動車</option><option>コンパクト</option></select></label></div>
    <div className="inline-item-list">{filtered.map(car => <div className="inline-item inline-split" key={car.name}><span><strong>{car.name}</strong> · {car.type}</span><button className="demo-secondary" type="button" onClick={() => setSelected(car.name)}>問い合わせの見本を見る</button></div>)}</div>
    {filtered.length === 0 && <div className="demo-empty"><p>この条件の見本車はありません。</p><button className="demo-secondary" type="button" onClick={() => { setQuery(""); setType("すべて"); }}>絞り込みを解除する</button></div>}
    <Feedback>{selected ? `LINEで伝える内容の見本：「${selected}について相談したいです。」送信はされていません。` : `${filtered.length}台の見本を表示しています。`}</Feedback>
  </DemoFrame>;
}

export function TimecardDemo() {
  const [rows, setRows] = useState(TIME_SAMPLE), [loaded, setLoaded] = useState(false);
  const results = rows.map(workMinutes);
  const totalMinutes = results.includes(null) ? 0 : results.reduce<number>((sum, value) => sum + value!, 0);
  return <DemoFrame title="読み取った時刻を確認して、時間を集計。" reset={() => { setRows(TIME_SAMPLE); setLoaded(false); }} note="読み取り後の確認・集計の操作見本です。画像の文字認識は行いません。同日の勤務のみ、休憩を引いた時間を計算します。給与・工賃の本番処理には接続しません。">
    {!loaded ? <><p>写真から読み取ったあとの見本を、表に入れて試せます。</p><button type="button" className="demo-primary" onClick={() => setLoaded(true)}>読み取り済みの見本を入れる</button></> : <>
      <div className="inline-item-list">{rows.map((row, index) => <div className="inline-item" key={row.day}><h5>{row.day}</h5><div className="inline-fields">{([['start', '出勤'], ['end', '退勤'], ['rest', '休憩（分）']] as const).map(([key, label]) => <label key={key}>{label}<input aria-label={`${row.day}の${label}`} type={key === 'rest' ? 'number' : 'time'} min={key === 'rest' ? '0' : undefined} max={key === 'rest' ? '1440' : undefined} step={key === 'rest' ? '1' : undefined} value={row[key]} aria-invalid={results[index] === null} onChange={event => { const value = event.target.value; setRows(previous => previous.map((item, i) => index === i ? { ...item, [key]: value } : item)); }} /></label>)}</div><p className="inline-result">勤務時間 <strong>{results[index] === null ? "—" : `${Math.floor(results[index]! / 60)}時間${results[index]! % 60}分`}</strong></p></div>)}</div>
      {results.includes(null) ? <DemoError>時刻と休憩を確認してください。退勤は出勤以降、休憩は勤務時間以内で入力してください。空欄の間は合計を表示しません。</DemoError> : <Feedback>合計 {Math.floor(totalMinutes / 60)}時間{totalMinutes % 60}分です。時刻を修正して試せます。</Feedback>}
    </>}
  </DemoFrame>;
}

export function ShopDemo() {
  const [quantity, setQuantity] = useState("1"), [cart, setCart] = useState(0), [message, setMessage] = useState("数量を変え、カートの見本に入れてみてください。");
  const count = numberValue(quantity, 9, true);
  return <DemoFrame title="商品を選んで、カートに入れる。" reset={() => { setQuantity("1"); setCart(0); setMessage("最初のサンプルに戻しました。"); }} note="ネットショップの操作見本です。商品・価格は架空です。注文・決済・在庫更新は行いません。個人情報の入力欄はありません。">
    <div className="inline-item"><h5>見本のはちみつ · 1点1,000円</h5><label className="inline-label">数量（1〜9点）<input aria-label="見本商品の数量" type="number" min="1" max="9" step="1" value={quantity} aria-invalid={count === null || count < 1} onChange={event => setQuantity(event.target.value)} /></label><button type="button" className="demo-primary" onClick={() => { if (count === null || count < 1) { setMessage("数量は1〜9の整数を入力してください。"); return; } if (cart + count > 9) { setMessage("見本のカートは合計9点までです。サンプルに戻して試してください。"); return; } setCart(previous => previous + count); setMessage("カートの見本に追加しました。注文はされていません。"); }}>カートの見本に入れる</button></div>
    {(count === null || count < 1) && <DemoError>数量は1〜9の整数を入力してください。</DemoError>}
    <p className="inline-result">カート {cart}点 <strong>{money(lineAmount(String(cart), "1000")!)}</strong></p><Feedback>{message}</Feedback>
  </DemoFrame>;
}
