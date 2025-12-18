// PropertyCard component for displaying individual properties with booking functionality
"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Property, BookingStatus } from '@/lib/contract';
import { usePropertyAvailability, mockProperties } from '@/lib/hooks';
import BookingModal from './BookingModal';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { isConnected } = useAccount();
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Check actual property availability from the smart contract
  const { isAvailable, isLoading: availabilityLoading } = usePropertyAvailability(property.id);

  // Use contract data if available, otherwise fall back to mock data
  const propertyAvailable = availabilityLoading ? property.available : isAvailable;

  const handleBookingClick = () => {
    if (!isConnected) {
      alert('Please connect your wallet to book a property');
      return;
    }
    setShowBookingModal(true);
  };

  const getStatusColor = (available: boolean) => {
    if (availabilityLoading) return 'bg-yellow-100 text-yellow-800';
    return available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (available: boolean) => {
    if (availabilityLoading) return 'Checking...';
    return available ? 'Available' : 'Unavailable';
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Property Image */}
        <div className="relative h-64 bg-gradient-to-br from-blue-400 to-purple-500">
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">🏠</div>
              <div className="text-sm opacity-80">Property #{property.id}</div>
            </div>
          </div>
          
          {/* Availability Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(propertyAvailable)}`}>
              {getStatusText(propertyAvailable)}
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            {property.name}
          </h3>
          
          <p className="text-slate-600 dark:text-slate-400 mb-3 text-sm">
            {property.description}
          </p>
          
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.location}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                ${property.price}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-sm">/night</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleBookingClick}
              disabled={!propertyAvailable || !isConnected || availabilityLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                propertyAvailable && isConnected && !availabilityLoading
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-105'
                  : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              }`}
            >
              {!isConnected 
                ? 'Connect Wallet to Book' 
                : availabilityLoading 
                ? 'Checking Availability...' 
                : propertyAvailable 
                ? 'Book Now' 
                : 'Unavailable'
              }
            </button>
            
            <button className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          property={property}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </>
  );
}
