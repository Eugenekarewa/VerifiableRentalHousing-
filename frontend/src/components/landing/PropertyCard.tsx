"use client";

import React from 'react';
import Image from 'next/image';
import { MapPin, Star, Lock, ShieldCheck, Zap } from 'lucide-react';
import { Property, User } from '@/types';

interface PropertyCardProps {
  property: Property;
  user: User | null;
}

export const PropertyCard = ({ property, user }: PropertyCardProps) => {
  // 1. Safety Guard: Prevents "Cannot read properties of undefined"
  if (!property) {
    return (
      <div className="h-96 w-full bg-slate-100 rounded-[2.5rem] animate-pulse flex items-center justify-center text-slate-400">
        Data unavailable
      </div>
    );
  }

  const isGuest = user?.role === 'GUEST';
  
  // 2. Default values to prevent UI breakage if fields are missing
  const displayImage = property.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"; // Fallback home image
  const displayTitle = property.title || "Premium Rental";
  const displayLocation = property.location || "Location on request";
  const displayPrice = property.price || 0;

  return (
    <div className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col h-full">
      
      {/* Image Container */}
      <div className="relative h-72 w-full overflow-hidden bg-slate-200">
        <Image 
          src={displayImage} 
          alt={displayTitle}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition duration-700 ease-out"
          loading="lazy"
        />
        
        {/* Verification Badge */}
        <div className="absolute top-5 left-5 z-10">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-white/20">
            <ShieldCheck size={14} className="text-blue-600" />
            <span className="text-[10px] font-black tracking-widest text-slate-900 uppercase">
              KRNL Verified
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-2xl text-slate-900 tracking-tight leading-tight">
            {displayTitle}
          </h3>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-600">
            <Star size={14} fill="currentColor"/>
            <span className="text-xs font-bold">4.9</span>
          </div>
        </div>
        
        <p className="text-slate-500 text-sm flex items-center gap-1.5 mb-8">
          <MapPin size={16} className="text-slate-400" /> 
          {displayLocation}
        </p>

        {/* Footer / Booking Logic */}
        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-black text-slate-900 leading-none">
              ${displayPrice}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">
              Per Night
            </span>
          </div>

          {/* Role-Based Action Logic */}
          {isGuest ? (
            <button 
              onClick={() => alert(`Initiating Verifiable Booking for ${displayTitle}...`)}
              className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              <Zap size={16} fill="currentColor"/> Book Now
            </button>
          ) : user ? (
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-tighter">
                Guest Access Required
              </span>
              <div className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg italic">
                View Only
              </div>
            </div>
          ) : (
            <button 
              disabled
              className="flex items-center gap-2 text-slate-400 font-bold text-sm bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 cursor-not-allowed opacity-80"
            >
              <Lock size={16}/> Login to Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
};