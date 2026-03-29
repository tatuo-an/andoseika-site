"use server";

import { writeClient } from "@/lib/microcms-write";

export type ContactState = {
    success: boolean;
    message: string;
    errors?: {
        [key: string]: string[];
    };
};

export async function submitContact(prevState: ContactState, formData: FormData): Promise<ContactState> {
    console.log("submitContact started");
    console.log("MICROCMS_SERVICE_DOMAIN exists:", !!process.env.MICROCMS_SERVICE_DOMAIN);
    console.log("MICROCMS_WRITE_API_KEY exists:", !!process.env.MICROCMS_WRITE_API_KEY);
    console.log("writeClient exists:", !!writeClient);

    if (!writeClient) {
        console.error("MicroCMS Write Client is not configured.");
        return {
            success: false,
            message: "システムエラーが発生しました。管理者にお問い合わせください。(API Key Missing)",
        };
    }

    try {
        const rawData: any = {
            kind: formData.get("kind"),
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            message: formData.get("message"),
            status: ["unhandled"], // Default status
        };

        // Personal specific fields
        if (rawData.kind === "personal") {
            rawData.type = [formData.get("type")];
        }

        // Business specific fields
        if (rawData.kind === "business") {
            rawData.company_name = formData.get("companyName");
            rawData.department = formData.get("department");
            rawData.quantity = formData.get("quantity");
            rawData.start_date = formData.get("startDate");

            // Handle multiple checkboxes for products
            const products = formData.getAll("items");
            // Map Japanese product names to IDs defined in MicroCMS schema
            const productMap: { [key: string]: string } = {
                "白ネギ": "negi",
                "長芋・むかご": "nagaimo",
                "里芋": "satoimo",
                "梨": "nashi",
                "蜂蜜": "honey",
                "甘酢らっきょう": "rakkyo",
                "その他": "other"
            };
            rawData.products = products.map(p => productMap[p.toString()] || "other");
        }

        // Basic validation (can be improved with Zod)
        if (!rawData.name || !rawData.email || !rawData.message) {
            return {
                success: false,
                message: "必須項目が入力されていません。",
            };
        }

        await writeClient.create({
            endpoint: "contacts",
            content: rawData,
        });

        return {
            success: true,
            message: "お問い合わせを受け付けました。",
        };

    } catch (error) {
        console.error("Failed to submit contact form:", error);
        return {
            success: false,
            message: "送信に失敗しました。時間をおいて再度お試しください。",
        };
    }
}
