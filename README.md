# Verifiable Rental Protocol

A trust-minimized rental marketplace where property bookings, identity verification, and deposit management occur through cryptographically verifiable workflows.

## Overview

This project implements the Verifiable Rental Protocol as described in the PRD, using KRNL.xyz for verifiable workflows, smart contracts for automated execution, and a React/NextJS frontend for user interaction.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Frontend  │────▶│  KRNL Workflows  │────▶│  Smart Contracts │
│  (React/NextJS) │     │  (Verifiable)    │     │  (Booking/Deposit)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Property APIs   │     │ Identity Services │     │ Payment Rails   │
│ (Zillow, etc.)  │     │ (Trulioo, etc.)   │     │ (Stripe, Crypto)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Project Structure

- `frontend/` - NextJS React application with TypeScript and Tailwind CSS
- `contracts/` - Solidity smart contracts using Hardhat
- `workflows/` - KRNL workflow definitions
- `scripts/` - Deployment and utility scripts
- `docs/` - Documentation and PRD

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Hardhat (for smart contracts)

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install contract dependencies:
   ```bash
   cd contracts
   npm install
   ```

### Development

1. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Start the Hardhat local network:
   ```bash
   cd contracts
   npx hardhat node
   ```

3. Deploy contracts to local network:
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network localhost
   ```

## MVP Features (Phase 1)

- Basic property listing interface
- Property availability verification workflow
- Simple booking smart contract
- Manual identity verification fallback

## Contributing

Please read the PRD document in `docs/` for detailed requirements and implementation guidelines.

## License

This project is licensed under the MIT License.
