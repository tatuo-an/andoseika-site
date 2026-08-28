// OpenNext が生成する worker.js は fetch ハンドラしか公開しないため、
// Cloudflare Cron Triggers 用の scheduled ハンドラをここで足す。
// （旧 vercel.json の crons 4本の移設先）
//
// このファイルは Next.js のビルド対象ではなく Worker のエントリポイント。
// tsconfig.json の exclude に入れてあり、型は wrangler/esbuild が解決する。

// .open-next/worker.js はビルド時に生成されるため、型検査時点では存在しない。
// @ts-ignore - ビルド時に生成されるため、型検査の時点では存在しないことがある
import { default as handler } from "./.open-next/worker.js";

type Env = Record<string, string | undefined>;
type ScheduledEvent = { cron: string; scheduledTime: number };
type Ctx = { waitUntil(promise: Promise<unknown>): void };

/** cron 式 → 叩くルート。wrangler.jsonc の triggers.crons と1対1で対応させること。 */
const CRON_ROUTES: Record<string, string> = {
  "0 2 * * *": "/api/cron/cleanup-images",
  "0 3 * * *": "/api/cron/auto-complete",
  "0 0 * * *": "/api/cron/renewal-notifications",
  "0 0 * * 1": "/api/cron/line-order-reminder",
};

export default {
  fetch: handler.fetch,

  async scheduled(event: ScheduledEvent, env: Env, ctx: Ctx): Promise<void> {
    // 実行ゲート。既存 Worker の POST_CRON_ENABLED と同じ考え方。
    // 未設定なら動かさない（検証デプロイで顧客宛の通知が飛ぶのを防ぐため）。
    // 本番切替時に  wrangler secret put CRON_ENABLED  で "true" を入れる。
    if (env.CRON_ENABLED !== "true") {
      console.log(`cron ${event.cron} はスキップ（CRON_ENABLED が true ではありません）`);
      return;
    }

    const path = CRON_ROUTES[event.cron];
    if (!path) {
      console.error(`未対応の cron 式: ${event.cron}`);
      return;
    }

    // ネットワークを経由せず同一 Worker 内で処理する（1042 やタイムアウトを避けるため）
    const origin = env.NEXT_PUBLIC_SITE_URL ?? "https://ando-seika.com";
    const req = new Request(`${origin}${path}`, {
      method: "GET",
      headers: { authorization: `Bearer ${env.CRON_SECRET ?? ""}` },
    });

    const run = handler
      .fetch(req, env, ctx)
      .then(async (res: Response) => {
        const body = await res.text().catch(() => "");
        if (!res.ok) {
          console.error(`cron ${event.cron} ${path} 失敗: ${res.status} ${body.slice(0, 500)}`);
        } else {
          console.log(`cron ${event.cron} ${path} 成功: ${body.slice(0, 200)}`);
        }
      })
      .catch((e: unknown) => {
        console.error(`cron ${event.cron} ${path} 例外:`, e);
      });

    // レスポンスを待たずに Worker が終了しないようにする
    ctx.waitUntil(run);
  },
};
