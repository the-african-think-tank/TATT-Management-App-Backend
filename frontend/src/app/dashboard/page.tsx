"use client";

import { useAuth } from "@/context/auth-context";
import {
    PlusCircle,
    TrendingUp,
    Network,
    Briefcase,
    Calendar,
    Stars,
    MessageSquare,
    ThumbsUp,
    MessageCircle,
    Share2,
    MemoryStick,
    Wifi,
    Download,
    GraduationCap,
    CheckCircle
} from "lucide-react";

export default function DashboardPage() {
    const { user } = useAuth();

    // Default to mock data if user is not fully loaded yet to preserve layout preview.
    const firstName = user?.firstName || "Abebe";
    const communityTier = user?.communityTier || "FREE";
    const displayTierName = communityTier.charAt(0).toUpperCase() + communityTier.slice(1).toLowerCase() + " Member";

    // We'll calculate a mock ID based on the user's ID or fallback.
    const memberId = user?.id ? `TATT-${user.id.substring(0, 8).toUpperCase()}` : "TATT-LG-2024-0842";

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-foreground">
                        Welcome back, {firstName}!
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="bg-[#5d4037] px-3 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-wider">
                            {displayTierName}
                        </span>
                        <span className="text-tatt-gray text-sm font-medium">• 14 days until next networking mixer</span>
                    </div>
                </div>
                <button className="bg-tatt-lime text-tatt-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-tatt-lime/20 hover:scale-[1.02] transition-transform active:scale-95">
                    <PlusCircle className="h-5 w-5" />
                    Post Update
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface dark:bg-black p-6 rounded-xl border border-border shadow-sm flex items-center justify-between hover:border-tatt-lime transition-colors">
                    <div>
                        <p className="text-tatt-gray text-xs font-bold uppercase tracking-wider mb-1">Connections</p>
                        <h3 className="text-3xl font-black text-foreground">1,842</h3>
                        <p className="text-green-600 text-xs font-bold mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> +48 this week
                        </p>
                    </div>
                    <div className="size-12 bg-tatt-lime/10 rounded-lg flex items-center justify-center text-tatt-lime-dark">
                        <Network className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-surface dark:bg-black p-6 rounded-xl border border-border shadow-sm flex items-center justify-between hover:border-tatt-lime transition-colors">
                    <div>
                        <p className="text-tatt-gray text-xs font-bold uppercase tracking-wider mb-1">Active Jobs</p>
                        <h3 className="text-3xl font-black text-foreground">124</h3>
                        <p className="text-tatt-lime-dark text-xs font-bold mt-1">12 new matches for you</p>
                    </div>
                    <div className="size-12 bg-tatt-lime/10 rounded-lg flex items-center justify-center text-tatt-lime-dark">
                        <Briefcase className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-surface dark:bg-black p-6 rounded-xl border border-border shadow-sm flex items-center justify-between hover:border-tatt-lime transition-colors">
                    <div>
                        <p className="text-tatt-gray text-xs font-bold uppercase tracking-wider mb-1">Workshops</p>
                        <h3 className="text-3xl font-black text-foreground">04</h3>
                        <p className="text-tatt-gray text-xs font-bold mt-1">Scheduled this month</p>
                    </div>
                    <div className="size-12 bg-tatt-lime/10 rounded-lg flex items-center justify-center text-tatt-lime-dark">
                        <Calendar className="h-6 w-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left & Middle: Feed & Business Spotlight */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Business Spotlight */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-black flex items-center gap-2 text-foreground">
                                <Stars className="text-tatt-lime h-6 w-6" />
                                Business Spotlight
                            </h3>
                            <a className="text-tatt-lime-dark text-sm font-bold hover:underline" href="#">View All</a>
                        </div>
                        <div className="bg-tatt-lime/5 border border-tatt-lime/20 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-tatt-lime/20 text-tatt-lime-dark px-3 py-1 rounded text-[10px] font-black uppercase">
                                    Verified Member Business
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
                                <div className="size-20 bg-white rounded-xl shadow-md p-2 flex items-center justify-center overflow-hidden shrink-0">
                                    <div className="w-full h-full bg-tatt-lime/20 rounded-lg flex items-center justify-center">
                                        <span className="font-black text-tatt-lime-dark">ECO</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black text-foreground">EcoTech Solutions Ltd</h4>
                                    <p className="text-foreground/70 text-sm max-w-xl">
                                        Providing sustainable solar irrigation systems for small-scale farmers across the Sahel region. Looking for partners in logistics and supply chain management.
                                    </p>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <button className="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-black/80 transition-colors">
                                            Connect with Founder
                                        </button>
                                        <button className="bg-surface border border-border text-foreground text-xs font-bold px-4 py-2 rounded-lg hover:bg-black/5 transition-colors">
                                            Learn More
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 size-40 bg-tatt-lime/10 rounded-full blur-3xl group-hover:bg-tatt-lime/20 transition-all duration-500"></div>
                        </div>
                    </section>

                    {/* Community Feed Preview */}
                    <section>
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <h3 className="text-xl font-black flex items-center gap-2 text-foreground">
                                <MessageSquare className="text-tatt-lime h-6 w-6" />
                                Recent Discussions
                            </h3>
                            <div className="flex gap-2">
                                <button className="bg-surface dark:bg-black px-3 py-1.5 rounded-lg border border-border text-xs font-bold shadow-sm">Hot</button>
                                <button className="bg-background dark:bg-black/30 px-3 py-1.5 rounded-lg text-xs font-bold text-tatt-gray hover:text-foreground">New</button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Discussion Item 1 */}
                            <div className="bg-surface dark:bg-black p-4 rounded-xl border border-border hover:shadow-md hover:border-tatt-lime/30 transition-all cursor-pointer">
                                <div className="flex gap-4">
                                    <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-800 shrink-0">C</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1 gap-2">
                                            <h5 className="font-bold text-sm text-foreground truncate">Opportunities in West African Fintech</h5>
                                            <span className="text-[10px] text-tatt-gray whitespace-nowrap">2h ago</span>
                                        </div>
                                        <p className="text-sm text-tatt-gray line-clamp-2">Has anyone else noticed the surge in cross-border payment platforms? I'm curious about the regulatory hurdles in Francophone markets...</p>
                                        <div className="flex gap-4 mt-3">
                                            <div className="flex items-center gap-1.5 text-tatt-gray hover:text-tatt-lime-dark text-xs font-bold transition-colors">
                                                <ThumbsUp className="h-4 w-4" /> 24
                                            </div>
                                            <div className="flex items-center gap-1.5 text-tatt-gray hover:text-foreground text-xs font-bold transition-colors">
                                                <MessageCircle className="h-4 w-4" /> 12
                                            </div>
                                            <div className="flex items-center gap-1.5 text-tatt-gray hover:text-foreground text-xs font-bold transition-colors ml-auto">
                                                <Share2 className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Discussion Item 2 */}
                            <div className="bg-surface dark:bg-black p-4 rounded-xl border border-border hover:shadow-md hover:border-tatt-lime/30 transition-all cursor-pointer">
                                <div className="flex gap-4">
                                    <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-800 shrink-0">S</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1 gap-2">
                                            <h5 className="font-bold text-sm text-foreground truncate">African Continental Free Trade Area (AfCFTA) Impact</h5>
                                            <span className="text-[10px] text-tatt-gray whitespace-nowrap">5h ago</span>
                                        </div>
                                        <p className="text-sm text-tatt-gray line-clamp-2">Let's discuss the practical implications for SME exports. Who has successfully leveraged the new framework?</p>
                                        <div className="flex gap-4 mt-3">
                                            <div className="flex items-center gap-1.5 text-tatt-gray hover:text-tatt-lime-dark text-xs font-bold transition-colors">
                                                <ThumbsUp className="h-4 w-4" /> 156
                                            </div>
                                            <div className="flex items-center gap-1.5 text-tatt-gray hover:text-foreground text-xs font-bold transition-colors">
                                                <MessageCircle className="h-4 w-4" /> 42
                                            </div>
                                            <div className="flex items-center gap-1.5 text-tatt-gray hover:text-foreground text-xs font-bold transition-colors ml-auto">
                                                <Share2 className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-4 py-3 border-2 border-dashed border-border rounded-xl text-sm font-bold text-tatt-gray hover:border-tatt-lime hover:text-tatt-lime-dark transition-all">
                            Load more discussions
                        </button>
                    </section>
                </div>

                {/* Right Column: Member ID Card & Premium Perks */}
                <div className="space-y-8">
                    {/* Digital ID Card */}
                    <section>
                        <h3 className="text-xl font-black mb-4 text-foreground">Digital Identity</h3>
                        <div className="bg-gradient-to-br from-[#23230f] to-[#3a3a1a] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                            {/* Chip & NFC Icon */}
                            <div className="flex justify-between items-start mb-8">
                                <div className="size-10 bg-yellow-600/30 rounded-md border border-yellow-500/50 flex items-center justify-center">
                                    <MemoryStick className="text-yellow-500 h-6 w-6" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wifi className="text-tatt-lime h-6 w-6 transform rotate-90" />
                                    <span className="font-black text-xl italic tracking-tighter text-white">TATT</span>
                                </div>
                            </div>

                            <div className="flex gap-4 mb-8">
                                <div className="size-20 rounded-lg border-2 border-tatt-lime overflow-hidden shrink-0 shadow-lg bg-black flex justify-center items-center text-tatt-lime font-black text-3xl">
                                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black leading-none text-white">{firstName} {user?.lastName || 'Bikila'}</h4>
                                    <p className="text-[10px] text-tatt-lime font-black uppercase tracking-widest">{displayTierName}</p>
                                    <div className="flex items-center gap-2 pt-2">
                                        <div className="size-5 rounded-full overflow-hidden bg-green-600">
                                            {/* Mock flag dot */}
                                        </div>
                                        <p className="text-xs font-medium text-white/80">Lagos Chapter</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Member ID</p>
                                    <p className="text-sm font-mono tracking-widest text-tatt-lime">{memberId}</p>
                                </div>
                                <div className="bg-white p-1 rounded-sm">
                                    <div className="size-10 bg-black/5 flex items-center justify-center">
                                        <span className="text-[8px] text-tatt-gray">QR</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Overlay Shine */}
                            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:left-[100%] transition-all duration-1000"></div>
                        </div>

                        <button className="w-full mt-4 flex items-center justify-center gap-2 text-tatt-gray text-xs font-bold hover:text-foreground transition-colors group">
                            <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                            Download Digital Pass
                        </button>
                    </section>

                    {/* Premium Perks Summary */}
                    <section className="bg-surface dark:bg-black p-6 rounded-2xl border border-tatt-lime/30 shadow-sm relative overflow-hidden group hover:border-tatt-lime transition-all">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-foreground">
                                <GraduationCap className="text-tatt-lime h-6 w-6" />
                                DBU Career Academy Benefit
                            </h3>

                            <div className="bg-tatt-lime/10 p-4 rounded-xl border border-tatt-lime/20 mb-4 transition-colors group-hover:bg-tatt-lime/15">
                                <p className="text-sm font-bold mb-1 text-foreground">Exclusive Academy Access</p>
                                <p className="text-xs text-tatt-gray mb-2">
                                    Get full access for just <span className="text-foreground dark:text-white font-bold">$99/year</span> (Regularly $399 — a <span className="text-green-600 font-bold dark:text-green-400">$300 savings</span>).
                                </p>
                                <p className="text-[10px] font-bold uppercase text-tatt-gray mb-2">Certificate Pathways:</p>
                                <ul className="grid grid-cols-1 gap-1.5 text-[11px] font-medium text-[#5d4037] dark:text-tatt-lime/80">
                                    <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-tatt-lime"></div> Project Management</li>
                                    <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-tatt-lime"></div> Leadership & Management</li>
                                    <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-tatt-lime"></div> Data & Technology</li>
                                    <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-tatt-lime"></div> Business & Finance</li>
                                    <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-tatt-lime"></div> Entrepreneurship</li>
                                </ul>
                                <button className="mt-5 w-full bg-tatt-lime text-tatt-black text-xs font-black py-2.5 rounded-lg hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all">
                                    Claim Your License
                                </button>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs text-tatt-gray font-bold uppercase tracking-wider">Your Member Benefits:</p>
                                <ul className="space-y-2.5">
                                    <li className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                                        <CheckCircle className="text-tatt-lime h-4 w-4 shrink-0" /> TATT Growth Mindset Mixers
                                    </li>
                                    <li className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                                        <CheckCircle className="text-tatt-lime h-4 w-4 shrink-0" /> DBU Career Academy License
                                    </li>
                                    <li className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                                        <CheckCircle className="text-tatt-lime h-4 w-4 shrink-0" /> Discounts from partner organizations
                                    </li>
                                    <li className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                                        <CheckCircle className="text-tatt-lime h-4 w-4 shrink-0" /> Annual Members-Only Appreciation Event
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute -top-10 -right-10 size-32 bg-tatt-lime/5 rounded-full group-hover:scale-110 group-hover:bg-tatt-lime/10 transition-all duration-700"></div>
                    </section>
                </div>
            </div>
        </div>
    );
}
