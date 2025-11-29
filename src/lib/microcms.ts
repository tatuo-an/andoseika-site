import { createClient } from "microcms-js-sdk";

type ClientType = ReturnType<typeof createClient>;

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
