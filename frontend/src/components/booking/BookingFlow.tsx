'use client';

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useRequestBooking, useEncryptUserData, useWalletConnection } from '@/lib/contracts/useVerifiableRental';
import { useAuth } from '@/context/AuthContext';
import { Property } from '@/types/contract';
import { Calendar, Users, CreditCard, Shield, Loader2, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface BookingFlowProps {
  property: Property;
  onSuccess?: (bookingId: string, transactionHash: string) => void;
  onCancel?: () => void;
}

export default function BookingFlow({ property, onSuccess, onCancel }: BookingFlowProps) {
  const { isConnected } = useWalletConnection();
  const { user } = useAuth();
  const { encryptUserData } = useEncryptUserData();
  const { requestBooking, isPending, isConfirming, isConfirmed, transactionHash, error } = useRequestBooking();
  
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [step, setStep] = useState<'details' | 'payment' | 'confirm' | 'processing' | 'success'>('details');
  const [selectedPayment, setSelectedPayment] = useState('crypto');

  // Calculate total nights and price
  const checkIn = checkInDate ? new Date(checkInDate) : null;
  const checkOut = checkOutDate ? new Date(checkOutDate) : null;
  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = nights > 0 ? property.price * nights : property.price;

  const handleRequestBooking = useCallback(async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!user?.isVerified) {
      toast.error('Identity verification required');
      return;
    }

    setStep('processing');

    try {
      // Encrypt user data for blockchain
      const encryptedUserData = encryptUserData({
        userId: user.id,
        email: user.email,
        name: user.name,
        checkInDate,
        checkOutDate,
        guests,
        propertyId: property.id,
      });

      // Submit booking to blockchain
      const result = await requestBooking({
        propertyId: BigInt(property.id),
        encryptedUserData,
      });

      if (result.success) {
        setStep('success');
        toast.success('Booking confirmed on blockchain!');
        onSuccess?.(result.bookingId?.toString() || '', result.transactionHash || '');
      } else {
        setStep('confirm');
        toast.error(result.error || 'Booking failed');
      }
    } catch (err) {
      setStep('confirm');
      toast.error('An error occurred during booking');
      console.error('Booking error:', err);
    }
  }, [isConnected, user, property, checkInDate, checkOutDate, guests, requestBooking, encryptUserData, onSuccess]);

  const handleNext = () => {
    if (step === 'details') {
      if (!checkInDate || !checkOutDate) {
        toast.error('Please select check-in and check-out dates');
        return;
      }
      if (checkIn && checkOut && checkIn >= checkOut) {
        toast.error('Check-out must be after check-in');
        return;
      }
      setStep('payment');
    } else if (step === 'payment') {
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('details');
    } else if (step === 'confirm') {
      setStep('payment');
    } else if (step === 'details' && onCancel) {
      onCancel();
    }
  };

  // Wallet not connected state
  if (!isConnected) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Connect Wallet to Book</h3>
        <p className="text-slate-600 mb-6">
          Please connect your wallet to proceed with the booking. This ensures secure, trustless transactions on the blockchain.
        </p>
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-blue-700">
          <Wallet size={24} />
          <span className="font-medium">MetaMask or WalletConnect required</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">Book Your Stay</h3>
        <span className="text-2xl font-black text-blue-600">${property.price}<span className="text-sm font-normal text-slate-500">/night</span></span>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-6">
        {['details', 'payment', 'confirm'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === s ? 'bg-blue-600 text-white' :
              ['details', 'payment', 'confirm'].indexOf(step) > i ? 'bg-green-500 text-white' :
              'bg-slate-200 text-slate-500'
            }`}>
              {['details', 'payment', 'confirm'].indexOf(step) > i ? <CheckCircle size={16} /> : i + 1}
            </div>
            {i < 2 && <div className={`w-12 h-1 mx-2 ${['details', 'payment', 'confirm'].indexOf(step) > i ? 'bg-green-500' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 'details' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Check-in
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Check-out
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Users className="inline w-4 h-4 mr-1" />
              Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {nights > 0 && (
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex justify-between text-sm mb-2">
                <span>${property.price} × {nights} nights</span>
                <span>${totalPrice}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 'payment' && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">Select Payment Method</h4>
          
          <div className="space-y-3">
            <button
              onClick={() => setSelectedPayment('crypto')}
              className={`w-full p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${
                selectedPayment === 'crypto' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">Ξ</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-slate-900">Cryptocurrency</div>
                <div className="text-sm text-slate-500">Pay with ETH on Sepolia</div>
              </div>
              {selectedPayment === 'crypto' && <CheckCircle className="text-blue-600" />}
            </button>

            <button
              onClick={() => setSelectedPayment('card')}
              className={`w-full p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${
                selectedPayment === 'card' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <CreditCard className="text-slate-600" size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-slate-900">Credit Card</div>
                <div className="text-sm text-slate-500">Processed via secure payment</div>
              </div>
              {selectedPayment === 'card' && <CheckCircle className="text-blue-600" />}
            </button>
          </div>

          {/* KRNL Verification Badge */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
            <Shield className="text-green-600" size={24} />
            <div>
              <div className="font-semibold text-green-800">KRNL Verified</div>
              <div className="text-sm text-green-600">Identity and payment verified before booking</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
            >
              Review Booking
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">Review Your Booking</h4>
          
          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Property</span>
              <span className="font-medium">{property.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Check-in</span>
              <span className="font-medium">{checkInDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Check-out</span>
              <span className="font-medium">{checkOutDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Guests</span>
              <span className="font-medium">{guests}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">${totalPrice}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl text-yellow-800 text-sm">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p>This booking will be recorded on the Ethereum Sepolia blockchain. A small gas fee will be required.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={handleRequestBooking}
              disabled={isPending || isConfirming}
              className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {isConfirming ? 'Confirming...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Shield size={20} />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Processing State */}
      {step === 'processing' && (
        <div className="text-center py-8">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-slate-900 mb-2">Processing Your Booking</h4>
          <p className="text-slate-600">Please wait while we verify your identity and create the booking on the blockchain...</p>
        </div>
      )}

      {/* Success State */}
      {step === 'success' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-2">Booking Confirmed!</h4>
          <p className="text-slate-600 mb-4">Your booking has been successfully recorded on the blockchain.</p>
          
          {transactionHash && (
            <div className="p-4 bg-blue-50 rounded-xl text-left">
              <div className="text-xs text-blue-600 font-semibold mb-1">Transaction Hash</div>
              <div className="text-sm text-blue-800 font-mono break-all">{transactionHash}</div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-700 font-medium">
            <AlertCircle size={20} />
            <span>Error: {error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

