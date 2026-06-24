import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// 顧客マスタ J列 = preferredDeliverySeason ("spring" | "autumn")

const ALLOWED = ["spring", "autumn"] as const;
type Season = (typeof ALLOWED)[number];

function isSeason(v: unknown): v is Season {
  return typeof v === "string" && (ALLOWED as readonly string[]).includes(v);
}

function getSheets() {
  const authClient = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: authClient });
}

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: "顧客マスタ!A:J",
    });
    const rows = res.data.values ?? [];
    const row = rows.find((r) => r[0] === email && r[1] === "__profile__");
    const season = row?.[9] ?? "";
    return NextResponse.json({ season });
  } catch {
    return NextResponse.json({ season: "" });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { season?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!isSeason(body.season)) {
    return NextResponse.json({ error: "Invalid season" }, { status: 400 });
  }

  try {
    const sheets = getSheets();
    const id = process.env.GOOGLE_SPREADSHEET_ID!;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: "顧客マスタ!A:J",
    });
    const rows = res.data.values ?? [];
    const rowIndex = rows.findIndex((r) => r[0] === email && r[1] === "__profile__");
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId: id,
      range: `顧客マスタ!J${rowIndex + 1}:J${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [[body.season]] },
    });
    return NextResponse.json({ success: true, season: body.season });
  } catch (err) {
    console.error("[delivery-season POST]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
