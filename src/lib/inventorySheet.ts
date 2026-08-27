import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";
import { unstable_cache } from "next/cache";
import { withRetry } from "@/lib/sheetsRetry";

function getSheetsClient() {
    const authClient = new googleAuth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return sheetsApi({ version: "v4", auth: authClient });
}

// 「商品在庫」シートの全行(A〜AC列)。ページ遷移のたびに全ページが個別に
// Google Sheets APIを叩くとレート制限にかかり商品一覧が丸ごと空表示になる
// ことがあるため、短時間キャッシュして呼び出し元同士で共有する。
// 管理画面で保存しても反映まで最大15秒程度かかる（キャッシュ期限切れを待つ）。
export const getInventoryRows = unstable_cache(
    async (): Promise<string[][]> => {
        const sheets = getSheetsClient();
        const res = await withRetry(() => sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: "商品在庫!A:AC",
        }));
        return (res.data.values ?? []) as string[][];
    },
    ["inventory-sheet-rows"],
    { revalidate: 15, tags: ["inventory-sheet"] }
);
