"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Loader2,
  Folder,
  Search,
  FileText,
  Video,
  Handshake,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
} from "lucide-react";
import type { ResourceCard, ResourcesListResponse, ResourceType } from "@/types/resources";

const RESOURCE_TYPES: { value: ResourceType | ""; label: string; icon: typeof FileText }[] = [
  { value: "", label: "All", icon: Folder },
  { value: "GUIDE", label: "Guides", icon: BookOpen },
  { value: "DOCUMENT", label: "Documents", icon: FileText },
  { value: "VIDEO", label: "Videos", icon: Video },
  { value: "PARTNERSHIP", label: "Partnerships", icon: Handshake },
];

function ResourceTypeIcon({ type }: { type: ResourceType }) {
  const t = RESOURCE_TYPES.find((r) => r.value === type);
  const Icon = t?.icon ?? FileText;
  return <Icon className="h-5 w-5 text-tatt-gray" />;
}

function stripHtml(html: string | null): string {
  if (!html) return "";
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent ?? div.innerText ?? "";
  }
  return html.replace(/<[^>]*>/g, "").trim();
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ResourceCard[]>([]);
  const [meta, setMeta] = useState<ResourcesListResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<ResourceType | "">("");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const fetchResources = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, limit: 12 };
      
      let resourceData: any[] = [];
      let partnershipData: any[] = [];
      let totalItems = 0;

      // Fetch regular resources
      if (!typeFilter || typeFilter !== "PARTNERSHIP") {
        if (typeFilter) params.type = typeFilter;
        const { data } = await api.get<ResourcesListResponse>("/resources", { params });
        resourceData = (Array.isArray(data?.data) ? data.data : []).map(r => ({...r, isPartnership: false}));
        totalItems = data?.meta?.total ?? 0;
      }

      // Fetch partnerships if applicable
      if (!typeFilter || typeFilter === "PARTNERSHIP") {
        const { data } = await api.get("/partnerships/my-benefits");
        partnershipData = (Array.isArray(data) ? data : []).map(p => ({
          ...p,
          id: p.id,
          title: p.name,
          type: "PARTNERSHIP",
          thumbnailUrl: p.logoUrl,
          description: p.description,
          tags: [p.category],
          isPartnership: true
        }));
        
        if (typeFilter === "PARTNERSHIP") {
          totalItems = partnershipData.length;
        } else {
          totalItems += partnershipData.length;
        }
      }

      const combined = typeFilter === "PARTNERSHIP" 
        ? partnershipData 
        : [...partnershipData.slice(0, 4), ...resourceData]; // Priority to some partnerships on "All"

      setItems(combined);
      setMeta({
          total: totalItems,
          page,
          limit: 12,
          totalPages: Math.ceil(totalItems / 12)
      });
    } catch (err: unknown) {
      const res =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string }; status?: number } }).response
          : undefined;
      setError(res?.data?.message ?? "Failed to load resources.");
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, typeFilter]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const filteredItems = search.trim()
    ? items.filter(
        (r) =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : items;
  const displayMeta = search.trim() ? { total: filteredItems.length, page: 1, limit: 12, totalPages: 1 } : meta;

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 sm:size-12 rounded-xl bg-tatt-lime flex items-center justify-center text-tatt-black shrink-0">
                <Folder className="h-5 w-5 sm:h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  Knowledge &amp; Resources
                </h1>
                <p className="text-tatt-gray text-sm mt-0.5">
                  Guides, documents, videos and partnership opportunities for the network.
                </p>
              </div>
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

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tatt-gray h-5 w-5 pointer-events-none" />
            <input
              type="search"
              placeholder="Search by title or tag..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm placeholder:text-tatt-gray focus:outline-none focus:ring-2 focus:ring-tatt-lime"
              aria-label="Search resources"
            />
          </form>
          <div className="flex flex-wrap gap-2">
            {RESOURCE_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value || "all"}
                type="button"
                onClick={() => {
                  setTypeFilter(value);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg font-bold text-sm transition-colors ${
                  typeFilter === value
                    ? "bg-tatt-lime text-tatt-black"
                    : "bg-tatt-gray/20 text-foreground hover:bg-tatt-gray/30"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-tatt-lime" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center">
            <Folder className="h-14 w-14 mx-auto text-tatt-gray opacity-50 mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No resources found</h2>
            <p className="text-tatt-gray">
              {search.trim() ? "Try a different search or filter." : "No resources match your filters yet."}
            </p>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map((resource) => (
                <li key={resource.id}>
                  <Link
                    href={resource.isPartnership ? (resource.isLocked ? "/dashboard/upgrade" : `/dashboard/partnerships/${resource.id}`) : `/dashboard/resources/${resource.id}`}
                    target="_self"
                    className={`relative block h-full rounded-xl border border-border bg-surface p-4 sm:p-5 hover:border-tatt-lime/50 hover:shadow-md transition-all text-left ${resource.isLocked ? "opacity-80 grayscale-[0.5]" : ""}`}
                  >
                    {resource.isLocked && (
                      <div className="absolute top-4 right-4 z-10 p-1.5 bg-background/80 rounded-full border border-border">
                        <Lock className="size-3.5 text-tatt-gray" />
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      {resource.thumbnailUrl ? (
                        <img
                          src={resource.thumbnailUrl}
                          alt=""
                          className="size-12 sm:size-14 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="size-12 sm:size-14 rounded-lg bg-tatt-gray/20 flex items-center justify-center shrink-0">
                          <ResourceTypeIcon type={resource.type} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-foreground truncate">{resource.title}</h3>
                        <span className="text-xs text-tatt-gray uppercase tracking-wide">{resource.type}</span>
                      </div>
                    </div>
                    {resource.description && (
                      <p className="text-sm text-tatt-gray line-clamp-2 mb-3">
                        {stripHtml(resource.description)}
                      </p>
                    )}
                    {resource.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded bg-tatt-lime/20 text-tatt-green-deep font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-tatt-lime mt-auto">
                      {resource.isPartnership ? (resource.isLocked ? "Upgrade to Unlock" : (resource.buttonLabel || "Redeem Offer")) : "View resource"}
                      {resource.isPartnership && !resource.isLocked ? <ExternalLink className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {displayMeta && displayMeta.totalPages > 1 && !search.trim() && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="min-h-[44px] px-3 rounded-lg border border-border bg-surface text-foreground disabled:opacity-50 hover:bg-tatt-gray/10 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="min-h-[44px] px-4 flex items-center text-sm text-tatt-gray">
                  Page {page} of {displayMeta.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= displayMeta.totalPages}
                  className="min-h-[44px] px-3 rounded-lg border border-border bg-surface text-foreground disabled:opacity-50 hover:bg-tatt-gray/10 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
