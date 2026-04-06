"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/organisms/navbar";
import { Footer } from "@/components/organisms/footer";
import { 
    Search, 
    ShoppingBag, 
    ChevronRight, 
    ArrowRight,
    Loader2,
    Image as ImageIcon,
    Star,
    Layers,
    ListFilter,
    ChevronDown
} from "lucide-react";
import api from "@/services/api";
import Link from "next/link";

interface Variant {
    id: string;
    label: string;
    stock: number;
    priceAdjustment: number;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    variants: Variant[];
    brand?: string;
    totalSold: number;
    tag?: string | 'NEW' | 'LIMITED';
    variationLabel?: string;
}

export function StoreClient() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("ALL");

    const categories = [
        { label: "ALL COLLECTIONS", value: "ALL" },
        { label: "APPAREL", value: "APPAREL" },
        { label: "MEDIA & BOOKS", value: "BOOKS" },
        { label: "ACCESSORIES", value: "ACCESSORIES" },
        { label: "LIMITED DROPS", value: "LIMITED_DROPS" }
    ];

    useEffect(() => {
        fetchProducts();
    }, [activeCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const categoryParam = activeCategory !== "ALL" ? activeCategory : undefined;
            const res = await api.get("/store/public/products", {
                params: { category: categoryParam }
            });
            const data = res.data.data || [];
            
            if (data.length === 0) {
                setProducts([
                    {
                        id: '1', name: 'Archive Heavyweight Tee', price: 45.00, category: 'APPAREL', 
                        variationLabel: 'ONYX', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000', 
                        tag: 'NEW', totalSold: 100, description: '', variants: []
                    },
                    {
                        id: '2', name: 'Modern Sovereignty Vol. I', price: 32.00, category: 'MEDIA', 
                        variationLabel: 'HARDCOVER', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=1000', 
                        totalSold: 50, description: '', variants: []
                    },
                    {
                        id: '3', name: 'Executive Launch System', price: 120.00, category: 'KITS', 
                        variationLabel: 'PRO', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000', 
                        tag: 'LIMITED', totalSold: 20, description: '', variants: []
                    },
                    {
                        id: '4', name: 'The Signature Hoodie', price: 85.00, category: 'APPAREL', 
                        variationLabel: 'BONE', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1000', 
                        totalSold: 80, description: '', variants: []
                    },
                    {
                        id: '5', name: 'Strategic Archive Journal', price: 28.00, category: 'MEDIA', 
                        variationLabel: 'LINED', imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=1000', 
                        totalSold: 40, description: '', variants: []
                    },
                    {
                        id: '6', name: 'The Catalyst Bundle', price: 95.00, category: 'KITS', 
                        variationLabel: 'INTRO', imageUrl: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?auto=format&fit=crop&q=80&w=1000', 
                        totalSold: 15, description: '', variants: []
                    },
                    {
                        id: '7', name: 'Editorial Script Tee', price: 40.00, category: 'APPAREL', 
                        variationLabel: 'BONE', imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7ec2c?auto=format&fit=crop&q=80&w=1000', 
                        totalSold: 60, description: '', variants: []
                    },
                    {
                        id: '8', name: 'Architectural Print Series', price: 150.00, category: 'MEDIA', 
                        variationLabel: 'LIMITED EDITION', imageUrl: 'https://images.unsplash.com/photo-1513519247388-193ad5102944?auto=format&fit=crop&q=80&w=1000', 
                        totalSold: 10, description: '', variants: []
                    }
                ]);
            } else {
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch store products", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-tatt-black">
            <Navbar />

            {/* RESTORED ORIGINAL HERO SECTION */}
            <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-tatt-black">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-tatt-black via-tatt-black/80 to-transparent z-10" />
                    <img 
                        src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=2070" 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-60 grayscale"
                    />
                </div>
                
                <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-20 w-full">
                    <div className="max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-tatt-lime/20 border border-tatt-lime/30 rounded-full text-[10px] font-black uppercase tracking-widest text-tatt-lime">
                            <span className="size-1.5 rounded-full bg-tatt-lime animate-pulse" />
                            Official Merchandise
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.85]">
                            The TATT <br />Collective Store
                        </h1>
                        <p className="text-lg text-white/70 font-medium max-w-lg">
                            Premium apparel and accessories designed for the global African diaspora. Wear the mission, share the impact.
                        </p>
                    </div>
                </div>
            </section>

            {/* Gallery Controls (Sticky Bar from New Design) */}
            <div id="archive-grid" className="border-t border-b border-gray-100 sticky top-0 z-40 bg-white/95 backdrop-blur-xl">
                <div className="max-w-[1600px] mx-auto px-6 lg:px-20 py-5 flex flex-wrap items-center justify-between gap-6">
                    {/* Category Selection */}
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setActiveCategory(cat.value)}
                                className={`px-6 h-11 flex items-center justify-center rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border transition-all whitespace-nowrap ${
                                    activeCategory === cat.value 
                                    ? 'bg-tatt-black text-white border-tatt-black shadow-lg shadow-black/10' 
                                    : 'bg-white border-gray-100 text-tatt-gray hover:border-tatt-black hover:text-tatt-black'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Sorting & Stats */}
                    <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">
                        <div className="hidden md:flex items-center gap-2 cursor-pointer hover:text-tatt-black transition-colors">
                            <ListFilter size={14} className="text-tatt-black" />
                            <span>Sort By: Newest</span>
                        </div>
                        <div className="h-4 w-px bg-gray-200 hidden md:block" />
                        <div className="flex items-center gap-2">
                            <span>Displaying {filteredProducts.length} Items</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Product Grid */}
            <main className="flex-1 max-w-[1600px] mx-auto px-6 lg:px-20 py-24 w-full">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="size-16 border-4 border-gray-100 border-t-tatt-black rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.4em] animate-pulse">Synchronizing Inventory...</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="space-y-24">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
                            {filteredProducts.map((product) => (
                                <Link 
                                    key={product.id}
                                    href={`/store/${product.id}`}
                                    className="group block space-y-6"
                                >
                                    <div className="aspect-[1/1] relative overflow-hidden bg-[#f3f4f1] rounded-[2rem] p-0 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-black/5">
                                        {product.imageUrl ? (
                                            <img 
                                                src={product.imageUrl} 
                                                alt={product.name}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <ImageIcon className="size-12 text-gray-200" />
                                            </div>
                                        )}
                                        
                                        {product.tag && (
                                            <div className="absolute top-6 left-6">
                                                <span className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] ${
                                                    product.tag === 'NEW' ? 'bg-tatt-lime text-tatt-black' : 'bg-tatt-black text-white'
                                                }`}>
                                                    {product.tag}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-1 space-y-1.5">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="text-base font-black text-tatt-black uppercase tracking-tight leading-snug group-hover:underline decoration-2 underline-offset-8 decoration-tatt-lime transition-all">
                                                {product.name}
                                            </h3>
                                            <p className="text-base font-black text-tatt-black tracking-tight shrink-0 italic">
                                                ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <p className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em] opacity-50">
                                            {product.category.replace('_', ' ')} &mdash; {product.variationLabel || "CORE"}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="flex justify-center pt-10">
                            <button className="h-16 px-12 border border-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-tatt-black hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow-sm">
                                Load More Archive
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 text-center space-y-8">
                        <div className="size-24 border-2 border-dashed border-gray-100 rounded-full flex items-center justify-center text-tatt-gray/20">
                            <ShoppingBag size={48} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Archive Filtered</h3>
                            <p className="text-sm text-tatt-gray font-medium max-w-sm mx-auto leading-relaxed">
                                No items match your current refined criteria.
                            </p>
                        </div>
                        <button 
                            onClick={() => { setSearchTerm(""); setActiveCategory("ALL"); }}
                            className="h-14 px-10 border border-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-tatt-black hover:text-white transition-all"
                        >
                            Reset Focus
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
