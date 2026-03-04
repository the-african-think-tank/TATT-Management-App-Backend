"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  Briefcase,
  Search,
  MapPin,
  Filter,
  Bookmark,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { JobCard } from "@/components/jobs/job-card";
import { JobApplicationModal } from "@/components/jobs/job-application-modal";
import { JobsSidebar } from "@/components/jobs/jobs-sidebar";
import type { JobListing, JobsResponse } from "@/types/jobs";

const CATEGORIES = [
  "All Categories",
  "Green Energy",
  "FinTech",
  "Sustainability",
  "Policy & Govt",
  "AgriTech",
];

const LOCATION_OPTIONS = ["All", "Remote", "Hybrid", "On-site"];
const TYPE_OPTIONS = ["All Types", "Full-time", "Part-time", "Contract"];

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [meta, setMeta] = useState<JobsResponse["meta"] | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All");
  const [type, setType] = useState("All Types");
  const [page, setPage] = useState(1);
  const [applyModalJob, setApplyModalJob] = useState<JobListing | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: 10,
      };
      if (search.trim()) params.search = search.trim();
      if (category !== "All Categories") params.category = category;
      if (location !== "All") params.location = location;
      if (type !== "All Types") params.type = type;
      const { data } = await api.get<JobsResponse>("/jobs", { params });
      setJobs(Array.isArray(data?.data) ? data.data : []);
      setMeta(data?.meta ?? null);
    } catch (err: unknown) {
      const res =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string }; status?: number } }).response
          : undefined;
      setError(res?.data?.message ?? "Failed to load opportunities.");
      setJobs([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, search, category, location, type]);

  const fetchSavedIds = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await api.get<string[]>("/jobs/saved-ids");
      setSavedIds(new Set(Array.isArray(data) ? data : []));
    } catch {
      setSavedIds(new Set());
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    fetchJobs();
  }, [fetchJobs, user?.id]);

  useEffect(() => {
    fetchSavedIds();
  }, [fetchSavedIds, user?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleSaveToggle = useCallback((jobId: string, saved: boolean) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(jobId);
      else next.delete(jobId);
      return next;
    });
  }, []);

  const totalPages = meta?.totalPages ?? 0;

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Opportunities
              </h1>
              <p className="text-tatt-gray text-sm mt-0.5">
                Curated leadership and innovation roles for our network.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/jobs/saved"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg font-bold bg-tatt-gray/20 text-foreground hover:bg-tatt-gray/30 transition-colors text-sm"
              >
                <Bookmark className="h-4 w-4" />
                Saved Roles
              </Link>
              <Link
                href="/dashboard/jobs/post"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg font-bold bg-tatt-lime text-tatt-black hover:brightness-95 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                Post a Listing
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-tatt-lime/10 border border-tatt-lime/30 text-foreground font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tatt-gray pointer-events-none" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by job title, keyword..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-foreground placeholder:text-tatt-gray focus:outline-none focus:ring-2 focus:ring-tatt-lime"
                  aria-label="Search jobs"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm font-medium hover:bg-background"
                >
                  <MapPin className="h-4 w-4" />
                  {location} &nbsp; ▼
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm font-medium hover:bg-background"
                >
                  <Filter className="h-4 w-4" />
                  {type} &nbsp; ▼
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-tatt-lime text-tatt-black font-bold text-sm hover:brightness-95"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    category === cat
                      ? "bg-tatt-lime text-tatt-black"
                      : "bg-tatt-gray/20 text-foreground hover:bg-tatt-gray/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Job list */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-tatt-lime mb-4" />
                <p className="text-tatt-gray font-medium">Loading opportunities...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="py-20 text-center">
                <Briefcase className="h-14 w-14 mx-auto text-tatt-gray opacity-50 mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">No opportunities yet</h2>
                <p className="text-tatt-gray max-w-md mx-auto">
                  Check back soon for curated roles, or post a listing if you&apos;re an employer.
                </p>
              </div>
            ) : (
              <>
                <ul className="space-y-4">
                  {jobs.map((job) => (
                    <li key={job.id}>
                      <JobCard
                        job={job}
                        saved={savedIds.has(job.id)}
                        onSaveToggle={handleSaveToggle}
                        onApplyClick={setApplyModalJob}
                      />
                    </li>
                  ))}
                </ul>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-lg border border-border hover:bg-background disabled:opacity-50"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(p)}
                          className={`min-w-[40px] h-10 rounded-lg font-bold text-sm ${
                            page === p
                              ? "bg-tatt-lime text-tatt-black"
                              : "bg-tatt-gray/20 text-foreground hover:bg-tatt-gray/30"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-tatt-gray">...</span>
                        <button
                          type="button"
                          onClick={() => setPage(totalPages)}
                          className="min-w-[40px] h-10 rounded-lg font-bold text-sm bg-tatt-gray/20 text-foreground hover:bg-tatt-gray/30"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="p-2 rounded-lg border border-border hover:bg-background disabled:opacity-50"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <JobsSidebar />
          </div>
        </div>
      </div>

      {applyModalJob && (
        <JobApplicationModal
          job={applyModalJob}
          user={user}
          onClose={() => setApplyModalJob(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
