import React from 'react';
import PhoneFrame from '../components/PhoneFrame';
import ChatMockup from '../components/ChatMockup';
import { OzichatLogo } from '../../components/icons/NestfingerLogo';
import { LogoIcon } from '../../components/icons/LogoIcon';

const Hero: React.FC = () => (
  <section className="relative overflow-hidden">
    {/* mesh background */}
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[#050714]" />
      <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full bg-[#3F9BFF]/30 blur-[120px] ozi-blob" />
      <div className="absolute top-[200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#EC53B7]/25 blur-[120px] ozi-blob" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-[-200px] left-1/3 w-[500px] h-[500px] rounded-full bg-[#A369F0]/25 blur-[120px] ozi-blob" style={{ animationDelay: '8s' }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
    </div>

    {/* nav */}
    <nav className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-7 flex items-center justify-between">
      <a href="#" className="flex items-center gap-3">
        <LogoIcon className="w-10 h-10" step={2} />
        <OzichatLogo className="h-6 w-auto" />
      </a>
      <div className="hidden md:flex items-center gap-7 text-[13px] font-semibold text-white/70">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#chat" className="hover:text-white transition-colors">Messaging</a>
        <a href="#reels" className="hover:text-white transition-colors">Reels</a>
        <a href="#more" className="hover:text-white transition-colors">More</a>
      </div>
      <a
        href="/admin/"
        className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 transition-colors"
      >
        Admin
      </a>
    </nav>

    {/* hero content */}
    <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 lg:pt-24 pb-20 lg:pb-32 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <div className="text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur text-[10px] font-bold uppercase tracking-widest text-white/70 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Version 1.0 · Production Release
        </div>

        <h1 className="text-[40px] sm:text-[56px] lg:text-[68px] font-black leading-[1.02] tracking-tight">
          OziChat:{' '}
          <span className="bg-gradient-to-r from-[#61D5F8] via-[#A369F0] to-[#EC53B7] bg-clip-text text-transparent">
            A New Era
          </span>{' '}
          of Connection.
        </h1>

        <p className="mt-6 text-lg lg:text-xl text-white/60 max-w-xl mx-auto lg:mx-0 leading-relaxed">
          Experience a beautifully crafted world of messaging, HD calling, and immersive video — built from the ground up for delight.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
          <a
            href="#download"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold tracking-tight bg-gradient-to-r from-[#3F9BFF] via-[#7c6cff] to-[#A369F0] hover:brightness-110 shadow-xl shadow-[#3F9BFF]/30 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M17.5 12.5c0-2.5 2-3.7 2.1-3.8a4.5 4.5 0 0 0-3.5-1.9c-1.5-.1-2.9.9-3.6.9s-1.9-.9-3.1-.9a4.7 4.7 0 0 0-4 2.4c-1.7 3-.4 7.5 1.3 9.9.8 1.2 1.8 2.6 3.1 2.5 1.3 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4a10 10 0 0 0 1.4-2.8 4.4 4.4 0 0 1-2.1-3.9zM15 4.5a4.3 4.3 0 0 0 1-3.2 4.4 4.4 0 0 0-2.8 1.5 4.1 4.1 0 0 0-1 3.1 3.6 3.6 0 0 0 2.8-1.4z" /></svg>
            Download for Android
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold tracking-tight border border-white/20 hover:border-white/40 hover:bg-white/[0.04] transition-all"
          >
            Open Ozi Web
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-6 justify-center lg:justify-start text-[11px] font-bold uppercase tracking-widest text-white/40">
          <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#3F9BFF]" /> End-to-end encrypted</span>
          <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#A369F0]" /> WebRTC HD calls</span>
          <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#EC53B7]" /> Free to use</span>
        </div>
      </div>

      <div className="relative flex justify-center lg:justify-end ozi-float">
        <div className="absolute -inset-10 rounded-full bg-gradient-to-br from-[#3F9BFF]/20 via-[#A369F0]/20 to-[#EC53B7]/20 blur-3xl" />
        <PhoneFrame glow="violet">
          <ChatMockup />
        </PhoneFrame>
      </div>
    </div>
  </section>
);

export default Hero;
