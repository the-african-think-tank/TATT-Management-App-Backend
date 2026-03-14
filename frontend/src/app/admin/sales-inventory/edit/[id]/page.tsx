"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Info,
    Image as ImageIcon,
    DollarSign,
    Layers,
    Timer,
    ChevronRight,
    UploadCloud,
    Trash2,
    PlusCircle,
    Eye,
    Save,
    Send,
    Loader2,
    X,
    Bold,
    Italic,
    List,
    Link as LinkIcon,
    AlertCircle
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

interface Variant {
    id?: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
}

export default function EditProductPage() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        category: "APPAREL",
        brand: "TATT Original",
        description: "",
        price: 0,
        currency: "USD",
        stock: 0,
        lowStockThreshold: 5,
        imageUrl: "",
        additionalImages: [] as string[],
        isLimitedEdition: false,
        dropStart: "",
        dropEnd: "",
        status: "ACTIVE"
    });

    const [variants, setVariants] = useState<Variant[]>([]);

    const AVAILABLE_COLORS = [
        "Obsidian", "Ivory", "Emerald", "Ruby", "Slate", "Amber", "Midnight", "Olive", "Sand"
    ];

    const AVAILABLE_SIZES = [
        "XS", "S", "M", "L", "XL", "XXL", "One Size"
    ];

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/store/products/${id}`);
            const p = res.data;
            setForm({
                name: p.name,
                category: p.category,
                brand: p.brand || "TATT Original",
                description: p.description || "",
                price: p.price,
                currency: p.currency || "USD",
                stock: p.stock,
                lowStockThreshold: p.lowStockThreshold || 5,
                imageUrl: p.imageUrl || "",
                additionalImages: p.additionalImages || [],
                isLimitedEdition: p.isLimitedEdition || false,
                dropStart: p.dropStart ? new Date(p.dropStart).toISOString().slice(0, 16) : "",
                dropEnd: p.dropEnd ? new Date(p.dropEnd).toISOString().slice(0, 16) : "",
                status: p.status
            });
            
            if (p.ProductVariants) {
                setVariants(p.ProductVariants.map((v: any) => ({
                    id: v.id,
                    size: v.size || "",
                    color: v.color || "",
                    sku: v.sku || "",
                    stock: v.stock || 0
                })));
            }
        } catch (error) {
            toast.error("Failed to load product details");
            router.push("/admin/sales-inventory");
        } finally {
            setLoading(false);
        }
    };

    const generateSKU = (size: string, color: string) => {
        const prefix = "TATT";
        const cleanSize = size.toUpperCase().replace(/\s+/g, "");
        const cleanColor = color.toUpperCase().replace(/\s+/g, "");
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${cleanSize}-${cleanColor}-${random}`;
    };

    const addVariant = () => {
        const newSize = "L";
        const newColor = "Obsidian";
        const newVariant: Variant = { 
            size: newSize, 
            color: newColor, 
            sku: generateSKU(newSize, newColor), 
            stock: 0 
        };
        setVariants([...variants, newVariant]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof Variant, value: any) => {
        setVariants(prev => {
            const next = [...prev];
            const currentItem = next[index];
            const updated: Variant = { ...currentItem, [field]: value };
            
            if (field === 'size' || field === 'color') {
                updated.sku = generateSKU(updated.size, updated.color);
            }
            
            next[index] = updated;
            return next;
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        
        const formData = new FormData();
        Array.from(e.target.files).forEach(file => {
            formData.append('files', file);
        });

        try {
            setUploading(true);
            const res = await api.post("/uploads/media", formData);
            const newImageUrls = res.data.files.map((f: any) => f.url);
            
            setForm(prev => ({
                ...prev,
                imageUrl: prev.imageUrl || (newImageUrls[0] as string),
                additionalImages: [...prev.additionalImages, ...newImageUrls]
            }));
            toast.success(`${newImageUrls.length} file(s) uploaded`);
        } catch (error) {
            toast.error("Failed to upload media");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (publish: boolean) => {
        if (!form.name || !form.price) {
            toast.error("Please fill in basic details");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                status: publish ? "ACTIVE" : "DRAFT",
                price: Number(form.price),
                stock: variants.reduce((acc, curr) => acc + Number(curr.stock), 0) || Number(form.stock),
                variants: variants.map(v => ({
                    ...v,
                    label: `${v.size} / ${v.color}`.trim() || "Default",
                    type: "VARIANT"
                }))
            };

            await api.patch(`/store/products/${id}`, payload);
            toast.success("Product updated successfully!");
            router.push("/admin/sales-inventory");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update product listing");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 text-tatt-lime animate-spin" />
                <p className="text-tatt-gray font-bold uppercase tracking-widest text-xs">Loading Product Data...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Breadcrumb Header */}
            <div className="flex items-center gap-2 text-xs font-bold text-tatt-gray grayscale mb-8 uppercase tracking-widest px-1">
                <span className="cursor-pointer hover:text-foreground transition-colors" onClick={() => router.push("/admin/sales-inventory")}>Products</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">Edit Product</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-tatt-lime truncate max-w-[150px]">{form.name}</span>
            </div>

            <div className="max-w-4xl space-y-8 pb-32">
                {/* Form Heading */}
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground italic uppercase">
                        Edit Premium Listing
                    </h1>
                    <p className="text-tatt-gray font-bold text-xs uppercase tracking-widest mt-2">
                        Update your luxury product details and inventory settings.
                    </p>
                </div>

                {/* Section: Basic Info */}
                <section className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-background/30">
                        <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-3">
                            <Info className="text-tatt-lime h-4 w-4" />
                            Basic Information
                        </h3>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="col-span-full">
                                <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-3">Product Title</label>
                                <input 
                                    className="w-full rounded-2xl border-border bg-background focus:border-tatt-lime focus:ring-tatt-lime/20 h-14 px-6 font-bold transition-all outline-none" 
                                    placeholder="e.g. Signature Leather Minimalist Wallet" 
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({...form, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-3">Category</label>
                                <select 
                                    className="w-full rounded-2xl border-border bg-background focus:border-tatt-lime focus:ring-tatt-lime/20 h-14 px-6 font-bold transition-all outline-none appearance-none cursor-pointer"
                                    value={form.category}
                                    onChange={e => setForm({...form, category: e.target.value})}
                                >
                                    <option value="APPAREL">Apparel</option>
                                    <option value="ACCESSORIES">Accessories</option>
                                    <option value="HOME_DECOR">Home Decor</option>
                                    <option value="LIMITED_DROPS">Limited Drops</option>
                                    <option value="BOOKS">Books & Media</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-3">Brand/Collection</label>
                                <input 
                                    className="w-full rounded-2xl border-border bg-background focus:border-tatt-lime focus:ring-tatt-lime/20 h-14 px-6 font-bold transition-all outline-none" 
                                    placeholder="TATT Original" 
                                    type="text"
                                    value={form.brand}
                                    onChange={e => setForm({...form, brand: e.target.value})}
                                />
                            </div>
                            <div className="col-span-full">
                                <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-3">Rich Description</label>
                                <div className="rounded-3xl border border-border bg-background overflow-hidden">
                                    <div className="bg-surface border-b border-border p-3 flex gap-4">
                                        <button type="button" className="p-2 hover:bg-tatt-lime/10 rounded-xl transition-colors"><Bold size={16} /></button>
                                        <button type="button" className="p-2 hover:bg-tatt-lime/10 rounded-xl transition-colors"><Italic size={16} /></button>
                                        <button type="button" className="p-2 hover:bg-tatt-lime/10 rounded-xl transition-colors"><List size={16} /></button>
                                        <div className="w-px h-6 bg-border self-center"></div>
                                        <button type="button" className="p-2 hover:bg-tatt-lime/10 rounded-xl transition-colors"><LinkIcon size={16} /></button>
                                    </div>
                                    <textarea 
                                        className="w-full border-none focus:ring-0 bg-transparent p-6 font-medium min-h-[160px] outline-none" 
                                        placeholder="Describe the luxury details, materials, and craftsmanship..."
                                        value={form.description}
                                        onChange={e => setForm({...form, description: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Media Upload */}
                <section className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-background/30">
                        <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-3">
                            <ImageIcon className="text-tatt-lime h-4 w-4" />
                            Product Media
                        </h3>
                    </div>
                    <div className="p-8">
                        <label className="border-2 border-dashed border-border rounded-[2rem] p-12 flex flex-col items-center justify-center text-center group hover:border-tatt-lime transition-all bg-background/50 cursor-pointer relative overflow-hidden">
                            <input 
                                type="file" 
                                className="hidden" 
                                multiple 
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                            {uploading ? (
                                <div className="flex flex-col items-center">
                                    <Loader2 className="h-10 w-10 text-tatt-lime animate-spin mb-4" />
                                    <p className="font-black text-xs uppercase tracking-widest">Processing Media...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="size-16 rounded-3xl bg-tatt-lime/10 flex items-center justify-center mb-6 text-tatt-lime group-hover:scale-110 transition-transform">
                                        <UploadCloud size={32} />
                                    </div>
                                    <h4 className="font-black text-lg uppercase tracking-tight">Drag & drop product images</h4>
                                    <p className="text-xs font-bold text-tatt-gray mt-2 uppercase tracking-widest">High-resolution PNG, JPG or WEBP (Max 10MB each)</p>
                                    <div className="mt-8 px-8 py-3 bg-tatt-black text-tatt-white font-black rounded-2xl text-[10px] uppercase tracking-widest group-hover:bg-tatt-lime group-hover:text-tatt-black transition-colors">
                                        Browse Store Assets
                                    </div>
                                </>
                            )}
                        </label>

                        {form.additionalImages.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
                                {form.additionalImages.map((url, idx) => (
                                    <div key={idx} className="aspect-square rounded-2xl border border-border bg-background overflow-hidden relative group">
                                        <img src={url} alt="" className="size-full object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-tatt-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => setForm(prev => ({...prev, imageUrl: url}))}
                                                className={`p-2 rounded-xl border ${form.imageUrl === url ? 'bg-tatt-lime text-tatt-black border-tatt-lime' : 'bg-surface/10 text-white border-white/20 hover:bg-white/20'}`}
                                                title="Set as main image"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button 
                                                onClick={() => setForm(prev => ({...prev, additionalImages: prev.additionalImages.filter(u => u !== url)}))}
                                                className="p-2 rounded-xl bg-red-500/80 text-white border border-red-500/20 hover:bg-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        {form.imageUrl === url && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-tatt-lime text-tatt-black text-[8px] font-black uppercase rounded shadow-lg">Main</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Section: Pricing */}
                <section className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-background/30">
                        <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-3">
                            <DollarSign className="text-tatt-lime h-4 w-4" />
                            Pricing
                        </h3>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-3">Base Price</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <span className="text-tatt-gray font-bold font-mono">$</span>
                                    </div>
                                    <input 
                                        className="w-full pl-12 rounded-2xl border-border bg-background focus:border-tatt-lime focus:ring-tatt-lime/20 h-14 px-6 font-bold transition-all outline-none" 
                                        placeholder="0.00" 
                                        step="0.01" 
                                        type="number"
                                        value={form.price || ""}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setForm({...form, price: val === "" ? 0 : Number(val)});
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-3">Currency</label>
                                <select 
                                    className="w-full rounded-2xl border-border bg-background focus:border-tatt-lime focus:ring-tatt-lime/20 h-14 px-6 font-bold transition-all outline-none appearance-none cursor-pointer"
                                    value={form.currency}
                                    onChange={e => setForm({...form, currency: e.target.value})}
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="NGN">NGN - Nigerian Naira</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Inventory & Variants */}
                <section className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-background/30 flex justify-between items-center">
                        <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-3">
                            <Layers className="text-tatt-lime h-4 w-4" />
                            Inventory & Variants
                        </h3>
                        <button 
                            type="button" 
                            onClick={addVariant}
                            className="text-[10px] font-black text-tatt-lime uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all hover:translate-x-1"
                        >
                            <PlusCircle size={16} />
                            Add Unique Variant
                        </button>
                    </div>
                    <div className="p-8">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-tatt-gray border-b border-border">
                                        <th className="pb-4 px-2">Size</th>
                                        <th className="pb-4 px-2">Color</th>
                                        <th className="pb-4 px-2">SKU</th>
                                        <th className="pb-4 px-2">Initial Stock</th>
                                        <th className="pb-4 px-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {variants.map((variant, idx) => (
                                        <tr key={idx} className="group hover:bg-background/50 transition-colors">
                                            <td className="py-5 px-2">
                                                <select 
                                                    className="w-24 bg-background border-border rounded-xl px-4 py-2 font-bold text-xs focus:ring-1 focus:ring-tatt-lime outline-none cursor-pointer appearance-none" 
                                                    value={variant.size}
                                                    onChange={e => updateVariant(idx, 'size', e.target.value)}
                                                >
                                                    {AVAILABLE_SIZES.map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-5 px-2">
                                                <select 
                                                    className="w-32 bg-background border-border rounded-xl px-4 py-2 font-bold text-xs focus:ring-1 focus:ring-tatt-lime outline-none cursor-pointer appearance-none" 
                                                    value={variant.color}
                                                    onChange={e => updateVariant(idx, 'color', e.target.value)}
                                                >
                                                    {AVAILABLE_COLORS.map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-5 px-2">
                                                <input 
                                                    className="w-40 bg-background border-border rounded-xl px-4 py-2 font-mono text-[10px] focus:ring-1 focus:ring-tatt-lime outline-none" 
                                                    type="text" 
                                                    value={variant.sku}
                                                    onChange={e => updateVariant(idx, 'sku', e.target.value)}
                                                    placeholder={`TATT-SKU-${idx}`}
                                                />
                                            </td>
                                            <td className="py-5 px-2">
                                                <input 
                                                    className="w-24 bg-background border-border rounded-xl px-4 py-2 font-bold text-xs focus:ring-1 focus:ring-tatt-lime outline-none" 
                                                    type="number" 
                                                    value={variant.stock}
                                                    onChange={e => updateVariant(idx, 'stock', Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="py-5 px-2 text-right">
                                                <button 
                                                    onClick={() => removeVariant(idx)}
                                                    className="size-8 rounded-lg text-tatt-gray hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {variants.length === 0 && (
                                <div className="py-10 text-center flex flex-col items-center">
                                    <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-4">No variants configured. Using global stock.</p>
                                    <input 
                                        type="number"
                                        className="w-32 rounded-xl border-border bg-background h-10 px-4 font-bold text-xs outline-none focus:ring-1 focus:ring-tatt-lime"
                                        value={form.stock}
                                        onChange={e => setForm({...form, stock: Number(e.target.value)})}
                                        placeholder="Base Stock"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Section: Limited Edition */}
                <section className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-8 flex items-center justify-between border-b border-border bg-background/30">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                                <Timer size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-widest leading-none">Limited Edition Drop</h3>
                                <p className="text-[10px] font-bold text-tatt-gray mt-2 uppercase tracking-widest">Enable time-restricted availability for exclusive drops.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={form.isLimitedEdition}
                                onChange={e => setForm({...form, isLimitedEdition: e.target.checked})}
                            />
                            <div className="w-14 h-7 bg-background border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-tatt-black after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-tatt-gray after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tatt-lime after:shadow-sm"></div>
                        </label>
                    </div>
                    {form.isLimitedEdition && (
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-300">
                            <div>
                                <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-3">Drop Starts</label>
                                <input 
                                    className="w-full rounded-2xl border-border bg-background focus:border-tatt-lime focus:ring-tatt-lime/20 h-14 px-6 font-bold transition-all outline-none uppercase text-xs" 
                                    type="datetime-local"
                                    value={form.dropStart}
                                    onChange={e => setForm({...form, dropStart: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-3">Drop Ends</label>
                                <input 
                                    className="w-full rounded-2xl border-border bg-background focus:border-tatt-lime focus:ring-tatt-lime/20 h-14 px-6 font-bold transition-all outline-none uppercase text-xs" 
                                    type="datetime-local"
                                    value={form.dropEnd}
                                    onChange={e => setForm({...form, dropEnd: e.target.value})}
                                />
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-surface/80 backdrop-blur-xl border-t border-border p-5 z-40">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-tatt-lime animate-pulse"></div>
                        <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Update Mode Active</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button 
                            onClick={() => router.push("/admin/sales-inventory")}
                            className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl border border-border text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-background transition-all flex items-center justify-center gap-2 group"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => handleSubmit(form.status === 'ACTIVE')}
                            disabled={saving}
                            className="flex-1 sm:flex-none px-10 py-3.5 rounded-2xl bg-tatt-lime text-tatt-black font-black text-[10px] uppercase tracking-widest hover:brightness-105 transition-all shadow-xl shadow-tatt-lime/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                            Update Listing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
