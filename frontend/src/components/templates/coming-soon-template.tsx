import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/organisms/navbar";
import { Footer } from "@/components/organisms/footer";

interface ComingSoonTemplateProps {
    title: string;
    subtitle?: string;
}

export function ComingSoonTemplate({ title, subtitle }: ComingSoonTemplateProps) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />

            <main className="flex flex-1 items-center justify-center px-6 py-20">
                <div className="max-w-lg w-full text-center space-y-8">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-tatt-lime/20 blur-2xl scale-150" />
                            <Image
                                src="/assets/tattlogoIcon.svg"
                                alt="The African Think Tank"
                                width={72}
                                height={72}
                                className="relative"
                            />
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-tatt-lime/10 border border-tatt-lime/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-tatt-lime">
                        <span className="h-1.5 w-1.5 rounded-full bg-tatt-lime animate-pulse" />
                        Coming Soon
                    </div>

                    {/* Heading */}
                    <div className="space-y-3">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-tatt-black leading-[1.1]">
                            {title}
                        </h1>
                        <p className="text-base text-tatt-gray leading-relaxed max-w-sm mx-auto">
                            {subtitle || "We're working hard to bring this page to life. Stay tuned for updates."}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 justify-center">
                        <span className="h-px flex-1 max-w-[80px] bg-border" />
                        <span className="text-xs font-bold uppercase tracking-widest text-tatt-gray">
                            In the meantime
                        </span>
                        <span className="h-px flex-1 max-w-[80px] bg-border" />
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-tatt-lime text-tatt-black font-bold text-sm uppercase tracking-wider hover:brightness-95 transition-all"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-border text-tatt-black font-bold text-sm uppercase tracking-wider hover:bg-surface transition-all"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
