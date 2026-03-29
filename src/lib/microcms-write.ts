import { createClient } from "microcms-js-sdk";

// Client for write operations (POST)
// This should ONLY be used in Server Actions or API Routes to keep the key secure.
export const writeClient = process.env.MICROCMS_SERVICE_DOMAIN && process.env.MICROCMS_WRITE_API_KEY
    ? createClient({
        serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
        apiKey: process.env.MICROCMS_WRITE_API_KEY,
    })
    : null;
