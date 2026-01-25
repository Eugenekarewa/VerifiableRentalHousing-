"use client";

import React from 'react';
import Image from 'next/image';
import { MapPin, Star, Lock, ShieldCheck, Zap, Bed, Bath, Users } from 'lucide-react';
import { Property, User } from '@/types';

interface PropertyCardProps {
  property: Property;
  user: User | null;
  onBook?: (property: Property) => void;
}

export const PropertyCard = ({ property, user, onBook }: PropertyCardProps) => {
  // Safety Guard: Prevents "Cannot read properties of undefined"
  if (!property) {
    return (
      <div className="h-96 w-full bg-slate-100 rounded-[2.5rem] animate-pulse flex items-center justify-center text-slate-400">
        Data unavailable
      </div>
    );
  }

  const isGuest = user?.role === 'GUEST';
  const isHost = user?.role === 'HOST';
  const isAdmin = user?.role === 'ADMIN';
  const isOwner = user?.id === property.owner?.id;

  // Use first image as main display, fallback to placeholder
  const displayImage = property.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6";
  const displayTitle = property.name || property.title || "Premium Rental";
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
              Verified
            </span>
          </div>
        </div>

        {/* Owner Verification Badge */}
        {property.owner?.verified && (
          <div className="absolute top-5 right-5 z-10">
            <div className="flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md">
              <span className="text-[10px] font-black tracking-widest text-white uppercase">
                Owner Verified
              </span>
            </div>
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute bottom-5 left-5 z-10">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-md ${property.available
              ? 'bg-emerald-500/90 backdrop-blur-md'
              : 'bg-red-500/90 backdrop-blur-md'
            }`}>
            <span className="text-[10px] font-black tracking-widest text-white uppercase">
              {property.available ? 'Available' : 'Booked'}
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
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold">{property.owner?.rating?.toFixed(1) || '4.9'}</span>
          </div>
        </div>

        <p className="text-slate-500 text-sm flex items-center gap-1.5 mb-4">
          <MapPin size={16} className="text-slate-400" />
          {displayLocation}
        </p>

        {/* Property Details */}
        <div className="flex items-center gap-4 mb-6 text-slate-400 text-xs">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed size={14} />
              <span>{property.bedrooms} beds</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath size={14} />
              <span>{property.bathrooms} baths</span>
            </div>
          )}
          {property.maxGuests && (
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{property.maxGuests} guests</span>
            </div>
          )}
        </div>

        {/* Description */}
        {property.description && (
          <p className="text-slate-500 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>
        )}

        {/* Amenities Preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {property.amenities.slice(0, 4).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full uppercase tracking-wider"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 4 && (
              <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase tracking-wider">
                +{property.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer / Booking Logic */}
        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-900 leading-none">
              KES {((property.price || 0) * 129).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">
              Per Night
            </span>
          </div>

          {/* Role-Based Action Logic */}
          {isGuest && property.available ? (
            <button
              onClick={() => onBook?.(property)}
              className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              <Zap size={16} fill="currentColor" /> Book Now
            </button>
          ) : isGuest && !property.available ? (
            <button
              disabled
              className="flex items-center gap-2 text-slate-400 font-bold text-sm bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 cursor-not-allowed opacity-80"
            >
              Currently Booked
            </button>
          ) : isHost || isAdmin || isOwner ? (
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-tighter">
                {isOwner ? 'Your Property' : 'Host Access'}
              </span>
              <div className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg italic">
                Manage
              </div>
            </div>
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
              <Lock size={16} /> Login to Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

