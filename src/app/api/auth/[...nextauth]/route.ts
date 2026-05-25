import { handlers } from "@/auth";

// NextAuth v5 beta と Next.js 16 の型互換性のためキャスト
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = handlers.GET as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = handlers.POST as any;
