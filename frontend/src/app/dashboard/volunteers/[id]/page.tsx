"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  HeartHandshake,
} from "lucide-react";
import type { VolunteerRole } from "@/types/volunteers";

export default function VolunteerRoleDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [role, setRole] = useState<VolunteerRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleApplyClick = () => {
    router.push(`/dashboard/volunteers/apply?roleId=${id}`);
  };

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

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          href="/dashboard/volunteers"
          className="inline-flex items-center gap-2 text-tatt-gray hover:text-tatt-lime font-medium mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Volunteers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 pb-12">
          {/* Role details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 size-48 bg-tatt-lime/5 rounded-full blur-3xl pointer-events-none" />
              
              <h1 className="text-2xl sm:text-4xl font-black text-foreground mb-6 tracking-tight">
                {role.name}
              </h1>
              
              <div className="flex flex-wrap gap-5 text-sm mb-8">
                <span className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-tatt-lime/10 text-tatt-lime-dark font-bold">
                  <MapPin className="h-4 w-4" />
                  {role.location}
                </span>
                <span className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-variant text-tatt-gray font-bold border border-border">
                  <Clock className="h-4 w-4" />
                  {role.weeklyHours} hrs/week · {role.durationMonths} months
                </span>
                <span className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-variant text-tatt-gray font-bold border border-border">
                  <Users className="h-4 w-4" />
                  {role.spotsNeeded} spot{role.spotsNeeded !== 1 ? "s" : ""} needed
                </span>
              </div>

              <div className="prose prose-sm max-w-none text-tatt-gray leading-relaxed mb-10">
                <p className="text-base text-tatt-gray/90 whitespace-pre-wrap">
                  {role.description}
                </p>
              </div>

              {role.responsibilities?.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-tatt-lime" />
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-3">
                    {role.responsibilities.map((r, i) => (
                      <li key={i} className="flex gap-3 text-tatt-gray">
                        <span className="text-tatt-lime font-bold mt-0.5">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {role.requiredSkills?.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                     <span className="size-2 rounded-full bg-tatt-lime" />
                    Ideal Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {role.requiredSkills.map((s, i) => (
                      <span
                        key={i}
                        className="bg-surface border border-border text-foreground px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:border-tatt-lime transition-colors"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-3xl border border-border p-8 shadow-2xl sticky top-8 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-tatt-lime/5 to-transparent pointer-events-none" />
               <div className="relative z-10">
                <div className="size-16 rounded-2xl bg-tatt-lime flex items-center justify-center mx-auto mb-6 text-tatt-black shadow-lg">
                  <HeartHandshake className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-4">
                  Apply for this position
                </h2>
                <p className="text-tatt-gray text-sm mb-8 leading-relaxed">
                  Join our mission and make a tangible difference. The application takes about 5 minutes.
                </p>
                
                <button
                  onClick={handleApplyClick}
                  className="w-full bg-tatt-lime text-tatt-black font-black py-4 rounded-2xl uppercase tracking-widest text-sm shadow-xl hover:brightness-105 hover:-translate-y-1 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  Apply Now
                </button>
                
                <p className="mt-6 text-[11px] text-tatt-gray italic">
                  * All applications are reviewed by regional TATT leads within 5-7 business days.
                </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
