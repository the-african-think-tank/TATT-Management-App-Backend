"use client";

import { useState, useEffect } from "react";
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
    Layers
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
}

export function StoreClient() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("ALL");

    const categories = [
        { label: "ALL", value: "ALL" },
        { label: "APPAREL", value: "APPAREL" },
        { label: "ACCESSORIES", value: "ACCESSORIES" },
        { label: "HOME DECOR", value: "HOME_DECOR" },
        { label: "LIMITED DROPS", value: "LIMITED_DROPS" },
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
            setProducts(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch store products", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
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

            {/* Toolbar */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-6 lg:px-20 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Categories List */}
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setActiveCategory(cat.value)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                        activeCategory === cat.value 
                                        ? 'bg-tatt-lime text-tatt-black shadow-lg shadow-tatt-lime/20' 
                                        : 'bg-background hover:bg-surface border border-border text-tatt-gray hover:text-foreground'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-tatt-gray group-focus-within:text-tatt-lime transition-colors" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search the collection..."
                                className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-3 text-xs font-bold focus:ring-2 focus:ring-tatt-lime/20 focus:border-tatt-lime transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-[1400px] mx-auto px-6 lg:px-20 py-16 w-full">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="size-12 text-tatt-lime animate-spin" />
                        <p className="text-xs font-black text-tatt-gray uppercase tracking-[0.2em] italic">Curating Premium Goods...</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        {filteredProducts.map((product) => (
                            <div 
                                key={product.id}
                                className="group relative flex flex-col bg-surface rounded-[2rem] border border-border overflow-hidden hover:border-tatt-lime transition-all duration-500 hover:shadow-2xl hover:shadow-tatt-lime/5"
                            >
                                {/* Image Wrapper */}
                                <div className="aspect-square relative overflow-hidden bg-background">
                                    {product.imageUrl ? (
                                        <img 
                                            src={product.imageUrl} 
                                            alt={product.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ImageIcon className="size-12 text-tatt-gray/10" />
                                        </div>
                                    )}
                                    
                                    {/* Quick Labels */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest border border-border shadow-sm">
                                            {product.category.replace('_', ' ')}
                                        </span>
                                        {product.totalSold > 10 && (
                                            <span className="px-3 py-1 bg-tatt-lime/90 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest border border-white/20 shadow-sm flex items-center gap-1">
                                                <Star size={8} className="fill-current" />
                                                Hot Listing
                                            </span>
                                        )}
                                    </div>

                                    {/* Hover Action */}
                                    <div className="absolute inset-0 bg-tatt-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-8 backdrop-blur-[2px]">
                                        <Link 
                                            href={`/store/${product.id}`}
                                            className="w-full py-5 bg-tatt-lime text-tatt-black rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl shadow-tatt-lime/40"
                                        >
                                            View Details <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-3 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <p className="text-[9px] font-black text-tatt-gray uppercase tracking-widest mb-1">{product.brand || "TATT Original"}</p>
                                            <h3 className="text-lg font-black text-foreground italic uppercase tracking-tighter leading-tight group-hover:text-tatt-lime transition-colors">
                                                {product.name}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-foreground tracking-tighter italic">
                                                ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-xs font-medium text-tatt-gray line-clamp-2 leading-relaxed">
                                        {product.description || "A luxury piece from our latest diaspora collective."}
                                    </p>

                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-1.5 overflow-hidden">
                                                {product.variants && product.variants.length > 0 ? (
                                                    product.variants.slice(0, 3).map((v, i) => (
                                                        <div 
                                                            key={v.id} 
                                                            className="size-4 rounded-full border-2 border-surface bg-tatt-lime/20 flex items-center justify-center"
                                                            title={v.label}
                                                        >
                                                            <div className="size-1.5 rounded-full bg-tatt-lime" />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="size-4 rounded-full border-2 border-surface bg-tatt-gray/10" />
                                                )}
                                            </div>
                                            {product.variants && product.variants.length > 3 && (
                                                <span className="text-[8px] font-black text-tatt-gray">+{product.variants.length - 3}</span>
                                            )}
                                        </div>
                                        <span className="text-[8px] font-black text-tatt-gray uppercase tracking-widest underline decoration-tatt-lime/30 underline-offset-4 flex items-center gap-1">
                                            <Layers size={8} />
                                            {product.variants?.length || 0} Variants Available
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                        <div className="size-20 bg-surface border border-border rounded-[2rem] flex items-center justify-center text-tatt-gray/20">
                            <ShoppingBag size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase italic tracking-tight">Archive Empty</h3>
                            <p className="text-sm text-tatt-gray font-medium max-w-xs">
                                We couldn't find any products matching your current filters. Try refreshing your search.
                            </p>
                        </div>
                        <button 
                            onClick={() => { setSearchTerm(""); setActiveCategory("ALL"); }}
                            className="text-[10px] font-black text-tatt-lime uppercase tracking-widest border-b border-tatt-lime pb-1"
                        >
                            Reset Registry
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
