// components/dashboard/ActiveBookings.tsx
export const BookingCard = ({ booking }: { booking: any }) => {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl hover:bg-white/[0.04] transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-white font-bold text-lg mb-1">Property #{booking.propertyId}</h4>
          <code className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2 py-1 rounded">
            TX: {booking.verificationHash.substring(0, 14)}...
          </code>
        </div>
        <span className="bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-widest">
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Check In</span>
          <span className="text-white font-bold">Jan 15, 2026</span>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Check Out</span>
          <span className="text-white font-bold">Jan 22, 2026</span>
        </div>
      </div>

      <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all">
        Cancel Booking
      </button>
    </div>
  );
};