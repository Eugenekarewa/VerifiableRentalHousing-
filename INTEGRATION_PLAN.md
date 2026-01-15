# Integration Plan: Smart Contract + Frontend + Auth

## Project Overview
- **Smart Contract**: `VerifiableRental` deployed at `0x17D6eD93bFccb90e6E7e862BAd3D27Af45ab46ca` (Sepolia)
- **Verifier**: `0xF2Ea67F83b58225edF11F3Af4A5733B3E0844509`
- **Frontend**: Next.js 16 with wagmi/viem for blockchain interaction
- **Backend**: Express.js with JWT auth and blockchain integration

---

## Issues Identified

### 1. Authentication (Critical)
- **Current**: Frontend uses mock login (localStorage-based)
- **Backend**: Has complete auth implementation (Google OAuth + email/password)
- **Missing**: Signup page, real API integration

### 2. Smart Contract Integration (Critical)
- **Current**: `useBookingContract` is a mock (simulates with setTimeout)
- **Missing**: Real wagmi/viem hooks for contract interaction

### 3. Wallet Connection
- **Current**: wagmiConfig exists but not fully integrated
- **Missing**: Proper wallet connection UI and state management

---

## Implementation Plan

### Phase 1: Authentication Integration (Priority: HIGH)
1. **Create Signup Page** (`frontend/src/app/signup/page.tsx`)
   - Email/password registration form
   - Integration with backend auth API
   - Error handling and validation

2. **Update AuthContext** (`frontend/src/context/AuthContext.tsx`)
   - Replace mock login with real API calls
   - Handle JWT token storage (cookies)
   - Sync user state with backend

3. **Create API Auth Hooks** (`frontend/src/lib/auth-hooks.ts`)
   - `useLogin` - Email/password login
   - `useSignup` - Registration
   - `useGoogleLogin` - Google OAuth

### Phase 2: Smart Contract Integration (Priority: HIGH)
1. **Create Real Contract Hooks** (`frontend/src/lib/contracts/useVerifiableRental.ts`)
   - `useRequestBooking` - Write contract function
   - `useGetBooking` - Read contract function
   - `useCancelBooking` - Write contract function
   - `useGetTenantBookings` - Read contract function
   - `useBookingStatus` - Event listener for status changes

2. **Update wagmiConfig** (`frontend/src/lib/wagmiConfig.ts`)
   - Add proper WalletConnect project ID from env
   - Configure supported chains (Sepolia)
   - Add custom transports

3. **Update Contract ABI** (`frontend/src/lib/contract.ts`)
   - Ensure ABI matches deployed contract
   - Add missing functions (cancelBooking, getBookingStatusString, etc.)

### Phase 3: Booking Flow Integration (Priority: MEDIUM)
1. **Update BookingFlow** (`frontend/src/components/booking/BookingFlow.tsx`)
   - Replace mock `executeBooking` with real contract hook
   - Add wallet connection check before booking
   - Show transaction hash on success

2. **Create Booking Status Component** (`frontend/src/components/booking/BookingStatusTracker.tsx`)
   - Display booking status from contract
   - Show confirmation hash
   - Handle different booking states

3. **Update useBookingContract** (`frontend/src/components/hooks/useBookingContract.ts`)
   - Convert to real wagmi hook or deprecate in favor of new hooks

### Phase 4: Environment Configuration (Priority: MEDIUM)
1. **Create Environment Template** (`frontend/.env.example`)
2. **Update Environment Variables**:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_WC_PROJECT_ID`
   - `NEXT_PUBLIC_RPC_URL`
   - `NEXT_PUBLIC_API_URL`

### Phase 5: Backend Wallet Integration (Priority: MEDIUM)
1. **Implement Wallet Service** (`backend/src/wallet/wallet.controller.js`)
   - Generate wallet addresses for users
   - Store encrypted private keys
   - Sign transactions for users

---

## File Changes Summary

### New Files to Create:
1. `frontend/src/app/signup/page.tsx` - Signup page
2. `frontend/src/lib/auth-hooks.ts` - Auth API hooks
3. `frontend/src/lib/contracts/useVerifiableRental.ts` - Contract hooks
4. `frontend/src/types/contract.ts` - Contract types
5. `frontend/.env.example` - Environment template

### Files to Update:
1. `frontend/src/context/AuthContext.tsx` - Real API integration
2. `frontend/src/lib/wagmiConfig.ts` - Proper wallet config
3. `frontend/src/lib/contract.ts` - Complete ABI
4. `frontend/src/components/booking/BookingFlow.tsx` - Real contract calls
5. `frontend/src/components/hooks/useBookingContract.ts` - Real implementation
6. `frontend/src/app/login/page.tsx` - Real auth forms
7. `frontend/package.json` - Add wagmi dependencies

### Dependencies to Add:
```json
{
  "wagmi": "^2.15.0",
  "@rainbow-me/rainbowkit": "^2.2.0",
  "viem": "^2.21.0",
  "@tanstack/react-query": "^5.0.0"
}
```

---

## Testing Checklist

- [ ] User can signup with email/password
- [ ] User can login with credentials
- [ ] Wallet connects via MetaMask/WalletConnect
- [ ] Booking request submits to blockchain
- [ ] Booking status updates correctly
- [ ] Booking cancellation works
- [ ] Error handling for failed transactions

---

## Estimated Timeline
- Phase 1: 2 hours
- Phase 2: 3 hours
- Phase 3: 2 hours
- Phase 4: 30 minutes
- Phase 5: 2 hours

**Total: ~9.5 hours**

---

## Next Steps
1. Confirm this plan meets requirements
2. Start with Phase 1 (Authentication)
3. Proceed sequentially through phases
4. Test each phase before moving to next

