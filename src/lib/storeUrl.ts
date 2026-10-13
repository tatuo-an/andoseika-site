/** Checkout return URLs must never be derived from client-controlled headers. */
export function getStoreBaseUrl(): string {
    const configured = process.env.NEXT_PUBLIC_URL || "https://ando-seika.com";
    const url = new URL(configured);
    if (url.protocol !== "https:" && url.hostname !== "localhost") {
        throw new Error("Invalid store URL configuration");
    }
    return url.origin;
}
