"use client";

import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Hero } from '@/components/landing/Hero';
import { PropertyCard } from '@/components/landing/PropertyCard';
import { useAuth } from '@/context/AuthContext';
import { Property } from '@/types';

// 10 Premium Dummy Properties
const MOCK_PROPS: Property[] = [
  { id: '1', title: 'The Glass Horizon', price: 1250, location: 'Malibu, California', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750' },
  { id: '2', title: 'Nordic Minimalist', price: 680, location: 'Oslo, Norway', image: 'https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '3', title: 'Tokyo Sky Loft', price: 890, location: 'Shibuya, Japan', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688' },
  { id: '4', title: 'Santorini White', price: 1400, location: 'Oia, Greece', image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb' },
  { id: '5', title: 'Savannah Eco Lodge', price: 520, location: 'Nairobi, Kenya', image: 'https://images.unsplash.com/photo-1549294413-26f195200c16' },
  { id: '6', title: 'Alpine Chalet', price: 950, location: 'Zermatt, Switzerland', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4' },
  { id: '7', title: 'Desert Mirage', price: 1100, location: 'Dubai, UAE', image: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '8', title: 'Amazon Treehouse', price: 320, location: 'Manaus, Brazil', image: 'https://images.unsplash.com/photo-1676500684456-99f21e42a6fe?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '9', title: 'Regency Flat', price: 750, location: 'London, UK', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156' },
  { id: '10', title: 'Azure Villa', price: 2100, location: 'Amalfi Coast, Italy', image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739' }
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-slate-950 pb-32">
      {/* Global Navigation */}
      <Navbar />

      {/* Hero Header */}
      <Hero />
      
      {/* Property Section */}
      <section className="max-w-[1400px] mx-auto px-8 sm:px-12 mt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-blue-600 font-bold text-sm tracking-widest uppercase">
              Verified Marketplace
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-50 tracking-tight mt-2">
              Premium Properties
            </h2>
            <p className="text-slate-500 font-medium mt-4 max-w-lg">
              Every listing is cryptographically verified via KRNL workflows to ensure ownership and identity trust.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-2xl font-black text-slate-50">10</span>
              <span className="text-xs font-bold text-slate-400 uppercase">Available Stays</span>
            </div>
            <div className="h-10 w-[1px] bg-slate-200 hidden lg:block mx-4"></div>
            <button className="bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-200 transition">
              Filters
            </button>
          </div>
        </div>

        {/* PROPERTY GRID 
           Using the PropertyCard component you provided earlier
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
          {MOCK_PROPS.map((p) => (
            <PropertyCard 
              key={p.id} 
              property={p} 
              user={user} 
            />
          ))}
        </div>
        
        {/* Footer Call to Action */}
        <div className="mt-28 p-16 bg-slate-900 rounded-[3rem] text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-4xl font-black mb-6">Ready to list your own property?</h3>
            <p className="text-slate-400 mb-10 max-w-xl mx-auto">
              Join our protocol as a host and get your properties verified in minutes using our trust-minimized workflow.
            </p>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold transition shadow-xl shadow-blue-900/20">
              Become a Host
            </button>
          </div>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        </div>
      </section>
    </main>
  );
}