'use client';

import { useAccount } from 'wagmi';
import { useGetTenantBookings, useGetBooking } from '@/lib/contracts/useVerifiableRental';
import { useFormatBookingStatus, useWalletStatus } from '@/components/hooks/useBookingContract';
import { BookingStatus } from '@/types/contract';
import { Calendar, MapPin, Home, Clock, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { useState, useCallback } from 'react';

interface BookingCardProps {
  bookingId: bigint;
  onClick?: (bookingId: bigint) => void;
}

const BookingCard = ({ bookingId, onClick }: BookingCardProps) => {
  const { booking, isLoading, isError } = useGetBooking(bookingId);
  const { formatStatus, getStatusColor, getStatusBgColor } = useFormatBookingStatus();

  if (isLoading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-white/10 rounded w-24"></div>
          <div className="h-6 bg-white/10 rounded w-20"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="bg-white/5 border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle size={20} />
          <span>Failed to load booking #{bookingId.toString()}</span>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(booking.status);
  const statusBgColor = getStatusBgColor(booking.status);

  return (
    <div 
      className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer"
      onClick={() => onClick?.(bookingId)}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-black text-white">#{bookingId.toString()}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBgColor} ${statusColor}`}>
          {formatStatus(booking.status)}
        </span>
      </div>
      
      <div className="space-y-3 text-slate-300">
        <div className="flex items-center gap-2">
          <Home size={16} className="text-slate-500" />
          <span>Property ID: <span className="font-mono text-white">{booking.propertyId.toString()}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-slate-500" />
          <span>Deposit: <span className="text-white">{booking.depositAmount.toString()} ETH</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-500" />
          <span>Check-in: <span className="text-white">{new Date(Number(booking.checkInDate) * 1000).toLocaleDateString()}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-500" />
          <span>Check-out: <span className="text-white">{new Date(Number(booking.checkOutDate) * 1000).toLocaleDateString()}</span></span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Tenant:</span>
          <span className="font-mono text-slate-400">{booking.tenant.slice(0, 6)}...{booking.tenant.slice(-4)}</span>
        </div>
      </div>
    </div>
  );
};

interface GetTenantsBookingsProps {
  onBookingSelect?: (bookingId: bigint) => void;
}

export default function GetTenantsBookings({ onBookingSelect }: GetTenantsBookingsProps) {
  const { address, isConnected } = useWalletStatus();
  const { bookingIds, isLoading, isError } = useGetTenantBookings(address);
  const { formatStatus } = useFormatBookingStatus();

  const handleBookingClick = useCallback((bookingId: bigint) => {
    onBookingSelect?.(bookingId);
  }, [onBookingSelect]);

  if (!isConnected) {
    return (
      <section className="pt-32 px-10">
        <h2 className="text-4xl font-black text-white mb-2">My Verified Stays</h2>
        <p className="text-slate-500 mb-12">Manage your cryptographically secured rental agreements.</p>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-slate-400 mb-6">Please connect your wallet to view your blockchain-verified bookings.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 px-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black text-white mb-2">My Verified Stays</h2>
          <p className="text-slate-500">Manage your cryptographically secured rental agreements on Ethereum.</p>
        </div>
        
        {address && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 text-sm">Connected:</span>
            <span className="font-mono text-white text-sm">{address.slice(0, 6)}...{address.slice(-4)}</span>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-24 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="h-4 bg-white/10 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-bold">Error Loading Bookings</h3>
              <p className="text-sm">Please check your wallet connection and try again.</p>
            </div>
          </div>
        </div>
      ) : bookingIds && bookingIds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookingIds.map((id) => (
            <BookingCard key={id.toString()} bookingId={id} onClick={handleBookingClick} />
          ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home size={32} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Bookings Found</h3>
          <p className="text-slate-400 mb-6">
            You haven't made any bookings yet. Start exploring properties and make your first blockchain-verified booking!
          </p>
        </div>
      )}
    </section>
  );
}

// Example of standalone usage with proper hooks integration
export const MyBookingsPage = () => {
  const { address } = useAccount();
  const { isConnected } = useWalletStatus();
  const { bookingIds, isLoading: loadingIds } = useGetTenantBookings(address);

  if (!isConnected) {
    return (
      <section className="pt-32 px-10">
        <h2 className="text-4xl font-black text-white mb-2">My Verified Stays</h2>
        <p className="text-slate-500 mb-12">Please connect your wallet to view your bookings.</p>
      </section>
    );
  }

  return (
    <section className="pt-32 px-10">
      <h2 className="text-4xl font-black text-white mb-2">My Verified Stays</h2>
      <p className="text-slate-500 mb-12">Manage your cryptographically secured rental agreements.</p>
      
      {loadingIds ? (
        <div className="text-white">Loading bookings...</div>
      ) : bookingIds && bookingIds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookingIds.map((id) => (
            <BookingCard key={id.toString()} bookingId={id} />
          ))}
        </div>
      ) : (
        <div className="text-slate-500">No bookings found.</div>
      )}
    </section>
  );
};

