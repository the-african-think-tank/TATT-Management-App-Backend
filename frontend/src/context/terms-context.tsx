"use client";

import React, { createContext, useContext, useState } from "react";
import { TermsModal } from "@/components/shared/terms-modal";


interface TermsContextType {
    showTerms: () => void;
    hideTerms: () => void;
}

const TermsContext = createContext<TermsContextType | undefined>(undefined);

export function TermsProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const showTerms = () => setIsOpen(true);
    const hideTerms = () => setIsOpen(false);

    return (
        <TermsContext.Provider value={{ showTerms, hideTerms }}>
            {children}
            <TermsModal open={isOpen} onClose={hideTerms} />
        </TermsContext.Provider>
    );
}

export function useTermsModal() {
    const context = useContext(TermsContext);
    if (context === undefined) {
        throw new Error("useTermsModal must be used within a TermsProvider");
    }
    return context;
}
