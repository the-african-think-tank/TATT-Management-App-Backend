"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronRight,
    ArrowLeft,
    CheckCircle,
    Edit3,
    Plus,
    TrendingUp,
    Info,
    CreditCard,
    Warehouse,
    BarChart3,
    DollarSign,
    Download,
    MoreVertical,
    X,
    Eye,
    EyeOff,
    Loader2,
    Image as ImageIcon,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

interface Variant {
    id: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
    label: string;
    type: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    brand: string;
    price: number;
    currency: string;
    stock: number;
    lowStockThreshold: number;
    imageUrl: string;
    additionalImages: string[];
    totalSold: number;
    status: string;
    createdAt: string;
    variants: Variant[];
}

export default function ProductDetailsPage() {
    const router = useRouter();
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    const [updating, setUpdating] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [showThresholdModal, setShowThresholdModal] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<string>("");
    const [stockToAdd, setStockToAdd] = useState<number>(0);
    const [newThreshold, setNewThreshold] = useState<number>(0);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/store/products/${id}`);
            const data = res.data;
            setProduct(data);
            setNewThreshold(data.lowStockThreshold);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load product details");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickStockAdd = async () => {
        if (!selectedVariant && product?.variants?.length) {
            toast.error("Please select a variant");
            return;
        }
        if (stockToAdd <= 0) {
            toast.error("Enter a valid stock amount");
            return;
        }

        setUpdating(true);
        try {
            if (selectedVariant) {
                // Update variant stock
                const variant = product?.variants.find(v => v.id === selectedVariant);
                const currentStock = variant?.stock || 0;
                await api.patch(`/store/variants/${selectedVariant}/stock`, { 
                    stock: currentStock + stockToAdd 
                });
            } else {
                // Update global product stock
                await api.patch(`/store/products/${id}/stock`, { 
                    adjustment: stockToAdd 
                });
            }
            toast.success("Inventory updated");
            setShowStockModal(false);
            setStockToAdd(0);
            fetchProduct();
        } catch (error) {
            toast.error("Failed to update stock");
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateThreshold = async () => {
        setUpdating(true);
        try {
            await api.patch(`/store/products/${id}`, { 
                lowStockThreshold: newThreshold 
            });
            toast.success("Alert threshold updated");
            setShowThresholdModal(false);
            fetchProduct();
        } catch (error) {
            toast.error("Failed to update threshold");
        } finally {
            setUpdating(false);
        }
    };

    const handleTogglePublish = async () => {
        const newStatus = product?.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
        setUpdating(true);
        try {
            await api.patch(`/store/products/${id}`, { status: newStatus });
            toast.success(newStatus === 'ACTIVE' ? "Listing Published" : "Listing Unpublished");
            fetchProduct();
        } catch (error) {
            toast.error("Status update failed");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 text-tatt-lime animate-spin" />
                <p className="text-tatt-gray font-bold uppercase tracking-widest text-xs italic">Fetching Product Intelligence...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Warehouse className="h-16 w-16 text-tatt-gray/20" />
                <h3 className="text-xl font-black uppercase italic tracking-tight">Product Not Found</h3>
                <button 
                    onClick={() => router.push("/admin/sales-inventory")}
                    className="text-xs font-black text-tatt-lime uppercase tracking-widest border-b border-tatt-lime pb-1"
                >
                    Return to Inventory
                </button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push("/admin/sales-inventory")}
                        className="size-10 rounded-xl bg-surface border border-border flex items-center justify-center text-tatt-gray hover:text-foreground hover:border-tatt-lime transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-1">
                            <span>Inventory</span>
                            <ChevronRight size={10} />
                            <span>{product.category}</span>
                            <ChevronRight size={10} />
                            <span className="text-foreground">{product.name}</span>
                        </div>
                        <h1 className="text-3xl font-black text-foreground italic uppercase tracking-tight">
                            Viewing Listing Details
                        </h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.push(`/admin/sales-inventory/edit/${id}`)}
                        className="px-6 py-3 rounded-xl bg-surface border border-border text-xs font-black uppercase tracking-widest hover:bg-background transition-all flex items-center gap-2"
                    >
                        <Edit3 size={16} className="text-tatt-lime" />
                        Modify Listing
                    </button>
                    <button 
                        onClick={() => setShowStockModal(true)}
                        className="px-6 py-3 rounded-xl bg-tatt-lime text-tatt-black text-xs font-black uppercase tracking-widest shadow-lg shadow-tatt-lime/20 hover:brightness-105 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Quick Stock Add
                    </button>
                </div>
            </div>

            {/* Hero Summary Card */}
            <div className="bg-surface rounded-[2.5rem] border border-border overflow-hidden shadow-sm flex flex-col lg:flex-row">
                <div className="lg:w-1/3 aspect-[4/3] lg:aspect-auto relative group overflow-hidden">
                    {product.imageUrl ? (
                        <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-background flex items-center justify-center">
                            <ImageIcon className="size-16 text-tatt-gray/20" />
                        </div>
                    )}
                    <div className="absolute top-6 left-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 border shadow-sm backdrop-blur-md ${
                            product.stock > 0 
                                ? 'bg-tatt-lime/90 text-tatt-black border-white/20' 
                                : 'bg-red-500/90 text-white border-white/20'
                        }`}>
                            <div className={`size-1.5 rounded-full ${product.stock > 0 ? 'bg-tatt-black animate-pulse' : 'bg-white'}`}></div>
                            {product.stock > 0 ? 'Live & In Stock' : 'Out of Stock'}
                        </span>
                    </div>
                </div>
                
                <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-tatt-lime uppercase underline decoration-tatt-lime/30 underline-offset-4 tracking-widest">
                                {product.brand || "TATT ORIGINAL"}
                            </span>
                            <div className="size-1 bg-tatt-gray/40 rounded-full"></div>
                            <span className="text-[10px] font-bold text-tatt-gray uppercase tracking-widest">
                                SKU: {product.id.slice(0, 8).toUpperCase()}
                            </span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-foreground italic uppercase tracking-tighter leading-[0.9]">
                            {product.name}
                        </h2>
                        <p className="text-tatt-gray text-base font-bold leading-relaxed max-w-2xl mt-4">
                            {product.description || "No luxury description provided for this listing."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 mt-12 pt-10 border-t border-border">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-tatt-gray/60 uppercase tracking-widest">Total Sales Volume</p>
                            <h4 className="text-2xl font-black text-foreground">
                                ${(product.totalSold * product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h4>
                            <div className="flex items-center gap-1.5 text-tatt-lime text-[10px] font-bold uppercase tracking-tight">
                                <TrendingUp size={12} />
                                High Performance
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-tatt-gray/60 uppercase tracking-widest">Units Sold</p>
                            <h4 className="text-2xl font-black text-foreground">{product.totalSold.toLocaleString()}</h4>
                            <p className="text-[10px] font-bold text-tatt-gray uppercase tracking-widest">Life-to-date</p>
                        </div>
                        <div className="hidden lg:block space-y-1">
                            <p className="text-[10px] font-black text-tatt-gray/60 uppercase tracking-widest">Current Stock</p>
                            <h4 className="text-2xl font-black text-foreground">{product.stock.toLocaleString()}</h4>
                            <p className="text-[10px] font-bold text-tatt-gray uppercase tracking-widest">Global Units</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Meta & Info */}
                <div className="space-y-8">
                    {/* Information Grid */}
                    <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="size-10 rounded-xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                                <Info size={20} />
                            </div>
                            <h3 className="font-black text-sm uppercase italic tracking-widest">Product Information</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[8px] font-black text-tatt-gray uppercase tracking-[0.2em] mb-2">Category Segment</label>
                                <p className="text-sm font-black text-foreground uppercase tracking-tight underline decoration-tatt-lime decoration-2 underline-offset-8 decoration-wavy/20">
                                    {product.category.replace('_', ' ')}
                                </p>
                            </div>
                            <div className="group/threshold relative">
                                <label className="block text-[8px] font-black text-tatt-gray uppercase tracking-[0.2em] mb-2">Inventory Logic</label>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-foreground">
                                        Low stock alert set at <span className="text-tatt-lime font-black underline">{product.lowStockThreshold} units</span>
                                    </p>
                                    <button 
                                        onClick={() => setShowThresholdModal(true)}
                                        className="text-[8px] font-black text-tatt-lime uppercase underline tracking-widest opacity-0 group-hover/threshold:opacity-100 transition-opacity"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[8px] font-black text-tatt-gray uppercase tracking-[0.2em] mb-2">Registry Date</label>
                                <p className="text-xs font-black text-foreground uppercase tracking-widest">
                                    {new Date(product.createdAt).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <CreditCard size={120} className="-mr-10 -mt-10" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <div className="size-10 rounded-xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                                <DollarSign size={20} />
                            </div>
                            <h3 className="font-black text-sm uppercase italic tracking-widest">Valuation & Revenue</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-border border-dashed">
                                <span className="text-[10px] font-bold text-tatt-gray uppercase tracking-widest">Unit List Price</span>
                                <span className="text-sm font-black text-foreground">
                                    ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border border-dashed">
                                <span className="text-[10px] font-bold text-tatt-gray uppercase tracking-widest">Internal Fee (0%)</span>
                                <span className="text-sm font-black text-tatt-lime">$0.00</span>
                            </div>
                            <div className="mt-6 p-4 bg-background rounded-2xl border border-border">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Net Revenue / Unit</span>
                                    <span className="text-xl font-black text-foreground tracking-tighter italic">
                                        ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleTogglePublish}
                        disabled={updating}
                        className={`w-full py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group ${
                            product.status === 'ACTIVE' 
                            ? 'border-red-500/10 text-red-500 hover:bg-red-500/5' 
                            : 'border-tatt-lime/10 text-tatt-lime hover:bg-tatt-lime/5'
                        }`}
                    >
                        {product.status === 'ACTIVE' ? (
                            <>
                                <EyeOff size={16} />
                                Unpublish Listing
                            </>
                        ) : (
                            <>
                                <Eye size={16} />
                                Publish Listing
                            </>
                        )}
                    </button>
                </div>

                {/* Right Side: Inventory Table & Stats */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-surface rounded-[2.5rem] border border-border shadow-sm overflow-hidden min-h-[400px]">
                        <div className="p-8 border-b border-border flex items-center justify-between bg-background/30">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                                    <Warehouse size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-widest italic leading-none">Variant Inventory Matrix</h3>
                                    <p className="text-[10px] font-bold text-tatt-gray mt-2 uppercase tracking-widest">Track specific SKU performance & stock logs</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-tatt-black text-tatt-white text-[8px] font-black rounded-full uppercase tracking-widest">
                                    {product.variants?.length || 0} Variants
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-background/50 text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em] border-b border-border">
                                        <th className="px-8 py-5">Specification</th>
                                        <th className="px-8 py-5">Unique SKU</th>
                                        <th className="px-8 py-5">Available</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {product.variants && product.variants.length > 0 ? (
                                        product.variants.map((variant) => (
                                            <tr key={variant.id} className="hover:bg-background/20 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            className="size-3 rounded-full border border-border shadow-sm"
                                                            style={{ backgroundColor: variant.color.toLowerCase() === 'obsidian' ? '#181811' : variant.color.toLowerCase() }}
                                                        ></div>
                                                        <span className="text-xs font-black uppercase tracking-tight text-foreground italic">
                                                            {variant.label || `${variant.size || ''} ${variant.color || ''}`.trim() || 'Default Variant'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-[10px] font-mono text-tatt-gray font-bold group-hover:text-foreground transition-colors">
                                                        {variant.sku || `TATT-V-${variant.id.slice(0, 4)}`}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-sm font-black text-foreground">{variant.stock}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${
                                                        variant.stock === 0 ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        variant.stock <= product.lowStockThreshold ? 'bg-tatt-bronze/10 text-tatt-bronze border-tatt-bronze/20' :
                                                        'bg-tatt-lime/10 text-tatt-lime border-tatt-lime/20'
                                                    }`}>
                                                        {variant.stock === 0 ? 'Exhausted' : variant.stock <= product.lowStockThreshold ? 'Impacting' : 'Optimized'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button className="text-[10px] font-black text-tatt-lime uppercase tracking-widest hover:brightness-110 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-end gap-1 w-full translate-x-4 group-hover:translate-x-0">
                                                        Adjust <Download size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-12 text-center">
                                                <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">No detailed variants configured for this product.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sales Trend Bar Chart (Mocked with product data) */}
                    <div className="bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                                    <BarChart3 size={24} />
                                </div>
                                <h3 className="font-black text-sm uppercase italic tracking-widest">Market Performance Trend</h3>
                            </div>
                            <div className="flex items-center gap-1.5 p-1 bg-background border border-border rounded-xl">
                                <button className="px-3 py-1.5 bg-tatt-black text-tatt-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all">Weekly</button>
                                <button className="px-3 py-1.5 hover:bg-white rounded-lg text-[8px] font-black uppercase tracking-widest text-tatt-gray hover:text-foreground transition-all">Monthly</button>
                            </div>
                        </div>

                        <div className="h-48 flex items-end justify-between gap-1.5 px-2">
                            {[40, 55, 45, 70, 35, 85, 95, 75, 60, 50, 65, 80, 45, 90].map((h, i) => (
                                <div 
                                    key={i} 
                                    className="w-full bg-tatt-lime/10 hover:bg-tatt-lime transition-all rounded-t-lg relative group cursor-pointer"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-tatt-black text-tatt-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                        Sales: {Math.floor(h * 1.5)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-6 px-4 text-[9px] font-black text-tatt-gray uppercase tracking-widest border-t border-border pt-4">
                            <span>Mar 01</span>
                            <span>Mar 10</span>
                            <span>Mar 20</span>
                            <span>Mar 31</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stock Add Modal */}
            {showStockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-tatt-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface w-full max-w-md rounded-[2.5rem] border border-border p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black uppercase italic italic tracking-tighter">Add Available Stock</h3>
                            <button onClick={() => setShowStockModal(false)} className="text-tatt-gray hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {product.variants?.length > 0 && (
                                <div>
                                    <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-2">Select Target Variant</label>
                                    <select 
                                        value={selectedVariant}
                                        onChange={(e) => setSelectedVariant(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest focus:ring-tatt-lime focus:border-tatt-lime"
                                    >
                                        <option value="">Global Product Stock</option>
                                        {product.variants.map(v => (
                                            <option key={v.id} value={v.id}>
                                                {v.label || `${v.size || ''} ${v.color || ''}`.trim() || 'Variant'} (Current: {v.stock})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-2">Quantity to Increase</label>
                                <input 
                                    type="number" 
                                    value={stockToAdd}
                                    onChange={(e) => setStockToAdd(parseInt(e.target.value) || 0)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-black focus:ring-tatt-lime focus:border-tatt-lime"
                                    placeholder="Enter units..."
                                />
                            </div>
                            
                            <button 
                                onClick={handleQuickStockAdd}
                                disabled={updating}
                                className="w-full py-4 bg-tatt-lime text-tatt-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-105 transition-all disabled:opacity-50"
                            >
                                {updating ? "Updating Network..." : "Push Stock Update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Threshold Modal */}
            {showThresholdModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-tatt-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface w-full max-w-md rounded-[2.5rem] border border-border p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black uppercase italic italic tracking-tighter">Alert Intelligence</h3>
                            <button onClick={() => setShowThresholdModal(false)} className="text-tatt-gray hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            <p className="text-xs font-bold text-tatt-gray uppercase tracking-widest leading-relaxed">
                                Set the global threshold for low stock triggers. All organization members will be notified when levels drop below this value.
                            </p>
                            
                            <div>
                                <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-2">Notification Threshold</label>
                                <input 
                                    type="number" 
                                    value={newThreshold}
                                    onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-black focus:ring-tatt-lime focus:border-tatt-lime"
                                />
                            </div>
                            
                            <button 
                                onClick={handleUpdateThreshold}
                                disabled={updating}
                                className="w-full py-4 bg-tatt-lime text-tatt-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-105 transition-all disabled:opacity-50"
                            >
                                {updating ? "Recalibrating..." : "Save Configuration"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
