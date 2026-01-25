import React from 'react';
import { ShieldCheck, Banknote, Clock, UserCheck } from 'lucide-react';

export const Features = () => {
    const features = [
        {
            icon: <UserCheck size={32} className="text-amber-500" />,
            title: "No More Brokers",
            description: "Deal directly with verified landlords. No more viewing fees or 'agency' nonsense."
        },
        {
            icon: <ShieldCheck size={32} className="text-emerald-500" />,
            title: "100% Verified",
            description: "Every property is visited and verified. What you see online is exactly what you get."
        },
        {
            icon: <Banknote size={32} className="text-blue-500" />,
            title: "Secure Payments",
            description: "Your rent is held in escrow until you check in. Pay safely via M-Pesa or Crypto."
        },
        {
            icon: <Clock size={32} className="text-red-500" />,
            title: "Instant Booking",
            description: "Book your viewing or stay instantly. No waiting for days to hear back."
        }
    ];

    return (
        <section className="py-24 bg-[#0a0f1e] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                        Why Rent With Us?
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        We are fixing the rental mess in Nairobi, one verified listing at a time.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white/5 border border-white/5 p-8 rounded-3xl hover:bg-white/10 transition-all hover:-translate-y-2 group"
                        >
                            <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
