"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronRight,
    User,
    Shield,
    Map as MapIcon,
    Settings,
    CheckCircle,
    Building,
    Globe,
    MessageSquare,
    Rss,
    Heart,
    Calendar,
    Handshake,
    IdCard,
    BookOpen,
    Package,
    BarChart3,
    ArrowLeft,
    AlertTriangle,
    Copy,
    Check,
    Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import api from "@/services/api";
import { toast } from "react-hot-toast";

const roles = [
    { id: 'SUPERADMIN',       name: 'Superadmin',       desc: 'Full access to all platform features and organization settings.',   icon: Shield },
    { id: 'ADMIN',            name: 'Admin',            desc: 'Can manage users and standard organizational content.',              icon: Shield },
    { id: 'REGIONAL_ADMIN',   name: 'Regional Director',desc: 'Access restricted to their assigned chapter or region.',            icon: Globe },
    { id: 'MODERATOR',        name: 'Moderator',        desc: 'Focused on community interactions and forum management.',           icon: MessageSquare },
    { id: 'CONTENT_ADMIN',    name: 'Content Admin',    desc: 'Full control over knowledge base and public resources.',            icon: BookOpen },
    { id: 'SALES',            name: 'Sales',            desc: 'Access to subscription data and billing records.',                  icon: BarChart3 },
    { id: 'COMMUNITY_MEMBER', name: 'Standard Member',  desc: 'Regular community member — added directly without self-signup.',   icon: User },
];

const moduleFlags = [
    { id: 'CAN_ACCESS_ORG_MANAGEMENT',     label: 'Org Management',        icon: Building },
    { id: 'CAN_ACCESS_REGIONAL_CHAPTERS',  label: 'Regional Chapters',     icon: Globe },
    { id: 'CAN_ACCESS_FORUM_MODERATION',   label: 'TATT Feed Moderation',  icon: Rss },
    { id: 'CAN_ACCESS_VOLUNTEER_CENTER',   label: 'Volunteer Center',       icon: Heart },
    { id: 'CAN_ACCESS_EVENTS',             label: 'Events & Mixers',        icon: Calendar },
    { id: 'CAN_ACCESS_PARTNERSHIPS',       label: 'Promotions',             icon: Handshake },
    { id: 'CAN_ACCESS_MEMBERSHIP_CENTER',  label: 'Membership',             icon: IdCard },
    { id: 'CAN_ACCESS_CONTENT_RESOURCES',  label: 'Resources',              icon: BookOpen },
    { id: 'CAN_ACCESS_SALES_INVENTORY',    label: 'Sales/Inventory',        icon: Package },
    { id: 'CAN_ACCESS_ANALYTICS',          label: 'Analytics',              icon: BarChart3 },
];

type FieldErrors = {
    firstName?: string;
    lastName?: string;
    email?: string;
};

