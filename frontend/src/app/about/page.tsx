'use client';

import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Github, Twitter, Globe } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <div className="mb-16">
                    <h1 className="text-5xl font-black text-white mb-6">About Keja.</h1>
                    <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                        "Keja" is slang for "Home" in Nairobi. We are building the future of decentralized housing, where trust is established by code, not corporations.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 text-slate-300 mb-20">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white">Our Mission</h3>
                        <p className="leading-relaxed">
                            To create a rental ecosystem that is verifiable, permissionless, and efficient. We believe that hosting and booking homes should be as easy as sending an email, but as secure as a bank vault.
                        </p>
                        <p className="leading-relaxed">
                            By leveraging **KRNL Verification**, we ensure that bad actors are kept out without requiring invasive centralized KYC for every single interaction.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                        <h3 className="text-2xl font-bold text-white mb-6">The Tech Stack</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold border border-blue-500/20">NEXT.JS</span>
                                <span>Frontend & API Routes</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20">KRNL</span>
                                <span>Decentralized Compute & Verification</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-bold border border-purple-500/20">SOLIDITY</span>
                                <span>Smart Contracts (Escrow & Registry)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-bold border border-amber-500/20">WAGMI</span>
                                <span>Wallet Connections</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Team / Socials */}
                <div className="border-t border-white/10 pt-12">
                    <h3 className="text-xl font-bold text-white mb-6">Connect with us</h3>
                    <div className="flex gap-6">
                        <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <Github size={20} /> GitHub
                        </a>
                        <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
                            <Twitter size={20} /> Twitter
                        </a>
                        <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors">
                            <Globe size={20} /> Website
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
