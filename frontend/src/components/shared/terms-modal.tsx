"use client";

import { useEffect, useState } from "react";
import { X, FileText, Loader2, ScrollText } from "lucide-react";
import api from "@/services/api";

interface TermsModalProps {
    open: boolean;
    onClose: () => void;
    /** If true, shows an "I Agree" button that calls onAgree before closing */
    requireAgreement?: boolean;
    onAgree?: () => void;
}

interface ActiveTerms {
    content: string;
    version: number;
    createdAt: string;
    updatedBy?: { firstName: string; lastName: string };
}

export function TermsModal({ open, onClose, requireAgreement = false, onAgree }: TermsModalProps) {
    const [terms, setTerms] = useState<ActiveTerms | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        api.get("/terms/active")
            .then((res) => setTerms(res.data))
            .catch(() => setTerms(null))
            .finally(() => setLoading(false));
    }, [open]);

    if (!open) return null;

    const handleAgree = () => {
        onAgree?.();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Terms of Service"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface/90 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                            <ScrollText className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-foreground">Terms of Service</h2>
                            {terms && (
                                <p className="text-[10px] font-bold text-tatt-gray uppercase tracking-widest">
                                    Version {terms.version} — {new Date(terms.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-9 rounded-xl flex items-center justify-center text-tatt-gray hover:text-foreground hover:bg-background transition-colors"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content — scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="size-8 animate-spin text-tatt-lime" />
                            <p className="text-sm text-tatt-gray font-medium">Loading terms…</p>
                        </div>
                    ) : terms ? (
                        <div className="prose prose-sm max-w-none text-foreground">
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                                {terms.content}
                            </pre>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                            <FileText className="size-10 text-tatt-gray opacity-30" />
                            <p className="text-sm font-bold text-tatt-gray">No Terms of Service have been published yet.</p>
                            <p className="text-xs text-tatt-gray/70">Please check back later or contact platform support.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t border-border px-6 py-4 bg-surface/80 backdrop-blur-sm flex items-center justify-between gap-3">
                    {requireAgreement ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-tatt-gray hover:text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAgree}
                                disabled={!terms}
                                className="px-6 py-2.5 rounded-xl bg-tatt-lime text-tatt-black font-black text-xs uppercase tracking-widest hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                I Agree & Continue
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="ml-auto px-6 py-2.5 rounded-xl bg-tatt-lime text-tatt-black font-black text-xs uppercase tracking-widest hover:brightness-95 transition-all"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
