import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// 顧客マスタ: A=メール, B=__profile__, C=表示名, D=誕生日(MM/DD), E=tier, F=tierExpiry(YYYY-MM-DD)
const SHEET = "顧客マスタ";

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

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${SHEET}!A:F` });
  const rows = res.data.values ?? [];
  const row = rows.find((r) => r[0] === session.user!.email && r[1] === "__profile__");

  const tier = row?.[4] ?? "";
  const tierExpiry = row?.[5] ?? "";
  const now = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
  const activeTier = (tier && tierExpiry && tierExpiry >= now) ? tier : "free";

  return NextResponse.json({
    displayName: row?.[2] ?? "",
    birthday: row?.[3] ?? "",
    tier: activeTier,
    tierExpiry,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { displayName?: string; birthday?: string };
  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${SHEET}!A:F` });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === session.user!.email && r[1] === "__profile__");

  const existing = rowIndex !== -1 ? rows[rowIndex] : [];
  const newName = "displayName" in body ? (body.displayName ?? "").trim().slice(0, 50) : (existing[2] ?? "");
  const newBirthday = "birthday" in body ? (body.birthday ?? "").trim() : (existing[3] ?? "");
  const existingTier = existing[4] ?? "";
  const existingExpiry = existing[5] ?? "";

  if (rowIndex === -1) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: `${SHEET}!A:F`,
      valueInputOption: "RAW",
      requestBody: { values: [[session.user.email, "__profile__", newName, newBirthday, "", ""]] },
    });
  } else {
    await sheets.spreadsheets.values.update({
      spreadsheetId: id,
      range: `${SHEET}!A${rowIndex + 1}:F${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [[session.user.email, "__profile__", newName, newBirthday, existingTier, existingExpiry]] },
    });
  }

  return NextResponse.json({ ok: true, displayName: newName, birthday: newBirthday });
}
