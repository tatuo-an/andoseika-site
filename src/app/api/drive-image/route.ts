import { NextRequest, NextResponse } from "next/server";
import { drive as driveApi, auth as googleAuth } from "@googleapis/drive";

import { workersGoogleAuth } from "@/lib/googleAuth";
import { googleFetch } from "@/lib/googleFetch";
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get("id");

    if (!fileId) {
        return new NextResponse("Missing id parameter", { status: 400 });
    }

    try {
        const auth = workersGoogleAuth(["https://www.googleapis.com/auth/drive.readonly"]);

        const drive = driveApi({ version: "v3", auth, fetchImplementation: googleFetch });

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
