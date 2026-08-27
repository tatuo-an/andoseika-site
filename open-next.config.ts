import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

// キューとタグキャッシュ（Durable Objects / D1）は未設定。
// 時間ベースの revalidate はベストエフォートになるが、revalidate 指定は 4 ルートのみで
// 残り 60 ルートは force-dynamic のため、初回移行では影響が小さい。
// 必要になったら doQueue + d1NextTagCache を追加する。
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
