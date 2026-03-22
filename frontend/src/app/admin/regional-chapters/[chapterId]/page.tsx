import { AdminChapterDetailsPage } from "@/components/pages/admin-chapter-details-page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Chapter Details | TATT Admin",
    description: "Manage chapter activities, volunteers, and regional leadership.",
};

export default function ChapterDetailsPage() {
    return <AdminChapterDetailsPage />;
}
