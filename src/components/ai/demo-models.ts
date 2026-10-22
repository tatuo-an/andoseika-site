// These fixtures and calculations are isolated from the shop, accounting and customer systems.
export function numberValue(raw: string, max: number, integer = false): number | null {
  const text = raw.trim();
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) && value >= 0 && value <= max && (!integer || Number.isInteger(value)) ? value : null;
}
export const money = (value: number) => `${value.toLocaleString("ja-JP")}円`;

export type PayRow = { name: string; hours: string; rate: string };
export const PAYROLL_SAMPLE: PayRow[] = [
  { name: "スタッフA", hours: "120", rate: "1400" },
  { name: "スタッフB", hours: "88.5", rate: "1300" },
  { name: "スタッフC", hours: "64", rate: "1200" },
];
export function payrollTotals(rows: PayRow[]) {
  const values = rows.map(row => ({ hours: numberValue(row.hours, 744), rate: numberValue(row.rate, 100000, true) }));
  if (values.some(row => row.hours === null || row.rate === null)) return null;
  return values.reduce((total, row) => ({ hours: total.hours + row.hours!, amount: total.amount + Math.round(row.hours! * row.rate!) }), { hours: 0, amount: 0 });
}

export type DeliveryRow = { name: string; delivered: string; returned: string };
export const DELIVERY_SAMPLE: DeliveryRow[] = [
  { name: "見本商品A", delivered: "24", returned: "3" },
  { name: "見本商品B", delivered: "12", returned: "1" },
];
export function deliveryResult(row: DeliveryRow) {
  const delivered = numberValue(row.delivered, 10000, true), returned = numberValue(row.returned, 10000, true);
  return delivered === null || returned === null || returned > delivered ? null : delivered - returned;
}

export type MarketRow = { id: number; type: string; name: string; quantity: string; price: string };
export const MARKET_SAMPLE: MarketRow[] = [
  { id: 1, type: "出荷", name: "見本商品A", quantity: "10", price: "200" },
  { id: 2, type: "仕入れ", name: "見本商品B", quantity: "5", price: "150" },
];
export function lineAmount(quantity: string, price: string) {
  const count = numberValue(quantity, 10000, true), unit = numberValue(price, 100000, true);
  return count === null || unit === null ? null : count * unit;
}

export type OrderRow = { id: string; product: string; quantity: string; price: string; prepared: boolean };
export const ORDER_CSV = "注文ID,商品,数量,単価\n見本001,見本商品A,2,180\n見本002,見本商品B,1,250\n見本003,見本商品A,3,180";
export function parseOrders(csv: string): { rows: OrderRow[]; error?: undefined } | { rows?: undefined; error: string } {
  if (csv.length > 4000) return { error: "見本は20件・4,000文字以内で入力してください。" };
  const lines = csv.trim().replace(/^\uFEFF/, "").split(/\r?\n/);
  if (lines[0] !== "注文ID,商品,数量,単価" || lines.length < 2 || lines.length > 21) return { error: "先頭を「注文ID,商品,数量,単価」にして、見本の注文を1〜20件入れてください。" };
  const rows: OrderRow[] = [];
  for (const line of lines.slice(1)) {
    const fields = line.split(",").map(value => value.trim());
    const [id, product, quantity, price] = fields;
    if (fields.length !== 4 || !id || !product || id.length > 40 || product.length > 40 || numberValue(quantity, 10000, true) === null || Number(quantity) < 1 || numberValue(price, 100000, true) === null || rows.some(row => row.id === id)) return { error: "注文IDの重複、空欄、数量・単価を確認してください。数量は1〜10,000、単価は0〜100,000の整数です。" };
    rows.push({ id, product, quantity, price, prepared: false });
  }
  return { rows };
}

export type TimeRow = { day: string; start: string; end: string; rest: string };
export const TIME_SAMPLE: TimeRow[] = [
  { day: "見本1日目", start: "09:00", end: "17:00", rest: "60" },
  { day: "見本2日目", start: "09:00", end: "16:00", rest: "60" },
];
export function workMinutes(row: TimeRow) {
  const toMinutes = (raw: string) => { const match = /^(\d{2}):(\d{2})$/.exec(raw); return match && Number(match[1]) <= 23 && Number(match[2]) <= 59 ? Number(match[1]) * 60 + Number(match[2]) : null; };
  const start = toMinutes(row.start), end = toMinutes(row.end), rest = numberValue(row.rest, 1440, true);
  return start === null || end === null || rest === null || end < start || rest > end - start ? null : end - start - rest;
}

export const CASTLE_SAMPLE = [
  { id: "a", name: "見本城A", area: "東エリア", seal: "限定版A（見本）", visited: true },
  { id: "b", name: "見本城B", area: "西エリア", seal: "通常版B（見本）", visited: false },
  { id: "c", name: "見本城C", area: "北エリア", seal: "限定版C（見本）", visited: false },
];
export function normalized(value: string) { return value.normalize("NFKC").toLocaleLowerCase("ja-JP").trim(); }
export function includesQuery(value: string, query: string) { return normalized(value).includes(normalized(query)); }
