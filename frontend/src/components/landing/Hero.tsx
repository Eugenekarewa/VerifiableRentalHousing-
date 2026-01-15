"use client";
import React from 'react';
import { ArrowRight, Zap, ShieldCheck, Globe, Cpu, ChevronRight } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-16 overflow-hidden bg-[#020617]">
      {/* --- Advanced Dark Background Layer --- */}
      <div className="absolute inset-0 z-0">
        {/* Deep Neon Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse delay-700" />
        
        {/* Grid & Noise for Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-200 pointer-events-none" />
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] [background-size:50px_50px]" />
        
        {/* Subtle Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_80%)]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* 1. Live Status Badge */}
          <div className="inline-flex items-center gap-3 bg-white/[0.03] backdrop-blur-2xl border border-white/10 px-4 py-2 rounded-2xl mb-10 animate-fade-in-up shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-100/60">
              Protocol v2.0 <span className="text-white">Mainnet Active</span>
            </span>
            <ChevronRight size={12} className="text-white/20" />
          </div>

          {/* 2. Massive High-Contrast Heading */}
          <h1 className="text-6xl md:text-[100px] font-[900] text-white leading-[0.9] tracking-[-0.05em] mb-8">
            Trust is <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-blue-400 to-indigo-600 italic">
              Code-Driven.
            </span>
          </h1>

          {/* 3. Refined Description */}
          <p className="max-w-2xl text-xl md:text-2xl text-slate-400 font-medium leading-relaxed mb-12">
            The verifiable layer for global rentals. Replace legacy contracts with 
            <span className="text-white"> cryptographic proofs</span> and automated node verification.
          </p>

          {/* 4. Glassmorphism Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-24">
            <button className="group relative bg-white text-black px-12 py-5 rounded-[2rem] font-bold text-lg transition-all hover:bg-blue-500 hover:text-white active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <span className="relative z-10 flex items-center gap-2">
                Deploy Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button className="flex items-center gap-3 px-12 py-5 rounded-[2rem] bg-white/[0.03] border border-white/10 text-white font-bold text-lg hover:bg-white/[0.08] transition-all active:scale-95">
              <Globe size={20} className="text-blue-400" />
              Ecosystem
            </button>
          </div>

          {/* 5. Cybernetic Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            <StatCard icon={<ShieldCheck className="text-blue-400" />} label="Verified Assets" value="1.2k+" />
            <StatCard icon={<Cpu className="text-indigo-400" />} label="Proof Latency" value="140ms" />
            <StatCard icon={<Zap className="text-blue-500" />} label="Total Volume" value="$24M" />
          </div>

        </div>
      </div>
    </section>
  );
};

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="group bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] p-8 rounded-[2.5rem] hover:border-blue-500/50 hover:bg-white/[0.04] transition-all duration-700 text-left relative overflow-hidden">
      {/* Subtle Card Glow hover effect */}
      <div className="absolute -inset-px bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all duration-500">
          {icon}
        </div>
        <div className="text-3xl font-black text-white tracking-tight">{value}</div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">{label}</div>
      </div>
    </div>
  );
}