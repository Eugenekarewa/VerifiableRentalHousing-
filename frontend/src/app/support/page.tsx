'use client';

import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Mail, MessageCircle, FileText, HelpCircle } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 pt-32 pb-12">
                <h1 className="text-4xl font-black text-white mb-6 text-center">How can we help?</h1>
                <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
                    Our dedicated support team is here to assist you with any questions regarding hosting, booking, or verification.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Contact Card */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-blue-500/30 transition-colors">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6">
                            <Mail size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
                        <p className="text-slate-400 mb-6 text-sm">
                            For general inquiries and account support. We typically respond within 24 hours.
                        </p>
                        <a href="mailto:support@keja.io" className="text-blue-400 font-bold hover:text-blue-300">
                            support@keja.io &rarr;
                        </a>
                    </div>

                    {/* Live Chat Card */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-emerald-500/30 transition-colors">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-6">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Live Chat</h3>
                        <p className="text-slate-400 mb-6 text-sm">
                            Chat with our support agents in real-time. Available Mon-Fri, 9am - 5pm UTC.
                        </p>
                        <button className="text-emerald-400 font-bold hover:text-emerald-300">
                            Start Chat &rarr;
                        </button>
                    </div>

                    {/* FAQs Card */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-purple-500/30 transition-colors">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6">
                            <HelpCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Knowledge Base</h3>
                        <p className="text-slate-400 mb-6 text-sm">
                            Find answers to common questions about KRNL verification, smart contracts, and more.
                        </p>
                        <a href="#" className="text-purple-400 font-bold hover:text-purple-300">
                            View FAQs &rarr;
                        </a>
                    </div>

                    {/* Dispute Resolution Card */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-amber-500/30 transition-colors">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 mb-6">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Dispute Resolution</h3>
                        <p className="text-slate-400 mb-6 text-sm">
                            Open a ticket for transaction disputes or verification issues requiring arbitration.
                        </p>
                        <button className="text-amber-400 font-bold hover:text-amber-300">
                            Open Ticket &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
