"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react";
import { VolunteerApplyForm } from "@/components/volunteers/volunteer-apply-form";
import type { VolunteerRole } from "@/types/volunteers";

export default function VolunteerRoleDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const id = params?.id as string;

  const [role, setRole] = useState<VolunteerRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    if (!user?.id || !id) {
      setLoading(false);
      return;
    }
    const fetchRole = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: roles } = await api.get<VolunteerRole[]>("/volunteers/roles");
        const found = Array.isArray(roles)
          ? roles.find((r) => r.id === id)
          : null;
        setRole(found || null);
        if (!found) setError("Role not found.");
      } catch (err: unknown) {
        const res =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
            : undefined;
        setError(res?.data?.message || "Failed to load role.");
        setRole(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, [user?.id, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-tatt-lime" />
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="py-20 text-center">
          <AlertCircle className="h-14 w-14 mx-auto text-tatt-gray mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">
            {error || "Role not found"}
          </h2>
          <Link
            href="/dashboard/volunteers"
            className="inline-flex items-center gap-2 text-tatt-lime font-medium hover:underline mt-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Volunteers
          </Link>
        </div>
      </div>
    );
  }

  if (applySuccess) {
    return (
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-lg mx-auto py-20 text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-tatt-lime/20 text-tatt-lime mb-6">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Application submitted
          </h2>
          <p className="text-tatt-gray mb-8">
            Thank you for applying. We&apos;ll review your application and get
            back to you soon.
          </p>
          <Link
            href="/dashboard/volunteers"
            className="inline-flex items-center gap-2 bg-tatt-lime text-tatt-black font-bold px-6 py-3 rounded-lg hover:brightness-95"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Volunteers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          href="/dashboard/volunteers"
          className="inline-flex items-center gap-2 text-tatt-gray hover:text-tatt-lime font-medium mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Volunteers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Role details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface rounded-xl border border-border p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                {role.name}
              </h1>
              <p className="text-tatt-gray leading-relaxed mb-6">
                {role.description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2 text-tatt-gray">
                  <MapPin className="h-4 w-4 text-tatt-lime" />
                  {role.location}
                </span>
                <span className="flex items-center gap-2 text-tatt-gray">
                  <Clock className="h-4 w-4 text-tatt-lime" />
                  {role.weeklyHours} hrs/week · {role.durationMonths} months
                </span>
                <span className="flex items-center gap-2 text-tatt-gray">
                  <Users className="h-4 w-4 text-tatt-lime" />
                  {role.spotsNeeded} spot{role.spotsNeeded !== 1 ? "s" : ""} needed
                </span>
              </div>

              {role.responsibilities?.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-bold text-foreground mb-2">
                    Responsibilities
                  </h3>
                  <ul className="list-disc list-inside text-tatt-gray space-y-1">
                    {role.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {role.requiredSkills?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-foreground mb-2">
                    Required skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {role.requiredSkills.map((s, i) => (
                      <span
                        key={i}
                        className="bg-tatt-lime/20 text-tatt-lime-dark px-3 py-1 rounded-full text-sm"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Apply form */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 sticky top-4">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Apply for this role
              </h2>
              <VolunteerApplyForm
                roleId={role.id}
                compact={false}
                onSuccess={() => setApplySuccess(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
