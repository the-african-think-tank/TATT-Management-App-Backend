"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    MapPin,
    Building2,
    Calendar,
    Briefcase,
    Lightbulb,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Mail,
    UserPlus,
    UserCheck,
    Clock,
    QrCode,
    CreditCard,
    X,
    Send,
    AlertCircle,
    Linkedin
} from "lucide-react";
import api from "@/services/api";
import MembershipCard from "@/components/molecules/MembershipCard";
import { useAuth } from "@/context/auth-context";

interface MemberProfile {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    professionTitle: string | null;
    companyName: string | null;
    location: string | null;
    tattMemberId: string;
    communityTier: string;
    industry: string | null;
    chapterId: string | null;
    professionalHighlight: string | null;
    chapter: {
        id: string;
        name: string;
        code: string;
    } | null;
    createdAt?: string;
    linkedInProfileUrl?: string;
}

const TIER_BADGES: Record<string, { label: string; classes: string }> = {
    KIONGOZI: { label: "Kiongozi", classes: "bg-tatt-lime text-tatt-black" },
    IMANI: { label: "Imani", classes: "bg-slate-200 text-neutral-700" },
    UBUNTU: { label: "Ubuntu", classes: "bg-neutral-100 border border-border text-tatt-gray" },
    FREE: { label: "Free", classes: "bg-neutral-100 border border-border text-tatt-gray" },
};

