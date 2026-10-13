import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const STATIC_PUBLIC_IMAGE_IDS = new Set([
    "1pl3qualswHo6y_j7x2gAwpRZYB6dAzgI",
    "1amXdXYmMageHtbznP5QTBxvKvoX-0Egc",
    "1150u3CyLASstZ_qS95Y-Yli-L1sDioKr",
    "12uK6xxFXHD0XWcLOCh-CKErXWmslUzaU",
    "1TFLTLoZLA0pwC2vU76CM3qbhVBhllclv",
]);

async function isPublishedImageId(fileId: string): Promise<boolean> {
    if (STATIC_PUBLIC_IMAGE_IDS.has(fileId)) return true;

    const sheetsAuth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth: sheetsAuth });
    const partners = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: "取引先!G2:H100",
    });
    return (partners.data.values ?? []).some((row) => row[0] === fileId && row[1] === "TRUE");
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get("id");

    if (!fileId || !/^[A-Za-z0-9_-]{10,100}$/.test(fileId)) {
        return new NextResponse("Invalid id parameter", { status: 400 });
    }

    try {
        if (!(await isPublishedImageId(fileId))) {
            return new NextResponse("Not found", { status: 404 });
        }
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/drive.readonly"],
        });

        const drive = google.drive({ version: "v3", auth });

        const metadataResponse = await drive.files.get({
            fileId: fileId,
            fields: "mimeType, size",
        });

        const mimeType = metadataResponse.data.mimeType ?? "";
        const size = Number(metadataResponse.data.size);
        if (!/^image\/(jpeg|png|webp|gif)$/.test(mimeType) || !Number.isSafeInteger(size) || size <= 0 || size > 10 * 1024 * 1024) {
            return new NextResponse("Not found", { status: 404 });
        }

        const response = await drive.files.get(
            { fileId: fileId, alt: "media" },
            { responseType: "stream" }
        );

        const stream = new ReadableStream({
            start(controller) {
                response.data.on("data", (chunk: Buffer) => controller.enqueue(chunk));
                response.data.on("end", () => controller.close());
                response.data.on("error", (err: Error) => controller.error(err));
            },
        });

        return new NextResponse(stream, {
            headers: {
                "Content-Type": mimeType,
                "X-Content-Type-Options": "nosniff",
                "Cache-Control":
                    "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200",
            },
        });
    } catch (error: unknown) {
        console.error("Error proxying drive image:", error);
        return new NextResponse("Image unavailable", { status: 502 });
    }
}
