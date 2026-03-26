"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { ShoppingBag, Menu, X, ArrowRight } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { CartDrawer } from "./cart-drawer";

export function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    const { totalItems } = useCart();
    const router = useRouter();
    const pathname = usePathname();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { label: "Store", href: "/store" },
        { label: "TATT Business Directory", href: "/business-directory" },
        { label: "Volunteer", href: isAuthenticated ? "/dashboard/volunteers" : "/volunteer" },
    ];

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
                <div className="flex items-center justify-between px-4 lg:px-20 py-4 max-w-[1600px] mx-auto">
                    <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                        <Link href="/" className="flex items-center gap-2 lg:gap-3 group">
                            <div className="size-8 lg:size-10 flex items-center justify-center transition-transform group-hover:scale-110">
                                <Image
                                    src="/assets/tattlogoIcon.svg"
                                    alt="TATT Logo"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 className="text-sm sm:text-base lg:text-xl font-black tracking-tight uppercase text-tatt-black leading-none whitespace-nowrap">
                                    The African Think Tank
                                </h1>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex items-center gap-2 lg:gap-8">
                        {/* Desktop Navigation */}
                        <div className="hidden xl:flex items-center gap-8 mr-4">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                                return (
                                    <Link 
                                        key={link.href}
                                        href={link.href}
                                        className={`text-[10px] font-black uppercase tracking-widest transition-all relative py-1 ${
                                            isActive 
                                                ? "text-tatt-lime hover:text-tatt-lime/80" 
                                                : "text-tatt-black hover:text-tatt-lime"
                                        }`}
                                    >
                                        {link.label}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-tatt-lime"></span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Cart Trigger */}
                            <button 
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 hover:bg-surface rounded-full transition-colors group"
                            >
                                <ShoppingBag size={18} className="text-tatt-black lg:size-5 group-hover:text-tatt-lime transition-colors" />
                                {totalItems > 0 && (
                                    <span className="absolute top-0 right-0 size-3.5 bg-tatt-black text-tatt-lime text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                                        {totalItems}
                                    </span>
                                )}
                            </button>

                            <div className="hidden md:block h-6 w-px bg-border mx-2"></div>

                            {/* Desktop Auth */}
                            <div className="hidden md:flex items-center gap-6">
                                {isAuthenticated ? (
                                    <button
                                        onClick={logout}
                                        className="bg-tatt-lime text-tatt-black px-6 py-2 rounded-lg text-[10px] font-black shadow-sm hover:brightness-110 transition-all uppercase tracking-widest"
                                    >
                                        Log Out
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-6">
                                        <Link 
                                            href="/" 
                                            className="text-[10px] font-black text-tatt-black hover:text-tatt-lime transition-colors uppercase tracking-widest"
                                        >
                                            Log In
                                        </Link>
                                        <button
                                            onClick={() => router.push("/signup")}
                                            className="bg-tatt-lime text-tatt-black px-6 py-2 rounded-lg text-[10px] font-black shadow-sm hover:brightness-110 transition-all uppercase tracking-widest"
                                        >
                                            Join community
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Trigger */}
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="xl:hidden p-2 text-tatt-black hover:bg-surface rounded-full transition-colors"
                            >
                                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Mobile Navigation Dropdown Overlay */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-white border-b border-border shadow-2xl xl:hidden z-50">
                        <div className="flex flex-col py-6 px-4 space-y-4">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border group"
                                >
                                    <span className="text-sm font-black text-tatt-black uppercase tracking-widest group-hover:text-tatt-lime transition-colors">
                                        {link.label}
                                    </span>
                                    <ArrowRight size={16} className="text-border group-hover:text-tatt-lime transition-all" />
                                </Link>
                            ))}
                            
                            <div className="pt-4 border-t border-border mt-2 space-y-3">
                                {isAuthenticated ? (
                                    <>
                                        <Link 
                                            href="/dashboard"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block w-full text-center py-4 bg-tatt-black text-tatt-lime rounded-xl text-xs font-black uppercase tracking-widest"
                                        >
                                            Dashboard
                                        </Link>
                                        <button 
                                            onClick={() => { logout(); setIsMenuOpen(false); }}
                                            className="w-full text-center py-2 text-tatt-gray text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Log Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link 
                                            href="/signup"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block w-full text-center py-4 bg-tatt-lime text-tatt-black rounded-xl text-xs font-black uppercase tracking-widest"
                                        >
                                            Join community
                                        </Link>
                                        <Link 
                                            href="/" 
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block w-full text-center py-2 text-tatt-black text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Log In
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
