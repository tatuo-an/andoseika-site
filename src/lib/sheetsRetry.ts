// Google Sheets APIは短時間に連続でアクセスすると一時的な通信エラー（レート制限含む）で
// 失敗することがある。失敗をそのまま諦めると商品一覧が空表示になったり、カートの金額や
// 住所判定がおかしくなったりするため、間隔を空けながら複数回リトライしてから諦める。
export async function withRetry<T>(fn: () => Promise<T>, retries = 4): Promise<T> {
    let lastErr: unknown;
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            if (i < retries) await new Promise((r) => setTimeout(r, 400 * 2 ** i));
        }
    }
    throw lastErr;
}
