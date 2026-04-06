"use client";

import { useState, useEffect, use, useCallback } from "react";
import { 
    ChevronRight, 
    ChevronLeft,
    Headset, 
    Bold, 
    Italic, 
    Link as LinkIcon, 
    List, 
    Image as ImageIcon,
    Paperclip,
    CheckCircle,
    BarChart,
    HelpCircle,
    Ticket,
    Settings,
    LogOut,
    Search,
    Bell,
    Loader2,
    MessageSquare,
    User as UserIcon,
    Calendar,
    Award,
    TrendingUp,
    ShieldCheck,
    Briefcase,
    FileText,
    Send
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/auth-context";

interface Message {
    id: string;
    message: string;
    isAdminResponse: boolean;
    createdAt: string;
    sender: {
        firstName: string;
        lastName: string;
        profilePicture: string;
    };
}

interface TicketDetail {
    id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    category: string;
    status: string;
    createdAt: string;
    adminNotes?: string;
    resolvedAt?: string;
    attachments?: string[];
    messages?: Message[];
    user: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture: string;
        email: string;
        createdAt: string;
        tattMemberId?: string;
        communityTier?: string;
    };
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [responseText, setResponseText] = useState("");
    const [isResolving, setIsResolving] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const fetchTicket = useCallback(async (silent = false) => {
        try {
            const { data } = await api.get(`/support/cases/${id}`);
            if (data && data.messages) {
                data.messages = [...data.messages].sort((a, b) => 
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
            }
            setTicket(data);
        } catch (error) {
            console.error("Failed to fetch ticket:", error);
            if (!silent) {
                toast.error("Archive not found or access denied.");
                router.push("/dashboard/support");
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchTicket();
        
        // Auto-refresh every 10 seconds to catch new responses
        const interval = setInterval(() => {
            fetchTicket(true);
        }, 10000);

        return () => clearInterval(interval);
    }, [fetchTicket]);

    const handleResolve = async () => {
        if (!ticket) return;
        setIsResolving(true);
        try {
            await api.put(`/support/tickets/${ticket.id}/resolve`, {
                adminNotes: responseText || "Resolved via member dashboard."
            });
            toast.success("Case marked as resolved.");
            fetchTicket(true);
            setResponseText("");
        } catch (error) {
            toast.error("Failed to update status.");
        } finally {
            setIsResolving(false);
        }
    };

    const handleSendResponse = async () => {
        if (!ticket || !responseText) return;
        setIsSending(true);
        try {
            await api.post(`/support/tickets/${ticket.id}/messages`, {
                message: responseText,
                isAdmin: false
            });
            toast.success("Response transmitted to the Archive.");
            fetchTicket(true);
            setResponseText("");
        } catch (error) {
            toast.error("Failed to transmit response.");
        } finally {
            setIsSending(false);
        }
    };

    const handleReopen = async () => {
        if (!ticket) return;
        setIsSending(true);
        try {
            await api.patch(`/support/tickets/${ticket.id}`, {
                status: 'OPEN',
                resolvedAt: null
            });
            toast.success("Ticket successfully reopened for further intelligence.");
            fetchTicket(true);
        } catch (error) {
            toast.error("Failed to reopen ticket.");
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-tatt-lime" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray italic">Retrieving secure archive...</p>
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="bg-background min-h-screen animate-in fade-in duration-700">
            {/* Main Content Stage */}
            <main className="p-6 lg:p-10 max-w-4xl mx-auto w-full space-y-12">
                
                {/* Header Context */}
                <div className="space-y-8 text-left">
                    {/* Breadcrumbs / Status Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-tatt-gray text-[10px] font-black tracking-[0.2em] uppercase">
                            <Link href="/dashboard/support" className="hover:text-tatt-lime transition-colors flex items-center gap-2">
                                <ChevronLeft className="h-3 w-3" /> Support center
                            </Link>
                            <ChevronRight className="h-3 w-3" />
                            <span className="text-foreground">Ticket #{ticket.ticketNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {ticket.category === 'TECHNICAL' && (
                                <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20">High Priority</span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                ticket.status === 'RESOLVED' 
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                    : 'bg-tatt-lime/10 text-tatt-lime border-tatt-lime/20'
                            }`}>
                                {ticket.status}
                            </span>
                        </div>
                    </div>

                    {/* Initial Request Card */}
                    <section className="bg-surface border border-border rounded-[32px] overflow-hidden shadow-sm">
                        <div className="p-10 border-b border-border bg-tatt-black text-white relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-tatt-lime/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                            <h1 className="text-3xl font-black tracking-tighter mb-3 leading-tight italic">{ticket.subject}</h1>
                            <div className="text-[10px] font-black tracking-[0.2em] uppercase text-tatt-lime/60">
                                Initial Request • {new Date(ticket.createdAt).toLocaleString()}
                            </div>
                        </div>
                        <div className="p-10 space-y-8 text-left">
                            <div className="prose prose-invert max-w-none text-tatt-gray leading-relaxed text-sm lg:text-base whitespace-pre-wrap">
                                {ticket.description}
                            </div>

                            {/* Attachments Display */}
                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <div className="pt-8 border-t border-border">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-tatt-gray mb-6 flex items-center gap-2">
                                        <Paperclip className="h-4 w-4 text-tatt-lime" /> Transmitted Assets
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {ticket.attachments.map((asset, idx) => (
                                            <div key={idx} className="group relative rounded-2xl overflow-hidden border border-border bg-background aspect-video flex items-center justify-center">
                                                {asset.startsWith('data:image') || asset.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                    <img 
                                                        src={asset} 
                                                        alt={`Attachment ${idx + 1}`} 
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <FileText className="h-10 w-10 text-tatt-gray" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">Document Archive</span>
                                                    </div>
                                                )}
                                                <a 
                                                    href={asset} 
                                                    download 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 bg-tatt-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm"
                                                >
                                                    <span className="bg-tatt-lime text-tatt-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Download Asset</span>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Ticket History / Thread */}
                <div className="space-y-6">
                    <div className="text-[10px] font-black tracking-[0.3em] uppercase text-tatt-gray/40 flex items-center gap-6">
                        <span className="flex-grow h-px bg-border"></span>
                        Transmission History
                        <span className="flex-grow h-px bg-border"></span>
                    </div>

                    {/* Render the full thread */}
                    {ticket.messages && ticket.messages.length > 0 ? (
                        ticket.messages.map((msg) => (
                            <div key={msg.id} className="flex gap-6 items-start animate-in slide-in-from-bottom-4 duration-500 text-left">
                                {msg.isAdminResponse ? (
                                    <div className="w-10 h-10 rounded-2xl bg-tatt-black flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <ShieldCheck className="text-tatt-lime h-5 w-5" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-2xl overflow-hidden bg-surface border border-border flex-shrink-0 shadow-sm flex items-center justify-center">
                                        {msg.sender?.profilePicture ? (
                                            <img src={msg.sender.profilePicture} alt="user" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-5 h-5 text-tatt-gray" />
                                        )}
                                    </div>
                                )}
                                <div className={`flex-1 border rounded-[24px] p-8 shadow-sm ${msg.isAdminResponse ? 'bg-surface border-tatt-lime/20' : 'bg-background border-border shadow-inner'}`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-[10px] uppercase tracking-widest text-foreground">
                                                {msg.isAdminResponse ? 'TATT Support' : (msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Member')}
                                            </span>
                                            {msg.isAdminResponse && <span className="bg-tatt-lime text-tatt-black px-2 py-0.5 rounded text-[8px] font-black uppercase">Official Response</span>}
                                        </div>
                                        <span className="text-[9px] font-black text-tatt-gray uppercase tracking-widest">
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-tatt-gray text-sm lg:text-base leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        ticket.adminNotes && (
                            <div className="flex gap-6 items-start animate-in slide-in-from-left-4 duration-500 text-left">
                                <div className="w-10 h-10 rounded-2xl bg-tatt-black flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <ShieldCheck className="text-tatt-lime h-5 w-5" />
                                </div>
                                <div className="flex-1 bg-surface border border-tatt-lime/20 rounded-[24px] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-[10px] uppercase tracking-widest text-foreground">TATT Support</span>
                                        </div>
                                        <span className="text-[9px] font-black text-tatt-gray uppercase tracking-widest">Recent</span>
                                    </div>
                                    <p className="text-tatt-gray text-sm lg:text-base leading-relaxed whitespace-pre-wrap">{ticket.adminNotes}</p>
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* Response Area */}
                {ticket.status !== 'RESOLVED' ? (
                    <section className="bg-surface border-2 border-tatt-lime/20 rounded-[32px] shadow-lg overflow-hidden transition-all focus-within:ring-2 focus-within:ring-tatt-lime/20 animate-in slide-in-from-bottom-4">
                        <div className="bg-background/50 p-3 border-b border-border flex gap-2 overflow-x-auto no-scrollbar">
                            {[Bold, Italic, LinkIcon, List, ImageIcon].map((Icon, i) => (
                                <button key={i} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-tatt-lime/10 text-tatt-gray hover:text-tatt-lime transition-all">
                                    <Icon size={18} />
                                </button>
                            ))}
                        </div>
                        <textarea 
                            className="w-full p-10 border-none bg-surface focus:ring-0 text-sm lg:text-base text-foreground placeholder:text-tatt-gray/30 min-h-[160px] resize-none" 
                            placeholder={`Awaiting your response, ${currentUser?.firstName}...`} 
                            rows={6}
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                        />
                        <div className="p-6 bg-background/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray hover:text-tatt-lime transition-all">
                                <Paperclip size={16} /> Add Archive Attachment
                            </button>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <button 
                                    onClick={handleResolve}
                                    disabled={isResolving || isSending}
                                    className="flex-1 sm:flex-none px-8 py-3.5 bg-background text-foreground border border-border font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all disabled:opacity-50"
                                >
                                    {isResolving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark as Resolved"}
                                </button>
                                <button 
                                    onClick={handleSendResponse}
                                    disabled={isSending || isResolving || !responseText}
                                    className="flex-1 sm:flex-none px-10 py-3.5 bg-tatt-lime text-tatt-black font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-tatt-lime/10 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                                >
                                    {isSending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>Submit Response <Send size={14} /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </section>
                ) : (
                    <div className="bg-surface border border-dashed border-border rounded-[32px] p-12 text-center space-y-6">
                        <div className="size-16 rounded-full bg-tatt-lime/10 flex items-center justify-center text-tatt-lime mx-auto">
                            <CheckCircle className="size-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground uppercase tracking-[0.1em] mb-2">Issue Resolved</h3>
                            <p className="text-tatt-gray text-sm max-w-md mx-auto">This case has been documented and archived. If you have follow-up questions or need more help, you can reopen it below.</p>
                        </div>
                        <button 
                            onClick={handleReopen}
                            disabled={isSending}
                            className="bg-tatt-lime text-tatt-black px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-tatt-lime/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                        >
                            {isSending ? <Loader2 className="size-4 animate-spin" /> : <>Reopen support ticket <TrendingUp size={14} /></>}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
