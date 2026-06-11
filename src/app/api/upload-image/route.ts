import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
    const apiKey = process.env.MICROCMS_WRITE_API_KEY;
    if (!serviceDomain || !apiKey) {
        return NextResponse.json({ error: "MicroCMS not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const uploadForm = new FormData();
    uploadForm.append("file", file);

    const res = await fetch(`https://${serviceDomain}.microcms.io/api/v1/media`, {
        method: "POST",
        headers: { "X-MICROCMS-API-KEY": apiKey },
        body: uploadForm,
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("[upload-image] MicroCMS error:", err);
        return NextResponse.json({ error: `MicroCMS: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ url: data.url });
}
