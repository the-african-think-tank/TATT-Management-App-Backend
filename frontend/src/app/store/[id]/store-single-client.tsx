"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/organisms/navbar";
import { Footer } from "@/components/organisms/footer";
import { 
    ArrowLeft, 
    ShoppingBag, 
    Star, 
    Truck, 
    ShieldCheck, 
    RefreshCw,
    Loader2,
    Image as ImageIcon,
    Check,
    Calendar,
    Clock,
    Zap
} from "lucide-react";
import api from "@/services/api";
import { useCart } from "@/context/cart-context";

interface Variant {
    id: string;
    label: string;
    type: string;
    size?: string;
    color?: string;
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
    additionalImages: string[];
    variants: Variant[];
    brand?: string;
    totalSold: number;
    stock: number;
    isLimitedEdition?: boolean;
    dropStart?: string;
    dropEnd?: string;
}

export function StoreSingleClient() {
    const { id } = useParams();
    const router = useRouter();
    const { addItem } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState<string>("");

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/store/public/products/${id}`);
            setProduct(res.data);
            setActiveImage(res.data.imageUrl);
            // Default select first variant if available
            if (res.data.variants?.length > 0) {
                setSelectedVariant(res.data.variants[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch product", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;
        await addItem(product.id, selectedVariant || undefined, 1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="size-12 text-tatt-lime animate-spin" />
                    <p className="text-xs font-black text-tatt-gray uppercase tracking-widest italic">Retrieving Luxury Specs...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) return null;

    const currentVariant = product.variants?.find(v => v.id === selectedVariant);
    const displayPrice = (Number(product.price) + (currentVariant?.priceAdjustment || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 });
    const allImages = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);
    
    const isAvailable = product.variants?.length > 0 
        ? (currentVariant && currentVariant.stock > 0)
        : (product.stock > 0);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-[1400px] mx-auto px-6 lg:px-20 py-12 w-full">
                {/* Breadcrumbs / Back */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-tatt-gray hover:text-tatt-black transition-colors mb-10 group"
                >
                    <div className="size-8 rounded-full border border-border flex items-center justify-center group-hover:bg-tatt-lime/10 group-hover:border-tatt-lime transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Return to Collection</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Media Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-square relative rounded-[3rem] border border-border overflow-hidden bg-surface group shadow-2xl shadow-tatt-lime/5">
                            <img 
                                src={activeImage} 
                                alt={product.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-6 left-6">
                                <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-border">
                                    {product.category}
                                </span>
                            </div>
                        </div>
                        
                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`size-24 rounded-2xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                                            activeImage === img ? 'border-tatt-lime scale-105 shadow-lg' : 'border-border hover:border-tatt-lime/50'
                                        }`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Specs */}
                    <div className="flex flex-col">
                        <div className="space-y-4 mb-8">
                            {product.isLimitedEdition && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-tatt-black text-tatt-lime w-fit rounded-full">
                                    <Zap size={14} className="fill-current" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">Limited Edition Drop</span>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-tatt-lime">
                                <div className="flex">
                                    {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-current" />)}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">Premium Collective Quality</span>
                            </div>
                            <p className="text-xs font-black text-tatt-gray uppercase tracking-[0.3em]">{product.brand || "TATT Original"}</p>
                            <h1 className="text-5xl lg:text-7xl font-black text-foreground italic uppercase tracking-tighter leading-[0.85]">
                                {product.name}
                            </h1>
                            <div className="flex items-baseline gap-4">
                                <p className="text-4xl font-black text-foreground tracking-tighter italic">${displayPrice}</p>
                                <span className="text-xs font-bold text-tatt-gray uppercase tracking-widest">Inclusive of taxes</span>
                            </div>
                        </div>

                        {product.isLimitedEdition && (product.dropStart || product.dropEnd) && (
                            <div className="mb-10 p-6 rounded-3xl bg-tatt-lime/5 border border-tatt-lime/20 space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-tatt-black">Availability Window</h4>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-white flex items-center justify-center text-tatt-lime border border-tatt-lime/10">
                                            <Calendar size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-tatt-gray uppercase tracking-widest">Sourcing Starts</p>
                                            <p className="text-[10px] font-black">{product.dropStart ? new Date(product.dropStart).toLocaleDateString() : 'Immediate'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-white flex items-center justify-center text-tatt-lime border border-tatt-lime/10">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-tatt-gray uppercase tracking-widest">Vault Closes</p>
                                            <p className="text-[10px] font-black">{product.dropEnd ? new Date(product.dropEnd).toLocaleDateString() : 'Permanent'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="prose prose-sm text-tatt-gray font-medium leading-relaxed max-w-xl mb-10">
                            {product.description || "Designed for the global African diaspora, this piece combines cultural heritage with contemporary luxury."}
                        </div>

                        {/* Variant Selection */}
                        {product.variants?.length > 0 && (
                            <div className="space-y-6 mb-10">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-tatt-black mb-4">Select Specification</h4>
                                    <div className="flex flex-wrap gap-4">
                                        {product.variants.map((variant) => (
                                            <button
                                                key={variant.id}
                                                onClick={() => setSelectedVariant(variant.id)}
                                                className={`px-6 py-4 rounded-2xl border-2 transition-all flex flex-col gap-2 min-w-[120px] ${
                                                    selectedVariant === variant.id 
                                                    ? 'border-tatt-lime bg-tatt-lime/5 text-tatt-black' 
                                                    : 'border-border text-tatt-gray hover:border-tatt-lime/30'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                        {variant.label || 'V-SPEC'}
                                                    </span>
                                                    {selectedVariant === variant.id && <Check size={14} className="text-tatt-lime" />}
                                                </div>
                                                
                                                <div className="flex items-center gap-3">
                                                    {variant.color && (
                                                        <div 
                                                            className="size-4 rounded-full border border-black/10 flex-shrink-0"
                                                            style={{ backgroundColor: variant.color.toLowerCase() === 'obsidian' ? '#181811' : variant.color.toLowerCase() }}
                                                            title={`Color: ${variant.color}`}
                                                        />
                                                    )}
                                                    {variant.size && (
                                                        <span className="text-[14px] font-bold tracking-tighter italic">
                                                            {variant.size}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-4">
                                    <div className={`size-2 rounded-full ${currentVariant?.stock && currentVariant.stock > 0 ? 'bg-tatt-lime animate-pulse' : 'bg-red-500'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">
                                        {currentVariant?.stock && currentVariant.stock > 0 
                                            ? `In Stock Across Network (${currentVariant.stock} units)` 
                                            : 'Temporarily Sourced Out'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Area */}
                        <div className="mt-auto space-y-6">
                            {!currentVariant && product.variants?.length > 0 && (
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">Please select a variant to continue</p>
                            )}
                            <button 
                                onClick={handleAddToCart}
                                disabled={!isAvailable || (product.variants?.length > 0 && !currentVariant)}
                                className="w-full py-6 bg-tatt-lime text-tatt-black rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:brightness-105 transition-all shadow-xl shadow-tatt-lime/20 disabled:opacity-50 disabled:grayscale"
                            >
                                <ShoppingBag size={18} />
                                {isAvailable ? "Add to Cart" : "Temporarily Sourced Out"}
                            </button>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                                <div className="text-center space-y-2">
                                    <div className="size-10 mx-auto rounded-xl bg-surface border border-border flex items-center justify-center text-tatt-lime">
                                        <Truck size={18} />
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-tatt-gray">Global Shipping</p>
                                </div>
                                <div className="text-center space-y-2">
                                    <div className="size-10 mx-auto rounded-xl bg-surface border border-border flex items-center justify-center text-tatt-lime">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-tatt-gray">Secure Checkout</p>
                                </div>
                                <div className="text-center space-y-2">
                                    <div className="size-10 mx-auto rounded-xl bg-surface border border-border flex items-center justify-center text-tatt-lime">
                                        <RefreshCw size={18} />
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-tatt-gray">Easy Returns</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
