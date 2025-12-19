# Integration Fix Plan - Backend, Frontend & Contracts

## Current Status Summary
- ✅ Smart Contract: Deployed on Sepolia (0x17D6eD93bFccb90e6E7e862BAd3D27Af45ab46ca)
- ✅ Backend: API endpoints created but using mock data
- ✅ Frontend: Next.js with wagmi, still using direct blockchain
- ❌ **Major Issue**: No proper integration between the three layers

## Critical Issues to Fix

### 1. Environment Configuration
**Problem**: Missing environment files and configuration
**Solution**: Create proper .env files for both backend and frontend

### 2. Contract Address Consistency
**Problem**: Different contract addresses in frontend vs backend
**Solution**: Use consistent address across all files

### 3. Backend Blockchain Integration
**Problem**: Backend using mock data instead of real blockchain calls
**Solution**: Implement actual RPC calls to Sepolia

### 4. Frontend UX Transformation
**Problem**: Frontend still using direct blockchain (wallet connect)
**Solution**: Replace with social login and backend API calls

### 5. Invisible Wallet System
**Problem**: No invisible wallet implementation
**Solution**: Create deterministic wallet generation

## Implementation Steps

### Step 1: Environment Setup
- [ ] Create backend/.env with RPC_URL, CONTRACT_ADDRESS, etc.
- [ ] Update frontend environment variables
- [ ] Configure consistent contract address

### Step 2: Backend Blockchain Integration
- [ ] Add real RPC provider (Sepolia)
- [ ] Implement actual contract calls in controllers
- [ ] Add proper error handling for blockchain transactions

### Step 3: Invisible Wallet Implementation
- [ ] Implement deterministic wallet generation
- [ ] Add session-based wallet storage
- [ ] Create API endpoints for invisible wallet operations

### Step 4: Frontend API Integration
- [ ] Replace wagmi wallet connect with social login
- [ ] Update API calls to use backend endpoints
- [ ] Remove direct blockchain interactions from frontend

### Step 5: Authentication System
- [ ] Implement Google OAuth and email auth
- [ ] Add JWT token management
- [ ] Create user session handling

### Step 6: End-to-End Testing
- [ ] Test booking flow: Frontend → Backend → Contract
- [ ] Verify wallet generation and signing
- [ ] Test property listing and booking confirmation

## Files That Need Updates

### Backend Files:
- backend/src/api/bookings.controller.js
- backend/src/wallet/wallet.controller.js
- backend/src/server.js
- New: backend/.env

### Frontend Files:
- frontend/src/lib/api.ts (already has API structure)
- frontend/src/components/ConnectWallet.tsx
- frontend/src/components/BookingModal.tsx
- frontend/src/app/layout.tsx
- frontend/.env.local

### Configuration Files:
- blockchain/VerifiableRentalHousing-/deployments.txt (for reference)

## Expected Outcome
After implementing these fixes:
1. Frontend users see normal Web2 UX (no wallet connection)
2. Backend handles all blockchain interactions invisibly
3. Smart contract properly integrated via RPC calls
4. Complete booking flow: Property browsing → Social login → Invisible booking → Blockchain confirmation
