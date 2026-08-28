/**
 * Cloudflare Workers 上で Google API を呼ぶための fetch 実装。
 *
 * googleapis-common は「ブラウザでなければ」必ず `Accept-Encoding: gzip` を付ける
 * （node_modules/googleapis-common/build/src/apirequest.js）。
 * ところが Cloudflare Workers は「呼び出し側が Accept-Encoding を明示した場合は
 * 自動展開せずそのまま通す」仕様のため、レスポンスが gzip のまま返り、
 * ライブラリがそれをテキストとして解釈して壊れる（実際に 1f 8b 08 ... が
 * エラーメッセージとして観測された）。
 *
 * このヘッダを落として Workers 側の自動展開に任せることで解消する。
 * gaxios は Workers 上では node-fetch を選ぶため globalThis.fetch の差し替えでは
 * 効かず、クライアント生成時に fetchImplementation として渡す必要がある。
 */
export const googleFetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  headers.delete("accept-encoding");
  return fetch(input, { ...init, headers });
}) as typeof fetch;
