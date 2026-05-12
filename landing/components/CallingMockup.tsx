import React from 'react';

const CallingMockup: React.FC = () => (
  <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-[#1a1230] via-[#0e1228] to-[#070912] text-white">
    {/* status bar */}
    <div className="h-7 flex items-center justify-between px-4 pt-2 text-[10px] font-bold text-white/80">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="w-3 h-1.5 rounded-sm bg-white/70" />
        <span className="w-4 h-2 rounded-sm border border-white/60" />
      </div>
    </div>

    {/* glow circles */}
    <div className="absolute top-32 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-[#A369F0]/20 blur-3xl" />
    <div className="absolute top-44 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-[#3F9BFF]/30 blur-3xl" />

    <div className="relative flex-1 flex flex-col items-center pt-12 px-6">
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Connected
      </div>

      <div className="mt-6 relative ozi-float">
        <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-[#3F9BFF]/40 to-[#A369F0]/40 blur-2xl" />
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#3F9BFF] via-[#A369F0] to-[#EC53B7] p-[3px]">
          <div className="w-full h-full rounded-full bg-[#0E1320] flex items-center justify-center text-4xl font-black">
            AK
          </div>
        </div>
      </div>

      <div className="mt-7 text-center">
        <div className="text-[18px] font-bold leading-tight">Ahmed Khan</div>
        <div className="text-[11px] text-white/50 mt-1 font-mono">02:47</div>
      </div>

      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/60">
        <svg viewBox="0 0 24 24" className="w-3 h-3 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3 4 6v6c0 4.5 3.4 8.5 8 9 4.6-.5 8-4.5 8-9V6l-8-3z" /></svg>
        End-to-end encrypted
      </div>
    </div>

    {/* call controls */}
    <div className="px-6 pb-8 pt-4">
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { i: <path d="M12 1a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4" />, on: true },
          { i: <path d="M11 5 6 9H2v6h4l5 4V5z M19.07 4.93a10 10 0 0 1 0 14.14 M15.54 8.46a5 5 0 0 1 0 7.07" />, on: false },
          { i: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3z" /></>, on: true },
          { i: <path d="M2 6h13l-3-3 M22 18H9l3 3 M17 6h5v5 M2 18V13" />, on: false },
        ].map((b, i) => (
          <button
            key={i}
            className={`aspect-square rounded-2xl flex items-center justify-center border ${
              b.on ? 'bg-white/10 border-white/15' : 'bg-white/[0.04] border-white/5'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {b.i}
            </svg>
          </button>
        ))}
      </div>
      <button className="w-full h-12 rounded-2xl bg-gradient-to-br from-[#ff5b6b] to-[#d11a3a] flex items-center justify-center shadow-lg shadow-red-500/40">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white rotate-[135deg]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.78.66 2.6a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.48-1.48a2 2 0 0 1 2.11-.45c.82.31 1.7.54 2.6.66A2 2 0 0 1 22 16.92z" /></svg>
      </button>
    </div>
  </div>
);

export default CallingMockup;
