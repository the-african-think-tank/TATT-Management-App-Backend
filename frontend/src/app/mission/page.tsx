import { ComingSoonTemplate } from "@/components/templates/coming-soon-template";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Mission",
};

export default function MissionPage() {
    return (
        <ComingSoonTemplate
            title="Our Mission"
            subtitle="Discover the values and goals that drive The African Think Tank's global impact. This page is coming soon."
        />
    );
}
