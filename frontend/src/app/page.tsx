
// Verifiable Rental Protocol - Main Page
"use client";

import { useAccount } from "wagmi";
import ConnectWallet from "@/components/ConnectWallet";
import PropertyCard from "@/components/PropertyCard";
import { mockProperties } from "@/lib/hooks";
import { Shield, Users, Lock, Zap } from "lucide-react";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Verifiable Rental Protocol
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Smart Contract: 0x17D6e...46ca (Sepolia)
            </p>
          </div>
          <ConnectWallet />
        </header>

        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Trustless Rentals on Blockchain
          </h2>
          <p className="text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-8">
            Browse verified properties, submit booking requests, and complete transactions
            with cryptographic verification. No intermediaries, just pure blockchain trust.
          </p>
          {isConnected && (
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Wallet Connected
            </div>
          )}
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
            <Shield className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">KRNL Verification</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Cryptographic identity verification for all bookings
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
            <Lock className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Smart Contracts</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Automated escrow and deposit management
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
            <Users className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Peer-to-Peer</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Direct connections between tenants and landlords
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
            <Zap className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Instant Settlement</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Real-time booking confirmations and payments
            </p>
          </div>
        </section>

        {/* Properties Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-semibold text-slate-800 dark:text-slate-200">
              Available Properties
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {mockProperties.length} properties available
            </div>
          </div>
          
          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>

        {/* Contract Info Section */}
        <section className="mt-20 bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Contract Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Deployment Details</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li><strong>Network:</strong> Sepolia Testnet</li>
                <li><strong>Contract:</strong> 0x17D6eD93bFccb90e6E7e862BAd3D27Af45ab46ca</li>
                <li><strong>Owner:</strong> 0x260396cCA54419D691836aC1661d9743FCF95044</li>
                <li><strong>Verifier:</strong> 0xF2Ea67F83b58225edF11F3Af4A5733B3E0844509</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Features</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>✓ On-chain property availability tracking</li>
                <li>✓ Encrypted booking requests</li>
                <li>✓ Automated deposit management</li>
                <li>✓ Dispute resolution mechanisms</li>
                <li>✓ KRNL attestation integration</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-slate-500 dark:text-slate-400">
          <div className="mb-4">
            © 2025 Verifiable Rental Protocol • Built with Next.js, Wagmi, and Solidity
          </div>
          <div className="text-xs">
            Powered by Ethereum Sepolia • Smart Contract v1.0
          </div>
        </footer>
      </div>
    </main>
  );
}
