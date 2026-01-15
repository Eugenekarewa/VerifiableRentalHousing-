"use client";
import React from 'react';
import { useProtocol } from '@/context/ProtocolContext';
import { ShieldCheck, Terminal, Activity } from 'lucide-react';

export default function AdminPage() {
  const { properties, adminVerifyProperty } = useProtocol();
  const pending = properties.filter(p => p.status === 'PENDING_ADMIN');

  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-10 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black mb-12">Governance</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
              <ShieldCheck size={20}/> Verification Queue
            </h2>
            {pending.map(prop => (
              <div key={prop.id} className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] flex justify-between items-center">
                <div>
                  <h4 className="font-bold">{prop.title}</h4>
                  <p className="text-xs text-slate-500">{prop.location} • Request ID: {prop.id}</p>
                </div>
                <button 
                  onClick={() => adminVerifyProperty(prop.id)}
                  className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-xl text-xs font-black uppercase"
                >
                  Verify Deed
                </button>
              </div>
            ))}
            {pending.length === 0 && <p className="text-slate-600 italic">Queue clear. No pending attestations.</p>}
          </div>

          <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 h-fit">
            <div className="flex items-center gap-2 mb-6 text-blue-500 text-xs font-black"><Terminal size={14}/> SYSTEM LOGS</div>
            <div className="font-mono text-[10px] space-y-2 opacity-50">
              <p>[09:00] Node v1.0.4 Online</p>
              <p>[09:12] Heartbeat: Block #19921 finalized</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}