import { ComingSoonTemplate } from "@/components/templates/coming-soon-template";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Impact",
};

export default function ImpactPage() {
    return (
        <ComingSoonTemplate
            title="Our Impact"
            subtitle="See the measurable change The African Think Tank has driven across communities worldwide. This page is coming soon."
        />
    );
}
