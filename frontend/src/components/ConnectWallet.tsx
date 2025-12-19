
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks';


export default function ConnectWallet() {

  const { isAuthenticated, user, loginWithGoogle, login, register, loginLoading, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      // For Google login, we would normally handle OAuth flow
      // For now, this is a placeholder
      alert('Google OAuth not implemented yet. Please use email login.');
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };


  const handleEmailLogin = (email: string, password: string) => {
    try {
      login({ email, password });
    } catch (error) {
      console.error('Email login failed:', error);
    }
  };

  const handleEmailRegister = (email: string, password: string, name?: string) => {
    try {
      if (name) {
        // Register with name
        register({ email, password, name });
      } else {
        // Register without name (fallback)
        register({ email, password });
      }
    } catch (error) {
      console.error('Email registration failed:', error);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          {user?.name || user?.email || 'User'}
        </button>
        
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">Signed in as</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{user?.email}</p>
              {user?.name && <p className="text-sm text-slate-500 dark:text-slate-400">{user.name}</p>}
            </div>
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setShowLogin(false)}
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          ← Back
        </button>

        <EmailLoginForm onLogin={handleEmailLogin} onRegister={handleEmailRegister} onGoogleLogin={handleGoogleLogin} isLoading={loading} />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setShowLogin(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Sign In
      </button>
    </div>
  );
}


// Email Login Form Component
interface EmailLoginFormProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string, name?: string) => void;
  onGoogleLogin: () => void;
  isLoading: boolean;
}

function EmailLoginForm({ onLogin, onRegister, onGoogleLogin, isLoading }: EmailLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      onRegister(email, password, name);
    } else {
      onLogin(email, password);
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        {isRegistering ? 'Create Account' : 'Sign In'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegistering && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg font-medium transition-colors"
        >
          {isLoading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-50 border border-slate-300 text-slate-700 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-indigo-600 hover:text-indigo-500 font-medium"
        >
          {isRegistering ? 'Sign In' : 'Create Account'}
        </button>
      </p>
    </div>
  );
}
