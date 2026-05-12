import React from 'react';
import { OzichatLogo } from '../../components/icons/NestfingerLogo';
import { LogoIcon } from '../../components/icons/LogoIcon';

const TRUST = [
  {
    title: 'Secure by Design',
    body: 'Industry-standard encryption and secure tokens.',
    icon: <path d="M12 3 4 6v6c0 4.5 3.4 8.5 8 9 4.6-.5 8-4.5 8-9V6l-8-3z" />,
  },
  {
    title: 'Modular Architecture',
    body: 'Cleanly organized for fast, safe future updates.',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  {
    title: 'Always Improving',
    body: 'Continuous delivery — new delight every release.',
    icon: (
      <>
        <path d="M4 17 10 11l4 4 6-7" />
        <path d="M14 8h6v6" />
      </>
    ),
  },
];

const TrustAndFooter: React.FC = () => (
  <>
    {/* Under the hood */}
    <section className="relative py-16 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-8">
          <div className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            Under the hood
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {TRUST.map(t => (
            <div key={t.title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#7cb8ff]">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {t.icon}
                </svg>
              </div>
              <div>
                <h4 className="font-bold tracking-tight">{t.title}</h4>
                <p className="text-white/55 text-sm leading-relaxed mt-0.5">{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Final CTA */}
    <section id="download" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050714]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#3F9BFF]/20 via-[#A369F0]/15 to-[#EC53B7]/10 blur-3xl" />
      </div>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          Ready for a{' '}
          <span className="bg-gradient-to-r from-[#61D5F8] via-[#A369F0] to-[#EC53B7] bg-clip-text text-transparent">
            better way to connect?
          </span>
        </h2>
        <p className="mt-5 text-lg text-white/55">
          Join the new era. Download OziChat and feel the difference from your first message.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-sm font-bold tracking-tight bg-gradient-to-r from-[#3F9BFF] via-[#7c6cff] to-[#A369F0] hover:brightness-110 shadow-xl shadow-[#3F9BFF]/30 transition-all"
          >
            Download for Android
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-sm font-bold tracking-tight border border-white/20 hover:border-white/40 hover:bg-white/[0.04] transition-all"
          >
            Open Ozi Web
          </a>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="relative border-t border-white/5 bg-[#03040A]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-3">
          <LogoIcon className="w-9 h-9" step={2} />
          <OzichatLogo className="h-5 w-auto" />
        </div>
        <div className="text-center md:text-right">
          <p className="text-sm text-white/50">
            Crafted with <span className="text-[#EC53B7]">♥</span> by the OziChat Development Team
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mt-2">
            Version 1.0 · Production Release
          </p>
        </div>
      </div>
    </footer>
  </>
);

export default TrustAndFooter;
