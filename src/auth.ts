import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Line from "next-auth/providers/line";
import { google as googleApi } from "googleapis";

async function storeLineUserId(email: string, lineUserId: string): Promise<void> {
  try {
    const auth = new googleApi.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = googleApi.sheets({ version: "v4", auth });
    const SHEET = "顧客マスタ";
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: `${SHEET}!A:H`,
    });
    const rows = res.data.values ?? [];
    const rowIndex = rows.findIndex((r) => r[0] === email && r[1] === "__profile__");

    if (rowIndex === -1) {
      // 新規プロフィール作成（H列にlineUserId）
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: `${SHEET}!A:H`,
        valueInputOption: "RAW",
        requestBody: { values: [[email, "__profile__", "", "", "", "", "", lineUserId]] },
      });
    } else {
      // 既存行のH列のみ更新（他列に影響なし）
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: `${SHEET}!H${rowIndex + 1}:H${rowIndex + 1}`,
        valueInputOption: "RAW",
        requestBody: { values: [[lineUserId]] },
      });
    }
  } catch (err) {
    console.error("[auth] storeLineUserId failed", err);
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
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
    async signIn({ account, profile, user }) {
      // LINE ログイン時に sub（messaging API 用の userId として利用）を顧客マスタに保存
      if (account?.provider === "line" && profile?.sub) {
        const email = profile.email ?? `${profile.sub}@line.user`;
        await storeLineUserId(email, profile.sub);
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
