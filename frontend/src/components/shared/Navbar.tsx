'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWalletConnection } from '@/lib/contracts/useVerifiableRental';
import { Wallet, LogOut, Menu, X, ShieldCheck, ChevronDown } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { address, isConnected, chainId } = useWalletConnection();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Effect to handle scroll styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <nav className={`
          flex justify-between items-center px-6 py-3 rounded-[2rem] transition-all duration-500
          ${scrolled
            ? 'bg-[#020617]/80 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)]'
            : 'bg-transparent border border-transparent'}
        `}>

          {/* 1. Branding */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:rotate-6 transition-transform">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">
              Keja<span className="text-amber-500">.</span>
            </span>
          </Link>

          {/* 2. Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'How It Works', href: '/how-it-works' },
              { label: 'Post a Keja', href: '/list-property' },
              { label: 'Support', href: '/support' },
              { label: 'About Us', href: '/about' }
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-bold text-slate-400 hover:text-white transition-colors tracking-wide"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* 3. Action Buttons / Auth State */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">

                {/* User Role Badge (Compact) */}
                <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    {user.role}
                  </span>
                </div>

                {/* RainbowKit Connect Button (Handles Address, Network, Balance, Profile Modal) */}
                <ConnectButton
                  showBalance={false}
                  accountStatus={{
                    smallScreen: 'avatar',
                    largeScreen: 'full',
                  }}
                  chainStatus="icon"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <ConnectButton accountStatus="avatar" showBalance={false} chainStatus="none" />

                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-bold text-sm overflow-hidden transition-all hover:bg-slate-200 active:scale-95 shadow-xl shadow-white/5"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 px-6">
            <div className="bg-[#020617]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              {[
                { label: 'How It Works', href: '/how-it-works' },
                { label: 'List Your Property', href: '/list-property' },
                { label: 'Support', href: '/support' },
                { label: 'About Us', href: '/about' }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-white/10">
                <Link
                  href="/login"
                  className="block py-3 text-sm font-bold text-blue-400 hover:text-blue-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

