import React from 'react';

const ChatMockup: React.FC = () => (
  <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-[#0E1320] via-[#0A0E1A] to-[#0B0E14] text-white">
    {/* status bar */}
    <div className="h-7 flex items-center justify-between px-4 pt-2 text-[10px] font-bold text-white/80">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="w-3 h-1.5 rounded-sm bg-white/70" />
        <span className="w-2 h-1.5 rounded-sm bg-white/40" />
        <span className="w-4 h-2 rounded-sm border border-white/60" />
      </div>
    </div>

    {/* header */}
    <div className="px-3 pt-3 pb-2 flex items-center gap-3 border-b border-white/5">
      <button className="text-white/60 text-lg">‹</button>
      <div className="relative">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EC53B7] via-[#A369F0] to-[#3F9BFF] flex items-center justify-center text-sm font-black">S</div>
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0E1320]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold leading-tight">Sara</div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-semibold">
          <span className="ozi-typing-dot w-1 h-1 rounded-full bg-emerald-300 inline-block" />
          <span className="ozi-typing-dot w-1 h-1 rounded-full bg-emerald-300 inline-block" />
          <span className="ozi-typing-dot w-1 h-1 rounded-full bg-emerald-300 inline-block" />
          <span className="ml-1">Sara is typing…</span>
        </div>
      </div>
      <button className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.78.66 2.6a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.48-1.48a2 2 0 0 1 2.11-.45c.82.31 1.7.54 2.6.66A2 2 0 0 1 22 16.92z" /></svg>
      </button>
      <button className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3z" /></svg>
      </button>
    </div>

    {/* messages */}
    <div className="flex-1 px-3 py-3 space-y-2.5 overflow-hidden">
      <div className="text-center text-[9px] uppercase tracking-widest text-white/30 font-bold py-1">Today</div>

      <div className="flex">
        <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-white/[0.06] px-3 py-2 text-[11px] leading-snug border border-white/5">
          Hey! Just finished the new design 🎨
          <div className="text-[8px] text-white/40 mt-1 text-right">9:38 AM</div>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-2xl rounded-br-md bg-gradient-to-br from-[#3F9BFF] to-[#5b8bff] px-3 py-2 text-[11px] leading-snug shadow-lg shadow-[#3F9BFF]/30">
          Wow, send it over! 🙌
          <div className="flex items-center justify-end gap-0.5 mt-1">
            <span className="text-[8px] text-white/80">9:39 AM</span>
            <svg viewBox="0 0 18 12" className="w-3 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6.5 4 9.5 9 4.5M7 6.5 10 9.5 17 2.5" /></svg>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-white/[0.06] px-3 py-2 text-[11px] leading-snug border border-white/5">
          Looks 🔥 on dark mode too
          <div className="text-[8px] text-white/40 mt-1 text-right">9:40 AM</div>
        </div>
      </div>

      <div className="flex">
        <div className="rounded-2xl rounded-bl-md bg-white/[0.06] px-3 py-2.5 border border-white/5 flex items-center gap-1.5">
          <span className="ozi-typing-dot w-1.5 h-1.5 rounded-full bg-white/60 inline-block" />
          <span className="ozi-typing-dot w-1.5 h-1.5 rounded-full bg-white/60 inline-block" />
          <span className="ozi-typing-dot w-1.5 h-1.5 rounded-full bg-white/60 inline-block" />
        </div>
      </div>
    </div>

    {/* composer */}
    <div className="px-3 py-2.5 border-t border-white/5 bg-[#0A0E1A]">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
        <span className="text-white/30 text-[11px] flex-1">Message…</span>
        <button className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3F9BFF] to-[#A369F0] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7z" /></svg>
        </button>
      </div>
    </div>
  </div>
);

export default ChatMockup;
