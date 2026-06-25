import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        // apiVersion: "2024-11-20.acacia", // Let library use default
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

export async function POST(req: NextRequest) {
    try {
        if (!stripe) {
            throw new Error("Stripe is not configured");
        }

        const body = await req.json();
        const { cartDetails, quote, shippingAddress, desiredDeliveryDate, desiredDeliveryTime, shipMode, shipValue, pointsUsed, tierDiscount } = body as {
            pointsUsed?: number;
            tierDiscount?: number;
            cartDetails?: Record<string, CartItem & { cost?: number | null }>;
            shipMode?: string;
            shipValue?: string;
            quote?: {
                matchedVariantId: string | null;
                matchedVariantName: string | null;
                itemsTotal: number;       // 商品本体価格（税込, 8%）
                baseShipFee: number;      // 送料（税込, 10%）
                profit: number;           // サービス料（税込, 10%）
                surcharge: number;        // 追加送料（税込, 10%）
                surchargeLabel: string | null;
                coolFee?: number;         // クール便（税込, 10%）
                shipSizeLabel?: string;
                optionsAdjustment?: number; // オプション調整（税込, 8%、負値=割引）
                optionLabels?: string[];    // 選択されたオプションのキー "family:label" 配列
                saleDiscount?: number;      // セール割引総額（税込, 8%）
            };
            shippingAddress?: {
                label: string; name: string; postalCode: string; prefecture: string;
                city: string; street: string; building: string; phone: string;
            };
            desiredDeliveryDate?: string;
            desiredDeliveryTime?: string;
        };

        if (!cartDetails) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // 通知先（LINE/メール）特定のため、ログイン中のメールを取得
        const nextAuthSession = await auth();
        const userEmail = nextAuthSession?.user?.email ?? "";
        console.log("[checkout] shipMode:", shipMode, "shipValue:", shipValue);

        const baseUrl = getBaseUrl(req);
        const legalDisclosureUrl = new URL("/tokusho", baseUrl).toString();
        const cartArr = Object.values(cartDetails);
        const toAbsoluteUrl = (img: string) => img.startsWith("http") ? img : new URL(img, baseUrl).toString();

        type LI = { price_data: { currency: string; product_data: { name: string; images: string[] }; unit_amount: number }; quantity: number };
        const line_items: LI[] = [];

        if (quote) {
            // 商品本体価格（税込）
            const firstImg = cartArr[0]?.image;
            const itemsName = quote.matchedVariantName
                ?? (cartArr.length === 1 ? cartArr[0].name : `商品本体（${cartArr.length}点）`);
            line_items.push({
                price_data: {
                    currency: "jpy",
                    product_data: { name: itemsName, images: firstImg ? [toAbsoluteUrl(firstImg)] : [] },
                    unit_amount: quote.itemsTotal,
                },
                quantity: 1,
            });
            if (quote.baseShipFee > 0) {
                line_items.push({
                    price_data: { currency: "jpy", product_data: { name: `送料${quote.shipSizeLabel ? `（${quote.shipSizeLabel}）` : ""}`, images: [] }, unit_amount: quote.baseShipFee },
                    quantity: 1,
                });
            }
            if (quote.profit > 0) {
                line_items.push({
                    price_data: { currency: "jpy", product_data: { name: "サービス料", images: [] }, unit_amount: quote.profit },
                    quantity: 1,
                });
            }
            if (quote.surcharge > 0) {
                line_items.push({
                    price_data: {
                        currency: "jpy",
                        product_data: { name: quote.surchargeLabel ?? "追加送料", images: [] },
                        unit_amount: quote.surcharge,
                    },
                    quantity: 1,
                });
            }
            if (quote.coolFee && quote.coolFee > 0) {
                line_items.push({
                    price_data: {
                        currency: "jpy",
                        product_data: { name: "クール便", images: [] },
                        unit_amount: quote.coolFee,
                    },
                    quantity: 1,
                });
            }
            // セール割引は商品本体行の単価から差し引く
            if (quote.saleDiscount && quote.saleDiscount > 0 && line_items[0]) {
                const discount = Math.min(quote.saleDiscount, line_items[0].price_data.unit_amount);
                line_items[0].price_data.unit_amount -= discount;
                line_items[0].price_data.product_data.name += "（セール価格）";
            }
            // オプション調整（割引は商品本体価格から差し引く / 追加料金は別行）
            if (quote.optionsAdjustment && quote.optionsAdjustment !== 0) {
                if (quote.optionsAdjustment > 0) {
                    // 追加料金は別行
                    line_items.push({
                        price_data: {
                            currency: "jpy",
                            product_data: { name: `オプション（${quote.optionLabels?.map(k => k.split(":")[1]).join(", ") ?? ""}）`, images: [] },
                            unit_amount: quote.optionsAdjustment,
                        },
                        quantity: 1,
                    });
                } else {
                    // 割引は商品本体行の単価から差し引く（Stripeは負の単価不可）
                    const discount = Math.abs(quote.optionsAdjustment);
                    if (line_items[0] && line_items[0].price_data.unit_amount >= discount) {
                        line_items[0].price_data.unit_amount -= discount;
                        line_items[0].price_data.product_data.name += `（${quote.optionLabels?.map(k => k.split(":")[1]).join(", ") ?? ""}）`;
                    }
                }
            }
        } else {
            for (const item of cartArr) {
                line_items.push({
                    price_data: {
                        currency: "jpy",
                        product_data: { name: item.name, images: [toAbsoluteUrl(item.image)] },
                        unit_amount: item.price,
                    },
                    quantity: item.quantity,
                });
            }
        }

        // サポーター割引（商品本体行 = 最初の行から差し引く）
        if (tierDiscount && tierDiscount > 0 && line_items[0]) {
            const deduct = Math.min(tierDiscount, Math.max(0, line_items[0].price_data.unit_amount - 1));
            line_items[0].price_data.unit_amount -= deduct;
        }

        // ポイント割引（通常商品本体・送料・サービス料に利用可。先頭行から順に控除。
        // セール商品分は上限算出時にカート側で除外済）
        if (pointsUsed && pointsUsed > 0) {
            let remaining = pointsUsed;
            for (const li of line_items) {
                if (remaining <= 0) break;
                const deduct = Math.min(remaining, li.price_data.unit_amount);
                li.price_data.unit_amount -= deduct;
                remaining -= deduct;
            }
        }

        // 配送先住所が事前指定されている場合は Stripe 側で再入力させない
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: `${baseUrl}/success`,
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
                    pointsUsed: (pointsUsed ?? 0).toString(),
                    userEmail,
                    // 注文管理シートでの商品特定用：カート内全商品IDと数量、マッチした単一バリエーションID
                    cartItems: Object.entries(cartDetails)
                        .map(([id, item]) => `${id}:${item.quantity}`)
                        .join(",")
                        .slice(0, 490), // Stripe metadata 値は 500 文字制限
                    matchedVariantId: quote?.matchedVariantId ?? "",
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
