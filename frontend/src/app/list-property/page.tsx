'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { ShieldCheck, Banknote, Clock, ArrowRight } from 'lucide-react';

export default function ListPropertyPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-500 px-4 py-2 rounded-full font-bold text-sm mb-8 border border-amber-500/20">
                        <ShieldCheck size={16} />
                        <span>Join 100+ Verified Hosts</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                        Turn your space into
                        <span className="block text-amber-500 mt-2">Extra Income.</span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        List your apartment, spare room, or holiday home on Kenya's most trusted rental marketplace.
                        <span className="text-white font-bold"> No agents. No drama. Guaranteed payments.</span>
                    </p>

                    <Link
                        href="/login?role=HOST"
                        className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-amber-600/20 active:scale-95"
                    >
                        Start Hosting Now <ArrowRight size={20} />
                    </Link>

                    <p className="mt-4 text-sm text-slate-500">
                        Already have an account? <Link href="/login" className="text-amber-500 hover:underline">Log in</Link>
                    </p>
                </div>
            </section>

            {/* Benefits Grid */}
            <section className="py-20 bg-slate-900/50">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <BenefitCard
                        icon={<Banknote size={32} className="text-emerald-500" />}
                        title="Earn More, Keep More"
                        description="We charge lower fees than traditional agents. Your money goes directly to your wallet or M-Pesa immediately after check-in."
                    />
                    <BenefitCard
                        icon={<ShieldCheck size={32} className="text-blue-500" />}
                        title="Verified Guests Only"
                        description="Screening is automatic. We verify every guest's identity so you can host with total peace of mind."
                    />
                    <BenefitCard
                        icon={<Clock size={32} className="text-amber-500" />}
                        title="Total Flexibility"
                        description="You control the calendar. Rent out for a weekend, a month, or a year. It's your Keja, your rules."
                    />
                </div>
            </section>

            {/* Step by Step */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-black text-center mb-16">How it works</h2>

                    <div className="space-y-12">
                        <Step
                            number="01"
                            title="Create your listing"
                            desc="Upload photos, set your price in KES, and describe your property. It takes less than 5 minutes."
                        />
                        <Step
                            number="02"
                            title="Get verified"
                            desc="Our team checks your details to ensure the platform remains safe. Once approved, you go live instantly."
                        />
                        <Step
                            number="03"
                            title="Welcome guests"
                            desc="Receive booking requests. Accept the ones you like. Get paid automatically upon check-in."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-slate-800/50 p-8 rounded-3xl border border-white/5 hover:bg-slate-800 transition-colors">
            <div className="mb-6 bg-slate-950 w-16 h-16 rounded-2xl flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <div className="flex gap-6 md:gap-10 items-start">
            <span className="text-5xl font-black text-slate-800 select-none">{number}</span>
            <div className="pt-2">
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
