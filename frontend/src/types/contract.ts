// Contract Types for VerifiableRental Smart Contract

import { Address } from 'viem';

// Contract address on Sepolia
export const CONTRACT_ADDRESS: Address = '0x17D6eD93bFccb90e6E7e862BAd3D27Af45ab46ca';

// Booking status enum (matching Solidity enum)
export enum BookingStatus {
  Requested = 0,
  Verified = 1,
  Confirmed = 2,
  Active = 3,
  Completed = 4,
  Cancelled = 5,
  Disputed = 6
}

// Booking status helper function
export function getBookingStatusString(status: BookingStatus): string {
  const statusNames: Record<BookingStatus, string> = {
    [BookingStatus.Requested]: 'Requested',
    [BookingStatus.Verified]: 'Verified',
    [BookingStatus.Confirmed]: 'Confirmed',
    [BookingStatus.Active]: 'Active',
    [BookingStatus.Completed]: 'Completed',
    [BookingStatus.Cancelled]: 'Cancelled',
    [BookingStatus.Disputed]: 'Disputed',
  };
  return statusNames[status] || 'Unknown';
}

// Booking struct (matching Solidity struct)
export interface Booking {
  tenant: Address;
  propertyId: bigint;
  depositAmount: bigint;
  checkInDate: bigint;
  checkOutDate: bigint;
  verificationHash: `0x${string}`;
  status: BookingStatus;
}

// Property interface for frontend
export interface Property {
  id: number;
  name: string;
  description: string;
  price: number;
  location: string;
  image: string;
  available: boolean;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
}

// Booking request parameters
export interface CreateBookingParams {
  propertyId: bigint;
  encryptedUserData: `0x${string}`;
}

// Booking response from contract
export interface BookingResponse {
  bookingId: bigint;
  tenant: Address;
  propertyId: bigint;
  depositAmount: bigint;
  checkInDate: bigint;
  checkOutDate: bigint;
  verificationHash: `0x${string}`;
  status: BookingStatus;
}

// Transaction result
export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  bookingId?: bigint;
  error?: string;
}

// Contract event types
export interface BookingRequestedEvent {
  bookingId: bigint;
  tenant: Address;
  propertyId: bigint;
}

export interface BookingConfirmedEvent {
  bookingId: bigint;
  verificationHash: `0x${string}`;
}

export interface BookingCancelledEvent {
  bookingId: bigint;
  cancelledBy: Address;
}

// Frontend booking display type
export interface BookingDisplay {
  id: string;
  propertyId: number;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  statusValue: BookingStatus;
  confirmationCode: string;
  transactionHash?: string;
  createdAt: Date;
}

// Wallet state
export interface WalletState {
  isConnected: boolean;
  address?: Address;
  chainId?: number;
  balance?: string;
}

// User with wallet info
export interface UserWithWallet {
  id: string;
  email: string;
  name: string;
  picture?: string;
  walletAddress?: Address;
  hasWallet: boolean;
  isVerified: boolean;
}

