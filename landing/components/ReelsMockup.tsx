import React from 'react';

const ReelsMockup: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* gradient backdrop simulating video */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(80% 50% at 30% 20%, rgba(236,83,183,0.55), transparent 60%),' +
          'radial-gradient(70% 60% at 70% 80%, rgba(63,155,255,0.45), transparent 60%),' +
          'linear-gradient(180deg, #1a0d2e 0%, #0a0716 60%, #050714 100%)',
      }}
    />
    <div
      className="absolute inset-0 opacity-25 mix-blend-overlay"
      style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '4px 4px' }}
    />

    {/* status bar */}
    <div className="relative h-7 flex items-center justify-between px-4 pt-2 text-[10px] font-bold text-white/80">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="w-3 h-1.5 rounded-sm bg-white/70" />
        <span className="w-4 h-2 rounded-sm border border-white/60" />
      </div>
    </div>

    {/* top tabs */}
    <div className="relative px-4 pt-2 flex items-center justify-center gap-5 text-[11px] font-bold">
      <span className="text-white/40">Following</span>
      <span className="relative text-white">
        For you
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white" />
      </span>
    </div>

    {/* center play hint */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white ml-1" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
    </div>

    {/* right action rail */}
    <div className="absolute right-3 bottom-32 flex flex-col items-center gap-4">
      {[
        { icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />, label: '12.4K', filled: true },
        { icon: <path d="M21 11.5a8.4 8.4 0 0 1-1 4 8.5 8.5 0 0 1-7.6 4.5 8.4 8.4 0 0 1-4-1L3 21l2-5.4a8.4 8.4 0 0 1-1-4 8.5 8.5 0 0 1 4.5-7.6 8.4 8.4 0 0 1 4-1h.5a8.5 8.5 0 0 1 8 8z" />, label: '342' },
        { icon: <><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="m16 6-4-4-4 4" /><path d="M12 2v13" /></>, label: '89' },
      ].map((a, i) => (
        <div key={i} className="flex flex-col items-center">
          <button
            className={`w-9 h-9 rounded-full flex items-center justify-center border ${
              a.filled
                ? 'bg-gradient-to-br from-[#EC53B7] to-[#A369F0] border-white/20'
                : 'bg-white/15 backdrop-blur border-white/20'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill={a.filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {a.icon}
            </svg>
          </button>
          <span className="text-[9px] font-bold mt-1 text-white/90">{a.label}</span>
        </div>
      ))}
    </div>

    {/* bottom caption */}
    <div className="absolute left-3 right-16 bottom-20">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3F9BFF] to-[#A369F0] flex items-center justify-center text-[10px] font-black border border-white/30">L</div>
        <span className="text-[11px] font-bold">@layla_codes</span>
        <span className="ml-1 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-white/30 text-white/80">Follow</span>
      </div>
      <p className="text-[11px] leading-snug text-white/90">
        When the build passes on the first try ✨ #devlife
      </p>
      <div className="flex items-center gap-1 mt-1 text-[10px] text-white/60">
        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13M9 9l12-2" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
        Original sound · Layla
      </div>
    </div>

    {/* bottom nav */}
    <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-around pb-2">
      {['Home', 'Reels', 'Inbox', 'Me'].map((t, i) => (
        <span key={t} className={`text-[9px] font-bold ${i === 1 ? 'text-white' : 'text-white/40'}`}>{t}</span>
      ))}
    </div>
  </div>
);

export default ReelsMockup;
