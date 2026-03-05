import { AdminRegionalChaptersPage } from "@/components/pages/admin-regional-chapters-page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Regional Chapters | TATT Admin",
    description: "Manage regional chapters, leadership, and activities.",
};

export default function RegionalChaptersPage() {
    return <AdminRegionalChaptersPage />;
}
