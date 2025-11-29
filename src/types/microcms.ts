import { MicroCMSImage, MicroCMSDate } from "microcms-js-sdk";

// Product Type
export type Product = {
    id: string;
    name: string;
    category: "vegetable" | "fruit" | "honey" | "experience" | "root" | "leaf" | "processed";
    price: number;
    description: string;
    catch?: string;
    image: MicroCMSImage;
    isRecommended?: boolean;
    order?: number;
} & MicroCMSDate;

// News Type
export type News = {
    id: string;
    title: string;
    content: string;
    thumbnail?: MicroCMSImage;
    publishedAt: string;
} & MicroCMSDate;
