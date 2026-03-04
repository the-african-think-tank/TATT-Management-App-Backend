"use client";

import { Globe, MessageCircle, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Global Networking",
    description:
      "Connect with leaders and experts across various global industries.",
  },
  {
    icon: MessageCircle,
    title: "Mentorship",
    description:
      "Work alongside seasoned policy makers and senior researchers.",
  },
  {
    icon: BarChart3,
    title: "Real-world Impact",
    description:
      "See your contributions influence actual policy and community growth.",
  },
];

export function VolunteerFeatures() {
  return (
    <section
      className="py-6 sm:py-10 md:py-16 bg-tatt-gray/5"
      aria-label="Volunteer benefits"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto w-full">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col items-center sm:items-start text-center sm:text-left p-4 sm:p-6 rounded-xl bg-surface border border-border shadow-sm"
          >
            <div className="size-14 rounded-full bg-tatt-lime flex items-center justify-center text-tatt-black mb-4 shrink-0">
              <Icon className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-tatt-gray leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
