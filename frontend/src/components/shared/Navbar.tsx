"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Wallet, LogOut, Menu, X, ShieldCheck, ChevronDown } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Effect to handle scroll styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'py-4' : 'py-6'
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
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">
              VRP<span className="text-blue-500">.</span>
            </span>
          </Link>

          {/* 2. Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {['Ecosystem', 'Nodes', 'Governance', 'Docs'].map((item) => (
              <Link 
                key={item} 
                href={`/${item.toLowerCase()}`}
                className="text-sm font-bold text-slate-400 hover:text-white transition-colors tracking-wide"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* 3. Action Buttons / Auth State */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* User Role Badge */}
                <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    {user.role}
                  </span>
                </div>

                {/* Account Menu Toggle */}
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  <LogOut size={14} />
                  <span>DISCONNECT</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="group relative flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm overflow-hidden transition-all hover:pr-10 active:scale-95 shadow-xl shadow-white/5"
              >
                <Wallet size={16} />
                <span className="relative z-10">Connect Portal</span>
                <ChevronDown size={14} className="absolute right-[-20px] group-hover:right-3 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            )}

            {/* Mobile Menu Icon (Visual Only) */}
            <button className="md:hidden text-white p-2">
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};