"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PostJobPage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-[1920px] mx-auto">
          <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-tatt-gray hover:text-tatt-lime text-sm font-medium mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Opportunities
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Post a Listing</h1>
          <p className="text-tatt-gray text-sm mt-0.5">Post a job listing (employer feature)</p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 text-center">
          <p className="text-tatt-gray">
            Job posting is available for employers and partners. Contact your chapter or admin to post a listing.
          </p>
        </div>
      </div>
    </div>
  );
}
