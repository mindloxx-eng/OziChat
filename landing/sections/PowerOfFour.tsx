import React from 'react';

const FEATURES = [
  {
    title: 'Real-Time Chat',
    desc: 'Lightning-fast messaging with instant delivery and live read receipts.',
    accent: 'from-[#3F9BFF] to-[#61D5F8]',
    icon: (
      <path d="M21 11.5a8.4 8.4 0 0 1-1 4 8.5 8.5 0 0 1-7.6 4.5 8.4 8.4 0 0 1-4-1L3 21l2-5.4a8.4 8.4 0 0 1-1-4 8.5 8.5 0 0 1 4.5-7.6 8.4 8.4 0 0 1 4-1h.5a8.5 8.5 0 0 1 8 8z" />
    ),
  },
  {
    title: 'HD Audio & Video',
    desc: 'Premium WebRTC-powered calls with crystal-clear, low-latency connections.',
    accent: 'from-[#A369F0] to-[#3F9BFF]',
    icon: (
      <>
        <rect x="3" y="6" width="13" height="12" rx="2" />
        <path d="M16 10l5-3v10l-5-3z" />
      </>
    ),
  },
  {
    title: 'Short Video Feed',
    desc: 'An immersive, vertical-scroll feed to discover stories and creators.',
    accent: 'from-[#EC53B7] to-[#A369F0]',
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="3" />
        <path d="M10 9 16 12 10 15z" />
      </>
    ),
  },
  {
    title: 'Communities',
    desc: 'Create groups and channels to stay connected with everyone who matters.',
    accent: 'from-[#61D5F8] to-[#EC53B7]',
    icon: (
      <>
        <circle cx="9" cy="9" r="3.2" />
        <path d="M2.5 19c.6-3.2 3.4-5 6.5-5s5.9 1.8 6.5 5" />
        <circle cx="17.5" cy="7.5" r="2.4" />
        <path d="M16 13c2.5.4 4.4 2 5 5" />
      </>
    ),
  },
];

const PowerOfFour: React.FC = () => (
  <section id="features" className="relative py-24 lg:py-32">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="text-center mb-16">
        <div className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-[#7cb8ff] mb-3">
          Power of Four
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
          Everything you need.{' '}
          <span className="text-white/40">Nothing you don't.</span>
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map(f => (
          <div
            key={f.title}
            className="group relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 hover:bg-white/[0.06] hover:border-white/20 transition-all overflow-hidden"
          >
            <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${f.accent} opacity-30 blur-2xl group-hover:opacity-50 transition-opacity`} />
            <div className={`relative inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br ${f.accent} items-center justify-center mb-5 shadow-lg`}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {f.icon}
              </svg>
            </div>
            <h3 className="relative text-lg font-bold mb-2 tracking-tight">{f.title}</h3>
            <p className="relative text-sm text-white/55 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PowerOfFour;