export default function AddMemberPage() {
    const router = useRouter();
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const [duplicateNameWarning, setDuplicateNameWarning] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        professionTitle: "",
        location: "",
        systemRole: "ADMIN",
        chapterId: "",
        flags: [] as string[]
    });

    useEffect(() => {
        api.get("/chapters").then(res => setChapters(res.data)).catch(err => console.error(err));
    }, []);

    const toggleFlag = (flag: string) => {
        setFormData(prev => ({
            ...prev,
            flags: prev.flags.includes(flag)
                ? prev.flags.filter(f => f !== flag)
                : [...prev.flags, flag]
        }));
    };

    const validate = (): boolean => {
        const errors: FieldErrors = {};
        if (!formData.firstName.trim()) errors.firstName = "First name is required";
        if (!formData.lastName.trim())  errors.lastName  = "Last name is required";
        if (!formData.email.trim())     errors.email     = "Work email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            errors.email = "Enter a valid email address";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const copyInviteUrl = async () => {
        if (!inviteUrl) return;
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        setInviteUrl(null);
        setDuplicateNameWarning(null);

        try {
            const res = await api.post("/auth/org-member/add", {
                ...formData,
                chapterId: formData.chapterId || undefined,
                flags: formData.flags.length > 0 ? formData.flags : undefined,
            });

            if (res.data?.duplicateNameWarning) {
                setDuplicateNameWarning(res.data.duplicateNameWarning);
            }

            if (res.data?.warning === 'EMAIL_DISPATCH_FAILED') {
                setInviteUrl(res.data.inviteUrl ?? null);
                toast.error(res.data.message, { duration: 8000 });
                // Don't navigate away — let admin copy the invite link first
            } else {
                toast.success(res.data?.message || "Member added successfully. Invitation email dispatched.");
                if (res.data?.duplicateNameWarning) {
                    // Stay on page briefly to show the warning, then navigate
                    setTimeout(() => router.push("/admin/org-management"), 3000);
                } else {
                    router.push("/admin/org-management");
                }
            }
        } catch (error: any) {
            const raw = error.response?.data?.message;
            if (Array.isArray(raw)) {
                // Map backend validation messages to fields where possible
                const errors: FieldErrors = {};
                const unmatched: string[] = [];
                raw.forEach((msg: string) => {
                    const lower = msg.toLowerCase();
                    if (lower.includes('first name') || lower.includes('firstname')) errors.firstName = msg;
                    else if (lower.includes('last name') || lower.includes('lastname')) errors.lastName = msg;
                    else if (lower.includes('email')) errors.email = msg;
                    else unmatched.push(msg);
                });
                setFieldErrors(errors);
                if (unmatched.length) toast.error(unmatched.join(' · '));
            } else {
                const msg = raw || "Failed to add team member. Please try again.";
                // Try to associate a single message to a field
                const lower = msg.toLowerCase();
                if (lower.includes('email')) setFieldErrors({ email: msg });
                else toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-tatt-gray mb-6">
                <Link href="/admin/org-management" className="hover:text-tatt-lime transition-colors">Org Management</Link>
                <ChevronRight size={14} />
                <span className="text-foreground font-bold">Add New Team Member</span>
            </nav>

            <header className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/admin/org-management" className="p-2 hover:bg-surface rounded-xl border border-border transition-all">
                        <ArrowLeft size={20} className="text-tatt-gray" />
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">Add New Team Member</h1>
                </div>
                <p className="text-tatt-gray text-lg max-w-2xl font-medium">
                    Onboard a new staff member or community member directly. They'll receive an invite link to set their password.
                </p>
            </header>

            {/* Duplicate name warning banner */}
            {duplicateNameWarning && (
                <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-in fade-in duration-300">
                    <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-amber-800">{duplicateNameWarning}</p>
                </div>
            )}

            {/* Invite link banner (shown when email dispatch failed) */}
            {inviteUrl && (
                <div className="mb-6 bg-surface border border-tatt-lime/30 rounded-2xl p-5 animate-in fade-in duration-300 space-y-3">
                    <div className="flex items-center gap-2 text-tatt-lime font-bold text-sm">
                        <LinkIcon size={16} />
                        Member Added — Share This Invite Link Manually
                    </div>
                    <p className="text-xs text-tatt-gray">
                        The invitation email could not be sent (check SMTP settings). Copy the link below and share it directly with the new member.
                    </p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-xs font-mono text-foreground truncate">
                            {inviteUrl}
                        </code>
                        <button
                            onClick={copyInviteUrl}
                            className="flex items-center gap-2 px-4 py-3 bg-tatt-lime text-tatt-black text-xs font-bold rounded-xl hover:brightness-105 transition-all shrink-0"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                    <button
                        onClick={() => router.push("/admin/org-management")}
                        className="text-xs font-bold text-tatt-gray hover:text-foreground transition-colors underline"
                    >
                        Done — go to Org Management →
                    </button>
                </div>
            )}

            <div className="space-y-8">
                {/* Section 1: Basic Information */}
                <section className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="size-10 bg-tatt-lime/10 rounded-xl flex items-center justify-center text-tatt-lime">
                            <User size={24} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Basic Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="First Name *"
                            placeholder="e.g. Kwame"
                            value={formData.firstName}
                            onChange={(v) => { setFormData({ ...formData, firstName: v }); setFieldErrors(e => ({ ...e, firstName: undefined })); }}
                            error={fieldErrors.firstName}
                        />
                        <InputField
                            label="Last Name *"
                            placeholder="e.g. Mensah"
                            value={formData.lastName}
                            onChange={(v) => { setFormData({ ...formData, lastName: v }); setFieldErrors(e => ({ ...e, lastName: undefined })); }}
                            error={fieldErrors.lastName}
                        />
                        <InputField
                            label="Work Email *"
                            placeholder="kwame@africa-tt.org"
                            type="email"
                            value={formData.email}
                            onChange={(v) => { setFormData({ ...formData, email: v }); setFieldErrors(e => ({ ...e, email: undefined })); }}
                            error={fieldErrors.email}
                        />
                        <InputField
                            label="Phone Number"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phoneNumber}
                            onChange={(v) => setFormData({ ...formData, phoneNumber: v })}
                        />
                        <InputField
                            label="Profession / Title"
                            placeholder="e.g. Operations Manager"
                            value={formData.professionTitle}
                            onChange={(v) => setFormData({ ...formData, professionTitle: v })}
                        />
                        <InputField
                            label="Location (City, Country)"
                            placeholder="e.g. Nairobi, Kenya"
                            value={formData.location}
                            onChange={(v) => setFormData({ ...formData, location: v })}
                        />
                    </div>
                </section>

                {/* Section 2: Role Selection */}
                <section className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-10 bg-tatt-lime/10 rounded-xl flex items-center justify-center text-tatt-lime">
                            <Shield size={24} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Role Selection</h2>
                    </div>
                    <p className="text-sm text-tatt-gray mb-8 ml-13">Select the role for this member</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                onClick={() => setFormData({ ...formData, systemRole: role.id })}
                                className={`relative cursor-pointer p-5 rounded-2xl border-2 transition-all group ${
                                    formData.systemRole === role.id
                                        ? "border-tatt-lime bg-tatt-lime/5"
                                        : "border-border bg-background/50 hover:border-tatt-lime/40"
                                }`}
                            >
                                <div className={`size-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                                    formData.systemRole === role.id ? "bg-tatt-lime text-tatt-black" : "bg-surface text-tatt-gray group-hover:text-tatt-lime"
                                }`}>
                                    <role.icon size={20} />
                                </div>
                                <p className="font-bold text-foreground mb-1">{role.name}</p>
                                <p className="text-[11px] leading-relaxed text-tatt-gray">{role.desc}</p>

                                {formData.systemRole === role.id && (
                                    <div className="absolute top-4 right-4 text-tatt-lime">
                                        <CheckCircle size={20} fill="currentColor" className="text-tatt-lime" />
                                        <div className="absolute inset-0 bg-white size-3 m-1 rounded-full -z-10"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 3: Chapter Assignment */}
                {formData.systemRole === "REGIONAL_ADMIN" && (
                    <section className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="size-10 bg-tatt-lime/10 rounded-xl flex items-center justify-center text-tatt-lime">
                                <MapIcon size={24} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Chapter Assignment</h2>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-foreground mb-1 uppercase tracking-wider">Select TATT Chapter / Region</label>
                            <select
                                value={formData.chapterId}
                                onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                                className="w-full h-14 rounded-xl border-border bg-background focus:ring-2 focus:ring-tatt-lime focus:border-tatt-lime outline-none transition-all px-4 font-medium"
                            >
                                <option value="">Global (All Regions)</option>
                                {chapters.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                ))}
                            </select>
                            <p className="text-xs text-tatt-gray mt-2 italic font-medium">This defines the visibility scope for Regional Directors.</p>
                        </div>
                    </section>
                )}

                {/* Section 4: Module Access — only relevant for non-community-member roles */}
                {formData.systemRole !== "COMMUNITY_MEMBER" && (
                    <section className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 bg-tatt-lime/10 rounded-xl flex items-center justify-center text-tatt-lime">
                                <Settings size={24} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Platform Access</h2>
                        </div>
                        <p className="text-sm text-tatt-gray mb-8 ml-13">Grant access to specific admin sidebar modules</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {moduleFlags.map((flag) => (
                                <button
                                    key={flag.id}
                                    onClick={() => toggleFlag(flag.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                                        formData.flags.includes(flag.id)
                                            ? "border-tatt-lime bg-tatt-lime/5 text-foreground font-bold"
                                            : "border-border bg-background/30 text-tatt-gray hover:border-tatt-lime/40"
                                    }`}
                                >
                                    <flag.icon size={16} />
                                    <span className="text-xs">{flag.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Fixed Bottom Actions */}
            <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-surface/80 backdrop-blur-md border-t border-border p-4 px-8 flex justify-end items-center gap-6 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-40 animate-in slide-in-from-bottom-full duration-700 delay-300">
                <button
                    onClick={() => router.back()}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-tatt-gray hover:bg-background transition-colors uppercase tracking-widest"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-10 py-3 rounded-xl text-sm font-bold bg-tatt-lime text-tatt-black shadow-lg shadow-tatt-lime/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50"
                >
                    {loading ? "Processing..." : "Create Account & Send Invite"}
                </button>
            </div>
        </div>
    );
}

function InputField({
    label, placeholder, type = "text", value, onChange, error,
}: {
    label: string;
    placeholder: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-tatt-gray uppercase tracking-widest ml-1">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full h-14 rounded-xl border bg-background focus:ring-2 outline-none transition-all px-4 font-medium ${
                    error
                        ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                        : "border-border focus:ring-tatt-lime focus:border-tatt-lime"
                }`}
            />
            {error && (
                <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                    <AlertTriangle size={11} />
                    {error}
                </p>
            )}
        </div>
    );
}
