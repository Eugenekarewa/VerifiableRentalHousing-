"use client";
import React from 'react';
import { useProtocol } from '@/context/ProtocolContext';
import { ShieldCheck, Users, Building, CheckCircle, Clock } from 'lucide-react';

export default function AdminPage() {
  const { properties, adminVerifyProperty } = useProtocol();
  const pending = properties.filter(p => p.status === 'PENDING_ADMIN');

  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-10 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-5xl font-black">Admin Dashboard</h1>
          </div>
          <p className="text-slate-400 text-lg">Manage property listings and verify new submissions.</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-blue-400">
                <Building size={20}/> Pending Approvals
              </h2>
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                {pending.length} pending
              </span>
            </div>
            
            {pending.map(prop => (
              <div key={prop.id} className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] flex justify-between items-center hover:bg-white/[0.05] transition-colors">
                <div>
                  <h4 className="font-bold text-lg">{(prop as any).title || (prop as any).name || 'Unnamed Property'}</h4>
                  <p className="text-sm text-slate-500">{prop.location} • Listed on {new Date().toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => adminVerifyProperty(prop.id)}
                  className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <CheckCircle size={18} />
                  Approve
                </button>
              </div>
            ))}
            
            {pending.length === 0 && (
              <div className="bg-white/[0.03] border border-white/10 p-12 rounded-[2rem] text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <p className="text-slate-400 font-medium">All caught up! No pending approvals at the moment.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Properties</span>
                  <span className="font-bold text-white">{properties.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active Listings</span>
                  <span className="font-bold text-green-400">
                    {properties.filter(p => p.status === 'VERIFIED_ACTIVE').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pending Review</span>
                  <span className="font-bold text-yellow-400">{pending.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-sm font-medium transition-colors text-left px-4">
                  View All Properties
                </button>
                <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-sm font-medium transition-colors text-left px-4">
                  Manage Users
                </button>
                <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-sm font-medium transition-colors text-left px-4">
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

