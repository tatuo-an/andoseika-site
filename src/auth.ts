import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Line from "next-auth/providers/line";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Line({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      authorization: { params: { scope: "profile openid" } },
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
      // LINEはメール未取得の場合、LINE user IDをemailの代わりに使う
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
});
