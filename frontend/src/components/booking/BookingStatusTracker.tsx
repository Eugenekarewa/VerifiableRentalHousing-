"use client";

import React from 'react';
// Added ShieldCheck and CheckCircle2 to the imports
import { Clock, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';

const STATUS_STEPS = [
  { label: 'Requested', icon: <Clock size={16}/> },
  { label: 'Verified', icon: <ShieldCheck size={16} className="text-blue-400"/> },
  { label: 'Confirmed', icon: <Zap size={16} className="text-amber-400"/> },
  { label: 'Completed', icon: <CheckCircle2 size={16} className="text-green-400"/> }
];

export const BookingStatusTracker = ({ currentStatus }: { currentStatus: string }) => {
  const currentIndex = STATUS_STEPS.findIndex(s => s.label === currentStatus);

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-12 relative">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2" />
      
      {STATUS_STEPS.map((step, index) => (
        <div key={step.label} className="relative z-10 flex flex-col items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500
            ${index <= currentIndex 
              ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white' 
              : 'bg-[#0f172a] border-white/10 text-slate-500'}
          `}>
            {step.icon}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${index <= currentIndex ? 'text-white' : 'text-slate-600'}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};