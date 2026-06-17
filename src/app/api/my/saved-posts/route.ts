import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const SHEET = "料理投稿";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = session.user.email;
  const a = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth: a });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: `${SHEET}!A:I`,
  });

  const rows = (res.data.values ?? []).filter((r) => r[0]);
  const saved = rows
    .filter((r) => {
      const bookmarks = r[8] ? r[8].split(",").filter(Boolean) : [];
      return bookmarks.includes(email);
    })
    .map((r) => {
      const likeEmails = r[7] ? r[7].split(",").filter(Boolean) : [];
      return {
        id: r[0] ?? "",
        email: r[1] ?? "",
        displayName: r[2] ?? "",
        productName: r[3] ?? "",
        imageUrl: r[4] ?? "",
        caption: r[5] ?? "",
        createdAt: r[6] ?? "",
        likeCount: likeEmails.length,
        liked: likeEmails.includes(email),
        saved: true,
        isOwner: r[1] === email,
      };
    })
    .reverse();

  return NextResponse.json({ posts: saved });
}
