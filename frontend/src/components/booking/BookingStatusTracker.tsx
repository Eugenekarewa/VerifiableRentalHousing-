"use client";

import React, { useEffect } from 'react';
import { Clock, ShieldCheck, Zap, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useGetBooking } from '@/lib/contracts/useVerifiableRental';
import { useFormatBookingStatus, useWalletStatus } from '@/components/hooks/useBookingContract';
import { BookingStatus } from '@/types/contract';

interface BookingStatusTrackerProps {
  bookingId: bigint | string;
  transactionHash?: string;
  onStatusChange?: (status: BookingStatus) => void;
}

const STATUS_STEPS = [
  { label: 'Requested', icon: <Clock size={16} />, status: BookingStatus.Requested },
  { label: 'Verified', icon: <ShieldCheck size={16} className="text-blue-400" />, status: BookingStatus.Verified },
  { label: 'Confirmed', icon: <Zap size={16} className="text-amber-400" />, status: BookingStatus.Confirmed },
  { label: 'Completed', icon: <CheckCircle2 size={16} className="text-green-400" />, status: BookingStatus.Completed },
];

const CANCELLED_STEPS = [
  { label: 'Requested', icon: <Clock size={16} />, status: BookingStatus.Requested },
  { label: 'Cancelled', icon: <AlertCircle size={16} className="text-red-400" />, status: BookingStatus.Cancelled },
];

export const BookingStatusTracker = ({ 
  bookingId, 
  transactionHash,
  onStatusChange 
}: BookingStatusTrackerProps) => {
  const { isConnected } = useWalletStatus();
  
  // Convert string bookingId to bigint if needed
  const bookingIdBigInt = typeof bookingId === 'string' ? BigInt(bookingId) : bookingId;
  
  // Fetch booking status from blockchain
  const { booking, isLoading, isError } = useGetBooking(bookingIdBigInt);
  
  const { formatStatus, getStatusColor, getStatusBgColor } = useFormatBookingStatus();

  // Notify parent of status changes
  useEffect(() => {
    if (booking && onStatusChange) {
      onStatusChange(booking.status);
    }
  }, [booking, onStatusChange]);

  // Determine current status from blockchain data or fallback
  const currentStatus = booking?.status !== undefined 
    ? formatStatus(booking.status) 
    : 'Requested';
  
  const currentStatusValue = booking?.status ?? BookingStatus.Requested;
  const isCancelled = currentStatusValue === BookingStatus.Cancelled;
  
  const steps = isCancelled ? CANCELLED_STEPS : STATUS_STEPS;
  const currentIndex = steps.findIndex(s => s.status === currentStatusValue);

  // Explorer link for transaction
  const explorerLink = transactionHash 
    ? `https://sepolia.etherscan.io/tx/${transactionHash}`
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2" />
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-[#0f172a] animate-pulse">
              <div className="w-4 h-4 bg-slate-600 rounded-full" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              Loading...
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <span>Error loading booking status. Please check your connection.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Transaction Hash Display */}
      {transactionHash && (
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
          <span>Tx:</span>
          <span className="font-mono text-blue-400">
            {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
          </span>
          {explorerLink && (
            <a 
              href={explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}

      {/* Status Tracker */}
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2" />
        
        {steps.map((step, index) => (
          <div key={step.label} className="relative z-10 flex flex-col items-center gap-3">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500
              ${index <= currentIndex 
                ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white' 
                : 'bg-[#0f172a] border-white/10 text-slate-500'}
            `}>
              {step.icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${index <= currentIndex ? 'text-white' : 'text-slate-600'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Booking Details from Blockchain */}
      {booking && (
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Property ID</span>
            <span className="font-mono text-white">{booking.propertyId.toString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-slate-400">Deposit</span>
            <span className="font-mono text-white">{booking.depositAmount.toString()} ETH</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-slate-400">Your Address</span>
            <span className="font-mono text-white">{booking.tenant.slice(0, 6)}...{booking.tenant.slice(-4)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Simple status display component (no blockchain fetching)
 */
export const SimpleBookingStatusTracker = ({ currentStatus }: { currentStatus: string }) => {
  const currentIndex = STATUS_STEPS.findIndex(s => s.label === currentStatus);

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-12 relative">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2" />
      
      {STATUS_STEPS.map((step, index) => (
        <div key={step.label} className="relative z-10 flex flex-col items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500
            ${index <= currentIndex 
              ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white' 
              : 'bg-[#0f172a] border-white/10 text-slate-500'}
          `}>
            {step.icon}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${index <= currentIndex ? 'text-white' : 'text-slate-600'}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};

