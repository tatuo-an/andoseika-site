import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get("id");

    if (!fileId) {
        return new NextResponse("Missing id parameter", { status: 400 });
    }

    try {
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
            fields: "mimeType, name",
        });

        const mimeType = metadataResponse.data.mimeType || "image/jpeg";

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
                "Cache-Control":
                    "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200",
            },
        });
    } catch (error: unknown) {
        console.error("Error proxying drive image:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        return new NextResponse(`Error proxying image: ${errorMessage}`, {
            status: 500,
        });
    }
}
