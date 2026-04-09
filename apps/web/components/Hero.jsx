import React from 'react';
import { ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative py-24 bg-cream overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-accent-teal rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-10 left-10 w-48 h-48 bg-accent-cyan rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-xs uppercase tracking-widest mb-8">
              <Sparkles size={16} className="text-accent-teal" />
              The Official Campus Marketplace
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] italic mb-8">
              Trade <span className="text-accent-teal">Hub.</span><br />
              <span className="text-accent-cyan underline decoration-black underline-offset-8">Rent.</span> Trade.<br />
              <span className="text-black">Share.</span>
            </h1>

            <p className="text-xl font-bold text-gray-700 mb-10 max-w-xl italic">
              Join 500+ students at MLRIT in the safest peer-to-peer trading community. No shipping, no fees, just campus trust.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <Link href="/browse" className="btn-neo bg-accent-teal text-white px-10 py-5 text-xl font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3">
                Start Browsing <ArrowRight size={24} />
              </Link>
              <Link href="/register" className="btn-neo bg-white px-10 py-5 text-xl font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                Join Community
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap justify-center lg:justify-start gap-8 opacity-50 font-black uppercase text-[10px] tracking-[0.2em]">
               <div className="flex items-center gap-2"><Zap size={14} /> Instant Pickup</div>
               <div className="flex items-center gap-2"><Shield size={14} /> Zero Scams</div>
               <div className="flex items-center gap-2">Verified .edu Only</div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl">
             <div className="relative">
                <div className="card-neo bg-accent-cyan p-2 rotate-2 scale-105">
                   <img src="https://loremflickr.com/800/600/college,gadgets" alt="Hero" className="w-full aspect-[4/3] object-cover border-2 border-black" />
                </div>
                <div className="absolute -bottom-8 -left-8 card-neo bg-accent-teal p-6 w-48 -rotate-3 hidden md:block">
                   <p className="text-white font-black uppercase italic text-xs mb-2">Top Trade:</p>
                   <p className="text-white font-black uppercase text-xl leading-none">iPhone 15 Pro</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
