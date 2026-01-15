"use client";
import { useAuth } from '@/context/AuthContext';
import { User, Home, Lock, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-white">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200"><ShieldCheck size={32} /></div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Portal</h1>
          <p className="text-slate-500 mt-2 font-medium">Choose your workspace to enter</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => login('GUEST')} className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-blue-50 hover:border-blue-500 transition-all group">
            <div className="flex items-center gap-4"><div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white"><User size={20}/></div><div className="text-left font-bold">Guest Portal</div></div>
            <span className="text-slate-300 group-hover:text-blue-600">→</span>
          </button>
          <button onClick={() => login('HOST')} className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-indigo-50 hover:border-indigo-500 transition-all group">
            <div className="flex items-center gap-4"><div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white"><Home size={20}/></div><div className="text-left font-bold">Host Workspace</div></div>
            <span className="text-slate-300 group-hover:text-indigo-600">→</span>
          </button>
          <button onClick={() => login('ADMIN')} className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-slate-900 transition-all group">
            <div className="flex items-center gap-4"><div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white"><Lock size={20}/></div><div className="text-left font-bold">Protocol Admin</div></div>
            <span className="text-slate-300 group-hover:text-slate-900">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}