"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/dashboard"); // Or login
                return;
            }

            const isOrgMember = user && user.systemRole && user.systemRole !== "COMMUNITY_MEMBER";

            if (!isOrgMember) {
                router.push("/dashboard");
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="size-10 animate-spin text-tatt-lime" />
            </div>
        );
    }

    const isOrgMember = user && user.systemRole && user.systemRole !== "COMMUNITY_MEMBER";

    if (!isAuthenticated || !isOrgMember) {
        return null;
    }

    return <>{children}</>;
}
