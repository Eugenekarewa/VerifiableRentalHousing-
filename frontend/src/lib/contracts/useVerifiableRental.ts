'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useReadContract, useAccount, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseEther, zeroHash } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract';
import { Booking, BookingStatus, CreateBookingParams, TransactionResult } from '@/types/contract';

/**
 * Hook to request a new booking on the blockchain
 */
export function useRequestBooking() {
  const [isPending, setIsPending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [bookingId, setBookingId] = useState<bigint | undefined>();
  const [error, setError] = useState<string | undefined>();

  const { address, chain } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, isError: writeError, failureReason } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const requestBooking = useCallback(async (params: CreateBookingParams): Promise<TransactionResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsPending(true);
    setError(undefined);
    setTransactionHash(undefined);
    setBookingId(undefined);

    try {
      // Submit transaction to blockchain
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'requestBooking',
        args: [params.propertyId, params.encryptedUserData],
        account: address,
        chain: chain,
      });

      return {
        success: true,
        transactionHash: hash,
        bookingId: undefined,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsPending(false);
    }
  }, [address, chain, writeContract, hash]);

  return {
    requestBooking,
    isPending: isPending || isConfirming,
    isConfirming,
    isConfirmed,
    transactionHash: hash,
    bookingId,
    error: error || (failureReason?.message) || (writeError ? 'Write contract failed' : undefined),
  };
}

/**
 * Hook to get booking details from the blockchain
 */
export function useGetBooking(bookingId: bigint | undefined) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getBooking',
    args: bookingId ? [bookingId] : undefined,
    query: {
      enabled: !!bookingId,
    },
  });

  const booking: Booking | undefined = data ? {
    tenant: data[0],
    propertyId: data[1],
    depositAmount: data[2],
    checkInDate: data[3],
    checkOutDate: data[4],
    verificationHash: data[5],
    status: Number(data[6]) as BookingStatus,
  } : undefined;

  return { booking, isError, isLoading };
}

/**
 * Hook to cancel a booking
 */
export function useCancelBooking() {
  const [isPending, setIsPending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | undefined>();

  const { address, chain } = useAccount();
  const { writeContract, data: hash, isError: writeError, failureReason } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const cancelBooking = useCallback(async (bookingId: bigint): Promise<TransactionResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsPending(true);
    setError(undefined);
    setTransactionHash(undefined);

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'cancelBooking',
        args: [bookingId],
        account: address,
        chain: chain,
      });

      return {
        success: true,
        transactionHash: hash,
        bookingId,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsPending(false);
    }
  }, [address, chain, writeContract, hash]);

  return {
    cancelBooking,
    isPending: isPending || isConfirming,
    isConfirming,
    isConfirmed,
    transactionHash: hash,
    error: error || (failureReason?.message) || (writeError ? 'Write contract failed' : undefined),
  };
}

/**
 * Hook to get tenant's bookings
 */
export function useGetTenantBookings(tenantAddress: `0x${string}` | undefined) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getTenantBookings',
    args: tenantAddress ? [tenantAddress] : undefined,
    query: {
      enabled: !!tenantAddress,
    },
  });

  return { bookingIds: data as bigint[] | undefined, isError, isLoading };
}

/**
 * Hook to check property availability
 */
export function useIsPropertyAvailable(propertyId: bigint | undefined) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isPropertyAvailable',
    args: propertyId ? [propertyId] : undefined,
    query: {
      enabled: !!propertyId,
    },
  });

  return { isAvailable: data as boolean | undefined, isError, isLoading };
}

/**
 * Hook to get booking status as string
 */
export function useGetBookingStatusString(bookingId: bigint | undefined) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getBookingStatusString',
    args: bookingId ? [bookingId] : undefined,
    query: {
      enabled: !!bookingId,
    },
  });

  return { statusString: data as string | undefined, isError, isLoading };
}

/**
 * Hook to get next booking ID
 */
export function useGetNextBookingId() {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getNextBookingId',
  });

  return { nextBookingId: data as bigint | undefined, isError, isLoading };
}

/**
 * Helper function to get next booking ID
 */
async function getNextBookingId(): Promise<bigint> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bookings/next-id`
    );
    if (response.ok) {
      const data = await response.json();
      return BigInt(data.nextBookingId);
    }
  } catch {
    // Fallback
  }
  return BigInt(Date.now());
}

/**
 * Hook to check if wallet is connected and get address
 */
export function useWalletConnection() {
  const { address, isConnected, chainId, chain } = useAccount();

  return {
    address: address as `0x${string}` | undefined,
    isConnected,
    chainId,
    chainName: chain?.name,
  };
}

/**
 * Hook to format booking status for display
 */
export function useBookingStatusFormatter() {
  const formatStatus = useCallback((status: BookingStatus | number): string => {
    const statusMap: Record<number, string> = {
      0: 'Requested',
      1: 'Verified',
      2: 'Confirmed',
      3: 'Active',
      4: 'Completed',
      5: 'Cancelled',
      6: 'Disputed',
    };
    return statusMap[status] || 'Unknown';
  }, []);

  const getStatusColor = useCallback((status: BookingStatus | number): string => {
    const colorMap: Record<number, string> = {
      0: 'text-yellow-400',
      1: 'text-blue-400',
      2: 'text-green-400',
      3: 'text-purple-400',
      4: 'text-gray-400',
      5: 'text-red-400',
      6: 'text-orange-400',
    };
    return colorMap[status] || 'text-gray-400';
  }, []);

  return { formatStatus, getStatusColor };
}

/**
 * Hook to encrypt user data for booking
 * In production, this would use proper encryption
 */
export function useEncryptUserData() {
  const encryptUserData = useCallback((data: Record<string, unknown>): `0x${string}` => {
    const jsonString = JSON.stringify(data);
    // Convert to hex bytes
    let hexString = '0x';
    for (let i = 0; i < jsonString.length; i++) {
      hexString += jsonString.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return hexString as `0x${string}`;
  }, []);

  return { encryptUserData };
}

