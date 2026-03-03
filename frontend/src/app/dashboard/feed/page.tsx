"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Rss,
    Building2,
    Badge,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { FeedPostCard } from "@/components/feed/feed-post-card";
import { CreatePostForm } from "@/components/feed/create-post-form";
import type { FeedFilter, FeedPost, FeedMeta, FeedResponse } from "@/types/feed";

export default function FeedPage() {
    const { user } = useAuth();
    const [feed, setFeed] = useState<FeedPost[]>([]);
    const [meta, setMeta] = useState<FeedMeta | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FeedFilter>("ALL");
    const [page, setPage] = useState(1);
    const [connectionCount, setConnectionCount] = useState<number>(0);
    const limit = 20;

    const fetchFeed = async () => {
        setLoading(true);
        try {
            const { data } = await api.get<FeedResponse>("/feed", {
                params: { filter, page, limit },
            });
            setFeed(data.data ?? []);
            setMeta(data.meta ?? null);
            setMessage(data.message ?? null);
        } catch (err: unknown) {
            const msg = err && typeof err === "object" && "response" in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : "Failed to load feed.";
            setMessage(msg ?? "Failed to load feed.");
            setFeed([]);
            setMeta(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, [filter, page]);

    useEffect(() => {
        const fetchNetwork = async () => {
            try {
                const { data } = await api.get<Array<{ connectionId: string }>>("/connections/network");
                setConnectionCount(Array.isArray(data) ? data.length : 0);
            } catch {
                setConnectionCount(0);
            }
        };
        if (user?.id) fetchNetwork();
    }, [user?.id]);

    const handlePostCreated = () => {
        setPage(1);
        fetchFeed();
    };

    const handleLikeToggle = (postId: string) => {
        setFeed((prev) =>
            prev.map((p) => {
                if (p.id !== postId) return p;
                return {
                    ...p,
                    isLikedByMe: !p.isLikedByMe,
                    likesCount: p.isLikedByMe ? p.likesCount - 1 : p.likesCount + 1,
                };
            })
        );
    };

    const handleCommentAdded = (postId: string) => {
        setFeed((prev) =>
            prev.map((p) =>
                p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
            )
        );
    };

    const tier = user?.communityTier || "FREE";
    const displayTierName =
        tier === "KIONGOZI"
            ? "Kiongozi Member"
            : `${tier.charAt(0)}${tier.slice(1).toLowerCase()} Member`;
    const memberId = user?.tattMemberId || (user?.id ? `TATT-${user.id.slice(0, 8).toUpperCase()}` : "TATT-0000");
    const fullName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`.toUpperCase()
        : "MEMBER";
    const initials = user?.firstName && user?.lastName
        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
        : "M";

    return (
        <div className="min-h-screen w-full bg-background text-foreground">
            {/* Hero / Banner — responsive height & padding */}
            <div className="relative w-full h-36 sm:h-40 md:h-48 bg-tatt-black overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tatt-black/80 to-transparent" />
                <div className="relative z-10 flex items-end h-full px-4 sm:px-6 md:px-8 lg:px-12 pb-4 sm:pb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="size-10 sm:size-12 rounded-lg sm:rounded-xl bg-tatt-lime flex items-center justify-center text-tatt-black shrink-0">
                            <Rss className="h-5 w-5 sm:h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-black text-tatt-white tracking-tight truncate">TATT Feed</h1>
                            <p className="text-tatt-white/80 text-xs sm:text-sm font-medium">Community insights, resources &amp; discussions</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8 pb-8 sm:pb-12 max-w-[1920px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch lg:items-start">
                    {/* Main content — takes space first on mobile */}
                    <div className="flex-grow space-y-4 sm:space-y-6 min-w-0 w-full">
                        {/* Filter tabs — touch-friendly on mobile */}
                        <div className="bg-surface rounded-xl border border-border p-2 sm:p-3 flex flex-wrap gap-2">
                            {(["ALL", "CHAPTER", "PREMIUM"] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => {
                                        setFilter(f);
                                        setPage(1);
                                    }}
                                    className={`min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-bold transition-colors touch-manipulation ${
                                        filter === f
                                            ? "bg-tatt-lime text-tatt-black"
                                            : "bg-background text-foreground hover:bg-border"
                                    }`}
                                >
                                    {f === "ALL" ? "All Posts" : f === "CHAPTER" ? "My Chapter" : "Premium"}
                                </button>
                            ))}
                        </div>

                        <CreatePostForm onCreated={handlePostCreated} />

                        {/* Feed list */}
                        <div className="bg-surface rounded-xl border border-border overflow-hidden">
                            <div className="p-4 sm:p-6 border-b border-border flex flex-wrap justify-between items-center gap-2">
                                <h2 className="text-base sm:text-lg font-bold text-foreground">Recent contributions</h2>
                                {meta && (
                                    <span className="text-xs sm:text-sm text-tatt-gray font-medium">
                                        {meta.total} post{meta.total !== 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>

                            {message && !loading && (
                                <div className="p-4 sm:p-6 text-center text-tatt-gray font-medium text-sm sm:text-base">{message}</div>
                            )}

                            {loading ? (
                                <div className="flex items-center justify-center py-12 sm:py-16">
                                    <Loader2 className="h-8 w-8 animate-spin text-tatt-lime" />
                                </div>
                            ) : feed.length === 0 ? (
                                <div className="p-8 sm:p-12 text-center text-tatt-gray">
                                    <Rss className="h-10 w-10 sm:h-12 w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                                    <p className="font-medium text-sm sm:text-base">No posts yet.</p>
                                    <p className="text-xs sm:text-sm mt-1">Create the first post or try another filter.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {feed.map((post) => (
                                        <FeedPostCard
                                            key={post.id}
                                            post={post}
                                            onLikeToggle={() => api.post(`/feed/${post.id}/like`).then(() => handleLikeToggle(post.id))}
                                            onCommentAdded={() => handleCommentAdded(post.id)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Pagination — stacks on very small screens */}
                            {meta && meta.totalPages > 1 && (
                                <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                        className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-1 text-sm font-bold text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:text-tatt-lime touch-manipulation order-2 sm:order-1"
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Previous
                                    </button>
                                    <span className="text-sm text-tatt-gray order-1 sm:order-2">
                                        Page {meta.page} of {meta.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                                        disabled={page >= meta.totalPages}
                                        className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-1 text-sm font-bold text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:text-tatt-lime touch-manipulation order-3"
                                    >
                                        Next <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right sidebar — full width on mobile/tablet, fixed width on lg+ */}
                    <aside className="w-full lg:w-80 xl:w-[22rem] space-y-4 sm:space-y-6 shrink-0 lg:sticky lg:top-24">
                        {/* Digital Identity Card */}
                        <div className="bg-surface rounded-xl border border-border p-4 sm:p-6">
                            <h3 className="text-xs sm:text-sm font-bold text-tatt-gray uppercase tracking-widest mb-3 sm:mb-4">
                                Digital Identity Card
                            </h3>
                            <div className="relative w-full max-w-[320px] mx-auto lg:max-w-none aspect-[1.6/1] bg-gradient-to-br from-tatt-black to-tatt-green-deep rounded-xl p-4 sm:p-5 text-tatt-white overflow-hidden shadow-xl">
                                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-tatt-lime/20 rounded-full blur-2xl sm:blur-3xl -mr-8 sm:-mr-10 -mt-8 sm:-mt-10" />
                                <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-tatt-lime/10 rounded-full blur-xl sm:blur-2xl -ml-4 sm:-ml-5 -mb-4 sm:-mb-5" />
                                <div className="relative h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-1.5 sm:gap-2 items-center">
                                            <div className="bg-tatt-lime size-5 sm:size-6 rounded-full flex items-center justify-center text-tatt-black shrink-0">
                                                <Building2 className="h-2.5 w-2.5 sm:h-3 w-3" />
                                            </div>
                                            <span className="text-[9px] sm:text-[10px] font-bold tracking-widest">TATT PASS</span>
                                        </div>
                                    </div>
                                    <div className="space-y-0.5 sm:space-y-1">
                                        <p className="text-[10px] sm:text-xs font-medium text-tatt-white/60">{displayTierName}</p>
                                        <p className="text-sm sm:text-lg font-bold leading-none tracking-tight break-words">{fullName}</p>
                                    </div>
                                    <div className="flex justify-between items-end gap-2">
                                        <span className="text-[8px] sm:text-[9px] font-mono opacity-70 truncate">ID: {memberId}</span>
                                        <div className="size-6 sm:size-8 bg-tatt-white p-0.5 rounded flex items-center justify-center shrink-0">
                                            <span className="text-tatt-black text-[10px] sm:text-xs font-mono">QR</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-tatt-gray text-center font-medium italic">
                                Verified by TATT
                            </p>
                        </div>

                        {/* Network widget */}
                        <div className="bg-surface rounded-xl border border-border p-4 sm:p-6">
                            <div className="flex justify-between items-center mb-3 sm:mb-4">
                                <h3 className="text-xs sm:text-sm font-bold text-tatt-gray uppercase tracking-widest">Network</h3>
                                <span className="text-lg sm:text-xl font-bold text-foreground">{connectionCount}</span>
                            </div>
                            <p className="text-xs text-tatt-gray mb-3 sm:mb-4 leading-relaxed">
                                Your professional connections across the TATT community.
                            </p>
                            <Link
                                href="/dashboard/network"
                                className="block w-full min-h-[44px] sm:min-h-0 py-2.5 border border-border rounded-lg text-sm font-bold text-center hover:bg-background text-foreground transition-colors flex items-center justify-center"
                            >
                                View All Connections
                            </Link>
                        </div>

                        {/* Tier status */}
                        <div className="bg-surface rounded-xl border border-border p-4 sm:p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-9 sm:size-10 rounded-lg bg-tatt-lime/10 flex items-center justify-center text-tatt-lime shrink-0">
                                    <ShieldCheck className="h-4 w-4 sm:h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] sm:text-xs font-bold text-tatt-gray uppercase tracking-wider">Tier Status</p>
                                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">{displayTierName}</p>
                                </div>
                            </div>
                            <div className="w-full bg-border h-1.5 rounded-full overflow-hidden mt-2">
                                <div
                                    className="bg-tatt-lime h-full rounded-full transition-all"
                                    style={{
                                        width: tier === "KIONGOZI" ? "100%" : tier === "IMANI" ? "75%" : tier === "UBUNTU" ? "50%" : "25%",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Quick info grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                            <div className="bg-surface p-4 sm:p-5 rounded-xl border border-border flex items-center gap-3 sm:gap-4">
                                <div className="size-10 sm:size-12 rounded-lg bg-tatt-lime/10 flex items-center justify-center text-tatt-lime shrink-0">
                                    <Badge className="h-5 w-5 sm:h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] sm:text-xs text-tatt-gray font-bold uppercase tracking-wider">Member ID</p>
                                    <p className="text-sm sm:text-lg font-bold text-foreground truncate">#{memberId}</p>
                                </div>
                            </div>
                            <div className="bg-surface p-4 sm:p-5 rounded-xl border border-border flex items-center gap-3 sm:gap-4">
                                <div className="size-10 sm:size-12 rounded-lg bg-tatt-lime/10 flex items-center justify-center text-tatt-lime shrink-0">
                                    <Building2 className="h-5 w-5 sm:h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] sm:text-xs text-tatt-gray font-bold uppercase tracking-wider">Chapter</p>
                                    <p className="text-sm sm:text-lg font-bold text-foreground truncate">{user?.chapterName || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
