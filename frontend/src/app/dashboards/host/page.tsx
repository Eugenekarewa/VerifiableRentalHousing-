'use client';

import React from 'react';
import { useProtocol } from '@/context/ProtocolContext';
import { Plus, Home, DollarSign, Calendar, CheckCircle, Clock, Users, TrendingUp, ExternalLink } from 'lucide-react';
import { propertiesAPI } from '@/lib/api';
import { PropertyUploadModal } from '@/components/host/PropertyUploadModal';

export default function HostPage() {
  const [properties, setProperties] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const { hostCompleteStay } = useProtocol(); // Keep protocol actions if needed, or move to API

  const fetchProperties = async () => {
    try {
      const response = await propertiesAPI.getProperties({ owner: 'true' }); // Assuming backend supports filtering by owner or we just get all and filter
      if (response.data.success) {
        setProperties(response.data.properties);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProperties();
  }, []);

  const handleDenyBooking = (id: string) => {
    console.log("Denied:", id);
  };

  // Calculate stats
  const totalEarnings = properties
    .filter((p: any) => p.status === 'COMPLETED')
    .reduce((sum, p: any) => sum + (p.price || 0) * 3, 0); // Assume 3 nights average

  const activeBookings = properties.filter((p: any) => p.status === 'OCCUPIED').length;
  const verifiedProperties = properties.filter((p: any) => p.status === 'VERIFIED_ACTIVE').length;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      <PropertyUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchProperties}
      />

      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto pt-24 pb-12 px-6">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/5 pb-8 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-[0.3em]">
              <Home size={12} /> Host Portal
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">My Properties</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Earnings</span>
              <span className="text-xl font-black text-emerald-400 font-mono">${totalEarnings.toLocaleString()}</span>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-6 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-95 text-sm"
            >
              <Plus size={18} /> Add Property
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Earnings</span>
            </div>
            <p className="text-2xl font-black text-white">${totalEarnings.toLocaleString()}</p>
          </div>

          <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Home size={16} className="text-blue-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Properties</span>
            </div>
            <p className="text-2xl font-black text-white">{properties.length}</p>
          </div>

          <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verified</span>
            </div>
            <p className="text-2xl font-black text-white">{verifiedProperties}</p>
          </div>

          <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-amber-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Guests</span>
            </div>
            <p className="text-2xl font-black text-white">{activeBookings}</p>
          </div>
        </div>

        {/* Properties List */}
        <div className="grid grid-cols-1 gap-3">
          {loading ? (
            <div className="text-center py-20 text-slate-500">Loading properties...</div>
          ) : properties.map((prop: any) => (
            <div
              key={prop.id}
              className="group relative bg-[#0a0f1e]/60 border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 transition-all backdrop-blur-md overflow-hidden"
            >
              {/* Hover background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/[0.02] to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] duration-1000 transition-transform pointer-events-none" />

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Left: Property Info */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 border border-white/10 shrink-0">
                    <Home size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white truncate leading-tight">
                      {prop.title || prop.name || 'Unnamed Property'}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{prop.location}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-[10px] font-black text-blue-500/80 uppercase font-mono">${prop.price || 0}/night</span>
                    </div>
                  </div>
                </div>

                {/* Center: Stay Info */}
                <div className="flex flex-1 items-center justify-start md:justify-center gap-8 w-full md:w-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Current Guest</span>
                    {prop.currentGuest ? (
                      <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                        <Users size={14} /> {prop.currentGuest}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-700 font-medium">No active booking</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</span>
                    <StatusTag status={prop.status} />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">

                  {/* View on Explorer Link */}
                  {(prop.txHash || prop.verificationProof?.transactionHash) && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${prop.txHash || prop.verificationProof?.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                      title="View Transaction on Blockchain"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}

                  {prop.status === 'PENDING_ADMIN' && (
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                      <Clock size={14} /> Pending Review
                    </span>
                  )}

                  {prop.status === 'OCCUPIED' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => hostCompleteStay(prop.id)}
                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs border border-emerald-500/20 transition-all flex items-center gap-2"
                      >
                        <CheckCircle size={14} /> Complete Stay
                      </button>
                      <button
                        onClick={() => handleDenyBooking(prop.id)}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-xl border border-red-500/20 transition-all"
                      >
                        <Clock size={16} />
                      </button>
                    </div>
                  )}

                  {prop.status === 'VERIFIED_ACTIVE' && (
                    <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold tracking-widest px-4 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <CheckCircle size={14} /> Live
                    </div>
                  )}

                  {prop.status === 'COMPLETED' && (
                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold bg-emerald-500/5 px-4 py-2 rounded-lg border border-emerald-500/10">
                      <DollarSign size={14} /> Paid Out
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}

          {!loading && properties.length === 0 && (
            <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
              <Home className="mx-auto text-slate-700 mb-4" size={48} />
              <p className="text-slate-500 font-bold uppercase tracking-widest">No properties yet.</p>
              <p className="text-slate-600 text-sm mt-2 mb-6">Add your first property to start earning!</p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2"
              >
                <Plus size={18} /> Add Property
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-6 bg-white/5 border border-white/5 rounded-2xl">
          <h4 className="text-sm font-bold text-white mb-2">Host Tips</h4>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Keep your calendar updated to avoid booking conflicts</li>
            <li>• Respond to guest inquiries within 24 hours</li>
            <li>• Verify your identity to unlock full platform features</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Visual Utilities
function StatusTag({ status }: { status: string }) {
  const configs: Record<string, { class: string; label: string }> = {
    PENDING_ADMIN: { class: "text-slate-500 bg-slate-500/10", label: "Pending Review" },
    VERIFIED_ACTIVE: { class: "text-blue-400 bg-blue-400/10", label: "Live" },
    OCCUPIED: { class: "text-amber-400 bg-amber-400/10", label: "Occupied" },
    COMPLETED: { class: "text-emerald-400 bg-emerald-400/10", label: "Completed" },
  };
  const config = configs[status] || configs.PENDING_ADMIN;
  return (
    <span className={`text-[10px] font-black tracking-tighter uppercase px-2 py-0.5 rounded ${config.class}`}>
      {config.label}
    </span>
  );
}

