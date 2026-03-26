"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Building2, 
  Globe, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Camera,
  ShieldCheck,
  Zap,
  Info,
  Loader2,
  ChevronDown,
  Check
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { toast } from "react-hot-toast";

interface BusinessIntakeFormProps {
  onSuccessRedirect?: string;
  backLink?: string;
  isPublic?: boolean;
}

// Custom Select Component for a premium feel
function CustomSelect({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option",
  required = false
}: { 
  label: string; 
  options: { label: string; value: string }[]; 
  value: string; 
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-background border border-border rounded-2xl px-6 py-4 text-left flex justify-between items-center transition-all ${
          isOpen ? 'ring-2 ring-tatt-lime/50 border-tatt-lime' : 'hover:border-tatt-gray/30'
        } ${!value ? 'text-tatt-gray/60' : 'text-tatt-black font-bold'}`}
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`size-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-tatt-lime' : 'text-tatt-gray'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-[60] mt-2 w-full bg-white border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 py-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="w-full px-6 py-3 text-left hover:bg-tatt-lime/10 flex items-center justify-between group transition-colors"
            >
              <span className={`text-sm ${opt.value === value ? 'text-tatt-lime font-bold' : 'text-tatt-black font-medium'}`}>
                {opt.label}
              </span>
              {opt.value === value && <Check className="size-4 text-tatt-lime" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BusinessIntakeForm({ 
  onSuccessRedirect = '/dashboard/business-center',
  backLink = '/dashboard/business-center',
  isPublic = false
}: BusinessIntakeFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    foundingYear: new Date().getFullYear(),
    website: '',
    locationText: '',
    chapterId: '',
    missionAlignment: '',
    perkOffer: '',
    logoUrl: '',
    contactEmail: '',
    contactPhone: '',
    contactName: '',
    tierRequested: 'Standard Partner',
    agreedToTerms: false
  });

  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tatt_business_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) { console.error("Failed to load draft", e); }
    }
    setHasLoadedDraft(true);
  }, []);

  // Save to localStorage on change ONLY AFTER DRAFT IS LOADED
  useEffect(() => {
    if (hasLoadedDraft) {
      localStorage.setItem('tatt_business_draft', JSON.stringify(formData));
    }
  }, [formData, hasLoadedDraft]);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const { data } = await api.get('/chapters');
        setChapters(data);
      } catch (e) { console.error(e); }
    };
    fetchChapters();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleCustomSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("files", file);

    setIsUploading(true);
    try {
      toast.loading("Uploading brand logo...", { id: 'logo-upload' });
      // Use the base api call, but avoid triggering the auth interceptor redirects if possible
      const response = await api.post("/uploads/media", uploadFormData);
      const imageUrl = response.data.files?.[0]?.url;
      
      if (imageUrl) {
        setFormData(prev => ({ ...prev, logoUrl: imageUrl }));
        toast.success("Logo uploaded successfully!", { id: 'logo-upload' });
      }
    } catch (error: any) {
      // Check if it's a 401/403 despite our efforts, maybe guide the user
      if (error.response?.status === 401 && !isPublic) {
        toast.error("Your session has expired. Please log in again.");
      } else {
        toast.error("Failed to upload logo. Please check file type and size.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      toast.error("Please agree to the TATT partnership terms.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/business-directory/apply', formData);
      toast.success("Application submitted! Our curators will review it shortly.");
      
      // Success: Clear the draft
      localStorage.removeItem('tatt_business_draft');
      
      router.push(onSuccessRedirect);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { label: 'Agriculture & Food', value: 'Agriculture & Food' },
    { label: 'Technology & Innovation', value: 'Technology & Innovation' },
    { label: 'Healthcare & Wellness', value: 'Healthcare & Wellness' },
    { label: 'Creative & Media', value: 'Creative & Media' },
    { label: 'Finance & FinTech', value: 'Finance & FinTech' },
    { label: 'Manufacturing & Trade', value: 'Manufacturing & Trade' },
    { label: 'Education & Research', value: 'Education & Research' },
    { label: 'Professional Services', value: 'Professional Services' },
    { label: 'Hospitality & Tourism', value: 'Hospitality & Tourism' }
  ];

  const chapterOptions = [
    { label: 'Global Presence / None', value: '' },
    ...chapters.map(c => ({ label: c.name, value: c.id }))
  ];

  return (
    <div className="max-w-4xl mx-auto pt-0 pb-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sticky Header with Step Indicator */}
      <div className="sticky top-[64px] lg:top-[72px] z-30 bg-background/95 backdrop-blur-md py-6 mb-8 border-b md:border-none border-border px-4 -mx-4 md:px-0 md:mx-0 flex items-center justify-between transition-all">
        <Link 
          href={backLink}
          className="flex items-center gap-2 text-tatt-gray hover:text-tatt-black transition-colors font-bold text-sm group"
        >
          <div className="size-8 bg-white rounded-full flex items-center justify-center group-hover:bg-tatt-lime/10 transition-all border border-border shadow-sm">
            <ArrowLeft size={16} />
          </div>
          {isPublic ? "Back to Ecosystem Overview" : "Back to Center"}
        </Link>
        <div className="flex items-center gap-2">
           {[1, 2, 3].map((s) => (
             <div 
               key={s} 
               className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= s ? 'bg-tatt-lime' : 'bg-border'}`}
             ></div>
           ))}
        </div>
      </div>

      <div className="bg-white border border-border rounded-[40px] shadow-2xl">
        {/* Banner */}
        <div className="h-40 bg-background border-b border-border flex items-center px-10 relative overflow-hidden rounded-t-[40px]">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Building2 size={120} className="text-tatt-black" />
           </div>
           <div className="size-16 rounded-2xl bg-tatt-lime flex items-center justify-center shadow-lg shadow-tatt-lime/20 relative z-10 transition-transform hover:scale-105 duration-300">
             <Building2 className="text-tatt-black pointer-events-none" size={32} strokeWidth={2.5} />
           </div>
           <div className="ml-6 relative z-10">
              <h1 className="text-2xl font-black text-tatt-black uppercase tracking-tight leading-none">TATT Business Directory Intake</h1>
              <p className="text-tatt-gray text-[10px] font-bold uppercase tracking-widest mt-1">Founding Partner Program</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-12">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-3xl font-black text-tatt-black mb-2">Business Overview</h2>
                <p className="text-tatt-gray font-medium">Tell us about your venture and global presence.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-1">Company Name</label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Onyx Collective"
                    className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-tatt-black focus:ring-2 focus:ring-tatt-lime/50 outline-none transition-all placeholder:text-tatt-gray/40 shadow-inner"
                  />
                </div>

                <CustomSelect 
                  label="Industry / Category"
                  options={categories}
                  value={formData.category}
                  onChange={(val) => handleCustomSelectChange('category', val)}
                  placeholder="Select Category"
                />

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-1">Founding Year</label>
                  <input
                    type="number"
                    name="foundingYear"
                    value={formData.foundingYear}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-tatt-black focus:ring-2 focus:ring-tatt-lime/50 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-1">Official Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-tatt-black focus:ring-2 focus:ring-tatt-lime/50 outline-none transition-all placeholder:text-tatt-gray/40 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-tatt-lime text-tatt-black font-black py-4 px-10 rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-tatt-lime/20"
                >
                  Continue to Impact <ArrowRight size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-3xl font-black text-tatt-black mb-2">Impact & Presence</h2>
                <p className="text-tatt-gray font-medium">How does your business align with TATT values?</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-1">Headquarters / Primary Location</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-tatt-lime size-5" />
                  <input
                    required
                    name="locationText"
                    value={formData.locationText}
                    onChange={handleInputChange}
                    placeholder="e.g. Accra, Ghana / London, UK"
                    className="w-full bg-background border border-border rounded-2xl pl-16 pr-6 py-4 text-tatt-black focus:ring-2 focus:ring-tatt-lime/50 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

               <CustomSelect 
                  label="Relevant Chapter (Optional)"
                  options={chapterOptions}
                  value={formData.chapterId}
                  onChange={(val) => handleCustomSelectChange('chapterId', val)}
                  placeholder="Global Presence / None"
                />

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-1">Mission Alignment Statement</label>
                <textarea
                  required
                  name="missionAlignment"
                  value={formData.missionAlignment}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us how your business contributes to the TATT mission of pan-African excellence..."
                  className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-tatt-black focus:ring-2 focus:ring-tatt-lime/50 outline-none transition-all resize-none shadow-inner"
                ></textarea>
                <p className="text-[10px] text-tatt-gray italic">* This will be reviewed by our curators to ensure value alignment.</p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-tatt-gray font-bold text-sm hover:text-tatt-black transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Previous
                </button>
                <button 
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-tatt-lime text-tatt-black font-black py-4 px-10 rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-tatt-lime/20"
                >
                  Define Your Offer <ArrowRight size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-3xl font-black text-tatt-black mb-2">Final Details & Offer</h2>
                <p className="text-tatt-gray font-medium">Define your contribution to the community.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-10">
                <div className="shrink-0 flex flex-col items-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-tatt-gray mb-3 text-center">Brand Logo</p>
                   <div className="relative group">
                     <div className="size-36 rounded-[32px] bg-background border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-tatt-lime/50 shadow-inner">
                       {formData.logoUrl ? (
                         <img src={formData.logoUrl} alt="Logo" className="size-full object-cover" />
                       ) : (
                         <div className="flex flex-col items-center gap-2 text-tatt-gray opacity-30">
                            <Camera size={40} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Logo</span>
                         </div>
                       )}
                       {isUploading && (
                         <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                           <Loader2 className="animate-spin text-tatt-lime" size={28} />
                         </div>
                       )}
                     </div>
                     <label className="absolute -bottom-2 -right-2 size-12 bg-tatt-lime text-tatt-black rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-90 transition-transform shadow-tatt-lime/30 border-4 border-surface">
                       <Camera size={22} />
                       <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                     </label>
                   </div>
                </div>

                <div className="flex-1 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-1">The Member Perk / Offer Details</label>
                    <textarea
                      required
                      name="perkOffer"
                      value={formData.perkOffer}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="e.g. 15% discount on all consulting services for TATT ID holders / Access to private investment syndicate..."
                      className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-tatt-black focus:ring-2 focus:ring-tatt-lime/50 outline-none transition-all resize-none shadow-inner"
                    ></textarea>
                    <div className="flex items-center gap-2 text-tatt-lime text-[10px] font-bold">
                       <ShieldCheck size={14} /> This perk will be visible in the Business Center.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-1">Point of Contact Name</label>
                      <input
                        required
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-tatt-black focus:ring-2 focus:ring-tatt-lime/50 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-1">Contact Email</label>
                      <input
                        required
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        placeholder="contact@business.com"
                        className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-tatt-black focus:ring-2 focus:ring-tatt-lime/50 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-1">Contact Phone Number</label>
                       <input
                         type="tel"
                         name="contactPhone"
                         value={formData.contactPhone}
                         onChange={handleInputChange}
                         placeholder="+254..."
                         className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-tatt-black focus:ring-2 focus:ring-tatt-lime/50 outline-none transition-all shadow-inner"
                       />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-background border border-border rounded-3xl p-8">
                  <div className="flex items-start gap-4">
                    <input 
                      type="checkbox"
                      id="agreedToTerms"
                      name="agreedToTerms"
                      checked={formData.agreedToTerms}
                      onChange={handleInputChange}
                      className="mt-1 size-5 border-border rounded text-tatt-lime focus:ring-tatt-lime"
                    />
                    <label htmlFor="agreedToTerms" className="text-sm text-tatt-gray leading-relaxed">
                      I confirm that the provided information is accurate and that my business aligns with the core values of <span className="text-tatt-black font-black uppercase tracking-tighter text-[11px]">The African Think Tank</span>. I agree to fulfill the listed member perks for all verified TATT members.
                    </label>
                  </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-tatt-gray font-bold text-sm hover:text-tatt-black transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Previous
                </button>
                <button 
                  type="submit"
                  disabled={loading || !formData.agreedToTerms}
                  className="bg-tatt-lime text-tatt-black font-black py-4 px-12 rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-tatt-lime/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="size-5 animate-spin" /> : (
                    <>Submit Application <CheckCircle2 size={20} strokeWidth={3} /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Info Badge */}
      <div className="mt-12 flex flex-col items-center text-center">
        <div className="size-12 bg-white rounded-full flex items-center justify-center text-tatt-lime mb-4 border border-border shadow-sm">
          <Info size={24} />
        </div>
        <h4 className="text-tatt-black font-black uppercase tracking-widest text-[10px] mb-2">Review Process</h4>
        <p className="text-tatt-gray text-xs max-w-md mx-auto leading-relaxed font-medium">
          Applications are reviewed manually by the TATT Community Curators. This process typically takes 3-5 business days. You will receive an email once your status is updated.
        </p>
      </div>
    </div>
  );
}
