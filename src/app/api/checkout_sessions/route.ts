import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";
import { workersGoogleAuth } from "@/lib/googleAuth";
import { googleFetch } from "@/lib/googleFetch";
import { auth } from "@/auth";
import { TIERS, getTier } from "@/lib/tiers";
import { computeCartPricing, type InvItem, type ShippingRow } from "@/lib/pricing";
import { getActiveSeasonalSale } from "@/lib/seasonalSales";
import { getInventoryRows } from "@/lib/inventorySheet";
import { withRetry } from "@/lib/sheetsRetry";

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        // apiVersion: "2024-11-20.acacia", // Let library use default
        httpClient: Stripe.createFetchHttpClient(),
    })
    : null;

type CartItem = {
    name: string;
    image: string;
    price: number;
    quantity: number;
};

function getBaseUrl(req: NextRequest) {
    return (
        req.headers.get("origin") ||
        process.env.NEXT_PUBLIC_URL ||
        new URL(req.url).origin
    );
}

function getSheets() {
    const authClient = workersGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"]);
    return sheetsApi({ version: "v4", auth: authClient, fetchImplementation: googleFetch });
}

async function fetchInventory(): Promise<InvItem[]> {
    const rows = await getInventoryRows();
    return rows.slice(1)
        .filter(r => r[0])
        .map((r) => ({
            id: r[0] ?? "",
            name: r[1] ?? "",
            price: r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : null,
            shipType: r[4] ?? "",
            family: r[9] ?? "",
            cost: r[12] !== undefined && r[12] !== "" ? parseInt(r[12], 10) : null,
            profitRate: r[13] !== undefined && r[13] !== "" ? parseFloat(r[13]) : null,
            coolAvailable: r[14] === "1",
            clickpostMax: r[16] !== undefined && r[16] !== "" ? parseInt(r[16], 10) : 0,
            options: r[17] ?? "",
            salePercent: r[18] !== undefined && r[18] !== "" ? parseInt(r[18], 10) : 0,
            saleStart: r[19] ?? "",
            saleEnd: r[20] ?? "",
            compactMax: r[23] !== undefined && r[23] !== "" ? parseInt(r[23], 10) : 0,
        }));
}

async function fetchSeasonalDiscountPercent(): Promise<number> {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: "季節セール!A:E",
        });
        const rows = (res.data.values ?? []).slice(1).filter((r) => r[0]);
        const sales = rows.map((r) => ({
            name: r[0] ?? "",
            startDate: r[1] ?? "",
            endDate: r[2] ?? "",
            discountPercent: parseInt(r[3] ?? "0", 10) || 0,
            enabled: r[4] === "TRUE",
        }));
        return getActiveSeasonalSale(sales)?.discountPercent ?? 0;
    } catch {
        return 0;
    }
}

async function fetchShippingRows(): Promise<ShippingRow[]> {
    const sheets = getSheets();
    const res = await withRetry(() => sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: "送料マスタ!A:L",
    }));
    const rows = res.data.values ?? [];
    const toInt = (v: string | undefined) => (v === undefined || v === "" ? 0 : parseInt(v, 10) || 0);
    return rows.slice(1).map((r) => ({
        region: r[0] ?? "", prefectures: r[1] ?? "",
        s60: toInt(r[2]), s80: toInt(r[3]), s100: toInt(r[4]), s120: toInt(r[5]),
        s140: toInt(r[6]), s160: toInt(r[7]), s180: toInt(r[8]), s200: toInt(r[9]),
        compact: toInt(r[10]), clickpost: toInt(r[11]),
    }));
}

async function fetchTierDiscountRate(email: string): Promise<number> {
    if (!email) return 0;
    const sheets = getSheets();
    const res = await withRetry(() => sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: "顧客マスタ!A:F",
    }));
    const rows = res.data.values ?? [];
    const row = rows.find((r) => r[0] === email && r[1] === "__profile__");
    const tier = row?.[4] ?? "";
    const tierExpiry = row?.[5] ?? "";
    const now = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
    const activeTier = tier && tierExpiry && tierExpiry >= now ? getTier(tier) : "free";
    return TIERS[activeTier].discountRate;
}

