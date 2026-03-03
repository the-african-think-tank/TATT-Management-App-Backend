"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  Building2,
  CheckCircle2,
  FolderOpen,
  Calendar,
  Users,
  MapPin,
} from "lucide-react";
import type { ChapterDetail, ChapterMember, ChapterMembersResponse } from "@/types/chapter";
import type { FeedPost, FeedResponse } from "@/types/feed";
import type { EventItem } from "@/types/events";

function formatEventDate(dateTime: string) {
  try {
    const d = new Date(dateTime);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  } catch {
    return "";
  }
}

function formatNewsDate(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

function getPostTag(post: FeedPost): string {
  if (post.type === "ANNOUNCEMENT") return "ANNOUNCEMENT";
  if (post.type === "EVENT") return "EVENT";
  if (post.type === "RESOURCE") return "RESOURCE";
  return "NEWS";
}

export default function ChapterPage() {
  const { user } = useAuth();
  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [news, setNews] = useState<FeedPost[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [membersRes, setMembersRes] = useState<ChapterMembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const chapterId = user.chapterId;
    if (!chapterId) {
      setLoading(false);
      setError("You are not assigned to a chapter.");
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const [chapterRes, feedRes, eventsRes, membersResData] = await Promise.all([
          api.get<ChapterDetail>(`/chapters/${chapterId}`),
          api.get<FeedResponse>("/feed", { params: { filter: "CHAPTER", page: 1, limit: 5 } }),
          api.get<EventItem[]>("/events"),
          api.get<ChapterMembersResponse>(`/chapters/${chapterId}/members`),
        ]);
        setChapter(chapterRes.data);
        setNews(feedRes.data?.data ?? []);
        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
        setMembersRes(membersResData.data);
      } catch (err: unknown) {
        const res =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string }; status?: number } }).response
            : undefined;
        setError(res?.data?.message ?? "Failed to load chapter.");
        setChapter(null);
        setNews([]);
        setEvents([]);
        setMembersRes(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.id, user?.chapterId]);

  const localEvents = useMemo(() => {
    if (!user?.chapterId || !events.length) return [];
    return events.filter((e) =>
      e.locations?.some((l) => l.chapterId === user.chapterId)
    ).slice(0, 5);
  }, [events, user?.chapterId]);

  const leadershipList = useMemo(() => {
    if (!chapter) return [];
    const list: { id: string; name: string; role: string; profilePicture?: string | null }[] = [];
    if (chapter.regionalManager) {
      list.push({
        id: chapter.regionalManager.id,
        name: `${chapter.regionalManager.firstName} ${chapter.regionalManager.lastName}`,
        role: "Chapter Lead",
        profilePicture: chapter.regionalManager.profilePicture,
      });
    }
    const members = membersRes?.members ?? [];
    const others = members.filter((m) => m.id !== chapter.regionalManagerId).slice(0, 2);
    const roleLabels = ["Events Coordinator", "Communications Officer"];
    others.forEach((m, i) => {
      list.push({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        role: roleLabels[i] ?? "Member",
        profilePicture: m.profilePicture,
      });
    });
    return list;
  }, [chapter, membersRes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-tatt-lime" />
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Building2 className="h-14 w-14 mx-auto text-tatt-gray opacity-50 mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">
            {error ?? "Chapter not found"}
          </h2>
          <p className="text-tatt-gray text-sm mb-6">
            {!user?.chapterId
              ? "You are not assigned to a chapter yet. Contact support to join a chapter."
              : "We couldn't load your chapter details."}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-tatt-lime font-medium hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const subtitle = chapter.description || `Regional Hub for ${chapter.cities?.length ? chapter.cities.join(", ") : chapter.name}`;

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
              My Chapter: {chapter.name}
            </h1>
            <p className="text-tatt-gray text-sm mt-0.5">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/dashboard/chapter/rules"
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 bg-tatt-gray/20 text-foreground font-bold rounded-lg text-sm hover:bg-tatt-gray/30 transition-colors"
            >
              Chapter Rules
            </Link>
            <Link
              href="/dashboard/chapter/directory"
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 bg-tatt-lime text-tatt-black font-bold rounded-lg text-sm hover:brightness-95 transition-colors"
            >
              Chapter Directory
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Chapter Leadership */}
            <section aria-label="Chapter leadership">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground mb-4">
                <CheckCircle2 className="h-5 w-5 text-tatt-lime shrink-0" />
                Chapter Leadership
              </h2>
              <div className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
                <div className="flex gap-4 pb-2 min-w-0">
                  {leadershipList.length === 0 ? (
                    <p className="text-tatt-gray text-sm py-4">No leadership assigned yet.</p>
                  ) : (
                    leadershipList.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex-shrink-0 w-[180px] sm:w-[200px] rounded-xl border border-border bg-surface p-4 shadow-sm"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="size-16 sm:size-20 rounded-full bg-tatt-gray/20 flex items-center justify-center overflow-hidden mb-3">
                            {lead.profilePicture ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={lead.profilePicture}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-tatt-gray">
                                {lead.name.split(" ").map((n) => n[0]).join("")}
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-foreground text-sm truncate w-full">
                            {lead.name}
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${
                              lead.role === "Chapter Lead"
                                ? "text-tatt-lime font-medium"
                                : "text-tatt-gray"
                            }`}
                          >
                            {lead.role}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Chapter News */}
            <section aria-label="Chapter news">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <FolderOpen className="h-5 w-5 text-tatt-lime shrink-0" />
                  Chapter News
                </h2>
                <Link
                  href="/dashboard/feed?filter=CHAPTER"
                  className="text-sm font-medium text-tatt-lime hover:underline"
                >
                  View Archive
                </Link>
              </div>
              <div className="space-y-4">
                {news.length === 0 ? (
                  <p className="text-tatt-gray text-sm py-4">No chapter news yet.</p>
                ) : (
                  news.map((post) => (
                    <article
                      key={post.id}
                      className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm"
                    >
                      {post.mediaUrls?.[0] && (
                        <div className="aspect-video bg-tatt-black relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.mediaUrls[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-tatt-lime text-tatt-black text-xs font-bold px-2 py-0.5 rounded">
                            {getPostTag(post)}
                          </span>
                          <span className="text-tatt-gray text-xs">
                            {formatNewsDate(post.createdAt)}
                          </span>
                        </div>
                        <h3 className="font-bold text-foreground mb-2 line-clamp-2">
                          {post.title || "Untitled"}
                        </h3>
                        <p className="text-tatt-gray text-sm line-clamp-2 mb-4">
                          {post.isPremiumLocked
                            ? "Upgrade to view this content."
                            : (post.content ?? "").replace(/<[^>]*>/g, "").slice(0, 150)}
                          ...
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <span className="size-6 rounded-full bg-tatt-bronze/30" />
                            <span className="size-6 rounded-full bg-tatt-gray/30" />
                            <span className="size-6 rounded-full bg-tatt-gray/30 text-xs flex items-center justify-center text-tatt-gray">
                              +{post.likesCount + post.commentsCount}
                            </span>
                          </div>
                          <Link
                            href="/dashboard/feed"
                            className="text-sm font-medium text-tatt-lime hover:underline"
                          >
                            Read Full Article &gt;
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Local Events */}
            <section aria-label="Local events" className="bg-surface rounded-xl border border-border p-4 sm:p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground mb-4">
                <Calendar className="h-5 w-5 text-tatt-lime shrink-0" />
                Local Events
              </h2>
              <div className="space-y-4">
                {localEvents.length === 0 ? (
                  <p className="text-tatt-gray text-sm">No upcoming local events.</p>
                ) : (
                  localEvents.map((event) => {
                    const loc = event.locations?.find((l) => l.chapterId === user?.chapterId);
                    const isVirtual = loc?.address?.toLowerCase().includes("virtual") ?? false;
                    return (
                      <Link
                        key={event.id}
                        href={`/dashboard/events/${event.id}`}
                        className="block rounded-lg border border-border bg-background p-3 hover:border-tatt-lime/50 transition-colors"
                      >
                        <p className="text-tatt-lime font-bold text-sm mb-1">
                          {formatEventDate(event.dateTime)}
                        </p>
                        <p className="font-medium text-foreground text-sm">{event.title}</p>
                        <p className="flex items-center gap-1 text-tatt-gray text-xs mt-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {isVirtual ? "TATT Virtual Hub" : loc?.address ?? "—"}
                        </p>
                        {isVirtual && (
                          <p className="text-tatt-gray text-xs mt-0.5">Virtual</p>
                        )}
                      </Link>
                    );
                  })
                )}
              </div>
              <Link
                href="/dashboard/events"
                className="mt-4 block w-full text-center min-h-[44px] py-2.5 bg-tatt-gray/20 text-foreground font-bold rounded-lg text-sm hover:bg-tatt-gray/30 transition-colors"
              >
                See All Local Events
              </Link>
            </section>

            {/* Chapter Members */}
            <section aria-label="Chapter members" className="bg-surface rounded-xl border border-border p-4 sm:p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground mb-4">
                <Users className="h-5 w-5 text-tatt-lime shrink-0" />
                Chapter Members
              </h2>
              <ul className="space-y-3">
                {(membersRes?.members ?? []).slice(0, 5).map((member) => (
                  <li key={member.id} className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-tatt-gray/20 flex items-center justify-center overflow-hidden shrink-0">
                      {member.profilePicture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.profilePicture}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-tatt-gray">
                          {member.firstName?.[0]}
                          {member.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-tatt-gray text-xs truncate">
                        {member.professionTitle ?? "Member"}
                      </p>
                    </div>
                    <div className="size-6 rounded-full bg-tatt-lime/30 flex items-center justify-center shrink-0">
                      <Users className="h-3 w-3 text-tatt-lime" />
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/chapter/directory"
                className="mt-4 block text-center text-sm font-medium text-tatt-lime hover:underline"
              >
                {membersRes && membersRes.total > 0
                  ? `Search ${membersRes.total}+ Members`
                  : "View Chapter Directory"}
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
