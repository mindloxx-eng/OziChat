import React from 'react';
import PhoneFrame from '../components/PhoneFrame';
import ReelsMockup from '../components/ReelsMockup';

const POINTS = [
  {
    title: 'Buttery performance',
    body: 'Intelligent pre-loading keeps the next reel ready before you swipe — zero buffering, zero stutter.',
    icon: <path d="M13 2 3 14h7l-2 8 10-12h-7l2-8z" />,
  },
  {
    title: 'Interactive engagement',
    body: 'Tap to like, swipe to comment, share to any chat. Discovery feels effortless.',
    icon: <path d="M20.8 6.3a5.5 5.5 0 0 0-9-1.8L12 5.3l-.2-.3a5.5 5.5 0 0 0-9 7l9.2 9 9.2-9a5.5 5.5 0 0 0-.4-5.7z" />,
  },
  {
    title: 'Distraction-free format',
    body: 'A clean, minimal UI for creators and viewers alike. Just content, just connection.',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 9h6M9 13h6M9 17h3" />
      </>
    ),
  },
];

const ImmersiveContent: React.FC = () => (
  <section id="reels" className="relative py-28 lg:py-36 overflow-hidden">
    {/* full-bleed blurred backdrop */}
    <div className="absolute inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 60% at 30% 30%, rgba(236,83,183,0.25), transparent 60%),' +
            'radial-gradient(50% 60% at 70% 70%, rgba(63,155,255,0.25), transparent 60%),' +
            'linear-gradient(180deg, #0a0716 0%, #050714 100%)',
        }}
      />
      <div className="absolute inset-0 backdrop-blur-3xl opacity-50" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050714] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050714] to-transparent" />
    </div>

    <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      <div>
        <div className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-[#f48fcf] mb-3">
          Immersive Content
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          A short video feed,{' '}
          <span className="bg-gradient-to-r from-[#EC53B7] via-[#A369F0] to-[#61D5F8] bg-clip-text text-transparent">
            done right.
          </span>
        </h2>
        <p className="mt-5 text-white/55 max-w-lg">
          Built for delight from the first swipe. Vertical, full-screen, and effortlessly fast.
        </p>

        <div className="mt-10 space-y-6">
          {POINTS.map(p => (
            <div key={p.title} className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#f48fcf]">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {p.icon}
                </svg>
              </div>
              <div>
                <h4 className="font-bold tracking-tight">{p.title}</h4>
                <p className="text-white/55 text-sm leading-relaxed mt-0.5">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center lg:justify-end relative">
        <div className="absolute -inset-10 rounded-full bg-gradient-to-br from-[#EC53B7]/30 to-[#3F9BFF]/30 blur-3xl" />
        <PhoneFrame glow="pink">
          <ReelsMockup />
        </PhoneFrame>
      </div>
    </div>
  </section>
);

export default ImmersiveContent;
