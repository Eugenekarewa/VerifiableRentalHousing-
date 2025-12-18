// Contract configuration for VerifiableRental
import { Address, Abi } from 'viem';

// Contract address on Sepolia
export const CONTRACT_ADDRESS: Address = '0x17D6eD93bFccb90e6E7e862BAd3D27Af45ab46ca';

// Contract ABI extracted from SmartContract.sol
export const CONTRACT_ABI: Abi = [
  {
    "inputs": [
      { "internalType": "address", "name": "_verifier", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "bookingId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "tenant", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "propertyId", "type": "uint256" }
    ],
    "name": "BookingRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "bookingId", "type": "uint256" },
      { "indexed": false, "internalType": "bytes32", "name": "verificationHash", "type": "bytes32" }
    ],
    "name": "BookingConfirmed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "bookingId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "tenant", "type": "address" }
    ],
    "name": "DepositReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "bookingId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "landlord", "type": "address" }
    ],
    "name": "DepositClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "propertyId", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "available", "type": "bool" }
    ],
    "name": "PropertyAvailabilitySet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "verifier", "type": "address" }
    ],
    "name": "VerifierUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "bookingId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "cancelledBy", "type": "address" }
    ],
    "name": "BookingCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "bookingId", "type": "uint256" }
    ],
    "name": "getBooking",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "tenant", "type": "address" },
          { "internalType": "uint256", "name": "propertyId", "type": "uint256" },
          { "internalType": "uint256", "name": "depositAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "checkInDate", "type": "uint256" },
          { "internalType": "uint256", "name": "checkOutDate", "type": "uint256" },
          { "internalType": "bytes32", "name": "verificationHash", "type": "bytes32" },
          { "internalType": "uint8", "name": "status", "type": "uint8" }
        ],
        "internalType": "struct VerifiableRental.Booking",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "bookingId", "type": "uint256" }
    ],
    "name": "getBookingStatusString",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "bookingId", "type": "uint256" }
    ],
    "name": "getNextBookingId",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "tenant", "type": "address" }
    ],
    "name": "getTenantBookings",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "propertyId", "type": "uint256" }
    ],
    "name": "isPropertyAvailable",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "bookingId", "type": "uint256" }
    ],
    "name": "bookingExistsCheck",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "propertyId", "type": "uint256" },
      { "internalType": "bytes", "name": "encryptedUserData", "type": "bytes" }
    ],
    "name": "requestBooking",
    "outputs": [
      { "internalType": "uint256", "name": "bookingId", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "bookingId", "type": "uint256" },
      { "internalType": "bytes", "name": "krnlAttestation", "type": "bytes" }
    ],
    "name": "fulfillBooking",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "bookingId", "type": "uint256" }
    ],
    "name": "releaseDeposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "bookingId", "type": "uint256" }
    ],
    "name": "cancelBooking",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "bookingId", "type": "uint256" }
    ],
    "name": "claimDeposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "propertyId", "type": "uint256" },
      { "internalType": "bool", "name": "available", "type": "bool" }
    ],
    "name": "setPropertyAvailability",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_verifier", "type": "address" }
    ],
    "name": "setVerifier",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "verifier",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNextBookingId",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "bookings",
    "outputs": [
      { "internalType": "address", "name": "tenant", "type": "address" },
      { "internalType": "uint256", "name": "propertyId", "type": "uint256" },
      { "internalType": "uint256", "name": "depositAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "checkInDate", "type": "uint256" },
      { "internalType": "uint256", "name": "checkOutDate", "type": "uint256" },
      { "internalType": "bytes32", "name": "verificationHash", "type": "bytes32" },
      { "internalType": "uint8", "name": "status", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "propertyAvailability",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Booking status enum
export enum BookingStatus {
  Requested = 0,
  Verified = 1,
  Confirmed = 2,
  Active = 3,
  Completed = 4,
  Cancelled = 5,
  Disputed = 6
}

// Property data interface
export interface Property {
  id: number;
  name: string;
  description: string;
  price: number;
  location: string;
  image: string;
  available: boolean;
}

// Booking data interface
export interface Booking {
  tenant: Address;
  propertyId: bigint;
  depositAmount: bigint;
  checkInDate: bigint;
  checkOutDate: bigint;
  verificationHash: `0x${string}`;
  status: BookingStatus;
}
