import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Line from "next-auth/providers/line";

/**
 * Edge runtime（middleware）でも読み込まれる軽量な設定。
 * googleapis などの Node 専用モジュールに依存する処理（signIn callback の
 * 顧客マスタ書き込み等）は src/auth.ts 側で追加する。
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Line({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email ?? `${profile.sub}@line.user`,
          image: profile.picture,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnMyPage = nextUrl.pathname.startsWith("/mypage");
      if (isOnMyPage) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "line" && !token.email && profile?.sub) {
        token.email = `${profile.sub}@line.user`;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.email) session.user.email = token.email as string;
      return session;
    },
  },
};
