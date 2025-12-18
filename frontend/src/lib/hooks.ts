// Custom hooks for interacting with the VerifiableRental contract
"use client";

import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI, BookingStatus, Property, Booking } from './contract';

// Mock property data - in a real app this would come from a database or API
export const mockProperties: Property[] = [
  {
    id: 1,
    name: "Luxury Downtown Apartment",
    description: "Modern 2-bedroom apartment in the heart of the city",
    price: 200,
    location: "Downtown, City Center",
    image: "/api/placeholder/400/300",
    available: true
  },
  {
    id: 2,
    name: "Cozy Studio Near Park",
    description: "Perfect studio apartment with park views",
    price: 120,
    location: "Central Park Area",
    image: "/api/placeholder/400/300",
    available: true
  },
  {
    id: 3,
    name: "Modern Loft",
    description: "Spacious loft with high ceilings and natural light",
    price: 300,
    location: "Arts District",
    image: "/api/placeholder/400/300",
    available: false
  },
  {
    id: 4,
    name: "Garden View House",
    description: "Charming house with beautiful garden views",
    price: 250,
    location: "Suburban Area",
    image: "/api/placeholder/400/300",
    available: true
  },
  {
    id: 5,
    name: "Beachfront Condo",
    description: "Stunning ocean views from this modern condo",
    price: 400,
    location: "Beachfront",
    image: "/api/placeholder/400/300",
    available: true
  },
  {
    id: 6,
    name: "Mountain Cabin",
    description: "Rustic cabin with modern amenities",
    price: 180,
    location: "Mountain Range",
    image: "/api/placeholder/400/300",
    available: true
  }
];

// Hook to check property availability
export function usePropertyAvailability(propertyId: number) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isPropertyAvailable',
    args: [propertyId],
  });

  return {
    isAvailable: data || false,
    isLoading,
    error
  };
}

// Hook to get booking details
export function useBooking(bookingId: number) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getBooking',
    args: [bookingId],
  });

  return {
    booking: data as Booking | undefined,
    isLoading,
    error
  };
}

// Hook to get user's booking IDs
export function useUserBookings(userAddress: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getTenantBookings',
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    bookingIds: data as bigint[] | undefined,
    isLoading,
    error
  };
}

// Hook to get next booking ID
export function useNextBookingId() {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getNextBookingId',
    args: [],
  });

  return {
    nextBookingId: data as bigint | undefined,
    isLoading,
    error
  };
}

// Hook to get contract owner
export function useContractOwner() {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
    args: [],
  });

  return {
    owner: data as `0x${string}` | undefined,
    isLoading,
    error
  };
}

// Hook to request a new booking
export function useRequestBooking() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const requestBooking = async (propertyId: number, encryptedUserData: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'requestBooking',
        args: [propertyId, encryptedUserData],
      });
    } catch (err) {
      console.error('Booking request failed:', err);
      throw err;
    }
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    requestBooking,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error
  };
}

// Hook to cancel a booking
export function useCancelBooking() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const cancelBooking = async (bookingId: number) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'cancelBooking',
        args: [bookingId],
      });
    } catch (err) {
      console.error('Booking cancellation failed:', err);
      throw err;
    }
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    cancelBooking,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error
  };
}

// Hook to release deposit
export function useReleaseDeposit() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const releaseDeposit = async (bookingId: number) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'releaseDeposit',
        args: [bookingId],
      });
    } catch (err) {
      console.error('Deposit release failed:', err);
      throw err;
    }
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    releaseDeposit,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error
  };
}

// Hook to get booking status as string
export function useBookingStatusString(bookingId: number) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getBookingStatusString',
    args: [bookingId],
  });

  return {
    statusString: data as string | undefined,
    isLoading,
    error
  };
}
