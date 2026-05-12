import React from 'react';

const CARDS = [
  {
    title: 'Status & Stories',
    desc: 'Share moments that disappear in 24 hours — photos, videos and quick thoughts.',
    accent: 'from-[#EC53B7] to-[#A369F0]',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
        <circle cx="12" cy="12" r="4" />
      </>
    ),
  },
  {
    title: 'Map & Location',
    desc: 'Explore nearby people and share your spot live — privacy controls always at hand.',
    accent: 'from-[#3F9BFF] to-[#61D5F8]',
    icon: (
      <>
        <path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" />
        <circle cx="12" cy="9" r="2.4" />
      </>
    ),
  },
  {
    title: 'Starred Messages',
    desc: 'Never lose an important note again. Pin to the top of a chat or save to your vault.',
    accent: 'from-[#A369F0] to-[#3F9BFF]',
    icon: (
      <path d="m12 2 3.1 6.4 7 1-5 4.9 1.2 7-6.3-3.4-6.3 3.4 1.2-7-5-4.9 7-1z" />
    ),
  },
  {
    title: 'Personalization',
    desc: 'Full control over your profile, privacy and preferences — make Ozi feel like yours.',
    accent: 'from-[#61D5F8] to-[#EC53B7]',
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8 2 2 0 1 1-2.8 2.8 1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0 1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3 2 2 0 1 1-2.8-2.8 1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8 2 2 0 1 1 2.8-2.8 1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0 1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3 2 2 0 1 1 2.8 2.8 1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4 1.7 1.7 0 0 0-1.5 1z" />
      </>
    ),
  },
];

const MoreGoodness: React.FC = () => (
  <section id="more" className="relative py-24 lg:py-32">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="text-center mb-14">
        <div className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-[#7cb8ff] mb-3">
          More goodness
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
          The little things,{' '}
          <span className="text-white/40">done right.</span>
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(c => (
          <div
            key={c.title}
            className="group relative rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] hover:border-white/20 transition-all overflow-hidden"
          >
            <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${c.accent} opacity-25 blur-2xl group-hover:opacity-50 transition-opacity`} />
            <div className={`relative inline-flex w-11 h-11 rounded-2xl bg-gradient-to-br ${c.accent} items-center justify-center mb-5 shadow-lg`}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {c.icon}
              </svg>
            </div>
            <h3 className="relative font-bold tracking-tight mb-2">{c.title}</h3>
            <p className="relative text-sm text-white/55 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default MoreGoodness;
