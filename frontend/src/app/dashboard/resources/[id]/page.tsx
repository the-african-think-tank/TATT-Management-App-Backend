"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, ExternalLink, Lock, FileText } from "lucide-react";
import type { ResourceDetail } from "@/types/resources";

export default function ResourceDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : null;
  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !id) {
      setLoading(false);
      return;
    }
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{ data: ResourceDetail }>(`/resources/${id}`);
        setResource(data?.data ?? null);
      } catch (err: unknown) {
        const res =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string }; status?: number } }).response
            : undefined;
        const status = res?.status;
        const msg = res?.data?.message;
        if (status === 403) {
          setError(typeof msg === "string" ? msg : "Your membership tier does not include access to this resource.");
        } else {
          setError(typeof msg === "string" ? msg : "Failed to load resource.");
        }
        setResource(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [user?.id, id]);

  if (!id) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
        <p className="text-tatt-gray">Invalid resource.</p>
        <Link href="/dashboard/resources" className="text-tatt-lime ml-2 hover:underline">
          Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard/resources"
            className="inline-flex items-center gap-2 text-tatt-gray hover:text-tatt-lime text-sm font-medium mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Resources
          </Link>
          {loading && (
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-tatt-lime" />
              <span className="text-tatt-gray">Loading…</span>
            </div>
          )}
          {!loading && resource && (
            <h1 className="text-2xl font-bold text-foreground">{resource.title}</h1>
          )}
          {!loading && error && (
            <h1 className="text-2xl font-bold text-foreground">Resource</h1>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-tatt-lime" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 text-center">
            <Lock className="h-14 w-14 mx-auto text-tatt-gray mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Access restricted</h2>
            <p className="text-tatt-gray mb-6">{error}</p>
            <Link
              href="/dashboard/resources"
              className="inline-flex items-center gap-2 text-tatt-lime font-medium hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Resources
            </Link>
          </div>
        )}

        {!loading && resource && !error && (
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-sm text-tatt-gray mb-4">
                <span className="uppercase tracking-wide">{resource.type}</span>
                {resource.tags?.length > 0 && (
                  <>
                    <span>·</span>
                    {resource.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-tatt-lime/20 text-tatt-green-deep font-medium">
                        {tag}
                      </span>
                    ))}
                  </>
                )}
              </div>
              {resource.description && (
                <div
                  className="prose prose-sm max-w-none text-foreground mb-6"
                  dangerouslySetInnerHTML={{ __html: resource.description }}
                />
              )}
              {resource.contentUrl ? (
                <a
                  href={resource.contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg font-bold bg-tatt-lime text-tatt-black hover:brightness-95 transition-colors"
                >
                  Open resource
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <p className="text-tatt-gray flex items-center gap-2">
                  <FileText className="h-5 w-5 shrink-0" />
                  No direct link available for this resource.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
