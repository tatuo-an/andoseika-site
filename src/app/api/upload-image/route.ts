import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Unauthorized (管理者権限が必要です)" }, { status: 403 });
    }

    const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
    const apiKey = process.env.MICROCMS_WRITE_API_KEY;
    if (!serviceDomain || !apiKey) {
        return NextResponse.json({ error: "MICROCMS_SERVICE_DOMAIN または MICROCMS_WRITE_API_KEY が未設定です" }, { status: 500 });
    }

    let file: File | null = null;
    try {
        const formData = await req.formData();
        file = formData.get("file") as File | null;
    } catch (e) {
        console.error("[upload-image] formData parse error:", e);
        return NextResponse.json({ error: `リクエスト解析エラー: ${e}` }, { status: 400 });
    }

    if (!file) return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 400 });

    // Blob に変換して MIME タイプとファイル名を明示的に保持
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type || "image/jpeg" });
    const uploadForm = new FormData();
    uploadForm.append("file", blob, file.name || "image.jpg");

    let res: Response;
    try {
        res = await fetch(`https://${serviceDomain}.microcms-management.io/api/v1/media`, {
            method: "POST",
            headers: { "X-MICROCMS-API-KEY": apiKey },
            body: uploadForm,
        });
    } catch (e) {
        console.error("[upload-image] fetch error:", e);
        return NextResponse.json({ error: `MicroCMS への接続に失敗: ${e}` }, { status: 500 });
    }

    const responseText = await res.text();
    console.log("[upload-image] MicroCMS response:", res.status, responseText);

    if (!res.ok) {
        return NextResponse.json(
            { error: `MicroCMS エラー (${res.status}): ${responseText}` },
            { status: 500 }
        );
    }

    try {
        const data = JSON.parse(responseText);
        return NextResponse.json({ url: data.url });
    } catch {
        return NextResponse.json({ error: `レスポンス解析エラー: ${responseText}` }, { status: 500 });
    }
}
