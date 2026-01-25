'use client';
import React, { useState } from 'react';
import { ArrowRight, Home, Shield, Users, Key, Star, MapPin, Zap, X } from 'lucide-react';
import BookingFlow from '@/components/booking/BookingFlow';
import { Property } from '@/types';

export const Hero = () => {
  const [showFeaturedBooking, setShowFeaturedBooking] = useState(false);

  // Featured property: Luxury Downtown Apartment
  const featuredProperty: Property = {
    id: 1,
    name: 'Luxury Downtown Apartment',
    description: 'Modern 2-bedroom apartment in the heart of the city with stunning skyline views, premium amenities, and secure verified booking.',
    price: 200,
    location: 'Downtown, City Center',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200'],
    amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Gym Access', 'Rooftop Terrace', 'Smart Home', 'Concierge'],
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    available: true,
    owner: {
      id: 'owner_1',
      name: 'Sarah Johnson',
      rating: 4.8,
      verified: true
    }
  };

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-16 overflow-hidden bg-slate-900">
      {/* --- Background Layer --- */}
      {/* --- Background Layer --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-600/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-emerald-500/10 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse]" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] [background-size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">

          {/* 1. Trust Badge */}
          <div className="animate-float inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full mb-12 shadow-lg shadow-amber-900/10">
            <Shield className="text-emerald-500" size={18} />
            <span className="text-sm font-bold text-slate-200 tracking-wide">
              Verified & Trusted Listings
            </span>
          </div>

          {/* 2. Main Heading - Consumer Friendly */}
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-8 max-w-5xl tracking-tight">
            Find your perfect
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              home away from home
            </span>
          </h1>

          {/* 3. Description */}
          <p className="max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed mb-12">
            Book verified rental properties with confidence. Every host is verified and every
            booking is protected by our secure processing system.
          </p>

          {/* 4. Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            <button
              onClick={() => setShowFeaturedBooking(true)}
              className="group bg-emerald-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-400 transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
            >
              <span className="flex items-center gap-2">
                Book Luxury Downtown <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button className="flex items-center gap-2 px-10 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all">
              <Home size={20} className="text-emerald-400" />
              List Your Property
            </button>
          </div>

          {/* 5. Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <TrustCard
              icon={<Users className="text-emerald-400" />}
              number="10,000+"
              label="Happy Guests"
            />
            <TrustCard
              icon={<Shield className="text-emerald-400" />}
              number="5,000+"
              label="Verified Properties"
            />
            <TrustCard
              icon={<Key className="text-emerald-400" />}
              number="500+"
              label="Cities Worldwide"
            />
          </div>

        </div>
      </div>

      {/* Featured Property Quick Booking Modal */}
      {showFeaturedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFeaturedBooking(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowFeaturedBooking(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-20"
            >
              <X size={32} />
            </button>

            {/* Featured Property Badge */}
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                <Star size={14} className="text-white fill-current" />
                <span className="text-[10px] font-black tracking-widest text-white uppercase">
                  Featured Property
                </span>
              </div>
            </div>

            {/* Booking Flow */}
            <BookingFlow
              property={featuredProperty}
              onSuccess={() => setShowFeaturedBooking(false)}
              onCancel={() => setShowFeaturedBooking(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
};

function TrustCard({ icon, number, label }: { icon: React.ReactNode; number: string; label: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-2xl font-bold text-white">{number}</span>
      </div>
      <span className="text-sm text-slate-400">{label}</span>
    </div>
  );
}

