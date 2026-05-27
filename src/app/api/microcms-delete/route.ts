import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { client } from "@/lib/microcms";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await req.json() as { id: string };
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // custom- で始まるIDはMicroCMSに存在しないのでスキップ
    if (id.startsWith("custom-")) {
        return NextResponse.json({ success: true, skipped: true });
    }

    try {
        await client.delete({ endpoint: "products", contentId: id });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        // 404 (already deleted) は成功扱い
        if (err?.response?.status === 404 || err?.status === 404) {
            return NextResponse.json({ success: true, skipped: true });
        }
        console.error("[microcms-delete]", err);
        return NextResponse.json({ error: "Failed to delete from MicroCMS" }, { status: 500 });
    }
}
