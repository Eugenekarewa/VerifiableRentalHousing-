"use client";
import React from 'react';
import { PropertyCard } from '@/components/landing/PropertyCard';
import { useProtocol } from '@/context/ProtocolContext';
import { useAuth } from '@/context/AuthContext';
import { LayoutGrid, Compass } from 'lucide-react';

export default function GuestPage() {
  const { properties } = useProtocol();
  const { user } = useAuth();
  
  // Only show properties that the Admin has verified
  const marketplace = properties.filter(p => p.status === 'VERIFIED_ACTIVE');

  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-white mb-4">Marketplace</h1>
          <p className="text-slate-400">Discover properties with cryptographically verified deeds.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {marketplace.length > 0 ? (
            marketplace.map(prop => (
              <PropertyCard key={prop.id} property={prop} user={user} />
            ))
          ) : (
            <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
              <Compass className="mx-auto text-slate-700 mb-4" size={48} />
              <p className="text-slate-500 font-bold uppercase tracking-widest">No verified listings available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}