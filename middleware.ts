import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "./src/auth.config";

const { auth } = NextAuth(authConfig);

/**
 * 正規ドメイン。ando-seika.vercel.app でのアクセスをここへ寄せる。
 *
 * 旧ドメインのまま注文されると、決済の成功/キャンセルURLや特定商取引法の
 * 表示リンク（Stripe metadata の legalDisclosureUrl）が旧ドメインで生成され、
 * お客様に届いた注文メールの中に残ってしまう。
 * Vercel を停止した時点でそれらのリンクが一斉に切れるため、
 * 注文が発生する前段でドメインを正規化しておく。
 */
const CANONICAL_HOST = "ando-seika.com";

/**
 * リダイレクト対象のホストか。
 * ブランチごとのプレビューURL（*-git-*.vercel.app 等）は検証に使うため
 * 対象にせず、本番エイリアスだけを正規ドメインへ寄せる。
 */
function shouldRedirect(host: string): boolean {
  if (!host) return false;
  const h = host.split(":")[0];
  return h === "ando-seika.vercel.app";
}

export default auth((req: NextRequest) => {
  const host = req.headers.get("host") ?? "";

  if (shouldRedirect(host)) {
    const url = new URL(req.url);
    url.host = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
});

export const config = {
  // 旧ドメインの正規化は全パスで効かせたいので matcher を広げる。
  // 認証が必要なパス（/mypage, /admin）の保護は auth() のラップで従来どおり働く。
  // 静的アセット・画像最適化・Stripe/LINE の Webhook は対象外にする
  // （Webhook は署名検証があり、リダイレクトすると届かなくなるため）。
  matcher: [
    "/((?!_next/static|_next/image|favicon\.ico|api/webhook|api/line-webhook|api/line-order-webhook).*)",
  ],
};
