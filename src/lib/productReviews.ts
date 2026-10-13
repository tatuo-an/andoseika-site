import { google } from "googleapis";

export const REVIEW_SHEET = "商品レビュー";
export const REVIEW_REWARD_POINTS = 100;

export function isSameReviewAuthorAndProduct(review: Pick<ProductReview, "email" | "productId">, email: string, productId: string) {
  return review.email.trim().toLowerCase() === email.trim().toLowerCase() && review.productId === productId;
}

export type ProductReview = {
  id: string;
  createdAt: string;
  productId: string;
  orderNumber: string;
  email: string;
  displayName: string;
  rating: number;
  body: string;
  status: string;
  moderatedAt: string;
  moderator: string;
  rowNumber: number;
};

export function reviewSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export function reviewSpreadsheetId() {
  const id = process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) throw new Error("GOOGLE_SPREADSHEET_ID is not configured");
  return id;
}

export async function readReviews(): Promise<ProductReview[]> {
  const response = await reviewSheets().spreadsheets.values.get({
    spreadsheetId: reviewSpreadsheetId(),
    range: `'${REVIEW_SHEET}'!A2:K`,
  });
  return (response.data.values ?? []).map((row, index) => ({
    id: String(row[0] ?? ""),
    createdAt: String(row[1] ?? ""),
    productId: String(row[2] ?? ""),
    orderNumber: String(row[3] ?? ""),
    email: String(row[4] ?? ""),
    displayName: String(row[5] ?? ""),
    rating: Number(row[6] ?? 0),
    body: String(row[7] ?? ""),
    status: String(row[8] ?? ""),
    moderatedAt: String(row[9] ?? ""),
    moderator: String(row[10] ?? ""),
    rowNumber: index + 2,
  })).filter(review => review.id);
}
