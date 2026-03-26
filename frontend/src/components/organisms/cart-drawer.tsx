"use client";

import React from "react";
import { useCart } from "@/context/cart-context";
import { 
    X, 
    ShoppingBag, 
    Trash2, 
    Plus, 
    Minus, 
    ArrowRight,
    Loader2
} from "lucide-react";
import Link from "next/link";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { cart, loading, updateQuantity, removeItem, totalItems, subtotal } = useCart();

    return (
        <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isOpen ? "visible" : "invisible"}`}>
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-tatt-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`absolute inset-y-0 left-0 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                {/* Header */}
                <div className="px-6 py-6 border-b border-border flex items-center justify-between bg-tatt-black text-white">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="text-tatt-lime" />
                        <div>
                            <h2 className="text-lg font-black uppercase italic tracking-tighter">Your Collection</h2>
                            <p className="text-[10px] font-bold text-tatt-lime uppercase tracking-widest">{totalItems} Pieces Sourced</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <Loader2 className="size-10 text-tatt-lime animate-spin" />
                            <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest italic">Syncing Registry...</p>
                        </div>
                    ) : cart?.items?.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="size-20 bg-surface border border-border rounded-[2rem] flex items-center justify-center text-tatt-gray/20">
                                <ShoppingBag size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase italic tracking-tight">Collection Empty</h3>
                                <p className="text-xs text-tatt-gray font-medium max-w-[15rem] mx-auto">
                                    You haven't added any luxury pieces to your diaspora collection yet.
                                </p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="px-8 py-3 bg-tatt-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-tatt-lime hover:text-tatt-black transition-all"
                            >
                                Browse Registry
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {cart?.items.map((item) => (
                                <div key={item.id} className="flex gap-4 group">
                                    <div className="size-24 rounded-2xl border border-border overflow-hidden flex-shrink-0 bg-surface">
                                        <img src={item.product.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-sm font-black uppercase italic tracking-tight leading-none group-hover:text-tatt-lime transition-colors">
                                                    {item.product.name}
                                                </h4>
                                                {item.variant && (
                                                    <span className="text-[9px] font-black text-tatt-gray uppercase tracking-widest mt-1 inline-block">
                                                        {item.variant.label}
                                                    </span>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => removeItem(item.id)}
                                                className="text-tatt-gray hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                    className="size-6 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                                                >
                                                    <Minus size={10} />
                                                </button>
                                                <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="size-6 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                                                >
                                                    <Plus size={10} />
                                                </button>
                                            </div>
                                            <p className="text-sm font-black tracking-tighter italic">
                                                ${((Number(item.product.price) + Number(item.variant?.priceAdjustment || 0)) * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {(cart?.items?.length ?? 0) > 0 && (
                    <div className="px-6 py-8 border-t border-border bg-surface/50 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-tatt-gray uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-tatt-lime uppercase tracking-widest">
                                <span>Sourcing Fee</span>
                                <span>Included</span>
                            </div>
                            <div className="flex justify-between text-lg font-black uppercase italic tracking-tighter pt-2 border-t border-border/50">
                                <span>Investment Total</span>
                                <span className="text-tatt-black">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        
                        <Link 
                            href="/store/checkout"
                            onClick={onClose}
                            className="w-full py-5 bg-tatt-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-tatt-lime hover:text-tatt-black transition-all shadow-xl shadow-tatt-black/10 group"
                        >
                            Secure Checkout
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        
                        <p className="text-[8px] text-center font-bold text-tatt-gray uppercase tracking-[0.2em]">
                            Your purchase supports TATT community initiatives
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
