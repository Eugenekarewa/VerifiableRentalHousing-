# Verifiable Rental Protocol - Implementation Plan

## Current State Analysis
✅ Smart contract deployed on Sepolia (0x17D6e...46ca)
✅ Basic Next.js frontend with wallet integration
✅ Property browsing and booking interface
❌ Direct blockchain UX (violates design principles)
❌ No invisible wallet system
❌ No social login
❌ No backend orchestrator
❌ No gas abstraction

## Design Principles to Implement
1. **Users interact with rental product** - Not blockchain application
2. **Blockchain exists only to enforce rules, lock money, resolve disputes**
3. **Zero crypto friction** - Users see normal Web2 UX
4. **Invisible wallets** - Backend creates/derives wallets
5. **Gas abstraction** - Backend pays for transactions
6. **Social login** - No wallet connection required

## Implementation Steps

### Phase 1: Backend Orchestrator Setup
- [ ] Create Express.js backend server
- [ ] Implement wallet generation/derivation system
- [ ] Add session management
- [ ] Create API endpoints for all blockchain interactions
- [ ] Implement gas abstraction (backend pays fees)

### Phase 2: Authentication System
- [ ] Replace wallet connection with social login (Google/Email)
- [ ] Implement user profile management
- [ ] Add device trust and recovery flows
- [ ] Map wallets to user IDs

### Phase 3: Invisible Wallet Integration
- [ ] Implement MPC (Multi-Party Computation) wallet system
- [ ] Create session-bound signer
- [ ] Add secure key storage
- [ ] Implement wallet persistence across devices

### Phase 4: Frontend UX Transformation
- [ ] Remove all blockchain terminology
- [ ] Replace wallet connection with social login
- [ ] Hide transaction details from users
- [ ] Create Stripe-like payment experience
- [ ] Add loading states and Web2-style feedback

### Phase 5: KRNL Integration
- [ ] Implement KRNL kernel architecture
- [ ] Add identity verification kernel
- [ ] Create availability kernel
- [ ] Implement escrow kernel
- [ ] Add resolution kernel for disputes

### Phase 6: Data Storage Strategy
- [ ] Web2 storage: User profiles, listings, images, search
- [ ] Decentralized storage: Proof artifacts, evidence hashes
- [ ] On-chain: Escrow balances, final outcomes

### Phase 7: Security & Trust Model
- [ ] Users trust UX, brand, speed
- [ ] Developers trust kernels, proofs, determinism
- [ ] Protocol trust: Smart contracts, cryptography

## Success Metrics
- Zero crypto friction for users
- Backend cannot steal funds even if hacked
- All blockchain complexity hidden
- Web2-like user experience
- Proper KRNL kernel integration
