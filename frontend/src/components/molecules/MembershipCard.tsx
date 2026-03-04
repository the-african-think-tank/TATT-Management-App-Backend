"use client";

import React, { useRef } from 'react';
import { Award, Download, ShieldCheck } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

export interface MemberData {
    id: string;
    firstName: string;
    lastName: string;
    communityTier: string;
    professionTitle?: string | null | undefined;
    companyName?: string | null | undefined;
    chapterName?: string | null | undefined;
    chapterCode?: string | null | undefined;
    tattMemberId?: string | null | undefined;
    createdAt?: string | null | undefined;
}

interface MembershipCardProps {
    member: MemberData;
    isCurrentUser: boolean;
}

const MembershipCard: React.FC<MembershipCardProps> = ({ member, isCurrentUser }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
        if (!cardRef.current) return;

        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: "#000000",
            });
            const imgData = canvas.toDataURL('image/png');

            // Calculate height to maintain aspect ratio
            const pdfWidth = canvas.width / 3;
            const pdfHeight = canvas.height / 3;

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [pdfWidth, pdfHeight]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`TATT-Membership-Card-${member.lastName}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
        }
    };

    const tier = member.communityTier || "FREE";
    const displayTierName =
        tier === "KIONGOZI"
            ? "Kiongozi Business"
            : `${tier.charAt(0)}${tier.slice(1).toLowerCase()} Member`;

    const joinedDate = member.createdAt ? format(new Date(member.createdAt), 'yyyy') : '2024';

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="relative group w-full max-w-[480px] mx-auto lg:mx-0">
                <div className="absolute -inset-0.5 bg-tatt-lime rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <div
                    ref={cardRef}
                    className="relative bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-2xl aspect-[1.58/1] flex flex-col p-6 text-white border border-white/10"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="size-8 bg-tatt-lime rounded flex items-center justify-center text-tatt-black">
                                <Award className="h-4 w-4 font-black" />
                            </div>
                            <span className="text-[10px] font-black tracking-widest uppercase text-tatt-lime">{displayTierName}</span>
                        </div>
                        {isCurrentUser && (
                            <span className="text-[10px] opacity-50 font-black tracking-tighter">
                                {member.tattMemberId || `TATT-XXXX-${member.id.substring(0, 4)}`}
                            </span>
                        )}
                    </div>

                    <div className="mt-auto">
                        <div className="mb-4">
                            <h4 className="text-2xl font-black tracking-tight leading-none mb-1 uppercase truncate">
                                {member.firstName} {member.lastName}
                            </h4>
                            <p className="text-[11px] text-tatt-lime font-black uppercase tracking-[0.2em] truncate">
                                {member.professionTitle || "Professional Member"}
                            </p>
                        </div>

                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="size-6 bg-foreground rounded-sm flex items-center justify-center border border-white/10 shadow-sm">
                                        <span className="text-tatt-lime text-[8px] font-black">
                                            {(member.companyName || "TATT").slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-black tracking-tight truncate max-w-[150px]">
                                        {member.companyName || "Member of TATT"}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] opacity-60 font-black uppercase tracking-widest">Member Since {joinedDate}</p>
                                    <p className="text-[10px] opacity-60 font-black uppercase tracking-widest">Chapter: {member.chapterName || "Global"}</p>
                                </div>
                            </div>

                            <div className="size-16 bg-white/5 border border-white/10 p-1.5 rounded-lg flex flex-col items-center justify-center backdrop-blur-sm">
                                <ShieldCheck className="text-tatt-lime size-8 mb-1 opacity-50" />
                                <span className="text-[6px] font-black uppercase tracking-[0.05em] text-center opacity-40">Verified<br />Member</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-foreground hover:border-tatt-lime hover:bg-tatt-lime/5 transition-all w-full max-w-[480px] mx-auto lg:mx-0 group shadow-sm"
            >
                <Download className="size-3.5 group-hover:translate-y-0.5 transition-transform" />
                Download Print Copy
            </button>
        </div>
    );
};

export default MembershipCard;
