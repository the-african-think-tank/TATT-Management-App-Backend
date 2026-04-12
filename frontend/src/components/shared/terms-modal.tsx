"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Loader2, Scale } from "lucide-react";
import api from "@/services/api";

interface TermsModalProps {
    open: boolean;
    onClose: () => void;
    /** If true, shows an "I Agree" button that calls onAgree before closing */
    requireAgreement?: boolean;
    onAgree?: () => void;
}

export function TermsModal({ open, onClose, requireAgreement = false, onAgree }: TermsModalProps) {
    const [content, setContent] = useState<string>("");
    const [version, setVersion] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchTerms();
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [open]);

    const fetchTerms = async () => {
        setLoading(true);
        try {
            const res = await api.get("/terms/active");
            if (res.data) {
                setContent(res.data.content || "");
                setVersion(res.data.version || 0);
            }
        } catch (error) {
            console.error("Failed to load terms:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAgree = () => {
        onAgree?.();
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-background border border-border rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-border bg-surface/50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime ring-1 ring-tatt-lime/20">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-foreground">
                                Terms of <span className="text-tatt-lime">Service</span>
                            </h2>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-tatt-gray italic">Revision v{version}.0</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="size-12 rounded-2xl bg-background border border-border flex items-center justify-center text-tatt-gray hover:text-foreground hover:rotate-90 transition-all duration-300">
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-12 no-scrollbar bg-gradient-to-b from-background via-background to-surface/30">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center opacity-50">
                            <Loader2 className="animate-spin text-tatt-lime mb-4" size={32} />
                            <p className="text-[9px] font-black uppercase tracking-widest italic">Decrypting Document...</p>
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none text-foreground/80 font-medium leading-[1.8] whitespace-pre-wrap">
                            {content || "The Terms of Service are currently unavailable."}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 md:p-8 border-t border-border bg-surface/80 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <Scale size={18} className="text-tatt-lime opacity-50" />
                        <p className="text-[10px] text-tatt-gray font-bold italic">Governance Board © 2026</p>
                    </div>
                    {requireAgreement ? (
                        <div className="flex gap-4 w-full md:w-auto">
                            <button onClick={onClose} className="px-8 h-14 bg-surface border border-border text-tatt-gray rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                            <button onClick={handleAgree} className="flex-1 md:flex-none px-10 h-14 bg-tatt-lime text-tatt-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-tatt-lime/10">I Agree & Continue</button>
                        </div>
                    ) : (
                        <button onClick={onClose} className="px-10 h-14 bg-tatt-lime text-tatt-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] shadow-xl shadow-tatt-lime/10">Acknowledge & Close</button>
                    )}
                </div>
                {/* Grid Overlay Decoration */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] select-none" style={{ backgroundImage: 'radial-gradient(circle, #89f110 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            </div>
        </div>
    );
}
