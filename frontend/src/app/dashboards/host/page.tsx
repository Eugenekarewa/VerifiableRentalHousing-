"use client";
import React from 'react';
import { useProtocol } from '@/context/ProtocolContext';
import { Plus, Home, Zap, CheckCircle2, Clock, XCircle, UserCheck, Wallet, Globe } from 'lucide-react';

export default function HostPage() {
  const { properties, listNewProperty, hostCompleteStay } = useProtocol();

  const handleDenyBooking = (id: string) => {
    // In a real app, this would call a deny function in Context
    console.log("Denied:", id);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      {/* Subtle Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto pt-24 pb-12 px-6">
        
        {/* Compact Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/5 pb-8 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-[0.3em]">
              <Globe size={12} /> Live Protocol Terminal
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Host Management</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Earnings</span>
              <span className="text-xl font-black text-emerald-400 font-mono">$12,450.00</span>
            </div>
            <button 
              onClick={() => listNewProperty("Alpine Loft", 920, "Zermatt, CH")}
              className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-6 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-95 text-sm"
            >
              <Plus size={18} /> List Property
            </button>
          </div>
        </div>

        {/* Dense Grid Layout */}
        <div className="grid grid-cols-1 gap-3">
          {properties.map(prop => (
            <div 
              key={prop.id} 
              className="group relative bg-[#0a0f1e]/60 border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 transition-all backdrop-blur-md overflow-hidden"
            >
              {/* Animated hover background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/[0.02] to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] duration-1000 transition-transform pointer-events-none" />

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Left Side: Property Info */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 border border-white/10 shrink-0">
                    <Home size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white truncate leading-tight">{prop.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{prop.location}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-[10px] font-black text-blue-500/80 uppercase font-mono">${prop.price}/night</span>
                    </div>
                  </div>
                </div>

                {/* Center: Guest/Status Section (Reduces Whitespace) */}
                <div className="flex flex-1 items-center justify-start md:justify-center gap-8 w-full md:w-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Stay Details</span>
                    {prop.currentGuest ? (
                      <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                        <UserCheck size={14} /> {prop.currentGuest}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-700 font-medium">No active guest</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Protocol State</span>
                    <StatusTag status={prop.status} />
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  {prop.status === 'PENDING_ADMIN' && (
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                      <Clock size={14} className="animate-spin-slow" /> VERIFICATION PENDING
                    </span>
                  )}

                  {prop.status === 'OCCUPIED' && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => hostCompleteStay(prop.id)} 
                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs border border-emerald-500/20 transition-all flex items-center gap-2"
                      >
                        <CheckCircle2 size={14} /> Accept & End
                      </button>
                      <button 
                        onClick={() => handleDenyBooking(prop.id)}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-xl border border-red-500/20 transition-all"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}

                  {prop.status === 'VERIFIED_ACTIVE' && (
                    <div className="text-blue-400 font-black text-[10px] tracking-widest flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <Zap size={14} className="fill-current animate-pulse" /> LIVE
                    </div>
                  )}

                  {prop.status === 'COMPLETED' && (
                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold bg-emerald-500/5 px-4 py-2 rounded-lg border border-emerald-500/10">
                      <Wallet size={14} /> SETTLED
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Global Stats Footer (Compact) */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat label="Escrow Held" value="$4,200" />
          <MiniStat label="Node Uptime" value="100%" />
          <MiniStat label="KRNL Proofs" value="28" />
          <MiniStat label="Avg Settled" value="2.4s" />
        </div>
      </div>
    </div>
  );
}

// Visual Utilities
function StatusTag({ status }: { status: string }) {
  const configs: any = {
    PENDING_ADMIN: "text-slate-500 bg-slate-500/10",
    VERIFIED_ACTIVE: "text-blue-400 bg-blue-400/10",
    OCCUPIED: "text-amber-400 bg-amber-400/10 animate-pulse",
    COMPLETED: "text-emerald-400 bg-emerald-400/10",
  };
  return (
    <span className={`text-[10px] font-black tracking-tighter uppercase px-2 py-0.5 rounded ${configs[status] || configs.PENDING_ADMIN}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function MiniStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-white mt-1">{value}</p>
    </div>
  );
}