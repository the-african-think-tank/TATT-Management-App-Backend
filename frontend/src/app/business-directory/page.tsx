"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Globe, Building2, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/organisms/navbar";
import { Footer } from "@/components/organisms/footer";

export default function BusinessDirectoryLanding() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-background text-tatt-black font-sans antialiased overflow-x-hidden">
        {/* Hero Section */}
        <section className="min-h-0 md:min-h-[85vh] flex items-center px-6 lg:px-20 border-b-2 border-tatt-black">
          <div className="max-w-[1440px] mx-auto w-full grid lg:grid-cols-12 gap-0 items-stretch">
            <div className="lg:col-span-7 py-10 md:py-20 lg:pr-16 flex flex-col justify-center items-start text-left animate-in fade-in slide-in-from-left-8 duration-1000">
              <p className="text-[10px] tracking-[0.3em] uppercase font-black text-tatt-gray mb-6 md:mb-8">
                TATT Business Directory
              </p>
              <h1 className="text-[32px] sm:text-[42px] font-black leading-[1.2] tracking-[-0.75px] uppercase text-tatt-black mb-8 md:mb-10">
                The Founding <br className="hidden sm:block"/> Business Partner <br className="hidden sm:block"/> Program
              </h1>

              {/* Mobile Only Hero Image */}
              <div className="lg:hidden w-full mb-10 overflow-hidden border-2 border-tatt-black rounded-2xl">
                <img 
                  alt="Strategic collaboration" 
                  className="w-full h-auto object-cover" 
                  src="/images/tatt-hero.png"
                />
              </div>

              <p className="text-lg md:text-2xl font-medium max-w-xl mb-10 md:mb-12 leading-tight tracking-tight text-tatt-black opacity-60">
                A curated economic ecosystem designed to build uncompromising relationships within the African Diaspora.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:items-start lg:justify-start gap-4 w-full">
                <Link 
                  href="/business-directory/apply"
                  className="h-14 bg-tatt-lime text-tatt-black px-10 md:px-14 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-[0.7px] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:brightness-95 active:scale-95 text-center"
                >
                  Add Your Business <ArrowRight size={20} />
                </Link>
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-5 border-l-2 border-tatt-black relative min-h-[600px] overflow-hidden">
              <img 
                alt="Strategic collaboration" 
                className="w-full h-full object-cover hover:scale-105 transition-all duration-1000" 
                src="/images/tatt-hero.png"
              />
              <div className="absolute inset-0 border-[32px] border-background/20 pointer-events-none"></div>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-12 md:py-32 px-6 lg:px-20 border-b-2 border-tatt-black bg-white">
          <div className="max-w-[1440px] mx-auto">
            <div className="grid lg:grid-cols-12 gap-8 md:gap-12 mb-16 md:mb-24 items-end text-left">
              <div className="lg:col-span-4">
                <p className="text-[10px] tracking-[0.3em] uppercase font-black text-tatt-gray mb-4">The Philosophy</p>
                <h2 className="text-[32px] sm:text-[42px] font-black leading-[1.2] tracking-[-0.75px] uppercase text-tatt-black">Core<br className="hidden md:block"/>Pillars</h2>
              </div>
              <div className="lg:col-span-8">
                <p className="text-2xl md:text-4xl font-bold leading-tight tracking-tighter uppercase">
                  Increasing membership value, circulating economic opportunity, and elevating trusted, values-aligned businesses.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 border-t border-l border-tatt-black">
              {[
                { id: '01', title: 'Increase value', desc: 'Enhancing the core member experience through intentional connectivity.' },
                { id: '02', title: 'Circulate wealth', desc: 'Creating a closed-loop economy where wealth stays within the Diaspora.' },
                { id: '03', title: 'Elevate brands', desc: 'Spotlighting enterprises that uphold the highest standards of excellence.' },
                { id: '04', title: 'Sustainability', desc: 'Building structures that outlast current market trends and cycles.' },
                { id: '05', title: 'Operationalize', desc: 'Turning abstract values into concrete economic actions and results.', highlight: true }
              ].map((pillar) => (
                <div 
                  key={pillar.id}
                  className={`p-10 border-r border-b border-tatt-black flex flex-col justify-between aspect-square group transition-all duration-500 ${
                    pillar.highlight ? 'bg-tatt-lime text-tatt-black' : 'hover:bg-tatt-black hover:text-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-4xl font-black ${pillar.highlight ? 'opacity-100' : 'opacity-20 group-hover:opacity-100'}`}>{pillar.id}</span>
                    {pillar.highlight ? <Zap size={24} className="fill-tatt-black" /> : <ShieldCheck size={24} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase mb-4 leading-none">{pillar.title}</h3>
                    <p className={`text-sm font-bold leading-relaxed ${pillar.highlight ? 'opacity-90' : 'opacity-60 group-hover:opacity-100'}`}>{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Authority & Visibility */}
        <section className="py-24 lg:py-32 px-6 lg:px-20 border-b-2 border-tatt-black">
          <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-0 border-2 border-tatt-black bg-white overflow-hidden shadow-2xl">
            <div className="order-2 lg:order-1 p-10 md:p-20 border-b-2 lg:border-b-0 lg:border-r-2 border-tatt-black flex flex-col justify-center text-left items-start">
              <p className="text-[10px] tracking-[0.3em] uppercase font-black text-tatt-gray mb-8">Strategic Advantage</p>
              <h2 className="text-[32px] sm:text-[42px] font-black leading-[1.2] tracking-[-0.75px] uppercase text-tatt-black mb-12 md:mb-16">Authority<br className="hidden md:block"/>& Visibility</h2>
              
              <div className="space-y-12">
                {[
                  { id: '01', title: 'TATT Community Visibility', desc: 'Direct exposure to a high-intent, curated audience of Diaspora professionals.', icon: Globe },
                  { id: '02', title: 'Premium Brand Exposure', desc: 'Positioning alongside top-tier partners in an editorial-style ecosystem.', icon: TrendingUp },
                  { id: '03', title: 'Values-Aligned Growth', desc: 'Scaling with partners who share a commitment to collective progress.', icon: Building2 }
                ].map((item) => (
                  <div key={item.id} className="flex gap-8 group">
                    <div className="text-4xl font-black text-tatt-lime group-hover:scale-110 transition-transform">{item.id}</div>
                    <div>
                      <h4 className="text-lg md:text-xl font-black uppercase mb-2">{item.title}</h4>
                      <p className="text-tatt-gray font-bold opacity-80 leading-relaxed text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 bg-background relative group">
              <img 
                alt="Strategic partner" 
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" 
                src="/images/tatt-authority.png"
              />
              <div className="absolute inset-0 bg-tatt-lime/5 group-hover:bg-transparent transition-colors duration-700"></div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-32 lg:py-48 px-6 lg:px-20 bg-background text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-tatt-lime rounded-full blur-[120px]"></div>
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <p className="text-[10px] tracking-[0.3em] uppercase font-black text-tatt-gray mb-10">Application Phase Active</p>
            <h2 className="text-[32px] sm:text-[42px] font-black leading-[1.2] tracking-[-0.75px] uppercase text-tatt-black mb-8 md:mb-12">
              Join the <br/><span className="text-tatt-lime">Ecosystem</span>
            </h2>
            <p className="text-lg md:text-2xl font-bold mb-12 md:mb-16 max-w-2xl mx-auto uppercase tracking-tight opacity-70">
              Applications are currently open for enterprises that embody excellence and uncompromising Diaspora values.
            </p>
            <Link 
              href="/business-directory/apply"
              className="inline-flex items-center justify-center h-16 md:h-20 bg-tatt-lime text-tatt-black px-12 md:px-20 font-bold uppercase tracking-[0.1em] text-sm md:text-base rounded-lg shadow-2xl transition hover:brightness-95 active:scale-95 text-center mx-auto"
            >
              Get Starter
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
