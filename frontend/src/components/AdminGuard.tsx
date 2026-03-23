"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { usePathname } from "next/navigation";

const rolePermissions: Record<string, string[]> = {
    "/admin": ["SUPERADMIN", "ADMIN", "REGIONAL_ADMIN", "CONTENT_ADMIN", "SALES", "MODERATOR"],
    "/admin/org-management": ["SUPERADMIN", "ADMIN"],
    "/admin/regional-chapters": ["SUPERADMIN", "ADMIN", "REGIONAL_ADMIN"],
    "/admin/feed-moderation": ["SUPERADMIN", "ADMIN", "MODERATOR"],
    "/admin/community-feed": ["SUPERADMIN", "ADMIN", "REGIONAL_ADMIN", "CONTENT_ADMIN", "SALES", "MODERATOR"],
    "/admin/volunteers": ["SUPERADMIN", "ADMIN", "REGIONAL_ADMIN"],
    "/admin/events": ["SUPERADMIN", "ADMIN", "REGIONAL_ADMIN", "CONTENT_ADMIN"],
    "/admin/partnerships": ["SUPERADMIN", "ADMIN", "CONTENT_ADMIN"],
    "/admin/membership-center": ["SUPERADMIN", "ADMIN", "CONTENT_ADMIN"],
    "/admin/jobs": ["SUPERADMIN", "ADMIN", "CONTENT_ADMIN", "MODERATOR"],
    "/admin/messages": ["SUPERADMIN", "ADMIN", "REGIONAL_ADMIN", "CONTENT_ADMIN", "SALES", "MODERATOR"],
    "/admin/revenue": ["SUPERADMIN"],
    "/admin/sales-inventory": ["SUPERADMIN", "ADMIN", "CONTENT_ADMIN", "SALES"],
    "/admin/resources": ["SUPERADMIN", "ADMIN", "CONTENT_ADMIN"],
    "/admin/platform": ["SUPERADMIN", "ADMIN", "CONTENT_ADMIN"],
    "/admin/analytics": ["SUPERADMIN", "ADMIN"],
    "/admin/settings": ["SUPERADMIN", "ADMIN", "REGIONAL_ADMIN", "CONTENT_ADMIN", "SALES", "MODERATOR"]
};

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/");
                return;
            }

            const isOrgMember = user && user.systemRole && user.systemRole !== "COMMUNITY_MEMBER";

            if (!isOrgMember) {
                router.push("/dashboard");
                return;
            }

            // Check specific route permissions
            if (user.systemRole !== "SUPERADMIN") {
                let allowed = false;
                
                // find the most specific route match
                const matchedRoute = Object.keys(rolePermissions)
                    .sort((a, b) => b.length - a.length)
                    .find(route => pathname === route || (pathname?.startsWith(route + "/")));
                
                if (matchedRoute) {
                    allowed = rolePermissions[matchedRoute].includes(user?.systemRole as string);
                } else if (pathname === "/admin") {
                    allowed = true;
                }

                if (!allowed) {
                    router.push("/admin");
                }
            }
        }
    }, [isLoading, isAuthenticated, user, router, pathname]);

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
