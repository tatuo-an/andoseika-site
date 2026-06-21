import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// 料理投稿シート: A=投稿ID, B=メール, C=表示名, D=商品名, E=投稿画像URL, F=本文, G=投稿日時, H=いいねメールリスト, I=保存メールリスト

function getSheets() {
  const a = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: a });
}

const ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET = "料理投稿";
const POINTS_SHEET = "ポイント履歴";
const POST_POINTS = 100;
const POST_POINTS_INTERVAL_DAYS = 7;

function rowToPost(r: string[], myEmail: string) {
  const likeEmails = r[7] ? r[7].split(",").filter(Boolean) : [];
  const bookmarkEmails = r[8] ? r[8].split(",").filter(Boolean) : [];
  return {
    id: r[0] ?? "",
    email: r[1] ?? "",
    displayName: r[2] ?? "",
    productName: r[3] ?? "",
    imageUrl: r[4] ?? "",
    caption: r[5] ?? "",
    createdAt: r[6] ?? "",
    likeCount: likeEmails.length,
    liked: likeEmails.includes(myEmail),
    saved: bookmarkEmails.includes(myEmail),
    isOwner: r[1] === myEmail,
  };
}

// 投稿一覧取得
export async function GET() {
  const session = await auth();
  const myEmail = session?.user?.email ?? "";

  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: ID, range: `${SHEET}!A:I` });
  const rows = (res.data.values ?? []).filter((r) => r[0]);
  const posts = rows.map((r) => rowToPost(r, myEmail)).reverse();
  return NextResponse.json({ posts });
}

// 新規投稿
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 購入者チェック
  const sheets = getSheets();
  const ordersRes = await sheets.spreadsheets.values.get({ spreadsheetId: ID, range: "注文管理!A:I" });
  const hasPurchase = (ordersRes.data.values ?? []).some(
    (r) => r[3] === session.user!.email && r[8] !== "cancelled"
  );
  if (!hasPurchase) return NextResponse.json({ error: "購入者のみ投稿できます" }, { status: 403 });

  const { productName, imageUrl, caption, displayName } = await req.json() as {
    productName: string; imageUrl: string; caption?: string; displayName?: string;
  };
  if (!imageUrl || !productName) return NextResponse.json({ error: "画像と商品名は必須です" }, { status: 400 });

  const postId = `post_${Date.now()}`;
  const createdAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const name = displayName || session.user.name || "";

  await sheets.spreadsheets.values.append({
    spreadsheetId: ID,
    range: `${SHEET}!A:H`,
    valueInputOption: "RAW",
    requestBody: { values: [[postId, session.user.email, name, productName, imageUrl, caption ?? "", createdAt, ""]] },
  });

  // 投稿ポイント付与（7日に1回）
  let pointsEarned = 0;
  try {
    const pointsRes = await sheets.spreadsheets.values.get({ spreadsheetId: ID, range: `${POINTS_SHEET}!A:E` });
    const pointsRows = pointsRes.data.values ?? [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - POST_POINTS_INTERVAL_DAYS);
    const alreadyRecent = pointsRows.some((r) => {
      if (r[0] !== session.user!.email || r[2] !== "post") return false;
      const rowDate = new Date(r[1] ?? "");
      return rowDate >= sevenDaysAgo;
    });
    if (!alreadyRecent) {
      const nowJST = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }) + " " +
        new Date().toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" });
      await sheets.spreadsheets.values.append({
        spreadsheetId: ID,
        range: `${POINTS_SHEET}!A:E`,
        valueInputOption: "RAW",
        requestBody: { values: [[session.user.email, nowJST, "post", POST_POINTS, "料理投稿ボーナス"]] },
      });
      pointsEarned = POST_POINTS;
    }
  } catch { /* ポイント付与失敗は投稿自体には影響させない */ }

  return NextResponse.json({ ok: true, postId, pointsEarned });
}
