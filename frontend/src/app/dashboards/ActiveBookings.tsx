// components/dashboard/ActiveBookings.tsx
'use client';

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useGetBooking, useCancelBooking } from '@/lib/contracts/useVerifiableRental';
import { useFormatBookingStatus, useWalletStatus } from '@/components/hooks/useBookingContract';
import { BookingStatus } from '@/types/contract';
import { AlertCircle, ExternalLink, Loader2, Wallet } from 'lucide-react';

interface BookingCardProps {
  bookingId: bigint;
  onCancel?: (bookingId: bigint) => void;
}

const BookingCard = ({ bookingId, onCancel }: BookingCardProps) => {
  const { booking, isLoading, isError } = useGetBooking(bookingId);
  const { formatStatus, getStatusColor, getStatusBgColor } = useFormatBookingStatus();
  const { cancelBooking, isPending, isConfirming, isConfirmed, transactionHash } = useCancelBooking();

  const handleCancel = useCallback(async () => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        onCancel?.(bookingId);
      }
    }
  }, [bookingId, cancelBooking, onCancel]);

  if (isLoading) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl animate-pulse">
        <div className="flex justify-between items-start mb-6">
          <div className="h-6 bg-white/10 rounded w-32"></div>
          <div className="h-6 bg-white/10 rounded w-20"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-white/5 rounded-2xl"></div>
          <div className="h-20 bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="bg-white/[0.02] border border-red-500/20 rounded-[2.5rem] p-8 backdrop-blur-3xl">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle size={20} />
          <span>Failed to load booking #{bookingId.toString()}</span>
        </div>
      </div>
    );
  }

  const statusString = formatStatus(booking.status);
  const statusColor = getStatusColor(booking.status);
  const statusBgColor = getStatusBgColor(booking.status);
  const isCancellable = booking.status === BookingStatus.Requested || booking.status === BookingStatus.Confirmed;

  // Format dates from blockchain (stored as Unix timestamps)
  const checkInDate = Number(booking.checkInDate) > 0 
    ? new Date(Number(booking.checkInDate) * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';
    
  const checkOutDate = Number(booking.checkOutDate) > 0
    ? new Date(Number(booking.checkOutDate) * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';

  // Explorer link
  const explorerLink = transactionHash 
    ? `https://sepolia.etherscan.io/tx/${transactionHash}`
    : `https://sepolia.etherscan.io/address/${booking.tenant}`;

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl hover:bg-white/[0.04] transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-white font-bold text-lg mb-1">Property #{booking.propertyId.toString()}</h4>
          <code className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2 py-1 rounded flex items-center gap-2 w-fit">
            <span>TX: {booking.verificationHash.slice(2, 14)}...</span>
            <a 
              href={explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-300"
            >
              <ExternalLink size={12} />
            </a>
          </code>
        </div>
        <span className={`${statusBgColor} ${statusColor} text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest`}>
          {statusString}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Check In</span>
          <span className="text-white font-bold">{checkInDate}</span>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Check Out</span>
          <span className="text-white font-bold">{checkOutDate}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Deposit Amount</span>
          <span className="font-mono text-white">{booking.depositAmount.toString()} ETH</span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Tenant</span>
          <span className="font-mono text-slate-300">{booking.tenant.slice(0, 6)}...{booking.tenant.slice(-4)}</span>
        </div>
      </div>

      {isCancellable && (
        <button 
          onClick={handleCancel}
          disabled={isPending || isConfirming}
          className="w-full mt-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {isConfirming ? 'Cancelling...' : 'Processing...'}
            </>
          ) : (
            'Cancel Booking'
          )}
        </button>
      )}

      {isConfirmed && (
        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
          <p className="text-xs text-green-400">Cancellation confirmed on blockchain</p>
        </div>
      )}
    </div>
  );
};

interface ActiveBookingsProps {
  onBookingCancel?: (bookingId: bigint) => void;
}

export const ActiveBookings = ({ onBookingCancel }: ActiveBookingsProps) => {
  const { isConnected } = useWalletStatus();

  if (!isConnected) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-12 backdrop-blur-3xl text-center">
        <Wallet size={48} className="mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-slate-400">Please connect your wallet to view your active bookings.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Placeholder bookings for demo - in production, these would come from useGetTenantBookings */}
      {[1, 2].map((id) => (
        <BookingCard 
          key={id} 
          bookingId={BigInt(id)} 
          onCancel={onBookingCancel}
        />
      ))}
    </div>
  );
};

export default ActiveBookings;

