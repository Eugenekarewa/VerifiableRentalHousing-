// components/landing/PropertyFilters.tsx
import { Search, Filter, Calendar } from 'lucide-react';

export const PropertyFilters = () => (
  <div className="flex flex-wrap items-center gap-4 mb-12 bg-white/5 border border-white/10 p-2 rounded-[2.5rem] backdrop-blur-md">
    <div className="flex-1 min-w-[200px] flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/5 group focus-within:border-blue-500/50 transition-all">
      <Search size={18} className="text-slate-500" />
      <input 
        placeholder="Search verified destinations..." 
        className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-600"
      />
    </div>
    <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 text-sm font-bold transition-all">
      <Calendar size={18} className="text-blue-500" /> Dates
    </button>
    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20">
      <Filter size={18} /> Apply Filters
    </button>
  </div>
);