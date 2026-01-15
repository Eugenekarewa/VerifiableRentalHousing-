'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin, useGoogleLogin } from '@/lib/auth-hooks';
import { useRouter } from 'next/navigation';
import { User, Home, Lock, ShieldCheck, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'credentials' | 'role'>('role');
  const { login, isLoading: loginLoading, error: loginError, clearError } = useLogin();
  const { googleLogin, isLoading: googleLoading, error: googleError } = useGoogleLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    await login(data.email, data.password);
  };

  const handleGoogleLogin = async () => {
    // In production, this would trigger Google OAuth flow
    // For demo purposes, show an alert
    alert('Google OAuth requires valid Google Client ID configuration.\n\nPlease set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.');
  };

  const handleRoleLogin = (role: 'GUEST' | 'HOST' | 'ADMIN') => {
    // For demo purposes, use mock login
    const mockUser = { 
      id: Date.now().toString(), 
      name: `Demo ${role}`, 
      role,
      email: `demo@${role.toLowerCase()}.com`
    };
    localStorage.setItem('vrp_session', JSON.stringify(mockUser));
    router.push(`/dashboards/${role.toLowerCase()}`);
  };

  const isLoading = loginLoading || googleLoading;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-white">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2 font-medium">Sign in to Verifiable Rental Protocol</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex mb-6 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('role')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'role' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Quick Demo
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'credentials' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Real Auth
          </button>
        </div>

        {/* Login Error */}
        {(loginError || googleError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{loginError || googleError}</span>
          </div>
        )}

        {activeTab === 'credentials' ? (
          /* Real Credentials Login Form */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Demo Role-Based Login */
          <div className="space-y-3">
            <button
              onClick={() => handleRoleLogin('GUEST')}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-blue-50 hover:border-blue-500 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white">
                  <User size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900">Guest Portal</div>
                  <div className="text-xs text-slate-500">Book properties & manage stays</div>
                </div>
              </div>
              <span className="text-slate-300 group-hover:text-blue-600">→</span>
            </button>

            <button
              onClick={() => handleRoleLogin('HOST')}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-indigo-50 hover:border-indigo-500 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white">
                  <Home size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900">Host Workspace</div>
                  <div className="text-xs text-slate-500">Manage listings & accept bookings</div>
                </div>
              </div>
              <span className="text-slate-300 group-hover:text-indigo-600">→</span>
            </button>

            <button
              onClick={() => handleRoleLogin('ADMIN')}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-slate-900 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white">
                  <Lock size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900">Protocol Admin</div>
                  <div className="text-xs text-slate-500">Verify properties & manage protocol</div>
                </div>
              </div>
              <span className="text-slate-300 group-hover:text-slate-900">→</span>
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500">or continue with</span>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Signup Link */}
        <p className="mt-6 text-center text-slate-600">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

