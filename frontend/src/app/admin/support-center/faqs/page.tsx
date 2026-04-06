"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
    Plus, 
    Search, 
    BookOpen, 
    ChevronRight, 
    Loader2, 
    TerminalSquare, 
    Trash2, 
    Edit2 
} from "lucide-react";
import api from "@/services/api";

export default function FaqsManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultTopic = searchParams.get('topic') || '';

    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(searchParams.get('create') === 'true');
    const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: defaultTopic || '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const { data } = await api.get('/support/faqs');
            setFaqs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFaq = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const formattedCategory = newFaq.category.toUpperCase().replace(/\s+/g, '_');
            await api.post('/support/faqs', {
                ...newFaq,
                category: formattedCategory
            });
            setIsModalOpen(false);
            setNewFaq({ question: '', answer: '', category: '' });
            fetchFaqs();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const filteredFaqs = faqs.filter(f => {
        const matchesSearch = f.question.toLowerCase().includes(searchTerm.toLowerCase()) || f.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTopic = defaultTopic ? f.category.toLowerCase() === defaultTopic.toLowerCase() : true;
        return matchesSearch && matchesTopic;
    });

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-tatt-gray text-[12px] font-medium tracking-wide uppercase mb-2">
                        <button onClick={() => router.push('/admin/support-center')} className="hover:text-tatt-lime transition-colors">Support Center</button>
                        <ChevronRight className="size-3.5" />
                        <span className="text-foreground font-bold">Knowledge Base</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">
                        {defaultTopic ? `Topic: ${defaultTopic.replace('_', ' ')}` : 'FAQ Management'}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-surface border border-border px-3 py-2 rounded-xl">
                        <Search className="size-4 text-tatt-gray mr-2" />
                        <input 
                            type="text" 
                            placeholder="Search questions or topics..." 
                            className="bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-tatt-gray w-64 p-0 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-tatt-lime text-tatt-black px-4 py-2 rounded-xl text-sm font-black hover:brightness-105 transition-all shadow-sm"
                    >
                        <Plus className="size-4" strokeWidth={3} /> Add FAQ
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <Loader2 className="size-8 animate-spin text-tatt-lime" />
                    <p className="text-[10px] font-bold text-tatt-gray uppercase tracking-widest animate-pulse">Loading Knowledge Base...</p>
                </div>
            ) : filteredFaqs.length === 0 ? (
                <div className="bg-surface border border-border border-dashed rounded-2xl p-16 text-center shadow-sm">
                    <BookOpen className="size-12 text-border mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-foreground mb-2">No Articles Found</h3>
                    <p className="text-sm text-tatt-gray max-w-md mx-auto mb-6">Create standardized responses and categorizations to help automatically resolve common member inquiries.</p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-tatt-lime/10 text-tatt-lime px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-tatt-lime/20 transition-colors inline-block"
                    >
                        Create First Entry
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFaqs.map((faq) => (
                        <div key={faq.id} className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:border-tatt-lime/30 transition-all group flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-background border border-border text-[10px] font-bold tracking-widest uppercase text-tatt-gray px-2.5 py-1 rounded">
                                    {faq.category.replace('_', ' ')}
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-tatt-gray hover:text-foreground transition-colors"><Edit2 size={14}/></button>
                                    <button className="text-tatt-gray hover:text-tatt-error transition-colors"><Trash2 size={14}/></button>
                                </div>
                            </div>
                            <h3 className="text-base font-bold text-foreground mb-3 leading-snug">{faq.question}</h3>
                            <p className="text-sm text-tatt-gray line-clamp-3 leading-relaxed flex-1">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div 
                    onClick={() => setIsModalOpen(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-surface w-full max-w-2xl rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200"
                    >
                        <div className="p-6 border-b border-border flex justify-between items-center bg-background/50">
                            <h2 className="text-lg font-bold text-foreground">Draft New Knowledge Base Article</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-tatt-gray hover:text-foreground text-sm font-bold uppercase">Cancel</button>
                        </div>
                        <form onSubmit={handleCreateFaq} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[11px] font-bold tracking-widest uppercase text-tatt-gray mb-2">Topic Category</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="e.g. MEMBERSHIP, BILLING, TECHNICAL"
                                    value={newFaq.category}
                                    onChange={(e) => setNewFaq({...newFaq, category: e.target.value})}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-tatt-lime outline-none transition-colors uppercase"
                                />
                                <p className="text-[10px] text-tatt-gray mt-1.5">This will automatically group the FAQ on the dashboard.</p>
                            </div>
                            
                            <div>
                                <label className="block text-[11px] font-bold tracking-widest uppercase text-tatt-gray mb-2">Question Title</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="What happens to my data if I cancel?"
                                    value={newFaq.question}
                                    onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-tatt-lime outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold tracking-widest uppercase text-tatt-gray mb-2">Answer</label>
                                <textarea 
                                    required
                                    rows={5}
                                    placeholder="Provide the comprehensive template answer here..."
                                    value={newFaq.answer}
                                    onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-tatt-lime outline-none transition-colors resize-y"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="bg-tatt-lime text-tatt-black px-6 py-2.5 rounded-lg text-sm font-black hover:brightness-105 transition-all shadow-sm disabled:opacity-50"
                                >
                                    {saving ? 'Publishing...' : 'Publish Faqs'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
