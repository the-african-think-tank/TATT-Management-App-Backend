"use client";

import type { ReactNode } from "react";

type VolunteerHeroBannerProps = {
  /** Custom CTA (e.g. link or button). Default: "Apply Now" anchor to #apply-section */
  cta?: ReactNode;
};

export function VolunteerHeroBanner({ cta }: VolunteerHeroBannerProps) {
  return (
    <section
      className="relative w-full min-h-[280px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[420px] flex flex-col justify-end overflow-hidden rounded-xl"
      aria-label="Volunteer hero"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200')",
        }}
      />
      <div className="absolute inset-0 bg-tatt-black/60 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-tatt-black/95 via-tatt-black/40 to-transparent" />

      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 lg:py-12 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-tatt-white tracking-tight leading-tight mb-3 sm:mb-4">
          <span className="text-tatt-white">Shape the Future of Africa: </span>
          <span className="text-tatt-lime">Your Expertise, Our </span>
          <span className="text-tatt-white">Collective Impact.</span>
        </h1>
        <p className="text-tatt-white/95 text-sm sm:text-base md:text-lg max-w-2xl mb-4 sm:mb-6">
          Join a global network of thinkers and doers dedicated to real-world
          change through policy, research, and community action.
        </p>
        {cta ?? (
          <a
            href="#apply-section"
            className="inline-flex items-center justify-center min-h-[44px] sm:min-h-[48px] px-5 sm:px-6 py-2.5 sm:py-3 bg-tatt-gray text-tatt-white font-bold rounded-lg text-sm hover:bg-tatt-gray/90 transition-colors touch-manipulation"
          >
            Apply Now
          </a>
        )}
      </div>
    </section>
  );
}
