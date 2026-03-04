"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import type { VolunteerRole } from "@/types/volunteers";

type VolunteerRoleCardProps = {
  role: VolunteerRole;
};

/** Derive location badge from role.location */
function getLocationBadge(location: string, skills: string[]): string {
  const loc = location.toLowerCase();
  if (loc.includes("remote")) return "REMOTE";
  if (loc.includes("hybrid")) return "HYBRID";
  const hasTechnical =
    skills.some((s) =>
      ["technical", "tech", "software", "development", "research"].some((k) =>
        s.toLowerCase().includes(k)
      )
    ) || skills.length > 3;
  if (hasTechnical) return "TECHNICAL";
  return "IN-PERSON";
}

/** Placeholder image based on role name hash for variety */
function getRoleImage(name: string): string {
  const images = [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600",
  ];
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % images.length;
  return images[idx] ?? images[0] ?? "";
}

export function VolunteerRoleCard({ role }: VolunteerRoleCardProps) {
  const badge = getLocationBadge(role.location, role.requiredSkills || []);
  const imageUrl = getRoleImage(role.name);

  return (
    <article className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="relative aspect-[4/3] bg-tatt-black overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-tatt-lime text-tatt-black text-xs font-bold px-2.5 py-1 rounded">
            {badge}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <FileText className="h-5 w-5 text-tatt-black/80" />
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight mb-3 line-clamp-2">
          {role.name}
        </h3>
        <p className="text-sm text-tatt-gray line-clamp-3 flex-1 mb-4">
          {role.description}
        </p>
        <Link
          href={`/dashboard/volunteers/${role.id}`}
          className="inline-flex items-center justify-center min-h-[44px] py-2.5 px-4 border-2 border-tatt-lime text-tatt-lime font-bold rounded-lg text-sm hover:bg-tatt-lime hover:text-tatt-black transition-colors touch-manipulation"
        >
          Learn More
        </Link>
      </div>
    </article>
  );
}
