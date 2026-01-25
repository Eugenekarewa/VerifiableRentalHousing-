'use client';

import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { ShieldCheck, Wallet, Home, Key } from 'lucide-react';

export default function HowItWorksPage() {
    const steps = [
        {
            icon: <Wallet size={32} className="text-blue-400" />,
            title: "1. Connect & Verify",
            description: "Link your Web3 wallet. Our KRNL Node verifies your on-chain reputation and identity without compromising privacy."
        },
        {
            icon: <ShieldCheck size={32} className="text-emerald-400" />,
            title: "2. Trusted Listing",
            description: "Hosts sign a cryptographic proof for every property. This eliminates fake listings and ensures accountability."
        },
        {
            icon: <Home size={32} className="text-purple-400" />,
            title: "3. Book with Confidence",
            description: "Browse verified homes. When you book, a smart contract holds the funds in escrow until you check in."
        },
        {
            icon: <Key size={32} className="text-amber-400" />,
            title: "4. Seamless Stay",
            description: "Unlock the door (literally or digitally). Upon successful completion, funds are released to the host."
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
                        Rentals, Reimagined with <span className="text-blue-500">Trust.</span>
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed">
                        The Verifiable Rental Protocol (VRP) replaces middlemen with code.
                        We use KRNL verification to ensure that every host is real and every property exists.
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/[0.07] transition-all group">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>

                {/* Technical Deep Dive */}
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-[3rem] p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/20 blur-[100px] pointer-events-none" />

                    <h2 className="text-3xl font-black text-white mb-6 relative z-10">Under the Hood</h2>
                    <div className="grid md:grid-cols-3 gap-8 relative z-10 max-w-4xl mx-auto text-left">
                        <div className="space-y-2">
                            <h4 className="font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full" /> KRNL Nodes
                            </h4>
                            <p className="text-sm text-slate-400">Compute nodes that verify off-chain data (like ID) and post proofs on-chain.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Smart Contracts
                            </h4>
                            <p className="text-sm text-slate-400">Escrow logic that is immutable and transparent. No hidden fees.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full" /> Zero-Knowledge
                            </h4>
                            <p className="text-sm text-slate-400">Verify who you are without revealing sensitive personal data.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
