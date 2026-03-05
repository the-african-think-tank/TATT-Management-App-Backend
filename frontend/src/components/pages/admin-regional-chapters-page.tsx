"use client";

import { useState } from "react";
import Image from "next/image";
import {
    PlusCircle,
    Search,
    Users,
    ClipboardList,
    Edit,
    Activity,
    Megaphone,
    Info,
    Globe,
    ChevronLeft,
    ChevronRight,
    MapPin,
    X
} from "lucide-react";

export function AdminRegionalChaptersPage() {
    const [activeTab, setActiveTab] = useState("directory");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            {/* Header / Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Regional Chapters Administration</h2>
                    <p className="text-sm text-tatt-gray mt-1">Manage global chapters, leadership, and regional activities.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-tatt-lime hover:brightness-105 text-tatt-black font-bold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all text-sm shrink-0"
                >
                    <PlusCircle className="h-4 w-4" />
                    Create New Chapter
                </button>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <p className="text-sm text-tatt-gray font-medium">Total Chapters</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-3xl font-black text-foreground">12</span>
                        <span className="text-xs text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">+2</span>
                    </div>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <p className="text-sm text-tatt-gray font-medium">Global Volunteers</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-3xl font-black text-foreground">450</span>
                        <span className="text-xs text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">+15%</span>
                    </div>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <p className="text-sm text-tatt-gray font-medium">Active Members</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-3xl font-black text-foreground">1,248</span>
                    </div>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <p className="text-sm text-tatt-gray font-medium">Recent Activities</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-3xl font-black text-foreground">34</span>
                        <span className="text-xs text-tatt-lime font-bold bg-tatt-lime/10 px-1.5 py-0.5 rounded">This Month</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border flex gap-6 overflow-x-auto custom-scrollbar">
                <button
                    className={`whitespace-nowrap px-4 py-3 border-b-2 font-bold text-sm transition-colors ${activeTab === 'directory' ? 'border-tatt-lime text-foreground' : 'border-transparent text-tatt-gray hover:text-foreground'}`}
                    onClick={() => setActiveTab('directory')}
                >
                    Chapter Directory
                </button>
                <button
                    className={`whitespace-nowrap px-4 py-3 border-b-2 font-bold text-sm transition-colors ${activeTab === 'activities' ? 'border-tatt-lime text-foreground' : 'border-transparent text-tatt-gray hover:text-foreground'}`}
                    onClick={() => setActiveTab('activities')}
                >
                    Chapter Activities
                </button>
                <button
                    className={`whitespace-nowrap px-4 py-3 border-b-2 font-bold text-sm transition-colors ${activeTab === 'announcements' ? 'border-tatt-lime text-foreground' : 'border-transparent text-tatt-gray hover:text-foreground'}`}
                    onClick={() => setActiveTab('announcements')}
                >
                    Regional Announcements
                </button>
            </div>

            {/* Chapter Directory Table Area */}
            {activeTab === 'directory' && (
                <div className="space-y-6">
                    {/* Search/Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tatt-gray h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search chapters by name or region..."
                                className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground placeholder:text-tatt-gray/60"
                            />
                        </div>
                    </div>

                    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-background border-b border-border">
                                        <th className="px-6 py-4 text-xs font-bold text-tatt-gray uppercase tracking-wider">Chapter Name & Region</th>
                                        <th className="px-6 py-4 text-xs font-bold text-tatt-gray uppercase tracking-wider">Leadership Team</th>
                                        <th className="px-6 py-4 text-xs font-bold text-tatt-gray uppercase tracking-wider">Quick Stats</th>
                                        <th className="px-6 py-4 text-xs font-bold text-tatt-gray uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {/* Chapter Row 1 */}
                                    <tr className="hover:bg-background/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-foreground flex items-center gap-2">
                                                West Africa - Accra
                                            </div>
                                            <div className="text-sm text-tatt-gray flex items-center gap-1 mt-1">
                                                <MapPin className="h-3 w-3" />
                                                Ghana / ECOWAS Sub-region
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex -space-x-3">
                                                    <div className="size-8 rounded-full border-2 border-surface bg-tatt-lime flex items-center justify-center text-tatt-black font-bold text-xs ring-2 ring-transparent">
                                                        AM
                                                    </div>
                                                    <div className="size-8 rounded-full border-2 border-surface bg-tatt-black flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent">
                                                        KA
                                                    </div>
                                                </div>
                                                <div className="text-xs">
                                                    <p className="font-bold text-foreground">Ama Mensah <span className="text-tatt-gray font-normal">(RD)</span></p>
                                                    <p className="text-tatt-gray mt-0.5">Kofi Addo <span className="opacity-70">(ARD)</span></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex gap-4 items-center">
                                                <div>
                                                    <p className="text-[10px] font-bold text-tatt-gray uppercase tracking-wider">Members</p>
                                                    <p className="text-base font-black text-foreground">120</p>
                                                </div>
                                                <div className="w-px h-6 bg-border"></div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-tatt-gray uppercase tracking-wider">Volunteers</p>
                                                    <p className="text-base font-black text-foreground">45</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" title="Manage Volunteers">
                                                    <Users className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" title="View Activities">
                                                    <ClipboardList className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" title="Edit Chapter">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Chapter Row 2 */}
                                    <tr className="hover:bg-background/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-foreground flex items-center gap-2">
                                                East Africa - Nairobi
                                            </div>
                                            <div className="text-sm text-tatt-gray flex items-center gap-1 mt-1">
                                                <MapPin className="h-3 w-3" />
                                                Kenya / East African Community
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex -space-x-3">
                                                    <div className="size-8 rounded-full border-2 border-surface bg-tatt-lime flex items-center justify-center text-tatt-black font-bold text-xs ring-2 ring-transparent">
                                                        SK
                                                    </div>
                                                    <div className="size-8 rounded-full border-2 border-surface bg-tatt-black flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent">
                                                        FM
                                                    </div>
                                                </div>
                                                <div className="text-xs">
                                                    <p className="font-bold text-foreground">Samuel Kariuki <span className="text-tatt-gray font-normal">(RD)</span></p>
                                                    <p className="text-tatt-gray mt-0.5">Faith Mwashighadi <span className="opacity-70">(ARD)</span></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex gap-4 items-center">
                                                <div>
                                                    <p className="text-[10px] font-bold text-tatt-gray uppercase tracking-wider">Members</p>
                                                    <p className="text-base font-black text-foreground">95</p>
                                                </div>
                                                <div className="w-px h-6 bg-border"></div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-tatt-gray uppercase tracking-wider">Volunteers</p>
                                                    <p className="text-base font-black text-foreground">30</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" title="Manage Volunteers">
                                                    <Users className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" title="View Activities">
                                                    <ClipboardList className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" title="Edit Chapter">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Chapter Row 3 */}
                                    <tr className="hover:bg-background/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-foreground flex items-center gap-2">
                                                Southern Africa - Johannesburg
                                            </div>
                                            <div className="text-sm text-tatt-gray flex items-center gap-1 mt-1">
                                                <MapPin className="h-3 w-3" />
                                                South Africa / SADC
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex -space-x-3">
                                                    <div className="size-8 rounded-full border-2 border-surface bg-tatt-lime flex items-center justify-center text-tatt-black font-bold text-xs ring-2 ring-transparent">
                                                        TM
                                                    </div>
                                                    <div className="size-8 rounded-full border-2 border-surface bg-tatt-black flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent">
                                                        ZD
                                                    </div>
                                                </div>
                                                <div className="text-xs">
                                                    <p className="font-bold text-foreground">Thabo Molefe <span className="text-tatt-gray font-normal">(RD)</span></p>
                                                    <p className="text-tatt-gray mt-0.5">Zanele Dlamini <span className="opacity-70">(ARD)</span></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex gap-4 items-center">
                                                <div>
                                                    <p className="text-[10px] font-bold text-tatt-gray uppercase tracking-wider">Members</p>
                                                    <p className="text-base font-black text-foreground">156</p>
                                                </div>
                                                <div className="w-px h-6 bg-border"></div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-tatt-gray uppercase tracking-wider">Volunteers</p>
                                                    <p className="text-base font-black text-foreground">62</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" title="Manage Volunteers">
                                                    <Users className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" title="View Activities">
                                                    <ClipboardList className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" title="Edit Chapter">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                        <div className="bg-background px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-border gap-4">
                            <p className="text-xs text-tatt-gray font-medium">Showing <span className="text-foreground font-bold">3</span> of <span className="text-foreground font-bold">12</span> chapters</p>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 text-xs font-bold text-tatt-gray bg-surface border border-border rounded-lg shadow-sm hover:bg-background transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeft className="h-3 w-3" />
                                    Prev
                                </button>
                                <button className="px-3 py-1.5 text-xs font-bold text-foreground bg-surface border border-border rounded-lg shadow-sm hover:bg-background transition-colors flex items-center gap-1">
                                    Next
                                    <ChevronRight className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                        {/* Chapter Activities Mini View */}
                        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                                    <Activity className="h-5 w-5 text-tatt-lime" />
                                    Ongoing Activities
                                </h3>
                                <button className="text-[10px] font-black text-tatt-lime uppercase tracking-widest hover:underline" onClick={() => setActiveTab('activities')}>View All</button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-background border-l-4 border-tatt-lime">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <p className="font-bold text-sm text-foreground">Youth Tech Summit - Accra</p>
                                            <p className="text-xs text-tatt-gray mt-1">West Africa Chapter • Dec 12-14, 2023</p>
                                        </div>
                                        <span className="text-[9px] font-black px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-full uppercase tracking-wider shrink-0">Active</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-background border-l-4 border-border">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <p className="font-bold text-sm text-foreground">Economic Policy Review</p>
                                            <p className="text-xs text-tatt-gray mt-1">East Africa Chapter • Jan 5, 2024</p>
                                        </div>
                                        <span className="text-[9px] font-black px-2.5 py-1 bg-surface border border-border text-tatt-gray rounded-full uppercase tracking-wider shrink-0">Draft</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Regional Announcements Mini View */}
                        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                                    <Megaphone className="h-5 w-5 text-tatt-lime" />
                                    Regional Updates
                                </h3>
                                <button className="text-[10px] font-black text-tatt-lime uppercase tracking-widest hover:underline" onClick={() => setActiveTab('announcements')}>New Post</button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex gap-4 p-3 hover:bg-background rounded-xl transition-colors cursor-pointer border border-transparent hover:border-border">
                                    <div className="size-10 bg-tatt-lime/10 rounded-lg flex items-center justify-center text-tatt-lime shrink-0">
                                        <Info className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold leading-tight text-foreground">New reporting guidelines for Q4 launched for all Regional Directors.</p>
                                        <p className="text-[11px] font-medium text-tatt-gray mt-1.5">2 hours ago • Global Admin</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-3 hover:bg-background rounded-xl transition-colors cursor-pointer border border-transparent hover:border-border">
                                    <div className="size-10 bg-tatt-lime/10 rounded-lg flex items-center justify-center text-tatt-lime shrink-0">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold leading-tight text-foreground">Volunteer recruitment drive results: 15% increase in East African region.</p>
                                        <p className="text-[11px] font-medium text-tatt-gray mt-1.5">Yesterday • Operations Team</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab !== 'directory' && (
                <div className="py-12 flex flex-col items-center justify-center bg-surface border border-border border-dashed rounded-xl text-center">
                    <Globe className="h-10 w-10 text-tatt-gray mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-foreground">Content Coming Soon</h3>
                    <p className="text-sm text-tatt-gray mt-2 max-w-sm">
                        The fully featured module for {activeTab === 'activities' ? "Chapter Activities" : "Regional Announcements"} is currently undergoing integration.
                    </p>
                    <button
                        className="mt-6 px-4 py-2 border border-border rounded-lg text-sm font-bold text-foreground hover:bg-background transition-colors"
                        onClick={() => setActiveTab('directory')}
                    >
                        Return to Directory
                    </button>
                </div>
            )}

            {/* Create Chapter Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in transition-opacity">
                    <div className="bg-surface rounded-2xl border border-border w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xl font-bold text-foreground">Create New Chapter</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-tatt-gray hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">Chapter Name</label>
                                <input type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground placeholder-tatt-gray/40" placeholder="e.g. West Africa - Accra" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-1">Country</label>
                                    <input type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground placeholder-tatt-gray/40" placeholder="e.g. Ghana" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-1">State / Region</label>
                                    <input type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground placeholder-tatt-gray/40" placeholder="e.g. Greater Accra" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">City</label>
                                <input type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground placeholder-tatt-gray/40" placeholder="e.g. Accra" />
                            </div>
                            <div className="border-t border-border pt-4 mt-4">
                                <label className="block text-sm font-bold text-foreground mb-1">Regional Director</label>
                                <select className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground">
                                    <option value="">Select a member...</option>
                                    <option value="1">Ama Mensah</option>
                                    <option value="2">Samuel Kariuki</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">Associate Regional Director</label>
                                <select className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground">
                                    <option value="">Select a member...</option>
                                    <option value="3">Kofi Addo</option>
                                    <option value="4">Faith Mwashighadi</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 bg-background border-t border-border flex justify-end gap-3">
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-foreground bg-surface border border-border hover:bg-background transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-tatt-black bg-tatt-lime hover:brightness-105 transition-colors shadow-sm">
                                Create Chapter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
