"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";

export function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    const router = useRouter();

    return (
        <header className="relative z-50 flex items-center justify-between border-b border-border px-6 lg:px-20 py-4 bg-white/80 backdrop-blur-md">
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

            <nav className="hidden md:flex items-center gap-8">
                <Link className="text-xs font-black text-tatt-black hover:text-tatt-lime transition-colors uppercase tracking-widest" href="#">Mission</Link>
                <Link className="text-xs font-black text-tatt-black hover:text-tatt-lime transition-colors uppercase tracking-widest" href="#">Programs</Link>
                <Link className="text-xs font-black text-tatt-black hover:text-tatt-lime transition-colors uppercase tracking-widest" href="#">Impact</Link>

                <div className="h-6 w-px bg-border mx-2"></div>

                {isAuthenticated ? (
                    <button
                        onClick={logout}
                        className="bg-tatt-lime text-tatt-black px-6 py-2 rounded-lg text-xs font-black shadow-sm hover:brightness-110 transition-all uppercase tracking-widest"
                    >
                        Log Out
                    </button>
                ) : (
                    <button
                        onClick={() => router.push("/")}
                        className="bg-tatt-lime text-tatt-black px-6 py-2 rounded-lg text-xs font-black shadow-sm hover:brightness-110 transition-all uppercase tracking-widest"
                    >
                        Log In
                    </button>
                )}
            </nav>
        </header>
    );
}
