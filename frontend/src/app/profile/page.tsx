'use client';

import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { useAuth } from '@/context/AuthContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { User, Mail, Shield, Wallet, LogOut } from 'lucide-react';

export default function ProfilePage() {
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <p className="text-slate-400">Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <h1 className="text-3xl font-black">Account Settings</h1>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors font-bold text-sm bg-red-500/10 px-4 py-2 rounded-xl"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>

                    {/* User Details Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-xl">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <span className="inline-block mt-1 bg-white/10 text-slate-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {user.role} Account
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                                <Mail className="text-slate-400" size={20} />
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                    <p className="font-medium text-slate-200">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                                <Shield className="text-emerald-500" size={20} />
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Verification Status</label>
                                    <p className="font-medium text-emerald-400 flex items-center gap-2">
                                        Verified Account
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wallet Section */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                                        <Wallet className="text-blue-500" size={24} />
                                        Crypto Wallet
                                    </h2>
                                    <p className="text-slate-400 text-sm max-w-sm">
                                        Connect your wallet to make secure payments or receive payouts directly.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-950/80 p-6 rounded-2xl border border-blue-500/10 flex flex-col items-center justify-center gap-4">
                                <ConnectButton label="Connect Wallet" showBalance={true} />
                                <p className="text-xs text-slate-500 text-center">
                                    Supported networks: Sepolia, Ethereum Mainnet
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
