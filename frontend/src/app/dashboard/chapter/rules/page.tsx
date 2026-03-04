"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ChapterRulesPage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-[1920px] mx-auto">
          <Link href="/dashboard/chapter" className="inline-flex items-center gap-2 text-tatt-gray hover:text-tatt-lime text-sm font-medium mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to My Chapter
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Chapter Rules</h1>
          <p className="text-tatt-gray text-sm mt-0.5">Guidelines and expectations for chapter members</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 text-foreground">
          <p className="text-tatt-gray">
            Chapter rules and guidelines will be displayed here. Contact your chapter lead or regional manager for the full rules document.
          </p>
        </div>
      </div>
    </div>
  );
}