async function fetchPointsBalance(email: string): Promise<number> {
    if (!email) return 0;
    const sheets = getSheets();
    const res = await withRetry(() => sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: "ポイント履歴!A:E",
    }));
    const rows = (res.data.values ?? []).filter((r) => r[0] === email);
    return rows.reduce((sum, r) => sum + (parseInt(r[3] ?? "0", 10) || 0), 0);
}

export async function POST(req: NextRequest) {
    try {
        if (!stripe) {
            throw new Error("Stripe is not configured");
        }

        const body = await req.json();
        const { cartDetails, shippingAddress, desiredDeliveryDate, desiredDeliveryTime, shipMode, shipValue, pointsUsed, coolRequested, optionLabels } = body as {
            pointsUsed?: number;
            coolRequested?: boolean;
            optionLabels?: string[]; // 選択されたオプションのキー "family:label"（金額は信頼しない。選択有無のみ使用）
            cartDetails?: Record<string, CartItem & { cost?: number | null }>;
            shipMode?: string;
            shipValue?: string;
            shippingAddress?: {
                label: string; name: string; postalCode: string; prefecture: string;
                city: string; street: string; building: string; phone: string;
            };
            desiredDeliveryDate?: string;
            desiredDeliveryTime?: string;
        };

        if (!cartDetails || Object.keys(cartDetails).length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // 通知先（LINE/メール）特定のため、ログイン中のメールを取得
        const nextAuthSession = await auth();
        const userEmail = nextAuthSession?.user?.email ?? "";
        console.log("[checkout] shipMode:", shipMode, "shipValue:", shipValue);

        // 金額に関わる値（単価・原価・セール率・オプション金額・tier割引率・保有ポイント）は
        // クライアント入力を一切信頼せず、必ずサーバー側で商品在庫・送料マスタ・顧客マスタ・
        // ポイント履歴から取得し直して再計算する（価格改ざん対策）。
        const [inventory, shippingRows, tierDiscountRate, pointsBalance, seasonalDiscountPercent] = await Promise.all([
            fetchInventory(),
            fetchShippingRows(),
            fetchTierDiscountRate(userEmail),
            fetchPointsBalance(userEmail),
            fetchSeasonalDiscountPercent(),
        ]);

        const cartLines = Object.entries(cartDetails).map(([id, item]) => ({
            id,
            quantity: Math.max(1, Math.floor(item.quantity)),
        }));
        const unknownItem = cartLines.find((line) => !inventory.some((v) => v.id === line.id && v.price !== null));
        if (unknownItem) {
            return NextResponse.json({ error: "商品情報が見つかりませんでした。カートを更新して再度お試しください。" }, { status: 400 });
        }

        const pricing = computeCartPricing({
            cartLines,
            inventory,
            shippingRows,
            prefecture: shippingAddress?.prefecture ?? null,
            selectedOptionKeys: new Set(optionLabels ?? []),
            coolRequested: !!coolRequested,
            tierDiscountRate,
            pointsBalance,
            pointsToUse: pointsUsed ?? 0,
            seasonalDiscountPercent,
        });

        // Stripe Customer を検索または作成（銀行振り込み payment_method に必須）
        let stripeCustomerId: string | undefined;
        if (userEmail) {
            const existing = await stripe.customers.list({ email: userEmail, limit: 1 });
            if (existing.data.length > 0) {
                stripeCustomerId = existing.data[0].id;
            } else {
                const customer = await stripe.customers.create({
                    email: userEmail,
                    metadata: { source: "ando-seika-store" },
                });
                stripeCustomerId = customer.id;
            }
        }

        const baseUrl = getBaseUrl(req);
        const legalDisclosureUrl = new URL("/tokusho", baseUrl).toString();
        const cartArr = Object.values(cartDetails);
        const toAbsoluteUrl = (img: string) => img.startsWith("http") ? img : new URL(img, baseUrl).toString();

        type LI = { price_data: { currency: string; product_data: { name: string; images: string[] }; unit_amount: number }; quantity: number };
        const line_items: LI[] = [];

        // 商品本体価格（税込・サーバー再計算値）
        const firstImg = cartArr[0]?.image;
        // 商品名はカート内容そのまま反映する
        // 数量×N も明示し、複数商品はすべて連結（Stripe name 上限250字を考慮して切詰め）
        const composedName = (() => {
            if (cartArr.length === 0) return "商品";
            if (cartArr.length === 1) {
                const it = cartArr[0];
                return it.quantity > 1 ? `${it.name} ×${it.quantity}` : it.name;
            }
            const joined = cartArr
                .map((item) => item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name)
                .join(" / ");
            return joined.length <= 240 ? joined : `${joined.slice(0, 235)}…`;
        })();
        line_items.push({
            price_data: {
                currency: "jpy",
                product_data: { name: composedName, images: firstImg ? [toAbsoluteUrl(firstImg)] : [] },
                unit_amount: pricing.itemsBodyShown,
            },
            quantity: 1,
        });
        if (pricing.shipFeeShown > 0) {
            line_items.push({
                price_data: { currency: "jpy", product_data: { name: `送料${pricing.shipSizeLabel ? `（${pricing.shipSizeLabel}）` : ""}`, images: [] }, unit_amount: pricing.shipFeeShown },
                quantity: 1,
            });
        }
        if (pricing.profitShown > 0) {
            line_items.push({
                price_data: { currency: "jpy", product_data: { name: "サービス料", images: [] }, unit_amount: pricing.profitShown },
                quantity: 1,
            });
        }
        if (pricing.surchargeTaxed > 0) {
            line_items.push({
                price_data: {
                    currency: "jpy",
                    product_data: { name: pricing.surchargeLabel ?? "追加送料", images: [] },
                    unit_amount: pricing.surchargeTaxed,
                },
                quantity: 1,
            });
        }
        if (pricing.coolFeeTaxed > 0) {
            line_items.push({
                price_data: {
                    currency: "jpy",
                    product_data: { name: "クール便", images: [] },
                    unit_amount: pricing.coolFeeTaxed,
                },
                quantity: 1,
            });
        }
        // セール割引は商品本体行の単価から差し引く（名前には付与しない）
        if (pricing.saleDiscountTaxed > 0 && line_items[0]) {
            const discount = Math.min(pricing.saleDiscountTaxed, line_items[0].price_data.unit_amount);
            line_items[0].price_data.unit_amount -= discount;
        }
        // オプション調整：価格と表示を分離して処理
        // - 価格：optionsAdjustmentTaxed が正→追加料金行、負→商品本体行から控除
        // - 表示：displayOptionLabels（割引以外のラベル）のみを商品本体行の名前に付与
        if (pricing.optionsAdjustmentTaxed > 0) {
            line_items.push({
                price_data: {
                    currency: "jpy",
                    product_data: { name: `オプション（${pricing.displayOptionLabels.join(", ")}）`, images: [] },
                    unit_amount: pricing.optionsAdjustmentTaxed,
                },
                quantity: 1,
            });
        } else if (pricing.optionsAdjustmentTaxed < 0) {
            const discount = Math.abs(pricing.optionsAdjustmentTaxed);
            if (line_items[0] && line_items[0].price_data.unit_amount >= discount) {
                line_items[0].price_data.unit_amount -= discount;
            }
        }
        // 商品名に追加するラベルは割引系を除いたもののみ
        if (pricing.displayOptionLabels.length > 0 && line_items[0]) {
            line_items[0].price_data.product_data.name += `（${pricing.displayOptionLabels.join("・")}）`;
        }

        // サポーター割引（商品本体行 = 最初の行から差し引く）
        if (pricing.tierDiscountAmount > 0 && line_items[0]) {
            const deduct = Math.min(pricing.tierDiscountAmount, Math.max(0, line_items[0].price_data.unit_amount - 1));
            line_items[0].price_data.unit_amount -= deduct;
        }

        // ポイント割引（通常商品本体・送料・サービス料に利用可。先頭行から順に控除。
        // 実際の保有ポイント・利用上限はサーバー側で再検証済み）
        if (pricing.effectivePointsToUse > 0) {
            let remaining = pricing.effectivePointsToUse;
            for (const li of line_items) {
                if (remaining <= 0) break;
                const deduct = Math.min(remaining, li.price_data.unit_amount);
                li.price_data.unit_amount -= deduct;
                remaining -= deduct;
            }
        }

        // Stripe は unit_amount ≥ 1 が必須。割引の合算で0以下になった場合は最低1円に補正。
        if (line_items[0] && line_items[0].price_data.unit_amount < 1) {
            line_items[0].price_data.unit_amount = 1;
        }

        // 配送先住所が事前指定されている場合は Stripe 側で再入力させない
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ["card"] as Stripe.Checkout.SessionCreateParams["payment_method_types"],
            ...(stripeCustomerId
                ? { customer: stripeCustomerId }
                : userEmail
                    ? { customer_email: userEmail }
                    : {}),
            line_items,
            mode: "payment",
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/cancel`,
            custom_text: {
                submit: {
                    message:
                        "ご注文前に、特定商取引法に基づく表示・返品交換条件をご確認ください。",
                },
            },
            metadata: {
                legalDisclosureUrl,
                source: "ando-seika-store",
                shippingLabel: shippingAddress?.label ?? "",
                shipMode: shipMode ?? "",
                shipValue: shipValue ?? "",
            },
            payment_intent_data: {
                metadata: {
                    legalDisclosureUrl,
                    source: "ando-seika-store",
                    shippingLabel: shippingAddress?.label ?? "",
                    shippingName: shippingAddress?.name ?? "",
                    shippingPostal: shippingAddress?.postalCode ?? "",
                    shippingAddress: shippingAddress
                        ? `${shippingAddress.prefecture}${shippingAddress.city}${shippingAddress.street}${shippingAddress.building ? " " + shippingAddress.building : ""}`
                        : "",
                    shippingPhone: shippingAddress?.phone ?? "",
                    desiredDeliveryDate: desiredDeliveryDate ?? "",
                    desiredDeliveryTime: desiredDeliveryTime ?? "",
                    shipMode: shipMode ?? "",
                    shipValue: shipValue ?? "",
                    pointsUsed: pricing.effectivePointsToUse.toString(),
                    userEmail,
                    // 注文管理シートでの商品特定用：カート内全商品IDと数量、マッチした単一バリエーションID
                    cartItems: Object.entries(cartDetails)
                        .map(([id, item]) => `${id}:${item.quantity}`)
                        .join(",")
                        .slice(0, 490), // Stripe metadata 値は 500 文字制限
                    matchedVariantId: pricing.matchedVariantId ?? "",
                },
            },
        };

        if (shippingAddress) {
            // Stripe Checkout に配送先を事前入力
            sessionParams.payment_intent_data!.shipping = {
                name: shippingAddress.name,
                phone: shippingAddress.phone || undefined,
                address: {
                    country: "JP",
                    postal_code: shippingAddress.postalCode,
                    state: shippingAddress.prefecture,
                    city: shippingAddress.city,
                    line1: shippingAddress.street,
                    line2: shippingAddress.building || undefined,
                },
            };
        } else {
            // フォールバック: Stripeで入力させる
            sessionParams.shipping_address_collection = { allowed_countries: ["JP"] };
            sessionParams.phone_number_collection = { enabled: true };
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: unknown) {
        console.error(err);
        const message = err instanceof Error ? err.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
