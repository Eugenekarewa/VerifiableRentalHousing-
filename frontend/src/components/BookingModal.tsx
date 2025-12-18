
// BookingModal component for handling property bookings
"use client";

import React, { useState } from 'react';
import { X, Calendar, User, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useCreateBooking } from '@/lib/hooks';


interface Property {
  id: number;
  name: string;
  description: string;
  price: number;
  location: string;
  image: string;
  available: boolean;
}

interface BookingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ property, isOpen, onClose }: BookingModalProps) {

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingResult, setBookingResult] = useState<{ success: boolean; bookingId?: number; error?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: createBooking, isPending, error } = useCreateBooking();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    if (new Date(checkIn) < new Date()) {
      alert('Check-in date cannot be in the past');
      return;
    }


    setIsSubmitting(true);
    
    try {
      const bookingData = {
        propertyId: property.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests,
        paymentMethod,
        specialRequests
      };

      createBooking(bookingData, {
        onSuccess: (response: any) => {
          setBookingResult({
            success: true,
            bookingId: response?.data?.bookingId || 1,
          });
          setIsSubmitting(false);
        },
        onError: (err: any) => {
          console.error('Booking failed:', err);
          setBookingResult({
            success: false,
            error: err?.message || 'Failed to create booking'
          });
          setIsSubmitting(false);
        }
      });
      
    } catch (err) {
      console.error('Booking failed:', err);
      setBookingResult({ success: false, error: 'Failed to submit booking request' });
      setIsSubmitting(false);
    }
  };


  // Handle booking errors
  React.useEffect(() => {
    if (error) {
      setBookingResult({ success: false, error: error.message });
    }
  }, [error]);

  if (!isOpen) return null;


  const isProcessing = isPending || isSubmitting;

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


          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 disabled:opacity-50"
            >
              <option value="card">Credit Card</option>
              <option value="debit">Debit Card</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests or notes for your stay..."
              rows={3}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 disabled:opacity-50"
            />
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

                Booking...
              </div>
            ) : (
              'Book Now'
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
                    Booking ID: #{bookingResult.bookingId}
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
