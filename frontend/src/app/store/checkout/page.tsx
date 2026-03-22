"use client";

import React, { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Navbar } from "@/components/organisms/navbar";
import { Footer } from "@/components/organisms/footer";
import { 
    CreditCard, 
    Truck, 
    ShieldCheck, 
    ArrowRight,
    Loader2,
    MapPin,
    User as UserIcon,
    Mail
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    const { cart, subtotal, clearCart, loading: cartLoading } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        city: "",
        country: "USA",
        notes: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const sid = localStorage.getItem("tatt_cart_sid");
            await api.post(`/store/cart/checkout?sessionId=${sid}`, {
                customerName: formData.name,
                customerEmail: formData.email,
                shippingAddress: `${formData.address}, ${formData.city}, ${formData.country}`,
                notes: formData.notes,
                items: [] // Backend will use cart items based on session
            });
            toast.success("Order Placed Successfully!");
            router.push("/store");
        } catch (error) {
            toast.error("Checkout failed. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (cartLoading) return null;

    if (!cart?.items?.length) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-tatt-gray">Your Collection is Empty</h2>
                    <button 
                        onClick={() => router.push("/store")}
                        className="px-8 py-4 bg-tatt-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-tatt-lime hover:text-tatt-black transition-all"
                    >
                        Return to Store
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-[1400px] mx-auto px-6 lg:px-20 py-16 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left: Info Grid */}
                    <div className="lg:col-span-12 mb-10">
                         <h1 className="text-5xl lg:text-7xl font-black text-foreground italic uppercase tracking-tighter leading-none mb-4">
                            Finalize Registry
                        </h1>
                        <p className="text-xs font-black text-tatt-gray uppercase tracking-[0.3em] mb-12">Complete your diaspora sourcing request</p>
                    </div>

                    <div className="lg:col-span-7 space-y-12">
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-tatt-lime flex items-center justify-center text-tatt-black">
                                    <UserIcon size={20} />
                                </div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tight">Personal Details</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">Full Name</label>
                                    <input 
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 rounded-2xl border border-border bg-surface focus:border-tatt-lime focus:ring-0 transition-all font-bold text-sm"
                                        placeholder="Enter your legal name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">Email Address</label>
                                    <input 
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 rounded-2xl border border-border bg-surface focus:border-tatt-lime focus:ring-0 transition-all font-bold text-sm"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-tatt-lime flex items-center justify-center text-tatt-black">
                                    <MapPin size={20} />
                                </div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tight">Shipping Nexus</h2>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">Address</label>
                                    <input 
                                        required
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 rounded-2xl border border-border bg-surface focus:border-tatt-lime focus:ring-0 transition-all font-bold text-sm"
                                        placeholder="Street & Apartment Number"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">City</label>
                                        <input 
                                            required
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-4 rounded-2xl border border-border bg-surface focus:border-tatt-lime focus:ring-0 transition-all font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">Country</label>
                                        <input 
                                            required
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-4 rounded-2xl border border-border bg-surface focus:border-tatt-lime focus:ring-0 transition-all font-bold text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">Gift Note / Sourcing Instructions</label>
                                    <textarea 
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-6 py-4 rounded-2xl border border-border bg-surface focus:border-tatt-lime focus:ring-0 transition-all font-bold text-sm"
                                        placeholder="Any special requests for the TATT logistics team?"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right: Summary Card */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 space-y-8">
                            <div className="bg-surface border border-border rounded-[3rem] p-10 shadow-2xl shadow-tatt-lime/5">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8 border-b border-border pb-4">Order Summary</h3>
                                
                                <div className="space-y-6 mb-10 max-h-80 overflow-y-auto pr-4 scrollbar-hide">
                                    {cart.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center">
                                            <div className="flex gap-4">
                                                <div className="size-16 rounded-xl border border-border overflow-hidden bg-background">
                                                    <img src={item.product.imageUrl} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-tight italic">{item.product.name}</p>
                                                    <p className="text-[9px] font-bold text-tatt-gray uppercase tracking-widest">Qty: {item.quantity}</p>
                                                    {item.variant && <p className="text-[9px] font-bold text-tatt-lime uppercase tracking-widest">{item.variant.label}</p>}
                                                </div>
                                            </div>
                                            <p className="text-xs font-black italic">${((Number(item.product.price) + Number(item.variant?.priceAdjustment || 0)) * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-6 border-t border-border">
                                    <div className="flex justify-between text-[10px] font-bold text-tatt-gray uppercase tracking-widest">
                                        <span>Merchandise Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-tatt-gray uppercase tracking-widest">
                                        <span>Diaspora Shipping</span>
                                        <span>FREE</span>
                                    </div>
                                    <div className="flex justify-between text-2xl font-black uppercase italic tracking-tighter pt-4">
                                        <span>Total</span>
                                        <span className="text-tatt-black">${subtotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleCheckout}
                                    disabled={loading || !formData.name || !formData.email || !formData.address}
                                    className="w-full py-6 bg-tatt-lime text-tatt-black rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:brightness-105 transition-all shadow-xl shadow-tatt-lime/20 disabled:opacity-50 disabled:grayscale mt-10"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={18} />}
                                    Finalize Sourcing Request
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-surface border border-border rounded-2xl flex flex-col items-center text-center gap-3">
                                    <ShieldCheck className="text-tatt-lime" size={24} />
                                    <p className="text-[8px] font-black uppercase tracking-widest text-tatt-gray">Vault Encryption Secured</p>
                                </div>
                                <div className="p-6 bg-surface border border-border rounded-2xl flex flex-col items-center text-center gap-3">
                                    <Truck className="text-tatt-lime" size={24} />
                                    <p className="text-[8px] font-black uppercase tracking-widest text-tatt-gray">Tracked Global Transit</p>
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
