// BookingModal component for handling property bookings
"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { X, Calendar, User, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Property } from '@/lib/contract';
import { useRequestBooking } from '@/lib/hooks';

interface BookingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ property, isOpen, onClose }: BookingModalProps) {
  const { address } = useAccount();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [userData, setUserData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ success: boolean; bookingId?: number; error?: string } | null>(null);

  const { requestBooking, isPending, isConfirming, isSuccess, error, hash } = useRequestBooking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create encrypted user data (in a real app, this would be properly encrypted)
      const encryptedUserData = JSON.stringify({
        address,
        checkIn,
        checkOut,
        guests,
        userData,
        timestamp: Date.now()
      });

      // Convert to bytes for the smart contract
      const encryptedUserDataBytes = new TextEncoder().encode(encryptedUserData);
      
      await requestBooking(property.id, Array.from(encryptedUserDataBytes));
      
      // The transaction receipt will be handled by the useRequestBooking hook
      // We'll show success message when isSuccess is true
      
    } catch (err) {
      console.error('Booking failed:', err);
      setBookingResult({ success: false, error: 'Failed to submit booking request' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle transaction success
  React.useEffect(() => {
    if (isSuccess && hash) {
      setBookingResult({ 
        success: true, 
        bookingId: 1 // In a real app, you'd parse the transaction receipt to get the actual booking ID
      });
    }
  }, [isSuccess, hash]);

  // Handle transaction errors
  React.useEffect(() => {
    if (error) {
      setBookingResult({ success: false, error: error.message });
    }
  }, [error]);

  if (!isOpen) return null;

  const isProcessing = isPending || isConfirming || isSubmitting;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Book Property
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Property Info */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
            {property.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {property.location}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              ${property.price}/night
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Property ID: {property.id}
            </span>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                disabled={isProcessing}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                required
                disabled={isProcessing}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Guests */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Number of Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 disabled:opacity-50"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>

          {/* User Verification Data */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              Verification Information (Optional)
            </label>
            <textarea
              value={userData}
              onChange={(e) => setUserData(e.target.value)}
              placeholder="Additional verification information for KRNL attestation..."
              rows={3}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 disabled:opacity-50"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              This information will be encrypted and used for identity verification
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : 'Processing...'}
              </div>
            ) : (
              'Request Booking'
            )}
          </button>
        </form>

        {/* Transaction Status */}
        {bookingResult && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            {bookingResult.success ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5 mr-2" />
                <div>
                  <p className="font-medium">Booking Request Submitted!</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your booking request has been submitted successfully. 
                    Transaction: {hash?.slice(0, 10)}...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                <div>
                  <p className="font-medium">Booking Failed</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {bookingResult.error || 'An error occurred while submitting your booking request'}
                  </p>
                </div>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="w-full mt-4 py-2 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
