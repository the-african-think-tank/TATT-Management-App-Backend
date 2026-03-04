"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { useEffect, useState, useRef } from "react";
import { Loader2, ChevronLeft, ChevronRight, HeartHandshake } from "lucide-react";
import { VolunteerHeroBanner } from "@/components/volunteers/volunteer-hero-banner";
import { VolunteerFeatures } from "@/components/volunteers/volunteer-features";
import { VolunteerRoleCard } from "@/components/volunteers/volunteer-role-card";
import { VolunteerApplyForm } from "@/components/volunteers/volunteer-apply-form";
import type { VolunteerRole } from "@/types/volunteers";

export default function VolunteersPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<VolunteerRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rolesScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<VolunteerRole[]>("/volunteers/roles");
        setRoles(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        const res =
          err &&
            typeof err === "object" &&
            "response" in err
            ? (err as {
              response?: {
                data?: { message?: string | string[] };
                status?: number;
              };
            }).response
            : undefined;
        const msg = res?.data?.message;
        const status = res?.status;
        const fallback =
          status === 500
            ? "Server error loading volunteer roles. Please try again."
            : "Failed to load volunteer roles.";
        const errorMsg = (Array.isArray(msg) ? msg[0] : msg) || fallback;
        setError(errorMsg);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [user?.id]);

  const scrollRoles = (direction: "left" | "right") => {
    const el = rolesScrollRef.current;
    if (!el) return;
    const amount = 320;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Page header - responsive */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-[1920px] mx-auto flex items-center gap-3 min-w-0">
          <div className="size-10 sm:size-12 rounded-xl bg-tatt-lime flex items-center justify-center text-tatt-black shrink-0">
            <HeartHandshake className="h-5 w-5 sm:h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight truncate">
              Volunteers
            </h1>
            <p className="text-tatt-gray text-xs sm:text-sm mt-0.5">
              Shape the future through policy, research, and community action
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-tatt-lime/10 border border-tatt-lime/30 text-foreground font-medium">
            {error}
          </div>
        )}

        {/* Hero section */}
        <section className="pt-6 sm:pt-8" aria-label="Volunteer hero">
          <VolunteerHeroBanner />
        </section>

        {/* Feature highlights */}
        <VolunteerFeatures />

        {/* Open Volunteer Roles */}
        <section
          className="py-8 sm:py-12"
          id="roles-section"
          aria-label="Open volunteer roles"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Open Volunteer Roles
              </h2>
              <p className="text-tatt-gray text-sm mt-1">
                Apply for positions that match your skills and passion for
                development.
              </p>
            </div>
            {roles.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollRoles("left")}
                  className="size-10 rounded-full bg-tatt-gray/20 hover:bg-tatt-gray/30 flex items-center justify-center text-foreground transition-colors"
                  aria-label="Scroll roles left"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRoles("right")}
                  className="size-10 rounded-full bg-tatt-gray/20 hover:bg-tatt-gray/30 flex items-center justify-center text-foreground transition-colors"
                  aria-label="Scroll roles right"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-tatt-lime mb-4" />
              <p className="text-tatt-gray font-medium">Loading volunteer roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="py-20 text-center">
              <HeartHandshake className="h-14 w-14 mx-auto text-tatt-gray opacity-50 mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                No open roles yet
              </h2>
              <p className="text-tatt-gray max-w-md mx-auto">
                Check back soon for volunteer opportunities. You can still apply
                generally using the Apply Now button above.
              </p>
            </div>
          ) : (
            <div
              ref={rolesScrollRef}
              className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
                {roles.map((role) => (
                  <li key={role.id} className="min-w-0">
                    <VolunteerRoleCard role={role} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* General Apply section (hero CTA scrolls here) */}
        <section
          id="apply-section"
          className="py-8 sm:py-12 scroll-mt-8"
          aria-label="Apply to volunteer"
        >
          <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 max-w-xl">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Apply to volunteer
            </h2>
            <p className="text-tatt-gray text-sm mb-6">
              Submit a general application to join our volunteer network. We&apos;ll
              match you with roles that fit your skills.
            </p>
            <VolunteerApplyForm compact />
          </div>
        </section>
      </div>
    </div>
  );
}
