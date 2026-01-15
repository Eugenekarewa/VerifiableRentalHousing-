'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useReadContract, useAccount, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { Booking, BookingStatus, CreateBookingParams, TransactionResult } from '@/types/contract';

/**
 * Hook to request a new booking on the blockchain
 * Replaces the mock implementation with real wagmi/viem calls
 */
export function useBookingContract() {
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

  const executeBooking = useCallback(async (propertyId: string | number, price: number): Promise<TransactionResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsPending(true);
    setError(undefined);
    setTransactionHash(undefined);
    setBookingId(undefined);

    try {
      // Convert propertyId to bigint and create encrypted user data
      const propertyIdBigInt = typeof propertyId === 'string' ? BigInt(propertyId) : BigInt(propertyId);
      
      // Create encrypted user data (in production, this would use proper encryption)
      const encryptedUserData = createEncryptedUserData({
        propertyId: propertyIdBigInt.toString(),
        price: price.toString(),
        timestamp: Date.now().toString(),
      });

      // Submit transaction to blockchain
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'requestBooking',
        args: [propertyIdBigInt, encryptedUserData],
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

  const cancelBooking = useCallback(async (bookingIdValue: string | bigint): Promise<TransactionResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    const bookingIdBigInt = typeof bookingIdValue === 'string' ? BigInt(bookingIdValue) : bookingIdValue;
    
    setIsPending(true);
    setError(undefined);
    setTransactionHash(undefined);

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'cancelBooking',
        args: [bookingIdBigInt],
        account: address,
        chain: chain,
      });

      return {
        success: true,
        transactionHash: hash,
        bookingId: bookingIdBigInt,
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
    executeBooking,
    cancelBooking,
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
export function useGetBookingDetails(bookingId: bigint | undefined) {
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
 * Hook to get tenant's bookings
 */
export function useGetUserBookings(tenantAddress: `0x${string}` | undefined) {
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
 * Helper function to create encrypted user data for booking
 * In production, this would use proper encryption
 */
function createEncryptedUserData(data: Record<string, string>): `0x${string}` {
  const jsonString = JSON.stringify(data);
  let hexString = '0x';
  for (let i = 0; i < jsonString.length; i++) {
    hexString += jsonString.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hexString as `0x${string}`;
}

/**
 * Hook to format booking status for display
 */
export function useFormatBookingStatus() {
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

  const getStatusBgColor = useCallback((status: BookingStatus | number): string => {
    const colorMap: Record<number, string> = {
      0: 'bg-yellow-500/20',
      1: 'bg-blue-500/20',
      2: 'bg-green-500/20',
      3: 'bg-purple-500/20',
      4: 'bg-gray-500/20',
      5: 'bg-red-500/20',
      6: 'bg-orange-500/20',
    };
    return colorMap[status] || 'bg-gray-500/20';
  }, []);

  return { formatStatus, getStatusColor, getStatusBgColor };
}

/**
 * Hook to check if wallet is connected
 */
export function useWalletStatus() {
  const { address, isConnected, chainId, chain } = useAccount();

  return {
    address: address as `0x${string}` | undefined,
    isConnected,
    chainId,
    chainName: chain?.name,
    chain,
  };
}

