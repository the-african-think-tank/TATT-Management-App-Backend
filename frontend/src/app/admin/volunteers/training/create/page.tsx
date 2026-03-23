"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    ChevronLeft, 
    ChevronRight, 
    BookOpen, 
    FileText, 
    Video, 
    Link as LinkIcon,
    Plus, 
    X,
    Loader2,
    CheckCircle2,
    ArrowLeft
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function CreateTrainingResourcePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        mediaUrls: [] as string[]
    });

    const [newMediaUrl, setNewMediaUrl] = useState("");

    const handleAddMedia = () => {
        if (!newMediaUrl.trim()) return;
        if (formData.mediaUrls.includes(newMediaUrl.trim())) {
            setNewMediaUrl("");
            return;
        }
        setFormData(prev => ({
            ...prev,
            mediaUrls: [...prev.mediaUrls, newMediaUrl.trim()]
        }));
        setNewMediaUrl("");
    };

    const handleRemoveMedia = (url: string) => {
        setFormData(prev => ({
            ...prev,
            mediaUrls: prev.mediaUrls.filter(u => u !== url)
        }));
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            toast.error("Module title is required. Signal strength low.");
            return;
        }
        if (!formData.content.trim()) {
            toast.error("Resource content must be defined.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/volunteers/training", formData);
            toast.success("Curriculum module transmitted successfully.");
            router.push("/admin/volunteers/training-stats");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to transmit curriculum. Data corrupted?");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background text-foreground animate-in fade-in duration-700">
            {/* Nav Header */}
            <header className="h-16 border-b border-border flex items-center justify-between px-6 md:px-10 bg-surface sticky top-0 z-40 backdrop-blur-md bg-opacity-70">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-tatt-gray">
                    <button onClick={() => router.push('/admin/volunteers')} className="hover:text-tatt-lime transition-colors">Volunteers</button>
                    <ChevronRight size={12} className="opacity-40" />
                    <button onClick={() => router.push('/admin/volunteers/training-stats')} className="hover:text-tatt-lime transition-colors">Curriculum</button>
                    <ChevronRight size={12} className="opacity-40" />
                    <span className="text-foreground">New Resource</span>
                </div>
            </header>

            <div className="max-w-4xl mx-auto py-12 px-6">
                 {/* Header Section */}
                <div className="mb-12 space-y-3">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-tatt-gray hover:text-tatt-lime transition-all mb-4">
                        <ArrowLeft size={14} /> Global Return
                    </button>
                    <h2 className="text-4xl font-black text-foreground tracking-tighter italic uppercase">Deploy Curriculum Module</h2>
                    <p className="text-tatt-gray max-w-2xl font-medium leading-relaxed">System-wide educational transmission. Ensure content is formatted for maximum retention and impact.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Form Col */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Title & Content */}
                        <section className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-2">Resource Title</label>
                                <input 
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-surface border border-border rounded-2xl p-4 focus:ring-2 focus:ring-tatt-lime/20 focus:border-tatt-lime transition-all text-foreground font-black italic tracking-tight text-xl outline-none shadow-sm" 
                                    placeholder="e.g. TATT Operational Security Protocol" 
                                    type="text"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-2">Module Content (System Manifest)</label>
                                <textarea 
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full bg-surface border border-border rounded-2xl p-6 focus:ring-2 focus:ring-tatt-lime/20 focus:border-tatt-lime transition-all text-foreground font-medium leading-relaxed outline-none shadow-sm min-h-[350px]" 
                                    placeholder="Define the curriculum details, instructions, and objectives..." 
                                    rows={12}
                                ></textarea>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Col - Assets */}
                    <div className="space-y-8">
                         <section className="bg-surface border border-border rounded-[2rem] p-8 shadow-xl space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-tatt-lime/5 rounded-bl-full blur-2xl"></div>
                            
                            <h4 className="text-lg font-black italic uppercase tracking-tight flex items-center gap-2">
                                <Video className="text-tatt-lime" size={20} />
                                Linked Assets
                            </h4>

                            <div className="space-y-4">
                                {formData.mediaUrls.map((url, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border group/item animate-in slide-in-from-right duration-300">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <LinkIcon size={14} className="text-tatt-lime shrink-0" />
                                            <span className="text-[10px] font-bold text-foreground truncate max-w-[140px] uppercase tracking-tighter">{new URL(url).hostname} Asset</span>
                                        </div>
                                        <button onClick={() => handleRemoveMedia(url)} className="text-tatt-gray hover:text-red-500 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {formData.mediaUrls.length === 0 && (
                                    <p className="text-[10px] font-bold text-tatt-gray italic uppercase tracking-widest text-center py-4 border-2 border-dashed border-border rounded-xl">No assets linked.</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest">Add Source URL</label>
                                <div className="flex gap-2">
                                    <input 
                                        value={newMediaUrl}
                                        onChange={(e) => setNewMediaUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddMedia()}
                                        className="flex-1 bg-background border border-border rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-1 focus:ring-tatt-lime" 
                                        placeholder="https://..." 
                                    />
                                    <button 
                                        onClick={handleAddMedia}
                                        className="size-10 bg-foreground text-surface rounded-xl flex items-center justify-center hover:bg-tatt-lime hover:text-tatt-black transition-all"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            <hr className="border-border/50" />

                            <div className="space-y-4">
                                <button 
                                    disabled={loading}
                                    onClick={handleSubmit}
                                    className="w-full bg-tatt-lime hover:bg-tatt-lime-vibrant text-tatt-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-tatt-lime/10 uppercase tracking-[0.2em] text-[10px] transform active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    Deploy Module
                                </button>
                                <button onClick={() => router.back()} className="w-full text-[9px] font-black text-tatt-gray uppercase tracking-widest hover:text-foreground transition-colors text-center">Abort Training Transmission</button>
                            </div>
                         </section>

                         <div className="p-8 rounded-[2rem] bg-tatt-black text-white space-y-4 shadow-2xl relative overflow-hidden group border border-white/5">
                            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-700">
                                <BookOpen size={120} />
                            </div>
                            <h4 className="text-lg font-black italic uppercase tracking-tight relative z-10">Curriculum Note</h4>
                            <p className="text-tatt-gray text-[11px] leading-relaxed relative z-10">High impact training modules typically include 2+ media assets and clear mission-driven objectives.</p>
                         </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
