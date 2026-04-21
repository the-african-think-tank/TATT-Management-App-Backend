"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Store, 
  CheckCircle2, 
  Globe, 
  MapPin, 
  ExternalLink,
  PartyPopper,
  ShieldCheck,
  Zap,
  Search,
  LayoutDashboard,
  Handshake,
  Settings,
  Bell,
  UserCircle
} from "lucide-react";
import Link from "next/link";
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
  status: string;
  contactEmail: string;
  contactName: string;
  contactPhone: string;
  isVolunteer: boolean;
  description: string;
  ownershipType: string;
  partnershipReason: string;
  benefitType: string;
  offerDuration: string;
  typicalEngagement: string;
  additionalInfo: string;
  valuesAlignmentAgreed: boolean;
  contactAgreed: boolean;
  chapter?: { name: string };
  submittedBy?: { communityTier: string };
  createdAt: string;
}

export default function MemberBusinessDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessPartner | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Failed to fetch business details:", error);
      toast.error("Venture details currently unavailable.");
      router.push("/dashboard/business-center");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!business) return;
    try {
      await api.post(`/business-directory/${business.id}/click`);
      window.open(business.website, '_blank');
    } catch (err) {
      console.error("Redemption tracking failed:", err);
      window.open(business.website, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="size-12 border-4 border-tatt-lime/20 border-t-tatt-lime rounded-full animate-spin"></div>
        <p className="text-tatt-gray font-bold animate-pulse">Entering Partner Ecosystem...</p>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      {/* Top Breadcrumb/Header */}
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => router.push("/dashboard/business-center")}
          className="flex items-center gap-2 text-tatt-gray hover:text-tatt-black transition-colors font-bold text-sm group"
        >
          <div className="size-8 bg-white rounded-full flex items-center justify-center group-hover:bg-tatt-lime/10 transition-all border border-border shadow-sm">
            <ArrowLeft size={16} />
          </div>
          Back to Directory
        </button>
      </div>

      {/* Hero Section */}
      <section className="mb-12">
        <div className="relative rounded-[32px] overflow-hidden min-h-[300px] flex items-end">
          <div className="absolute inset-0 z-0">
            {/* Using a TATT themed background pattern if no image */}
            <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-tatt-lime via-transparent to-transparent"></div>
                <div className="grid grid-cols-12 w-full h-full opacity-5">
                    {[...Array(24)].map((_, i) => (
                        <div key={i} className="border border-white/20 h-32"></div>
                    ))}
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/40 to-transparent"></div>
          </div>
          <div className="relative z-10 p-8 lg:p-12 flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-8">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white p-1 rounded-3xl shadow-2xl flex-shrink-0">
                <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center rounded-2xl overflow-hidden">
                  {business.logoUrl ? (
                    <img src={business.logoUrl} alt={business.name} className="size-full object-cover" />
                  ) : (
                    <span className="text-tatt-lime font-black text-4xl">
                      {business.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">{business.name}</h1>
                  <span className="flex items-center gap-1.5 bg-tatt-lime text-tatt-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-tatt-lime/20">
                    <CheckCircle2 size={12} strokeWidth={3} />
                    Verified Partner
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-white/70 font-bold text-lg italic">{business.category}</p>
                  <span className="text-white/30 font-black">•</span>
                  <p className="text-white/70 font-black text-sm uppercase tracking-widest">Est. {business.foundingYear}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleRedeem}
              className="bg-tatt-lime text-tatt-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-tatt-lime/30 flex items-center gap-3 whitespace-nowrap"
            >
              Visit Website
              <ExternalLink size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Active Member Perk - Highlighted */}
          <section className="bg-surface border border-tatt-black/5 rounded-[32px] p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-tatt-lime/10 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:bg-tatt-lime/20 transition-all duration-1000"></div>
            
            <div className="relative z-10 flex items-center gap-8 mb-8 md:mb-0">
              <div className="size-20 rounded-full bg-tatt-lime/20 flex items-center justify-center text-tatt-lime shrink-0">
                <PartyPopper size={40} strokeWidth={2.5} />
              </div>
              <div className="max-w-md">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-tatt-lime mb-2 block">Exclusive TATT Community Offer</span>
                <h2 className="text-2xl md:text-3xl font-black text-tatt-black tracking-tight leading-none mb-3 italic">
                  "{business.perkOffer}"
                </h2>
                <p className="text-tatt-gray font-medium text-sm">
                  Available for all verified TATT members. 
                  <span className="mx-2 text-tatt-lime/40">•</span>
                  Type: <span className="text-tatt-black font-bold">{business.benefitType}</span>
                  <span className="mx-2 text-tatt-lime/40">•</span>
                  Honored for <span className="text-tatt-black font-bold">{business.offerDuration || '12 months'}</span>.
                </p>
              </div>
            </div>
            
            <button 
               onClick={handleRedeem}
               className="relative z-10 bg-tatt-black text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
               Redeem Community Perk
            </button>
          </section>

          {/* Detailed Narrative Section */}
          <div className="bg-surface border border-border rounded-[32px] p-8 md:p-12 shadow-sm space-y-12">
            <section>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-tatt-gray mb-6 flex items-center gap-3">
                <span className="h-6 w-1.5 bg-tatt-lime rounded-full"></span>
                About the Business
              </h3>
              <p className="text-tatt-gray/80 leading-relaxed text-lg font-medium">
                {business.description || `${business.name} is a premier ${business.category} establishment focused on excellence and pan-African impact.`}
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                {business.ownershipType && (
                  <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-xl border border-border">
                    <span className="text-[9px] font-black uppercase tracking-widest text-tatt-gray">Ownership:</span>
                    <span className="text-xs font-bold text-tatt-black">{business.ownershipType}</span>
                  </div>
                )}
                {business.isVolunteer && (
                  <div className="flex items-center gap-2 bg-tatt-lime/10 px-4 py-2 rounded-xl border border-tatt-lime/20">
                    <UserCircle size={14} className="text-tatt-lime" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-tatt-lime">TATT Volunteer Affiliate</span>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-tatt-gray mb-6 flex items-center gap-3">
                <span className="h-6 w-1.5 bg-tatt-lime rounded-full"></span>
                Mission Alignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-background/50 p-6 rounded-[24px] border border-border group hover:border-tatt-lime/30 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck size={20} className="text-tatt-lime" />
                    <h4 className="font-black text-xs uppercase tracking-widest text-tatt-black">Core Philosophy</h4>
                  </div>
                  <p className="text-sm text-tatt-gray font-semibold italic">"{business.missionAlignment}"</p>
                </div>
                <div className="bg-background/50 p-6 rounded-[24px] border border-border">
                  <p className="text-sm text-tatt-gray font-medium">As a verified TATT partner, {business.name} is committed to the collective prosperity and operational excellence of the African Diaspora.</p>
                </div>
              </div>
              {(business.typicalEngagement || business.partnershipReason) && (
                <div className="mt-8 pt-8 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-8">
                  {business.typicalEngagement && (
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-widest text-tatt-gray mb-3">Community Engagement</h4>
                      <p className="text-sm text-tatt-gray font-medium">{business.typicalEngagement}</p>
                    </div>
                  )}
                  {business.partnershipReason && (
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-widest text-tatt-gray mb-3">Partnership Motivation</h4>
                      <p className="text-sm text-tatt-gray font-medium italic">"{business.partnershipReason}"</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {business.additionalInfo && (
              <section className="bg-background/30 p-8 rounded-[24px] border border-dashed border-border">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-tatt-gray mb-4">More Business Description</h3>
                <p className="text-sm text-tatt-gray/80 font-medium leading-relaxed">
                  {business.additionalInfo}
                </p>
              </section>
            )}

            {/* Conditional Kiongozi Perks: Announcements/Updates */}
            {business.submittedBy?.communityTier === 'KIONGOZI' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="border-b border-border mb-8">
                  <div className="flex gap-10">
                    <button className="pb-4 border-b-4 border-tatt-lime text-tatt-black text-xs font-black uppercase tracking-widest">Partner Updates</button>
                    <button className="pb-4 border-b-4 border-transparent text-tatt-gray hover:text-tatt-black transition-all text-xs font-black uppercase tracking-widest">Business Spotlight</button>
                  </div>
                </div>
                <div className="space-y-6">
                   <div className="p-6 bg-background rounded-2xl flex items-start gap-5 border border-border/50 group hover:border-tatt-lime/20 cursor-default transition-all shadow-sm">
                      <div className="size-12 rounded-xl bg-tatt-lime flex items-center justify-center shrink-0 shadow-lg shadow-tatt-lime/10">
                        <Zap size={24} className="text-tatt-black" />
                      </div>
                      <div>
                         <div className="flex justify-between items-start mb-1">
                            <h4 className="font-black text-tatt-black">Premium Partner Announcement</h4>
                            <span className="text-[10px] text-tatt-gray font-bold uppercase tracking-widest">Kiongozi Tier</span>
                         </div>
                         <p className="text-sm text-tatt-gray/70 font-medium italic">"We are committed to pan-African excellence. Look out for our upcoming spotlights and strategic updates within the TATT ecosystem."</p>
                      </div>
                   </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Right Column (Sidebar Extras) */}
        <div className="space-y-10">
          
          {/* Location & Coverage */}
          <div className="bg-surface border border-border rounded-[32px] p-8 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-tatt-gray mb-8">Business Locations</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="size-12 rounded-xl bg-background border border-border flex items-center justify-center text-tatt-lime">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-tatt-black">{business.locationText}</p>
                  <p className="text-[10px] text-tatt-gray font-bold uppercase tracking-widest">Primary Hub</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="size-12 rounded-xl bg-background border border-border flex items-center justify-center text-tatt-lime">
                  <Handshake size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-tatt-black">{business.chapter?.name || 'Continental Network'}</p>
                  <p className="text-[10px] text-tatt-gray font-bold uppercase tracking-widest">Assigned Chapter</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="size-12 rounded-xl bg-background border border-border flex items-center justify-center text-tatt-lime">
                  <Globe size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-tatt-black">Global Digital Delivery</p>
                  <p className="text-[10px] text-tatt-gray font-bold uppercase tracking-widest">Service Availability</p>
                </div>
              </div>
            </div>
            
            {/* Integrated Map View */}
            <div className="mt-10 rounded-[24px] overflow-hidden h-52 relative group border border-border shadow-inner bg-background">
               <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${business.name} ${business.locationText}`)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                className="grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
               ></iframe>
               <div className="absolute top-4 right-4 z-20 pointer-events-none">
                  <div className="px-3 py-1.5 bg-tatt-black/90 backdrop-blur-sm rounded-lg text-[9px] font-black uppercase tracking-widest text-tatt-lime shadow-xl flex items-center gap-2">
                    <MapPin size={10} /> Active Hub
                  </div>
               </div>
            </div>
          </div>

          {/* Contact Information & Metadata */}
          <div className="bg-tatt-black rounded-[32px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 p-8 opacity-[0.03] translate-x-10 translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-1000">
               <ShieldCheck size={200} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-tatt-lime mb-8 relative z-10">Business Contacts</h3>
            <div className="space-y-6 relative z-10">
              <div className="group/item">
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1.5">
                  Official Email
                </p>
                <p className="text-sm font-bold tracking-tight text-white hover:text-tatt-lime transition-colors truncate">{business.contactEmail}</p>
              </div>
              {business.contactPhone && (
                <div className="group/item">
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1.5">
                    Direct Phone Handline
                  </p>
                  <p className="text-sm font-bold tracking-tight text-white hover:text-tatt-lime transition-colors">{business.contactPhone}</p>
                </div>
              )}
              <div className="group/item">
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1.5">
                  Primary Point of Contact
                </p>
                <p className="text-sm font-bold tracking-tight text-white transition-colors">{business.contactName || 'Corporate Relations'}</p>
                 <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-0.5">Verified TATT Representative</p>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
