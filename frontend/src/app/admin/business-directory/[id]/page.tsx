"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Store, 
  CheckCircle2, 
  ExternalLink, 
  Lock as LockIcon,
  Globe,
  Star
} from "lucide-react";
import api from "@/services/api";
import { toast } from "react-hot-toast";

interface BusinessPartner {
  id: string;
  name: string;
  category: string;
  foundingYear: number;
  website: string;
  locationText: string;
  missionAlignment: string;
  perkOffer: string;
  logoUrl: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'INACTIVE';
  contactEmail: string;
  contactPhone: string;
  contactName: string;
  createdAt: string;
  clickCount: number;
}

export default function BusinessDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewerNotes, setReviewerNotes] = useState("");

  useEffect(() => {
    if (id) {
      fetchBusiness();
    }
  }, [id]);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/business-directory/${id}`);
      setBusiness(response.data);
      if (response.data.adminNotes) {
        setReviewerNotes(response.data.adminNotes);
      }
    } catch (error) {
      console.error("Failed to fetch business details:", error);
      toast.error("Venture not found or access restricted.");
      router.push("/admin/business-directory");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: 'APPROVED' | 'DECLINED') => {
    try {
      await api.patch(`/business-directory/${id}/status`, { 
        status,
        adminNotes: reviewerNotes 
      });
      toast.success(`Application ${status.toLowerCase()} successfully.`);
      fetchBusiness();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Internal server error during status update.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="size-12 border-4 border-tatt-lime/20 border-t-tatt-lime rounded-full animate-spin"></div>
        <p className="text-tatt-gray font-bold animate-pulse">Reviewing Application...</p>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Header equivalent */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/admin/business-directory")}
            className="p-2 hover:bg-surface rounded-lg text-tatt-gray transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-black text-xl lg:text-2xl tracking-tight text-tatt-black">
              Review Application: {business.name}
            </h1>
            <nav className="flex gap-4 mt-1">
              <span className="text-tatt-lime border-b-2 border-tatt-lime pb-1 text-[10px] font-black uppercase tracking-widest">Review Queue</span>
              <span className="text-tatt-gray/40 font-bold text-[10px] uppercase tracking-widest">Archive</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Primary Details */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Applicant Overview Card */}
          <section className="bg-surface rounded-xl p-8 shadow-sm border border-border">
            <header className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-tatt-gray">Applicant Overview</span>
              <h2 className="text-2xl font-black mt-2 text-tatt-black">{business.name}</h2>
            </header>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-tatt-gray mb-1">Industry</p>
                <p className="text-sm font-bold text-tatt-black">{business.category}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-tatt-gray mb-1">Founding Year</p>
                <p className="text-sm font-bold text-tatt-black">{business.foundingYear || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-tatt-gray mb-1">Website</p>
                <a className="text-xs font-black text-white bg-tatt-black px-2 py-0.5 rounded" href={business.website} target="_blank">
                  {business.website?.replace(/^https?:\/\//, '')}
                </a>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-tatt-gray mb-1">Location</p>
                <p className="text-sm font-bold text-tatt-black">{business.locationText}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-4 mt-2 pt-4 border-t border-border/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-tatt-gray mb-1">Direct Contact Phone</p>
                <p className="text-sm font-black text-tatt-lime tracking-widest">{business.contactPhone || 'No Phone Provided'}</p>
              </div>
            </div>
          </section>

          {/* Mission Alignment Card */}
          <section className="bg-surface rounded-xl p-8 shadow-sm border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-tatt-black">
              <Globe size={100} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">Mission Alignment</span>
            <div className="mt-6">
              <h3 className="text-lg font-black mb-4 text-tatt-black">Core Philosophy Statement</h3>
              <p className="text-tatt-gray leading-relaxed text-sm font-medium">
                "{business.missionAlignment}"
              </p>
            </div>
          </section>

          {/* Proposed Member Perk */}
          <section className="bg-tatt-lime/5 rounded-xl p-8 border-l-4 border-tatt-lime">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-tatt-secondary">Proposed Member Perk</span>
                <h3 className="text-xl font-black mt-2 text-tatt-black italic">Exclusive Partner Incentive</h3>
              </div>
              <Star size={36} className="text-tatt-lime fill-current" />
            </div>
            <div className="mt-6 bg-surface p-6 rounded-lg border border-border">
              <p className="text-lg font-black text-tatt-black">{business.perkOffer}</p>
              <p className="text-xs text-tatt-gray mt-2 font-medium">Applies to archival prints, limited edition curations, and bespoke artist collaborations for all verified TATT members.</p>
            </div>
          </section>
        </div>

        {/* Right Column: Administrative Tools */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* Internal Notes */}
          <section className="bg-surface rounded-xl p-6 shadow-sm border border-border">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">Reviewer Notes</span>
            <div className="mt-4">
              <textarea 
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                className="w-full bg-background border-none rounded-lg focus:ring-2 focus:ring-tatt-lime/40 text-sm h-48 p-4 placeholder:text-tatt-gray/40 resize-none" 
                placeholder="Add internal observations regarding brand fit, documentation status, or strategic value..."
              ></textarea>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-tatt-gray font-bold italic">
              <LockIcon size={12} /> Notes are only visible to the administrative team.
            </div>
          </section>

          {/* Profile Snapshot */}
          <section className="bg-surface rounded-xl p-6 border border-border shadow-sm">
            <div className="w-full h-40 bg-background rounded-lg mb-4 overflow-hidden border border-border flex items-center justify-center">
                {business.logoUrl ? (
                    <img src={business.logoUrl} alt={business.name} className="size-full object-cover" />
                ) : (
                    <Store className="text-tatt-black opacity-10" size={40} />
                )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">Associated Contact</span>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-tatt-secondary rounded-full flex items-center justify-center text-white font-black text-sm">
                {business.contactName ? business.contactName.substring(0, 2).toUpperCase() : '??'}
              </div>
              <div>
                <p className="text-sm font-black text-tatt-black">{business.contactName || 'Anonymous'}</p>
                <div className="flex flex-col">
                  <p className="text-[10px] text-tatt-gray font-bold tracking-tighter truncate max-w-[150px]">{business.contactEmail}</p>
                  {business.contactPhone && (
                    <p className="text-[10px] text-tatt-lime font-black tracking-tighter mt-0.5">{business.contactPhone}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Administrative Actions Footer */}
      <footer className="fixed bottom-0 left-0 lg:left-72 right-0 bg-surface/90 backdrop-blur-md border-t border-border p-4 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-background border border-border rounded-full">
              <span className={`w-2 h-2 rounded-full ${business.status === 'PENDING' ? 'bg-tatt-lime animate-pulse shadow-[0_0_8px_rgba(159,204,0,0.5)]' : 'bg-tatt-lime'}`}></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-tatt-black">
                {business.status === 'PENDING' ? 'Pending Review' : `Application ${business.status}`}
              </span>
            </div>
            <p className="text-xs text-tatt-gray font-medium italic">Submitted on {new Date(business.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div className="flex gap-3">
            {business.status === 'PENDING' ? (
                <>
                    <button 
                        onClick={() => handleStatusUpdate('DECLINED')}
                        className="px-8 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest border border-border hover:bg-red-50 hover:text-red-600 transition-all font-sans active:scale-95"
                    >
                        Decline
                    </button>
                    <button 
                        onClick={() => handleStatusUpdate('APPROVED')}
                        className="px-12 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest bg-tatt-lime text-tatt-black hover:brightness-110 transition-all shadow-lg shadow-tatt-lime/20 active:scale-95 whitespace-nowrap"
                    >
                        Approve Application
                    </button>
                </>
            ) : (
                <button 
                    onClick={() => router.push("/admin/business-directory")}
                    className="px-12 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest bg-tatt-black text-white transition-all shadow-lg active:scale-95"
                >
                    Back to Directory
                </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
