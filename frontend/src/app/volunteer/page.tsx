"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Navbar, Footer } from "@/components/organisms";
import { VolunteerHeroBanner } from "@/components/volunteers/volunteer-hero-banner";
import { VolunteerFeatures } from "@/components/volunteers/volunteer-features";
import { HeartHandshake } from "lucide-react";

export default function VolunteerPublicPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user?.systemRole === "COMMUNITY_MEMBER") {
      router.replace("/dashboard/volunteers");
    }
  }, [isAuthenticated, isLoading, user?.systemRole, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-tatt-lime border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated && user?.systemRole === "COMMUNITY_MEMBER") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Page header */}
        <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="max-w-[1920px] mx-auto flex items-center gap-3">
            <div className="size-10 sm:size-12 rounded-xl bg-tatt-lime flex items-center justify-center text-tatt-black shrink-0">
              <HeartHandshake className="h-5 w-5 sm:h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Volunteers
              </h1>
              <p className="text-tatt-gray text-sm mt-0.5">
                Shape the future through policy, research, and community action
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero - same design as dashboard */}
          <section className="pt-6 sm:pt-8" aria-label="Volunteer hero">
            <VolunteerHeroBanner />
          </section>

          {/* Feature highlights */}
          <VolunteerFeatures />

          {/* CTA: Join to apply (members only) */}
          <section
            id="apply-section"
            className="py-8 sm:py-12 md:py-16 scroll-mt-8"
            aria-label="Join to apply"
          >
            <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 md:p-12 max-w-2xl mx-auto text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                Join Our Mission
              </h2>
              <p className="text-tatt-gray text-sm sm:text-base mb-8">
                Create an account or sign in to view open volunteer roles and
                submit your application.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-tatt-lime text-tatt-black font-bold rounded-lg text-sm hover:brightness-95 transition-colors touch-manipulation w-full sm:w-auto"
                >
                  Sign Up
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 border-2 border-tatt-lime text-tatt-lime font-bold rounded-lg text-sm hover:bg-tatt-lime hover:text-tatt-black transition-colors touch-manipulation w-full sm:w-auto"
                >
                  Log In
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
