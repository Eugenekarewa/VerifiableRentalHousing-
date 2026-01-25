"use client";

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { PropertyCard } from '@/components/landing/PropertyCard';
import { PropertyCarousel } from '@/components/landing/PropertyCarousel';
import { PropertySkeleton } from '@/components/landing/PropertySkeleton';
import BookingFlow from '@/components/booking/BookingFlow';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api';
import { Property } from '@/types';
import { ShieldCheck, AlertCircle, RefreshCw, Home, X } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Handle booking initiation from PropertyCard
  const handleBookProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsBookingModalOpen(true);
  };

  // Handle booking success
  const handleBookingSuccess = (bookingId: string, transactionHash: string) => {
    console.log('Booking successful:', { bookingId, transactionHash });
    // Refresh properties to update availability
    fetchProperties();
  };

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await propertiesAPI.getProperties({ available: 'true' });
      if (response.data.success) {
        setProperties(response.data.properties);
      } else {
        setError('Failed to load properties');
      }
    } catch (err: unknown) {
      console.error('Error fetching properties:', err);
      const errorMessage = err instanceof Error
        ? err.message
        : 'Unable to connect to the server. Please ensure the backend is running.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    fetchProperties();
  };

  return (
    <main className="min-h-screen bg-slate-950 pb-32">
      {/* Global Navigation */}
      <Navbar />

      {/* Hero Header */}
      <Hero />

      {/* Value Proposition */}
      <Features />

      {/* Property Section */}
      <section className="max-w-[1400px] mx-auto px-8 sm:px-12 mt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-blue-600 font-bold text-sm tracking-widest uppercase flex items-center gap-2">
              <ShieldCheck size={16} />
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
              <span className="text-2xl font-black text-slate-50">
                {loading ? '...' : properties.length}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase">
                {properties.length === 1 ? 'Available Stay' : 'Available Stays'}
              </span>
            </div>
            <div className="h-10 w-[1px] bg-slate-200 hidden lg:block mx-4"></div>
            <button className="bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-200 transition">
              Filters
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-12 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/20 rounded-2xl">
                <AlertCircle className="text-red-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-400 mb-1">
                  Unable to Load Properties
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {error}
                </p>
                <button
                  onClick={handleRetry}
                  disabled={retrying}
                  className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl font-bold text-sm transition"
                >
                  <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
                  {retrying ? 'Retrying...' : 'Try Again'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          /* Empty state when error occurred */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-6">
              <Home className="text-slate-500" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">
              Properties Unavailable
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We couldn&apos;t load the property listings at this time. Please try again later.
            </p>
          </div>
        ) : properties.length === 0 ? (
          /* Empty state when no properties available */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-6">
              <ShieldCheck className="text-blue-500" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">
              No Properties Available
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Check back soon! New verified properties are being added to our marketplace.
            </p>
          </div>
        ) : (
          /* Property Carousel */
          <PropertyCarousel
            title="Trending in Nairobi"
            properties={properties}
            user={user}
            onBook={handleBookProperty}
          />
        )}

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

      {/* Booking Modal */}
      {isBookingModalOpen && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsBookingModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>

            {/* Booking Flow */}
            <BookingFlow
              property={selectedProperty}
              onSuccess={handleBookingSuccess}
              onCancel={() => setIsBookingModalOpen(false)}
            />
          </div>
        </div>
      )}
    </main>
  );
}

