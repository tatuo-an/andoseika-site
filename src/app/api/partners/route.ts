import { NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

export type Partner = {
  name: string;
  genre: string;
  address: string;
  catchphrase: string;
  description: string;
  websiteUrl: string;
  driveId: string;
};

export async function GET() {
  try {
    const authClient = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth: authClient });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: "取引先!A2:H100",
    });

    const rows = res.data.values ?? [];
    const partners: Partner[] = rows
      .filter((r) => r[7] === "TRUE" && r[0])
      .map((r) => ({
        name: r[0] ?? "",
        genre: r[1] ?? "",
        address: r[2] ?? "",
        catchphrase: r[3] ?? "",
        description: r[4] ?? "",
        websiteUrl: r[5] ?? "",
        driveId: r[6] ?? "",
      }));

    return NextResponse.json({ partners });
  } catch (err) {
    console.error("[partners]", err);
    return NextResponse.json({ partners: [] });
  }
}
