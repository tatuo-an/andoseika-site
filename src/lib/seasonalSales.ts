import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";

export type SeasonalSale = {
    name: string;
    startDate: string; // "MM-DD"
    endDate: string;   // "MM-DD"
    discountPercent: number;
    enabled: boolean;
};

// 季節イベントセールの初期値（管理画面「季節セール管理」の初回アクセス時にシートへ書き込まれる）
export const DEFAULT_SEASONAL_SALES: SeasonalSale[] = [
    { name: "年賀セール", startDate: "01-01", endDate: "01-07", discountPercent: 10, enabled: true },
    { name: "成人の日セール", startDate: "01-08", endDate: "01-14", discountPercent: 5, enabled: true },
    { name: "バレンタインセール", startDate: "02-01", endDate: "02-14", discountPercent: 8, enabled: true },
    { name: "ホワイトデーセール", startDate: "03-01", endDate: "03-14", discountPercent: 8, enabled: true },
    { name: "卒園・卒業・入学・入園セール", startDate: "03-15", endDate: "03-31", discountPercent: 5, enabled: true },
    { name: "就職・昇進祝いセール", startDate: "04-01", endDate: "04-10", discountPercent: 5, enabled: true },
    { name: "母の日セール", startDate: "05-01", endDate: "05-12", discountPercent: 8, enabled: true },
    { name: "父の日セール", startDate: "06-01", endDate: "06-21", discountPercent: 8, enabled: true },
    { name: "お中元・暑中見舞いセール", startDate: "07-01", endDate: "08-15", discountPercent: 8, enabled: true },
    { name: "敬老の日セール", startDate: "09-01", endDate: "09-21", discountPercent: 8, enabled: true },
    { name: "七五三セール", startDate: "11-01", endDate: "11-15", discountPercent: 5, enabled: true },
    { name: "クリスマスセール", startDate: "12-01", endDate: "12-25", discountPercent: 8, enabled: true },
    { name: "お歳暮セール", startDate: "12-01", endDate: "12-20", discountPercent: 10, enabled: true },
];

// MM-DD 形式の日付が期間内かどうか（年をまたぐ期間にも対応。例: 12-25〜01-05）
function isWithinMonthDayRange(mmdd: string, start: string, end: string): boolean {
    if (start <= end) return mmdd >= start && mmdd <= end;
    return mmdd >= start || mmdd <= end;
}

function todayMMDD(now: Date): string {
    const mm = now.toLocaleString("en-US", { timeZone: "Asia/Tokyo", month: "2-digit" });
    const dd = now.toLocaleString("en-US", { timeZone: "Asia/Tokyo", day: "2-digit" });
    return `${mm}-${dd}`;
}

// 現在有効な季節セールのうち、最も割引率が高いものを1つ返す（クリスマスとお歳暮のように
// 期間が重複する場合は、重複させず割引率が高い方だけを適用する）
export function getActiveSeasonalSale(sales: SeasonalSale[], now: Date = new Date()): SeasonalSale | null {
    const mmdd = todayMMDD(now);
    const active = sales.filter((s) => s.enabled && s.discountPercent > 0 && isWithinMonthDayRange(mmdd, s.startDate, s.endDate));
    if (active.length === 0) return null;
    return active.reduce((max, s) => (s.discountPercent > max.discountPercent ? s : max));
}

// 「季節セール」シートを読み、現在有効なセール（名前・割引率）を返す（読み取り失敗時はnull＝影響なし）。
export async function fetchActiveSeasonalSale(): Promise<SeasonalSale | null> {
    try {
        const authClient = new googleAuth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });
        const sheets = sheetsApi({ version: "v4", auth: authClient });
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: "季節セール!A:E",
        });
        const rows = (res.data.values ?? []).slice(1).filter((r) => r[0]);
        const sales: SeasonalSale[] = rows.map((r) => ({
            name: r[0] ?? "",
            startDate: r[1] ?? "",
            endDate: r[2] ?? "",
            discountPercent: parseInt(r[3] ?? "0", 10) || 0,
            enabled: r[4] === "TRUE",
        }));
        return getActiveSeasonalSale(sales);
    } catch {
        return null;
    }
}

// 商品一覧・詳細ページなど、割引率の数値だけが必要な呼び出し元向けの簡易ヘルパー。
export async function fetchActiveSeasonalDiscountPercent(): Promise<number> {
    const sale = await fetchActiveSeasonalSale();
    return sale?.discountPercent ?? 0;
}
