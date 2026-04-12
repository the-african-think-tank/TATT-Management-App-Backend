"use client";

import React from "react";
import Link from "next/link";
import { useTermsModal } from "@/context/terms-context";



export function DashboardFooter() {
  const { showTerms } = useTermsModal();
  const currentYear = 2026; // Fixed per user request

  return (
    <footer className="w-full py-10 px-6 mt-auto bg-surface border-t border-border">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left: Copyright */}
        <div className="font-sans text-[10px] tracking-widest uppercase text-tatt-gray font-black">
          © {currentYear} The African Think Tank. All Rights Reserved.
        </div>

        {/* Right: Links & Maintenance */}
        <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-8 gap-y-3 font-sans text-[10px] tracking-[0.2em] font-black uppercase">
          <a 
            href="https://www.theafricanthinktank.com/privacy-policy" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-tatt-gray hover:text-tatt-black transition-all"
          >
            Privacy Policy
          </a>
          <button 
            onClick={showTerms}
            className="text-tatt-gray hover:text-tatt-black transition-all uppercase"
          >
            Terms of Service
          </button>
          
          <span className="hidden lg:inline text-border">|</span>
          
          <a 
            href="https://www.dohtechsolutions.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-tatt-gray/40 hover:text-tatt-lime transition-colors italic tracking-normal normal-case font-bold"
          >
            Developed and maintained by DOHTECH SOLUTIONS
          </a>
        </div>
      </div>
    </footer>
  );
}
