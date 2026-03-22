import { StoreSingleClient } from "./store-single-client";
import api from "@/services/api";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    try {
        const res = await api.get(`/store/public/products/${params.id}`);
        const product = res.data;
        return {
            title: `${product.name} | The TATT Store`,
            description: product.description,
        };
    } catch (error) {
        return {
            title: "Product Not Found | The TATT Store",
        };
    }
}

export default function ProductPage() {
    return <StoreSingleClient />;
}
