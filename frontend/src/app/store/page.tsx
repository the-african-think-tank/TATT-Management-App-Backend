import { StoreClient } from "./store-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "The TATT Store | Official Merchandise",
    description: "Premium apparel and accessories designed for the global African diaspora. Wear the mission, share the impact.",
};

export default function StorePage() {
    return <StoreClient />;
}
