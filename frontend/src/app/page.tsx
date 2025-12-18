

// Verifiable Rental Platform - Main Page
"use client";

import { useAuth } from "@/lib/hooks";
import PropertyCard from "@/components/PropertyCard";
import { mockProperties } from "@/lib/hooks";
import { Shield, Users, Lock, Zap } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">

        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Staybnb
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Secure rentals with verified trust
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Welcome back!
              </div>
            )}
          </div>
        </header>


        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Find Your Perfect Stay
          </h2>
          <p className="text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-8">
            Browse verified properties, make secure bookings, and enjoy peace of mind
            with our trusted rental platform. No intermediaries, just secure transactions.
          </p>
          {isAuthenticated && (
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Account Verified
            </div>
          )}
        </section>


        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
            <Shield className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Verified Trust</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Identity verification and trust scores for all users
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
            <Lock className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Secure Payments</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Protected deposits and automated payment processing
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
            <Users className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Direct Bookings</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Connect directly with property owners
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
            <Zap className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Instant Confirmation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Real-time booking confirmations and notifications
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

        {/* Why Choose Us Section */}
        <section className="mt-20 bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center">
            Why Choose Staybnb?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Verified Properties</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                All properties are thoroughly verified and inspected before listing
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Secure Transactions</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your payments are protected with bank-level security and escrow services
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">24/7 Support</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Our support team is available around the clock to help with any issues
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-slate-500 dark:text-slate-400">
          <div className="mb-4">
            © 2025 Staybnb • Secure rentals with verified trust
          </div>
          <div className="text-xs">
            Built with modern web technologies for a seamless experience
          </div>
        </footer>
      </div>
    </main>
  );
}
