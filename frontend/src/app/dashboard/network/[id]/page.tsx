"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    Briefcase,
    MapPin,
    Building2,
    UserPlus,
    Clock,
    UserCheck,
    Loader2,
    Globe,
    Award,
    Users,
} from "lucide-react";

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
    professionalHighlight: string | null;
    chapter: { id: string; name: string; code: string } | null;
}

interface ConnectionStatus {
    status: string;
    connectionId: string | null;
    initiatedBy?: string;
}

export default function MemberProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const memberId = params.id as string;

    const [member, setMember] = useState<MemberProfile | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [connectLoading, setConnectLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!memberId) return;

        const fetchProfile = async () => {
            setLoading(true);
            try {
                const [profileRes, statusRes] = await Promise.all([
                    api.get(`/members/${memberId}`),
                    user?.id !== memberId
                        ? api.get(`/connections/status/${memberId}`)
                        : Promise.resolve({ data: null }),
                ]);
                setMember(profileRes.data);
                setConnectionStatus(statusRes.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [memberId, user?.id]);

    const handleConnect = async () => {
        if (!member) return;
        setConnectLoading(true);
        try {
            await api.post("/connections/request", {
                recipientId: member.id,
                message: `Hi ${member.firstName}! I'd love to connect with you on the TATT platform.`,
            });
            setConnectionStatus({ status: "PENDING", connectionId: null, initiatedBy: "ME" });
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to send connection request.");
        } finally {
            setConnectLoading(false);
        }
    };

    const tierColors: Record<string, string> = {
        FREE: "bg-gray-100 text-gray-600",
        UBUNTU: "bg-blue-100 text-blue-700",
        IMANI: "bg-purple-100 text-purple-700",
        KIONGOZI: "bg-tatt-lime/20 text-tatt-lime-dark",
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                <Loader2 className="h-12 w-12 text-tatt-lime animate-spin mb-4" />
                <p className="text-tatt-gray font-bold">Loading profile...</p>
            </div>
        );
    }

    if (error || !member) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <p className="text-2xl font-black text-foreground mb-2">Member not found</p>
                <p className="text-tatt-gray text-sm mb-6">{error ?? "This profile may no longer be available."}</p>
                <Link href="/dashboard/network" className="bg-tatt-lime text-tatt-black font-black px-6 py-2.5 rounded-xl text-sm">
                    Back to Network
                </Link>
            </div>
        );
    }

    const isMe = member.id === user?.id;
    const tierName = member.communityTier.charAt(0) + member.communityTier.slice(1).toLowerCase();

    return (
        <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Back button */}
            <Link
                href="/dashboard/network"
                className="inline-flex items-center gap-2 text-sm font-bold text-tatt-gray hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Network
            </Link>

            {/* Profile Card */}
            <div className="bg-surface dark:bg-black rounded-2xl border border-border overflow-hidden">
                {/* Cover */}
                <div className="h-32 bg-gradient-to-r from-tatt-black to-[#23230f] relative">
                    <div className="absolute -bottom-14 left-8 p-1.5 bg-surface dark:bg-black rounded-2xl">
                        <div className="size-28 bg-tatt-lime/10 rounded-xl overflow-hidden flex items-center justify-center border-4 border-surface dark:border-black relative">
                            {member.profilePicture ? (
                                <Image src={member.profilePicture} alt={member.firstName} fill className="object-cover" />
                            ) : (
                                <span className="text-4xl font-black text-tatt-lime-dark">
                                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="pt-18 p-8" style={{ paddingTop: "4.5rem" }}>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-foreground">
                                {member.firstName} {member.lastName}
                            </h1>
                            <span className={`inline-block mt-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${tierColors[member.communityTier] ?? tierColors['FREE']}`}>
                                {tierName} Member
                            </span>
                            {member.tattMemberId && (
                                <p className="text-xs text-tatt-gray font-mono mt-1">{member.tattMemberId}</p>
                            )}
                        </div>

                        {/* Action buttons */}
                        {!isMe && (
                            <div className="flex gap-3 shrink-0">
                                {connectionStatus?.status === "ACCEPTED" ? (
                                    <button disabled className="flex items-center gap-2 bg-green-500/10 text-green-600 font-bold py-2.5 px-4 rounded-xl text-sm cursor-default">
                                        <UserCheck className="h-4 w-4" /> Connected
                                    </button>
                                ) : connectionStatus?.status === "PENDING" ? (
                                    <button disabled className="flex items-center gap-2 bg-tatt-lime/10 text-tatt-lime-dark font-bold py-2.5 px-4 rounded-xl text-sm cursor-default">
                                        <Clock className="h-4 w-4" />
                                        {connectionStatus.initiatedBy === "ME" ? "Request Sent" : "Pending Response"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleConnect}
                                        disabled={connectLoading}
                                        className="flex items-center gap-2 bg-tatt-lime text-tatt-black font-black py-2.5 px-5 rounded-xl text-sm hover:scale-[1.04] active:scale-95 transition-all shadow-md shadow-tatt-lime/20 disabled:opacity-60"
                                    >
                                        {connectLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                        Connect
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Details Grid */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {member.professionTitle && (
                            <div className="flex items-center gap-3 bg-background rounded-xl p-3 border border-border">
                                <Briefcase className="h-4 w-4 text-tatt-lime shrink-0" />
                                <div>
                                    <p className="text-[10px] text-tatt-gray font-bold uppercase tracking-wide">Role</p>
                                    <p className="text-sm font-bold text-foreground">{member.professionTitle}</p>
                                </div>
                            </div>
                        )}
                        {member.companyName && (
                            <div className="flex items-center gap-3 bg-background rounded-xl p-3 border border-border">
                                <Building2 className="h-4 w-4 text-tatt-lime shrink-0" />
                                <div>
                                    <p className="text-[10px] text-tatt-gray font-bold uppercase tracking-wide">Company</p>
                                    <p className="text-sm font-bold text-foreground">{member.companyName}</p>
                                </div>
                            </div>
                        )}
                        {member.location && (
                            <div className="flex items-center gap-3 bg-background rounded-xl p-3 border border-border">
                                <MapPin className="h-4 w-4 text-tatt-lime shrink-0" />
                                <div>
                                    <p className="text-[10px] text-tatt-gray font-bold uppercase tracking-wide">Location</p>
                                    <p className="text-sm font-bold text-foreground">{member.location}</p>
                                </div>
                            </div>
                        )}
                        {member.chapter && (
                            <div className="flex items-center gap-3 bg-background rounded-xl p-3 border border-border">
                                <Users className="h-4 w-4 text-tatt-lime shrink-0" />
                                <div>
                                    <p className="text-[10px] text-tatt-gray font-bold uppercase tracking-wide">Chapter</p>
                                    <p className="text-sm font-bold text-foreground">{member.chapter.name}</p>
                                </div>
                            </div>
                        )}
                        {member.industry && (
                            <div className="flex items-center gap-3 bg-background rounded-xl p-3 border border-border">
                                <Globe className="h-4 w-4 text-tatt-lime shrink-0" />
                                <div>
                                    <p className="text-[10px] text-tatt-gray font-bold uppercase tracking-wide">Industry</p>
                                    <p className="text-sm font-bold text-foreground">{member.industry}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Professional Highlight */}
                    {member.professionalHighlight && (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="h-4 w-4 text-tatt-lime" />
                                <h2 className="text-sm font-black uppercase tracking-widest text-tatt-gray">Professional Highlight</h2>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed bg-background rounded-xl p-4 border border-border">
                                {member.professionalHighlight}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
