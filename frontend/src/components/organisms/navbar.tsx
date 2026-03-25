"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { CartDrawer } from "./cart-drawer";

export function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    const { totalItems } = useCart();
    const router = useRouter();
    const pathname = usePathname();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const navLinks = [
        { label: "Store", href: "/store" },
        { label: "TATT Business Directory", href: "/business-directory" },
        { label: "Volunteer", href: isAuthenticated ? "/dashboard/volunteers" : "/volunteer" },
    ];

    return (
        <>
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border px-6 lg:px-20 py-4 bg-white/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="size-10 flex items-center justify-center transition-transform group-hover:scale-110">
                            <Image
                                src="/assets/tattlogoIcon.svg"
                                alt="TATT Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <h1 className="text-xl font-black tracking-tight uppercase text-tatt-black leading-none">
                                The African Think Tank
                            </h1>
                        </div>
                    </Link>
                </div>

                <nav className="flex items-center gap-6 lg:gap-8">
                    <div className="hidden md:flex items-center gap-8 mr-4">
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
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-tatt-lime animate-in fade-in duration-500"></span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Cart Trigger */}
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 hover:bg-surface rounded-full transition-colors group"
                    >
                        <ShoppingBag size={20} className="text-tatt-black group-hover:text-tatt-lime transition-colors" />
                        {totalItems > 0 && (
                            <span className="absolute top-0 right-0 size-4 bg-tatt-black text-tatt-lime text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    <div className="hidden md:block h-6 w-px bg-border mx-2"></div>

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
                </nav>
            </header>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
