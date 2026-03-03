"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from "@/services/api";
import { useAuth } from "@/context/auth-context";
import { formatDistanceToNow } from "date-fns";
import { Lock, Share2, ThumbsUp, MessageSquare, ArrowLeft, UserPlus, LogIn } from "lucide-react";
import { Navbar, Footer } from "@/components/organisms";


interface Post {
    id: string;
    title: string | null;
    content: string | null;
    contentFormat: string;
    isPremium: boolean;
    isPremiumLocked: boolean;
    createdAt: string;
    author: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        communityTier: string;
    };
    chapter: { name: string } | null;
    likesCount: number;
    commentsCount: number;
}

export default function SharePostPage() {
    const { postId } = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/feed/${postId}`);
                setPost(res.data);
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (postId) fetchPost();
    }, [postId]);

    // If already authenticated, redirect to the dashboard feed (maybe scroll to that post)
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            // router.push(`/dashboard/feed?post=${postId}`);
        }
    }, [isAuthenticated, authLoading, postId, router]);

    if (isLoading || authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tatt-lime"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-black mb-4">Post not found</h1>
                <Link href="/" className="text-tatt-lime hover:underline flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Go back
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-tatt-lime selection:text-black">
            {/* Global Nav */}
            <Navbar />


            <main className="max-w-3xl mx-auto px-4 py-12">
                <Link href="/" className="inline-flex items-center gap-2 text-tatt-gray hover:text-tatt-lime font-bold text-xs uppercase tracking-widest mb-8 transition-colors group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Discover More Insights
                </Link>

                <article className="bg-surface rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
                    {post.isPremium && (
                        <div className="bg-gradient-to-r from-tatt-lime via-tatt-lime/50 to-transparent h-1.5" />
                    )}

                    <div className="p-8 lg:p-12">
                        {/* Author Header */}
                        <div className="flex items-center gap-5 mb-10">
                            <div className="size-16 rounded-full border-2 border-tatt-lime/30 overflow-hidden bg-background p-1">
                                <div className="size-full rounded-full overflow-hidden relative">
                                    {post.author.profilePicture ? (
                                        <Image src={post.author.profilePicture} alt={post.author.firstName} fill className="object-cover" />
                                    ) : (
                                        <div className="size-full flex items-center justify-center font-black text-tatt-lime bg-black/5 text-xl">
                                            {post.author.firstName.charAt(0)}{post.author.lastName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-black">{post.author.firstName} {post.author.lastName}</h3>
                                    <span className="bg-tatt-lime/10 text-tatt-lime text-[10px] font-black px-2.5 py-1 rounded border border-tatt-lime/20 uppercase tracking-widest">
                                        {post.author.communityTier}
                                    </span>
                                </div>
                                <p className="text-xs text-tatt-gray font-bold uppercase tracking-[0.2em] mt-1.5">
                                    {post.chapter?.name || 'Global'} Chapter • {formatDistanceToNow(new Date(post.createdAt))} ago
                                </p>
                            </div>
                        </div>

                        {/* Post Body */}
                        <div className="space-y-6">
                            {post.title && (
                                <h1 className="text-3xl lg:text-4xl font-black tracking-tighter leading-[1.1] text-foreground">{post.title}</h1>
                            )}

                            {post.isPremiumLocked ? (
                                <div className="space-y-8">
                                    <div className="text-foreground/90 text-lg leading-relaxed italic opacity-50 select-none">
                                        {post.content ? post.content : "The strategic wisdom contained in this insight is reserved for the TATT community elite..."}
                                    </div>

                                    <div className="bg-black/5 dark:bg-white/5 rounded-[2rem] p-10 border border-dashed border-border flex flex-col items-center text-center space-y-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Lock className="size-32 rotate-12" />
                                        </div>
                                        <div className="size-20 rounded-full bg-tatt-lime/10 border border-tatt-lime/20 flex items-center justify-center text-tatt-lime relative z-10 shadow-inner">
                                            <Lock className="size-10" />
                                        </div>
                                        <div className="max-w-md relative z-10">
                                            <h4 className="text-2xl font-black mb-2 uppercase tracking-tighter italic">Strategic Intelligence Locked</h4>
                                            <p className="text-tatt-gray font-medium leading-relaxed">
                                                This high-value resource is exclusive to TATT Ubuntu, Imani, and Kiongozi members. Join the movement to unlock full access and participate in the dialogue.
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center relative z-10">
                                            <Link href="/signup" className="bg-tatt-lime text-black font-black px-10 py-4 rounded-2xl text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-tatt-lime/20 flex items-center justify-center gap-2 whitespace-nowrap">
                                                <UserPlus className="h-4 w-4" /> Join TATT Community
                                            </Link>
                                            <Link href="/" className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 text-foreground font-black px-10 py-4 rounded-2xl text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                                                <LogIn className="h-4 w-4" /> Members Sign In
                                            </Link>
                                        </div>

                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="text-foreground/90 text-lg lg:text-xl leading-relaxed whitespace-pre-wrap break-words font-medium"
                                    dangerouslySetInnerHTML={{ __html: post.content || "" }}
                                />
                            )}
                        </div>

                        {/* Interactions Mock */}
                        <div className="flex items-center justify-between pt-10 mt-12 border-t border-border">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-tatt-gray">
                                    <ThumbsUp className="h-5 w-5" />
                                    <span className="text-sm font-black">{post.likesCount}</span>
                                </div>
                                <div className="flex items-center gap-2 text-tatt-gray">
                                    <MessageSquare className="h-5 w-5" />
                                    <span className="text-sm font-black">{post.commentsCount}</span>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 text-tatt-lime hover:scale-105 transition-all">
                                <Share2 className="h-5 w-5" />
                                <span className="text-sm font-black uppercase tracking-widest">Share Insight</span>
                            </button>
                        </div>
                    </div>
                </article>

                {/* Engagement Section for Non-Auth */}
                {!isAuthenticated && (
                    <div className="mt-12 text-center space-y-6">
                        <h2 className="text-2xl font-black tracking-tighter uppercase italic">Ready to Shape the Future of Africa?</h2>
                        <p className="text-tatt-gray max-w-xl mx-auto font-medium">
                            Join thousands of African professionals, visionaries, and leaders in the world's premier strategic networking platform.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                            {[
                                { title: "Elite Network", desc: "Connect with vetted pan-African leaders." },
                                { title: "Strategic Insights", desc: "Access premium resources and guides." },
                                { title: "Global Chapters", desc: "Participate in exclusive local events." }
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 text-left">
                                    <h4 className="font-black text-tatt-lime mb-2 text-sm uppercase tracking-widest">{item.title}</h4>
                                    <p className="text-xs text-tatt-gray leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Global Footer */}
            <Footer />

        </div>
    );
}
