import { ComingSoonTemplate } from "@/components/templates/coming-soon-template";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Programs",
};

export default function ProgramsPage() {
    return (
        <ComingSoonTemplate
            title="Our Programs"
            subtitle="Explore our community programs, workshops, and initiatives designed to empower the African diaspora. This page is coming soon."
        />
    );
}
