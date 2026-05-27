export const ADMIN_EMAILS = [
    "tatuo.an@gmail.com",
    "imamura0510@gmail.com",
];

export function isAdmin(email?: string | null): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email);
}
