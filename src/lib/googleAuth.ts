import { OAuth2Client } from "google-auth-library";

/**
 * Cloudflare Workers 用の Google サービスアカウント認証。
 *
 * google-auth-library の `GoogleAuth` / `JWT` は JWT の署名に Node の
 * `crypto.createSign('RSA-SHA256')` を使う。ブラウザ判定が
 *
 *   typeof window !== 'undefined' && window.crypto.subtle
 *
 * （node_modules/google-auth-library/build/src/crypto/crypto.js）なので、
 * Workers では `window` が無いため Node 版が選ばれ、署名が正しく作られず
 * 「Request had invalid authentication credentials」で全API呼び出しが失敗する。
 *
 * かといって `globalThis.window` を定義すると Next.js の SSR が
 * 「ブラウザで実行中」と誤認して広範囲に壊れるため、それは採らない。
 *
 * ここではトークンの取得だけを WebCrypto で自前実装し、取得したアクセストークンを
 * `OAuth2Client` に載せて渡す。実際のHTTP通信はライブラリ側の経路のままなので、
 * レスポンスやエラーの形は従来と変わらない。
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";

type Cached = { token: string; expiresAt: number };
const tokenCache = new Map<string, Cached>();

function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlJson(obj: unknown): string {
  return base64url(new TextEncoder().encode(JSON.stringify(obj)));
}

/** PEM(PKCS#8) を ArrayBuffer に変換する。 */
function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function fetchAccessToken(scopes: string[]): Promise<Cached> {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  // Vercel 由来の値は改行が \n のリテラルで入っていることがあるため両対応にする
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) {
    throw new Error("GOOGLE_DRIVE_CLIENT_EMAIL / GOOGLE_DRIVE_PRIVATE_KEY が未設定です");
  }

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: scopes.join(" "),
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${base64urlJson({ alg: "RS256", typ: "JWT" })}.${base64urlJson(claim)}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );
  const assertion = `${signingInput}.${base64url(new Uint8Array(sig))}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Google トークン取得に失敗 (${res.status}): ${detail.slice(0, 300)}`);
  }

  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) throw new Error("Google トークン応答に access_token がありません");

  return {
    token: json.access_token,
    // 60秒の余裕をみて期限切れ扱いにする
    expiresAt: Date.now() + ((json.expires_in ?? 3600) - 60) * 1000,
  };
}

/**
 * googleapis のクライアントに渡せる認証オブジェクトを返す。
 * 同期的に生成できるので、既存の `new googleAuth.GoogleAuth({...})` を
 * そのまま置き換えられる（呼び出し側を async にする必要がない）。
 */
/** googleapis の型はクラスの実体を要求するため、構造的に等価なこのオブジェクトを同型として扱う。 */
type GoogleAuthClient = OAuth2Client;

export function workersGoogleAuth(scopes: string[]): GoogleAuthClient {
  const cacheKey = scopes.join(" ");

  async function client() {
    const hit = tokenCache.get(cacheKey);
    const fresh = hit && hit.expiresAt > Date.now() ? hit : await fetchAccessToken(scopes);
    tokenCache.set(cacheKey, fresh);

    const oauth = new OAuth2Client();
    oauth.setCredentials({ access_token: fresh.token, expiry_date: fresh.expiresAt });
    return oauth;
  }

  return {
    async getUniverseDomain() {
      return "googleapis.com";
    },
    async getRequestHeaders(url?: string) {
      return (await client()).getRequestHeaders(url);
    },
    async request(opts: Parameters<GoogleAuthClient["request"]>[0]) {
      return (await client()).request(opts);
    },
    // googleapis が実際に使うのは request / getRequestHeaders / getUniverseDomain のみ
  } as unknown as GoogleAuthClient;
}
