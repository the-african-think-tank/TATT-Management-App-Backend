"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { useEffect, useState } from "react";
import {
    User as UserIcon,
    BadgeCheck,
    Brain,
    Network,
    Building2,
    Camera,
    Plus,
    CheckCircle,
    Loader2,
    Save,
    Trash2
} from "lucide-react";
import { Interest } from "@/types/interests";
import { ChapterDetail } from "@/types/chapter";
import { toast } from "react-hot-toast";
import { ChevronDown, X, AlertTriangle } from "lucide-react";

// --- Custom Components ---

const CustomSelect = ({
    label,
    name,
    value,
    options,
    onChange,
    placeholder = "Select an option"
}: {
    label: string,
    name: string,
    value: string,
    options: { label: string, value: string }[],
    onChange: (name: string, value: string) => void,
    placeholder?: string
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="space-y-2 relative">
            <label className="text-xs font-black uppercase tracking-widest text-tatt-gray">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-background border-border border rounded-xl px-4 py-3 text-sm flex items-center justify-between focus:ring-2 focus:ring-tatt-lime outline-none text-left transition-all hover:border-tatt-lime/50"
            >
                <span className={value ? "text-foreground" : "text-tatt-gray"}>
                    {options.find(opt => opt.value === value)?.label || placeholder}
                </span>
                <ChevronDown className={`size-4 text-tatt-gray transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-full left-0 w-full mt-2 bg-surface border border-border rounded-xl shadow-2xl z-40 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(name, opt.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-3 text-sm text-left hover:bg-tatt-lime/10 transition-colors flex items-center justify-between ${value === opt.value ? 'bg-tatt-lime/5 text-tatt-lime font-bold' : 'text-foreground'}`}
                            >
                                {opt.label}
                                {value === opt.value && <CheckCircle className="size-4" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    isLoading
}: {
    isOpen: boolean,
    onClose: () => void,
    onConfirm: () => void,
    title: string,
    message: string,
    confirmText: string,
    isLoading: boolean
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-surface border border-border w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-tatt-gray hover:text-foreground transition-colors"
                >
                    <X className="size-6" />
                </button>

                <div className="size-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                    <AlertTriangle className="text-red-500 size-8" />
                </div>

                <h3 className="text-2xl font-black mb-4">{title}</h3>
                <p className="text-tatt-gray text-sm leading-relaxed mb-8">
                    {message}
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full py-4 bg-red-500 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="size-4 animate-spin" /> : confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full py-4 text-tatt-gray text-sm font-bold hover:text-foreground transition-colors"
                    >
                        Nevermind, take me back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
    const [chapters, setChapters] = useState<ChapterDetail[]>([]);
    const [deletionLoading, setDeletionLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        professionTitle: "",
        industry: "",
        employer: "",
        professionalHighlight: "",
        expertise: "",
        connectionPreference: "OPEN",
        businessName: "",
        businessRole: "",
        businessProfileLink: "",
        interests: [] as string[],
        profilePicture: "",
        chapterId: "",
        linkedInProfileUrl: "",
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [intRes, chapRes] = await Promise.all([
                    api.get("/interests"),
                    api.get("/chapters")
                ]);
                setAvailableInterests(intRes.data);
                setChapters(chapRes.data);

                if (user) {
                    setFormData({
                        firstName: user.firstName || "",
                        lastName: user.lastName || "",
                        professionTitle: user.professionTitle || "",
                        industry: user.industry || "",
                        employer: user.companyName || "",
                        professionalHighlight: user.professionalHighlight || "",
                        expertise: user.expertise || "",
                        connectionPreference: user.connectionPreference || "OPEN",
                        businessName: user.businessName || "",
                        businessRole: user.businessRole || "",
                        businessProfileLink: user.businessProfileLink || "",
                        interests: user.interests?.map(i => i.id) || [],
                        profilePicture: user.profilePicture || "",
                        chapterId: user.chapterId || "",
                        linkedInProfileUrl: user.linkedInProfileUrl || "",
                    });
                }
            } catch (error) {
                console.error("Failed to load settings data", error);
            } finally {
                setFetching(false);
            }
        };

        loadInitialData();
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleInterest = (interestId: string) => {
        setFormData(prev => {
            const interests = prev.interests.includes(interestId)
                ? prev.interests.filter(id => id !== interestId)
                : [...prev.interests, interestId];
            return { ...prev, interests };
        });
    };

    const cleanPayload = (data: any) => {
        const cleaned = { ...data };
        Object.keys(cleaned).forEach(key => {
            if (cleaned[key] === "") cleaned[key] = null;
        });
        return cleaned;
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { employer, ...payload } = formData;
            const cleanedPayload = cleanPayload({
                ...payload,
                companyName: employer
            });

            const response = await api.patch("/account/profile", cleanedPayload);

            // Update auth context with new user data
            updateUser(response.data);
            toast.success("Profile settings saved securely!");
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append("files", file);

        try {
            toast.loading("Updating profile picture...", { id: 'upload' });
            
            // 1. Upload the image
            const response = await api.post("/uploads/media", uploadFormData);
            const imageUrl = response.data.files[0].url;
            
            // 2. Update the user profile immediately for a live feel
            const { employer, ...payload } = formData;
            const cleanedPayload = cleanPayload({
                ...payload,
                profilePicture: imageUrl,
                companyName: employer 
            });

            const profileRes = await api.patch("/account/profile", cleanedPayload);

            // 3. Update both local state and auth context
            setFormData(prev => ({ ...prev, profilePicture: imageUrl }));
            updateUser(profileRes.data);
            
            toast.success("Profile picture updated!", { id: 'upload' });
        } catch (error) {
            console.error("Failed to update profile picture", error);
            toast.error("Failed to update profile picture.", { id: 'upload' });
        }
    };

    const handleRequestDeletion = async () => {
        setDeletionLoading(true);
        try {
            const response = await api.patch("/account/request-deletion");
            toast.success(response.data.message);

            // Refresh user profile
            const meRes = await api.get("/auth/me");
            updateUser(meRes.data);
            setIsConfirmModalOpen(false);
        } catch (error) {
            toast.error("Failed to schedule deletion.");
        } finally {
            setDeletionLoading(false);
        }
    };

    const handleCancelDeletion = async () => {
        setDeletionLoading(true);
        try {
            const response = await api.patch("/account/cancel-deletion");
            toast.success(response.data.message);

            // Refresh user profile
            const meRes = await api.get("/auth/me");
            updateUser(meRes.data);
        } catch (error) {
            toast.error("Failed to cancel deletion.");
        } finally {
            setDeletionLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="size-10 animate-spin text-tatt-lime" />
            </div>
        );
    }

    const isKiongozi = user?.communityTier === "KIONGOZI";

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight mb-2 text-foreground">Account Settings</h2>
                    <p className="text-tatt-gray">Manage your profile, visibility, and professional identity.</p>
                </div>
                {user?.deletionRequestedAt && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-4 animate-pulse">
                        <Trash2 className="text-red-500 shrink-0" />
                        <div>
                            <p className="text-xs font-black text-red-500 uppercase tracking-widest">Account Scheduled for Deletion</p>
                            <p className="text-[10px] text-tatt-gray italic">Set to be permanently removed on {new Date(new Date(user.deletionRequestedAt).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}
            </header>

            {user?.deletionRequestedAt && (
                <div className="mb-8">
                    {(() => {
                        const start = new Date(user.deletionRequestedAt).getTime();
                        const now = new Date().getTime();
                        const end = start + 14 * 24 * 60 * 60 * 1000;
                        const total = end - start;
                        const elapsed = now - start;
                        const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
                        const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

                        return (
                            <div className="bg-surface border border-red-500/20 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <h4 className="font-bold text-red-500">Deletion Progress</h4>
                                        <p className="text-xs text-tatt-gray">{daysLeft} days remaining before permanent data removal</p>
                                    </div>
                                    <button
                                        onClick={handleCancelDeletion}
                                        disabled={deletionLoading}
                                        className="text-xs font-bold text-white bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                    >
                                        Cancel Deletion Request
                                    </button>
                                </div>
                                <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500 transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            <div className="space-y-6">
                {/* Profile Header Card */}
                <section className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="size-32 rounded-full overflow-hidden border-4 border-tatt-lime/20 bg-tatt-lime/10 flex items-center justify-center relative shadow-xl shadow-tatt-lime/5 group-hover:scale-105 transition-transform duration-300">
                                {formData.profilePicture ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={formData.profilePicture} alt="Profile" className="size-full object-cover" />
                                ) : (
                                    <UserIcon className="text-4xl text-tatt-lime/40 size-16" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 size-10 bg-tatt-lime text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                                <Camera className="size-5" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <h3 className="text-2xl font-bold">{formData.firstName} {formData.lastName}</h3>
                                <span className="px-3 py-1 bg-tatt-lime/10 text-tatt-lime text-[10px] font-black uppercase tracking-widest rounded-full border border-tatt-lime/30">
                                    {user?.communityTier} Tier
                                </span>
                            </div>
                            <p className="text-tatt-gray mb-4">Update your profile photo and visible tier status.</p>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <label className="px-5 py-3 bg-tatt-lime text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg shadow-tatt-lime/20 cursor-pointer flex items-center gap-2">
                                    <Camera className="size-4" />
                                    Change Photo
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Personal & Professional Info */}
                <section className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <BadgeCheck className="text-tatt-lime size-5" />
                        Personal & Professional Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-tatt-gray">First Name</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full bg-background border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tatt-lime outline-none"
                                placeholder="e.g. John"
                                type="text"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-tatt-gray">Last Name</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full bg-background border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tatt-lime outline-none"
                                placeholder="e.g. Doe"
                                type="text"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-tatt-gray">Profession</label>
                            <input
                                name="professionTitle"
                                value={formData.professionTitle}
                                onChange={handleInputChange}
                                className="w-full bg-background border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tatt-lime outline-none"
                                placeholder="e.g. Senior Architect"
                                type="text"
                            />
                        </div>
                        <CustomSelect
                            label="Industry"
                            name="industry"
                            value={formData.industry}
                            onChange={handleSelectChange}
                            options={[
                                { label: "Technology", value: "Technology" },
                                { label: "Finance", value: "Finance" },
                                { label: "Healthcare", value: "Healthcare" },
                                { label: "Real Estate", value: "Real Estate" },
                                { label: "Education", value: "Education" },
                                { label: "Manufacturing", value: "Manufacturing" },
                                { label: "Agriculture", value: "Agriculture" },
                            ]}
                        />
                        <CustomSelect
                            label="Local Chapter"
                            name="chapterId"
                            value={formData.chapterId}
                            onChange={handleSelectChange}
                            placeholder="Choose your chapter"
                            options={chapters.map(c => ({ label: c.name, value: c.id }))}
                        />
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-tatt-gray">Employer / Company</label>
                            <input
                                name="employer"
                                value={formData.employer}
                                onChange={handleInputChange}
                                className="w-full bg-background border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tatt-lime outline-none"
                                placeholder="e.g. Global Tech Solutions"
                                type="text"
                            />
                        </div>
                        <CustomSelect
                            label="Chapter"
                            name="chapterId"
                            value={formData.chapterId}
                            onChange={handleSelectChange}
                            placeholder="Global / Select Chapter"
                            options={chapters.map(c => ({ label: c.name, value: c.id }))}
                        />
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-tatt-gray">LinkedIn Profile URL</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-border bg-background text-tatt-gray text-xs font-bold">
                                    https://linkedin.com/in/
                                </span>
                                <input
                                    name="linkedInProfileUrl"
                                    value={formData.linkedInProfileUrl}
                                    onChange={handleInputChange}
                                    className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-r-xl bg-background border-border focus:ring-2 focus:ring-tatt-lime outline-none text-sm"
                                    placeholder="yourname"
                                    type="text"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-tatt-gray">Professional Description / Bio</label>
                            <textarea
                                name="professionalHighlight"
                                value={formData.professionalHighlight}
                                onChange={handleInputChange}
                                className="w-full bg-background border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tatt-lime outline-none resize-none"
                                placeholder="Briefly describe your professional journey..."
                                rows={4}
                            ></textarea>
                        </div>
                    </div>
                </section>

                {/* Interests & Expertise */}
                <section className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
                        <Brain className="text-tatt-lime size-5" />
                        Interests & Expertise
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-tatt-gray">Select Interests</label>
                            <div className="flex flex-wrap gap-2">
                                {availableInterests.map((interest) => {
                                    const isSelected = formData.interests.includes(interest.id);
                                    return (
                                        <button
                                            key={interest.id}
                                            onClick={() => toggleInterest(interest.id)}
                                            className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${isSelected
                                                ? 'bg-tatt-lime border-tatt-lime text-black'
                                                : 'border-border text-tatt-gray hover:border-tatt-lime hover:text-tatt-lime'
                                                }`}
                                        >
                                            {interest.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-tatt-gray">Specific Expertise (Skills)</label>
                            <input
                                name="expertise"
                                value={formData.expertise}
                                onChange={handleInputChange}
                                className="w-full bg-background border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tatt-lime outline-none"
                                placeholder="e.g. Cloud Infrastructure, Strategic Planning"
                                type="text"
                            />
                        </div>
                    </div>
                </section>

                {/* Connection Preferences */}
                <section className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Network className="text-tatt-lime size-5" />
                        Connection Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'OPEN', title: 'Open to Connect', desc: 'Available for all member outreach' },
                            { id: 'CHAPTER_ONLY', title: 'Chapter Only', desc: 'Only show to your local chapter' },
                            { id: 'NO_CONNECTIONS', title: 'No Connections', desc: 'Keep your profile private' },
                        ].map((pref) => (
                            <label
                                key={pref.id}
                                className={`relative flex cursor-pointer rounded-2xl border p-4 shadow-sm transition-all ${formData.connectionPreference === pref.id
                                    ? 'border-tatt-lime bg-tatt-lime/5 shadow-md'
                                    : 'border-border hover:border-tatt-lime/40'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="connectionPreference"
                                    className="sr-only"
                                    value={pref.id}
                                    checked={formData.connectionPreference === pref.id}
                                    onChange={handleInputChange}
                                />
                                <div className="flex w-full flex-col">
                                    <span className={`text-sm font-bold ${formData.connectionPreference === pref.id ? 'text-tatt-lime' : 'text-foreground'}`}>
                                        {pref.title}
                                    </span>
                                    <span className="text-[10px] text-tatt-gray mt-1">{pref.desc}</span>
                                </div>
                                {formData.connectionPreference === pref.id && (
                                    <CheckCircle className="text-tatt-lime absolute top-4 right-4 size-4" />
                                )}
                            </label>
                        ))}
                    </div>
                </section>

                {/* Business Profile (Kiongozi Section) */}
                {isKiongozi && (
                    <section className="bg-tatt-lime/5 p-6 rounded-2xl border border-tatt-lime/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 py-1 px-4 bg-tatt-lime text-black text-[10px] font-black uppercase tracking-widest rounded-bl-xl">
                            Exclusive Access
                        </div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Building2 className="text-tatt-lime size-5" />
                                Business Profile (Kiongozi)
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-tatt-gray">Business Name</label>
                                <input
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    className="w-full bg-background border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tatt-lime outline-none"
                                    placeholder="Your Registered Business"
                                    type="text"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-tatt-gray">Role in Business</label>
                                <input
                                    name="businessRole"
                                    value={formData.businessRole}
                                    onChange={handleInputChange}
                                    className="w-full bg-background border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tatt-lime outline-none"
                                    placeholder="e.g. Founder, CEO"
                                    type="text"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-tatt-gray">Link to Business Profile</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-border bg-background text-tatt-gray text-xs font-bold">
                                        https://
                                    </span>
                                    <input
                                        name="businessProfileLink"
                                        value={formData.businessProfileLink}
                                        onChange={handleInputChange}
                                        className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-r-xl bg-background border-border focus:ring-2 focus:ring-tatt-lime outline-none text-sm"
                                        placeholder="tatt.org/biz/your-company"
                                        type="text"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <div className="flex justify-end gap-4 pt-6 pb-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 text-sm font-bold text-tatt-gray hover:text-foreground transition-colors"
                    >
                        Discard Changes
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-10 py-3 bg-tatt-lime text-black text-sm font-black uppercase tracking-[0.1em] rounded-xl shadow-lg shadow-tatt-lime/20 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        Save Profile Settings
                    </button>
                </div>

                <div className="border-t border-border pt-8 pb-12">
                    <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <Trash2 className="text-red-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">Danger Zone</h4>
                                <p className="text-xs text-tatt-gray">Request to close your account and remove all your information from the system.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsConfirmModalOpen(true)}
                            disabled={deletionLoading || !!user?.deletionRequestedAt}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${user?.deletionRequestedAt
                                ? 'bg-border text-tatt-gray cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/10 hover:scale-105 active:scale-95'
                                }`}
                        >
                            {deletionLoading ? <Loader2 className="size-4 animate-spin" /> : 'Delete Account'}
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleRequestDeletion}
                isLoading={deletionLoading}
                title="Permanently Close Account?"
                message="This will schedule your account for permanent deletion. All your data, connections, and historical records will be removed from the system in 14 days. This action cannot be undone once the period expires."
                confirmText="Yes, Schedule Deletion"
            />
        </div>
    );
}
