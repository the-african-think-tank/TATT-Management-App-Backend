"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Archive as Inventory2,
    PlayCircle,
    FileText,
    TrendingUp,
    TrendingDown,
    MoreVertical,
    File as ArticleIcon,
    BookOpen as AutoStories,
    Handshake,
    Loader2,
    X,
    ExternalLink,
    AlertCircle
} from "lucide-react";
import api from "@/services/api";
import { toast, Toaster } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

export default function ResourcesAdminPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, videos: 0, guides: 0 });
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [activeTab, setActiveTab] = useState<string | null>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        type: "DOCUMENT",
        contentUrl: "",
        thumbnailUrl: "",
        minTier: "FREE",
    });

    const fetchResources = async (page = 1, type = activeTab) => {
        setLoading(true);
        try {
            const params: any = { page, limit: 10 };
            if (type && type !== "ALL") params.type = type;

            const [res, statsRes] = await Promise.all([
                api.get("/resources", { params }),
                api.get("/resources/stats")
            ]);
            
            setResources(res.data.data || []);
            setMeta(res.data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
            setStats(statsRes.data);
        } catch (error) {
            console.error("Error fetching resources", error);
            toast.error("Failed to load resources");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources(1, activeTab);
    }, [activeTab]);

    const handleCreateResource = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post("/resources", {
                ...formData,
                visibility: "PUBLIC"
            });
            toast.success("Resource created successfully!");
            setIsModalOpen(false);
            setFormData({
                title: "",
                type: "DOCUMENT",
                contentUrl: "",
                thumbnailUrl: "",
                minTier: "FREE",
            });
            fetchResources(1, activeTab);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create resource");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteResource = async (id: string) => {
        if (!confirm("Are you sure you want to archive this resource?")) return;
        try {
            await api.delete(`/resources/${id}`);
            toast.success("Resource archived");
            fetchResources(meta.page, activeTab);
        } catch (error: any) {
            toast.error("Failed to archive resource");
        }
    };

    const tabs = [
        { label: "All Resources", value: "ALL" },
        { label: "Guides", value: "GUIDE" },
        { label: "Documents", value: "DOCUMENT" },
        { label: "Videos", value: "VIDEO" },
        { label: "Partnerships", value: "PARTNERSHIP" },
    ];

    const getIconForType = (type: string) => {
        switch (type) {
            case "DOCUMENT": return <ArticleIcon size={14} className="mr-1" />;
            case "VIDEO": return <PlayCircle size={14} className="mr-1" />;
            case "GUIDE": return <AutoStories size={14} className="mr-1" />;
            case "PARTNERSHIP": return <Handshake size={14} className="mr-1" />;
            default: return <FileText size={14} className="mr-1" />;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <Toaster position="top-right" />
            
            <header className="pb-4 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">Resource Management Hub</h2>
                        <p className="mt-1 text-slate-500 text-base">Central control for all educational materials, guides, and partnership content.</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-tatt-lime text-tatt-black rounded-lg font-bold hover:brightness-110 shadow-sm transition-all"
                    >
                        <Plus size={20} />
                        Create New Resource
                    </button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Resources</span>
                            <div className="p-2 bg-tatt-lime/10 rounded-lg text-tatt-lime-dark">
                                <Inventory2 size={24} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">{stats.total}</span>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Video Content</span>
                            <div className="p-2 bg-tatt-lime/10 rounded-lg text-tatt-lime-dark">
                                <PlayCircle size={24} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">{stats.videos}</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Exclusive Guides</span>
                            <div className="p-2 bg-tatt-lime/10 rounded-lg text-tatt-lime-dark">
                                <FileText size={24} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">{stats.guides}</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-hide shrink-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value === "ALL" ? null : tab.value)}
                            className={`px-6 py-3 border-b-2 text-sm whitespace-nowrap transition-colors ${
                                (activeTab === tab.value) || (tab.value === "ALL" && activeTab === null)
                                    ? "border-tatt-lime text-slate-900 font-bold"
                                    : "border-transparent text-slate-500 hover:text-slate-700 font-medium"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Table Content */}
            <section className="pt-4 flex-1 flex flex-col min-h-0">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0">
                    <div className="overflow-auto flex-1 h-0">
                        <table className="w-full text-left border-collapse relative">
                            <thead className="sticky top-0 bg-slate-50 shadow-sm z-10">
                                <tr className="border-b border-slate-200">
                                    <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Resource Title</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Target Membership</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading && resources.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400">
                                            <Loader2 size={32} className="animate-spin mx-auto mb-3" />
                                            <p>Loading catalog...</p>
                                        </td>
                                    </tr>
                                ) : resources.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-slate-400">
                                            <Inventory2 size={48} className="mx-auto mb-4 opacity-20" />
                                            <p className="font-medium text-lg text-slate-600">No resources found</p>
                                            <p className="text-sm">Click "Create New Resource" to add content to your catalog.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    resources.map((resource) => (
                                        <tr key={resource.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    {resource.thumbnailUrl && (
                                                        <img src={resource.thumbnailUrl} alt="" className="w-12 h-12 rounded object-cover border border-slate-100" />
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900 group-hover:text-tatt-lime-dark transition-colors">{resource.title}</span>
                                                        <span className="text-xs text-slate-500 mt-0.5">Added {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold leading-none ${
                                                    resource.type === 'VIDEO' ? 'bg-orange-100 text-orange-700' :
                                                    resource.type === 'DOCUMENT' ? 'bg-blue-100 text-blue-700' :
                                                    resource.type === 'PARTNERSHIP' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {getIconForType(resource.type)}
                                                    <span className="capitalize">{resource.type.toLowerCase()}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-sm font-bold px-3 py-1 rounded border ${
                                                    resource.minTier === 'FREE' ? 'border-slate-200 text-slate-600 bg-slate-50' :
                                                    'border-tatt-lime-dark/20 text-tatt-lime-dark bg-tatt-lime/10'
                                                }`}>
                                                    {resource.minTier}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {resource.contentUrl && (
                                                        <a href={resource.contentUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="View Link">
                                                            <ExternalLink size={18} />
                                                        </a>
                                                    )}
                                                    <button onClick={() => handleDeleteResource(resource.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Archive">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 shrink-0 gap-4">
                        <span className="text-sm text-slate-500 font-medium">
                            Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} resources
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => fetchResources(meta.page - 1)}
                                disabled={meta.page <= 1}
                                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 text-sm font-medium bg-white"
                            >
                                Previous
                            </button>
                            <button 
                                onClick={() => fetchResources(meta.page + 1)}
                                disabled={meta.page >= meta.totalPages}
                                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 text-sm font-medium bg-white"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-900">Add New Resource</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateResource} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Resource Title <span className="text-red-500">*</span></label>
                                <input 
                                    required 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-tatt-lime outline-none font-medium"
                                    placeholder="e.g. 2024 Industry Outlook"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Resource Type</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-tatt-lime outline-none font-medium appearance-none"
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    >
                                        <option value="DOCUMENT">Document</option>
                                        <option value="VIDEO">Video</option>
                                        <option value="GUIDE">Guide</option>
                                        <option value="PARTNERSHIP">Partnership</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target Membership</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-tatt-lime outline-none font-medium appearance-none"
                                        value={formData.minTier}
                                        onChange={(e) => setFormData({...formData, minTier: e.target.value})}
                                    >
                                        <option value="FREE">Free Members</option>
                                        <option value="UBUNTU">Ubuntu (Base)</option>
                                        <option value="IMANI">Imani (Mid)</option>
                                        <option value="KIONGOZI">Kiongozi (Top)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Link / Content URL</label>
                                <input 
                                    type="url"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-tatt-lime outline-none font-medium"
                                    placeholder="https://"
                                    value={formData.contentUrl}
                                    onChange={(e) => setFormData({...formData, contentUrl: e.target.value})}
                                />
                                <p className="text-[10px] text-slate-400 mt-1.5 font-medium flex items-center gap-1">
                                    <AlertCircle size={12} /> URLs to Google Drive, YouTube, or external partner portals.
                                </p>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Thumbnail URL (Optional)</label>
                                <input 
                                    type="url"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-tatt-lime outline-none font-medium"
                                    placeholder="https://"
                                    value={formData.thumbnailUrl}
                                    onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button disabled={isSubmitting} type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-tatt-lime hover:bg-tatt-lime-dark text-tatt-black transition-colors rounded-lg font-bold disabled:opacity-50">
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    Deploy to Hub
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
