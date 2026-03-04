"use client";

import { LoginPage } from "@/components/pages/login-page";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      if (user.systemRole === 'COMMUNITY_MEMBER') {
        router.push('/dashboard');
      } else {
        router.push('/admin');
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

  // If they are logging in they should be routed, show nothing
  if (isAuthenticated && user) {
    return null;
  }

  return <LoginPage />;
}
