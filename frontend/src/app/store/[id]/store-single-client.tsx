"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/organisms/navbar";
import { Footer } from "@/components/organisms/footer";
import { 
    ChevronRight, 
    ShoppingBag, 
    Loader2,
    Check,
    Plus,
    Minus,
    Truck,
    Info
} from "lucide-react";

import api from "@/services/api";
import { useCart } from "@/context/cart-context";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Variant {
    id: string;
    label: string;
    type: string;
    size?: string;
    color?: string;
    stock: number;
    priceAdjustment?: number;
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
    deliveryFee: number;
}

export function StoreSingleClient() {
    const { id } = useParams();
    const router = useRouter();
    const { addItem } = useCart();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    // Selection state
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState<string>("");

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/store/public/products/${id}`);
            const p = res.data;
            setProduct(p);
            setActiveImage(p.imageUrl);
            
            // Extract unique sizes and colors from combinations
            const allVariants = p.variants || [];
            const sizes = new Set<string>();
            const colors = new Set<string>();

            allVariants.forEach((v: any) => {
                if (v.size) sizes.add(v.size);
                if (v.color) colors.add(v.color);
                
                // Backup parsing if they are combined in label "S / Obsidian"
                if (!v.size || !v.color) {
                  const parts = v.label.split(" / ");
                  if (parts.length === 2) {
                    sizes.add(parts[0]);
                    colors.add(parts[1]);
                  } else if (v.type === 'SIZE') {
                    sizes.add(v.label);
                  } else if (v.type === 'COLOR') {
                    colors.add(v.label);
                  }
                }
            });

            const uniqueSizes = Array.from(sizes);
            const uniqueColors = Array.from(colors);

            if (uniqueSizes.length > 0) setSelectedSize(uniqueSizes[0]);
            if (uniqueColors.length > 0) setSelectedColor(uniqueColors[0]);
            
        } catch (error) {
            console.error("Failed to fetch product", error);
        } finally {
            setLoading(false);
        }
    };

    // Find the variant matching current selection
    const matchingVariant = useMemo(() => {
        if (!product || (!selectedSize && !selectedColor)) return null;
        return product.variants.find(v => {
            const hasSize = v.size === selectedSize || v.label.startsWith(`${selectedSize} /`);
            const hasColor = v.color === selectedColor || v.label.endsWith(`/ ${selectedColor}`);
            return hasSize && hasColor;
        }) || product.variants.find(v => v.label.includes(selectedSize || "") && v.label.includes(selectedColor || ""));
    }, [product, selectedSize, selectedColor]);

    const handleAddToCart = async () => {
        if (!product) return;
        setIsAdding(true);
        try {
            const variantId = matchingVariant?.id || undefined;
            await addItem(product.id, variantId, quantity);
            toast.success("Successfully added to bag.");
        } catch (err) {
            toast.error("Could not add to bag.");
        } finally {
            setIsAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
                <Loader2 className="size-12 text-tatt-lime animate-spin" />
                <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest italic animate-pulse">Retrieving Archive Specs...</p>
            </div>
        );
    }

    if (!product) return null;

    const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size || v.label.split(" / ")[0]).filter(Boolean)));
    const uniqueColors = Array.from(new Set(product.variants.map(v => v.color || v.label.split(" / ")[1]).filter(Boolean)));
    
    const unitPrice = Number(product.price) + (matchingVariant?.priceAdjustment || 0);
    const totalPrice = (unitPrice * quantity).toFixed(2);
    const deliveryFee = Number(product.deliveryFee || 0);

    const allImages = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);

    return (
        <div className="min-h-screen bg-background text-tatt-black font-sans antialiased">
            <Navbar />

            <main className="max-w-[1440px] mx-auto px-6 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 mb-12">
                    <Link href="/store" className="text-[10px] tracking-widest uppercase text-tatt-gray/60 font-black hover:text-tatt-lime transition-colors">Store</Link>
                    <ChevronRight size={10} className="text-tatt-gray/40" />
                    <span className="text-[10px] tracking-widest uppercase text-tatt-gray font-black">{product.category}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
                    {/* Gallery Section */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="aspect-[16/9] w-full bg-surface rounded-3xl overflow-hidden border border-border">
                            <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" src={activeImage} alt={product.name} />
                        </div>
                        <div className="flex gap-4">
                            {allImages.map((img, i) => (
                              <button key={i} onClick={() => setActiveImage(img)} className={`size-16 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-tatt-lime' : 'border-border'}`}>
                                  <img className="w-full h-full object-cover" src={img} alt={`Detail ${i}`} />
                              </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info Section */}
                    <div className="lg:col-span-5 flex flex-col space-y-8">
                        <div>
                            <div className="inline-block bg-tatt-lime text-tatt-black text-[9px] font-black px-3 py-1 mb-4 uppercase tracking-[0.2em]">
                                {product.isLimitedEdition ? "Vault Entry" : "Archive Basic"}
                            </div>
                            <h1 className="text-5xl font-black text-tatt-black mb-2 leading-none uppercase italic tracking-tighter">
                                {product.name}
                            </h1>
                            <div className="flex items-baseline gap-4 mt-2">
                                <p className="text-3xl font-black italic tracking-tighter">${unitPrice.toFixed(2)}</p>
                                {deliveryFee > 0 && <span className="text-[10px] font-black text-tatt-lime uppercase tracking-widest flex items-center gap-1"><Truck size={12} /> +${deliveryFee.toFixed(2)} Service</span>}
                            </div>
                        </div>

                        {/* Size Selection */}
                        {uniqueSizes.length > 0 && (
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Select Size Package</label>
                              <div className="flex flex-wrap gap-2">
                                  {uniqueSizes.map((s) => (
                                      <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest transition-all ${selectedSize === s ? 'border-tatt-lime bg-tatt-lime/5' : 'border-border text-tatt-gray'}`}>
                                          {s}
                                      </button>
                                  ))}
                              </div>
                          </div>
                        )}

                        {/* Color Selection */}
                        {uniqueColors.length > 0 && (
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Archive Colorway</label>
                              <div className="flex flex-wrap gap-3">
                                  {uniqueColors.map((c) => (
                                      <button key={c} onClick={() => setSelectedColor(c)} className={`group relative size-10 rounded-full border-2 transition-all p-0.5 ${selectedColor === c ? 'border-tatt-lime' : 'border-border'}`}>
                                          <div className="w-full h-full rounded-full border border-black/5" style={{ backgroundColor: c.toLowerCase() === 'obsidian' ? '#000' : c.toLowerCase() }} />
                                          {selectedColor === c && <div className="absolute -top-1 -right-1 size-4 bg-tatt-lime rounded-full flex items-center justify-center border-2 border-white"><Check size={8} className="text-tatt-black" /></div>}
                                      </button>
                                  ))}
                              </div>
                          </div>
                        )}

                        {/* Quantity & Summary */}
                        <div className="p-8 rounded-[2.5rem] bg-surface border border-border shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">Quantity Archive</span>
                              <div className="flex items-center gap-4 bg-background px-3 py-2 rounded-xl border border-border">
                                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-tatt-gray hover:text-tatt-black"><Minus size={14} /></button>
                                  <span className="text-sm font-black w-6 text-center">{quantity}</span>
                                  <button onClick={() => setQuantity(q => q + 1)} className="text-tatt-gray hover:text-tatt-black"><Plus size={14} /></button>
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t border-border/50">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Acquisition Total</span>
                                    <h4 className="text-2xl font-black italic tracking-tighter text-tatt-black">${(Number(totalPrice) + deliveryFee).toFixed(2)}</h4>
                                </div>
                                <p className="text-[9px] font-bold text-tatt-gray/50 uppercase mt-1 tracking-widest">Included: {quantity} Unit{quantity > 1 ? 's' : ''} + Fulfillment Tax</p>
                            </div>

                            <button onClick={handleAddToCart} disabled={isAdding} className="w-full h-16 bg-tatt-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-tatt-lime hover:text-tatt-black transition-all flex items-center justify-center gap-3">
                                {isAdding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={18} />}
                                {isAdding ? "PROCESSING..." : "COMMIT TO BAG"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