export default function MemberProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const id = params.id as string;

    const [member, setMember] = useState<MemberProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<any>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [connectMessage, setConnectMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const openModal = () => {
        setModalOpen(true);
        setConnectMessage("");
        setSendError(null);
    };

    const closeModal = () => {
        setModalOpen(false);
        setConnectMessage("");
        setSendError(null);
    };

    const handleSendInvite = async () => {
        if (!member) return;
        if (connectMessage.trim().length < 20) {
            setSendError("Please write at least 20 characters so the recipient knows why you want to connect.");
            return;
        }
        setSending(true);
        setSendError(null);
        try {
            await api.post("/connections/request", {
                recipientId: member.id,
                message: connectMessage.trim(),
            });
            setStatus({ status: "PENDING", initiatedBy: "ME" });
            closeModal();
        } catch (err: any) {
            setSendError(err.response?.data?.message || "Failed to send connection request.");
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, statusRes] = await Promise.all([
                    api.get(`/members/${id}`),
                    api.get(`/connections/status/${id}`)
                ]);
                setMember(profileRes.data);
                setStatus(statusRes.data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProfile();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-80px)] w-full flex-col items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 text-tatt-lime animate-spin mb-4" />
                <p className="text-tatt-gray font-bold">Loading member profile...</p>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="flex h-[calc(100vh-80px)] w-full flex-col items-center justify-center bg-background">
                <h2 className="text-2xl font-black mb-2 text-foreground">Member Not Found</h2>
                <p className="text-tatt-gray mb-6">This member could not be found or their profile is private.</p>
                <button onClick={() => router.back()} className="px-6 py-2 bg-foreground text-background font-bold rounded-lg hover:brightness-110">
                    Go Back
                </button>
            </div>
        );
    }

    const fallbackTier = { label: "Free", classes: "bg-neutral-100 border border-border text-tatt-gray" };
    const tier = TIER_BADGES[member.communityTier] || fallbackTier;

    return (
        <>
            <div className="min-h-screen bg-surface font-sans text-foreground">
                {/* Hero Section */}
                <div className="relative w-full h-48 lg:h-64 bg-tatt-gray">
                    <div className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')" }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                    <div className="absolute top-6 left-6 z-10">
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-white bg-black/40 hover:bg-black/60 px-4 py-2 rounded-full backdrop-blur-md transition-colors text-sm font-bold">
                            <ArrowLeft className="h-4 w-4" /> Back to Network
                        </button>
                    </div>
                </div>

                <div className="px-4 lg:px-12 -mt-20 relative z-10 pb-12 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left Column: Main Profile Info */}
                    <div className="flex-grow w-full space-y-6">
                        {/* Profile Header Card */}
                        <div className="bg-background rounded-2xl shadow-sm border border-border p-6 lg:p-8">
                            <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                                    <div className="relative shrink-0">
                                        <div className="size-32 lg:size-40 rounded-2xl border-4 border-background shadow-md bg-cover bg-center bg-surface flex items-center justify-center overflow-hidden">
                                            {member.profilePicture ? (
                                                <Image src={member.profilePicture} alt={`${member.firstName} ${member.lastName}`} fill className="object-cover" />
                                            ) : (
                                                <span className="text-4xl lg:text-6xl font-black text-tatt-lime-dark">
                                                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-3 -right-3 bg-tatt-lime text-tatt-black text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 border border-black/10">
                                            <CheckCircle2 className="h-3 w-3" /> VERIFIED
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black tracking-tight text-foreground">{member.firstName} {member.lastName}</h2>
                                        <p className="text-tatt-gray font-medium">
                                            {member.professionTitle ? member.professionTitle : "No professional title"}
                                            {member.companyName && ` • ${member.companyName}`}
                                        </p>
                                        <div className="flex items-center gap-3 pt-2">
                                            {member.chapter ? (
                                                <div className="flex flex-wrap gap-2 text-sm font-bold text-foreground">
                                                    <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-tatt-lime" /> {member.chapter.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                                                    <MapPin className="h-4 w-4 text-tatt-lime" /> {member.location || 'Location not specified'}
                                                </div>
                                            )}

                                            {member.linkedInProfileUrl && (
                                                <a
                                                    href={member.linkedInProfileUrl.startsWith('http') ? member.linkedInProfileUrl : `https://linkedin.com/in/${member.linkedInProfileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-sm font-bold text-[#0077b5] hover:underline"
                                                >
                                                    <Linkedin className="h-4 w-4" /> LinkedIn
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto mt-6 md:mt-0">
                                    {status?.status === "ACCEPTED" ? (
                                        <>
                                            <button className="flex-1 md:flex-none px-6 py-2.5 bg-green-500/10 text-green-600 font-black rounded-xl text-sm justify-center gap-2 flex items-center cursor-default">
                                                <UserCheck className="h-4 w-4" /> Connected
                                            </button>
                                            <button className="flex-1 md:flex-none px-6 py-2.5 bg-surface text-foreground font-black rounded-xl text-sm hover:brightness-95 transition-all justify-center border border-border gap-2 flex items-center">
                                                <Mail className="h-4 w-4" /> Message
                                            </button>
                                        </>
                                    ) : status?.status === "PENDING" ? (
                                        <button disabled className="flex-1 md:flex-none px-6 py-2.5 bg-surface text-foreground font-black rounded-xl text-sm justify-center gap-2 flex items-center cursor-default border border-border opacity-50">
                                            <Clock className="h-4 w-4" /> {status.initiatedBy === "ME" ? "Pending" : "Needs Response"}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={openModal}
                                            className="flex-1 md:flex-none px-6 py-2.5 bg-tatt-lime text-tatt-black font-black uppercase tracking-widest rounded-xl text-sm hover:brightness-110 transition-all shadow-sm shadow-tatt-lime/20 justify-center gap-2 flex items-center hover:scale-[1.02] active:scale-95"
                                        >
                                            <UserPlus className="h-4 w-4" /> Connect
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Professional Background Summary */}
                            <div className="mt-10 pt-8 border-t border-border">
                                <h3 className="text-xl font-black mb-4 text-foreground">Professional Background & Impact</h3>
                                {member.professionalHighlight ? (
                                    <p className="text-tatt-gray leading-relaxed font-medium max-w-3xl">
                                        {member.professionalHighlight}
                                    </p>
                                ) : (
                                    <p className="text-tatt-gray/50 italic leading-relaxed max-w-3xl">
                                        This member has not provided a professional background summary yet.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Key Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-background p-5 rounded-2xl border border-border flex items-center gap-4 hover:border-tatt-lime/50 transition-colors">
                                <div className="size-12 rounded-xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime-dark shrink-0">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-tatt-gray font-black uppercase tracking-widest">Member ID</p>
                                    <p className="text-base font-black text-foreground truncate">
                                        {user?.id === member.id ? (member.tattMemberId || 'N/A') : '••••••••'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-background p-5 rounded-2xl border border-border flex items-center gap-4 hover:border-tatt-lime/50 transition-colors">
                                <div className="size-12 rounded-xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime-dark shrink-0">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-tatt-gray font-black uppercase tracking-widest">Joined Date</p>
                                    <p className="text-base font-black text-foreground truncate">
                                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-background p-5 rounded-2xl border border-border flex items-center gap-4 hover:border-tatt-lime/50 transition-colors">
                                <div className="size-12 rounded-xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime-dark shrink-0">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-tatt-gray font-black uppercase tracking-widest">Industry</p>
                                    <p className="text-base font-black text-foreground truncate">{member.industry || 'Not Provided'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Interests & Expertise */}
                        <div className="bg-background rounded-2xl border border-border p-6 lg:p-8">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-foreground">
                                <Lightbulb className="h-6 w-6 text-tatt-lime" /> Interests & Expertise
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {/* In a real app, this would be an array from member data */}
                                <span className="px-4 py-2 bg-surface text-foreground font-bold text-sm rounded-xl">Economic Policy</span>
                                <span className="px-4 py-2 bg-surface text-foreground font-bold text-sm rounded-xl">Leadership</span>
                                <span className="px-4 py-2 bg-surface text-foreground font-bold text-sm rounded-xl">{member.industry || 'Strategy'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar Widgets */}
                    <div className="w-full lg:w-80 space-y-6 shrink-0">

                        {/* Digital Identity Card Widget */}
                        <div className="bg-background rounded-2xl border border-border p-6">
                            <h3 className="text-xs font-black text-tatt-gray uppercase tracking-widest mb-4">Digital Identity Card</h3>
                            {member && (
                                <MembershipCard
                                    member={{
                                        ...member,
                                        chapterName: member.chapter?.name,
                                        chapterCode: member.chapter?.code
                                    }}
                                    isCurrentUser={user?.id === member.id}
                                />
                            )}
                            <p className="mt-4 text-[11px] text-tatt-gray text-center font-bold">Verified by TATT Global Compliance</p>
                        </div>

                        {/* Business/Enterprise Widget (Only for Kiongozi) */}
                        {member.communityTier === "KIONGOZI" && (
                            <div className="bg-surface rounded-2xl border-2 border-tatt-lime/30 p-6 shadow-sm relative overflow-hidden">
                                <div className="absolute inset-0 bg-tatt-lime/[0.03] pointer-events-none"></div>
                                <div className="flex items-center gap-3 mb-4 relative z-10">
                                    <div className="size-12 rounded-xl bg-tatt-lime flex items-center justify-center text-tatt-black shrink-0">
                                        <Briefcase className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-foreground">{member.companyName || "Member Enterprise"}</h3>
                                        <p className="text-[10px] font-black text-tatt-lime-dark uppercase tracking-widest">Verified Enterprise</p>
                                    </div>
                                </div>
                                <p className="text-sm text-tatt-gray leading-relaxed mb-5 font-medium relative z-10">
                                    As a Kiongozi member, this enterprise receives premium placement and priority partnership matchmaking within the network.
                                </p>
                                <button className="w-full py-3 bg-tatt-black text-white dark:bg-white dark:text-tatt-black rounded-xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all relative z-10">
                                    View Business Profile
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Connection Request Modal ───────────────────────────────── */}
            {
                modalOpen && member && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                    >
                        <div className="bg-surface w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                            {/* Modal Header */}
                            <div className="bg-[#1a1a15] pt-10 pb-8 px-8 text-center flex flex-col items-center relative">
                                <button onClick={closeModal} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
                                    <X className="h-6 w-6" />
                                </button>

                                <div className="relative mb-6">
                                    <div className="size-24 rounded-full overflow-hidden border-4 border-[#1a1a15] ring-4 ring-tatt-lime bg-tatt-lime/10 flex items-center justify-center relative">
                                        {member.profilePicture ? (
                                            <Image src={member.profilePicture} alt={member.firstName} fill className="object-cover" />
                                        ) : (
                                            <span className="text-4xl font-black text-tatt-lime">
                                                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`absolute -bottom-3 right-1/2 translate-x-1/2 text-[11px] font-black uppercase tracking-tight px-3 py-0.5 rounded-full whitespace-nowrap ${tier.classes}`}>
                                        {tier.label}
                                    </span>
                                </div>

                                <h3 className="text-[22px] font-bold text-white mt-1">
                                    Connect with {member.firstName} {member.lastName}
                                </h3>
                                <p className="text-[#a1a396] text-[15px] mt-1.5 font-medium">
                                    {[member.professionTitle, member.chapter?.name].filter(Boolean).join(" • ")}
                                </p>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 flex flex-col gap-6 bg-surface">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[15px] font-bold text-black dark:text-white" htmlFor="connect-msg">
                                        Add a personalized message
                                    </label>
                                    <textarea
                                        id="connect-msg"
                                        rows={4}
                                        className="w-full p-5 bg-[#f5f5f5] dark:bg-white/5 border border-border dark:border-white/10 rounded-2xl text-black dark:text-white placeholder:text-gray-500 text-[15px] focus:ring-2 focus:ring-tatt-lime outline-none transition-all resize-none shadow-inner"
                                        placeholder={`Hi ${member.firstName}, I'd love to discuss your latest work on policy frameworks...`}
                                        value={connectMessage}
                                        onChange={(e) => { setConnectMessage(e.target.value); setSendError(null); }}
                                        maxLength={500}
                                    />
                                </div>


                                {sendError && (
                                    <div className="flex items-start gap-4 p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{sendError}</p>
                                    </div>
                                )}

                                {/* Modal Footer */}
                                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                    <button
                                        onClick={handleSendInvite}
                                        disabled={sending || connectMessage.trim().length < 20}
                                        className="flex-1 flex items-center justify-center py-4 bg-tatt-lime text-black text-[13px] font-black rounded-xl uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Send Invitation
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        disabled={sending}
                                        className="flex-1 py-4 bg-[#fcfcfc] dark:bg-white/5 text-black dark:text-white text-[13px] font-black rounded-xl uppercase tracking-widest border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
