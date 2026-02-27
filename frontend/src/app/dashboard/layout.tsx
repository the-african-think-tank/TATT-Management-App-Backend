"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/organisms/dashboard-sidebar";
import { DashboardHeader } from "@/components/organisms/dashboard-header";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/');
            } else if (user && user.systemRole !== 'COMMUNITY_MEMBER') {
                // If they are admin or superadmin etc., route them to the admin dashboard.
                // You can add logic here to differentiate based on the actual roles if needed.
                // For now, redirect them since this is explicitly the community dashboard.
                router.push('/');
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tatt-lime"></div>
            </div>
        );
    }

    if (!isAuthenticated || (user && user.systemRole !== 'COMMUNITY_MEMBER')) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
