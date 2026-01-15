// app/verify-identity/page.tsx
export default function ManualVerification() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-3xl">
        <h1 className="text-3xl font-black mb-4">Manual Fallback</h1>
        <p className="text-slate-400 mb-8 text-sm">Automated proof failed. Please upload a government ID for manual protocol approval.</p>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upload ID (PDF/JPG)</span>
          </div>
          <button className="w-full bg-blue-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all">
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}