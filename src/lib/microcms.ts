import { createClient } from "microcms-js-sdk";

type ClientType = ReturnType<typeof createClient>;

// 商品APIが存在する環境でだけMicroCMSを読みに行く。
// 現在の商品正本は商品在庫シート + products.json。古い認証情報が残っていても
// 毎ページ404を発生させないよう、明示的に有効化した場合のみMicroCMSを優先する。
export const isMicroCmsProductsEnabled = process.env.MICROCMS_PRODUCTS_ENABLED === "true";

export const client: ClientType = process.env.MICROCMS_SERVICE_DOMAIN && process.env.MICROCMS_API_KEY
    ? createClient({
        serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
        apiKey: process.env.MICROCMS_API_KEY,
    })
    : {
        getList: async () => ({ contents: [], totalCount: 0, offset: 0, limit: 0 }),
        get: async () => null,
        getAllContent: async () => [],
        getObject: async () => null,
        create: async () => null,
        update: async () => null,
        delete: async () => null,
    } as unknown as ClientType;
