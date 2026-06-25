import NextAuth from "next-auth";
import { google as googleApi } from "googleapis";
import { authConfig } from "./auth.config";

/**
 * LINE 初回ログイン時に sub（messaging API 用 userId として利用）を
 * 顧客マスタ H 列に保存する。googleapis を使うため Edge runtime には乗らない。
 */
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
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: `${SHEET}!A:H`,
        valueInputOption: "RAW",
        requestBody: { values: [[email, "__profile__", "", "", "", "", "", lineUserId]] },
      });
    } else {
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
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      // LINE ログイン時に sub を顧客マスタに保存
      if (account?.provider === "line" && profile?.sub) {
        const email = profile.email ?? `${profile.sub}@line.user`;
        await storeLineUserId(email, profile.sub);
      }
      return true;
    },
  },
});
