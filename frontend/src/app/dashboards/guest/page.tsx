"use client";
import React from 'react';
import { PropertyCard } from '@/components/landing/PropertyCard';
import { useProtocol } from '@/context/ProtocolContext';
import { useAuth } from '@/context/AuthContext';
import { Search, Filter, MapPin } from 'lucide-react';

export default function GuestPage() {
  const { properties } = useProtocol();
  const { user } = useAuth();
  
  // Only show properties that have been verified/approved
  const marketplace = properties.filter(p => p.status === 'VERIFIED_ACTIVE');

  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-white mb-4">Find Your Stay</h1>
          <p className="text-slate-400 text-lg">Browse verified properties from trusted hosts.</p>
        </header>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search destinations..."
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white font-medium hover:bg-white/10 transition-colors">
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Results Count */}
        <div className="flex items-center gap-2 mb-6 text-slate-400">
          <MapPin size={18} />
          <span className="text-sm font-medium">
            {marketplace.length} {marketplace.length === 1 ? 'property' : 'properties'} available
          </span>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {marketplace.length > 0 ? (
            marketplace.map(prop => (
              <PropertyCard key={prop.id} property={prop} user={user} />
            ))
          ) : (
            <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={40} className="text-slate-700" />
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-widest">No listings available yet.</p>
              <p className="text-slate-600 text-sm mt-2">Check back soon for new properties!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

