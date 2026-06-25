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

