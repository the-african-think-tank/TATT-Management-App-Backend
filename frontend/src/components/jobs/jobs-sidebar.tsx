"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import Link from "next/link";
import type { MarketInsights } from "@/types/jobs";

export function JobsSidebar() {
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchInsights = async () => {
      try {
        const { data } = await api.get<MarketInsights>("/jobs/insights");
        if (!cancelled) setInsights(data);
      } catch {
        if (!cancelled) setInsights(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchInsights();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <aside className="space-y-6 animate-pulse">
        <div className="h-24 rounded-xl bg-tatt-gray/10" />
        <div className="h-32 rounded-xl bg-tatt-gray/10" />
      </aside>
    );
  }

  return (
    <aside className="space-y-6">
      <section className="bg-surface rounded-xl border border-border p-4 sm:p-5">
        <h3 className="text-xs font-bold text-tatt-gray uppercase tracking-wider mb-4">
          Market Insights
        </h3>
        <div className="space-y-3">
          {insights?.topCategory && (
            <div className="p-3 rounded-lg bg-background border border-border">
              <p className="text-xs font-medium text-tatt-gray uppercase">Top Category</p>
              <p className="font-bold text-foreground">{insights.topCategory.name}</p>
              <p className="text-tatt-lime text-sm">{insights.topCategory.growth}</p>
            </div>
          )}
          <div className="p-3 rounded-lg bg-background border border-border">
            <p className="text-xs font-medium text-tatt-gray uppercase">Salary Trend</p>
            <p className="font-bold text-foreground">
              ${(insights?.salaryTrend?.avg ?? 95000).toLocaleString()} Avg.
            </p>
            <p className="text-tatt-gray text-sm">
              {insights?.salaryTrend?.label ?? "Executive roles in West Africa"}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-tatt-gray uppercase">Top Employers</p>
              <Link href="/dashboard/jobs" className="text-xs text-tatt-lime hover:underline">
                See all
              </Link>
            </div>
            <ul className="space-y-2">
              {(insights?.topEmployers ?? []).slice(0, 3).map((emp) => (
                <li key={emp.name} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="size-8 rounded bg-tatt-lime/20 flex items-center justify-center text-tatt-lime font-bold text-xs shrink-0">
                    {emp.initials}
                  </span>
                  {emp.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-surface rounded-xl border border-border p-4 sm:p-5">
        <h3 className="font-bold text-foreground mb-2">Job Alerts</h3>
        <p className="text-tatt-gray text-sm mb-4">
          Get notified when roles matching your profile are posted.
        </p>
        <button
          type="button"
          className="w-full min-h-[44px] py-2.5 rounded-lg font-bold bg-tatt-lime text-tatt-black hover:brightness-95 transition-colors text-sm"
        >
          Get Alert
        </button>
      </section>
    </aside>
  );
}
