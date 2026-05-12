import React from 'react';
import PhoneFrame from '../components/PhoneFrame';
import ChatMockup from '../components/ChatMockup';
import CallingMockup from '../components/CallingMockup';

const Bullet: React.FC<{ title: string; body: string; accent: string }> = ({ title, body, accent }) => (
  <div className="flex gap-4">
    <div className={`shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg`}>
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5 9-11" />
      </svg>
    </div>
    <div>
      <h4 className="text-lg font-bold tracking-tight">{title}</h4>
      <p className="text-white/55 leading-relaxed mt-1">{body}</p>
    </div>
  </div>
);

const Showcases: React.FC = () => (
  <>
    {/* Showcase 1 — Chat */}
    <section id="chat" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="flex justify-center lg:justify-start order-2 lg:order-1">
          <PhoneFrame glow="blue">
            <ChatMockup />
          </PhoneFrame>
        </div>
        <div className="order-1 lg:order-2">
          <div className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-[#7cb8ff] mb-3">
            Messaging
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Conversations that{' '}
            <span className="bg-gradient-to-r from-[#3F9BFF] to-[#A369F0] bg-clip-text text-transparent">feel alive.</span>
          </h2>

          <div className="mt-10 space-y-8">
            <Bullet
              title="Instant Sync"
              body="No refreshing, no waiting. Messages deliver the moment they are sent — with live typing indicators and double-tick receipts."
              accent="from-[#3F9BFF] to-[#61D5F8]"
            />
            <Bullet
              title="Smart Reconnection"
              body="Chats keep working even on patchy networks. Missed messages auto-sync the moment you're back online."
              accent="from-[#A369F0] to-[#3F9BFF]"
            />
          </div>
        </div>
      </div>
    </section>

    {/* Showcase 2 — Calling */}
    <section id="calling" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 right-[-100px] w-[500px] h-[500px] rounded-full bg-[#A369F0]/20 blur-[140px]" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#3F9BFF]/15 blur-[140px]" />
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <div className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-[#a98bff] mb-3">
            Calls
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Calling,{' '}
            <span className="bg-gradient-to-r from-[#EC53B7] to-[#A369F0] bg-clip-text text-transparent">reimagined.</span>
          </h2>

          <div className="mt-10 space-y-8">
            <Bullet
              title="One-Tap Connection"
              body="Launch HD voice or video calls directly from any chat. Powered by WebRTC for ultra low-latency, crystal-clear quality."
              accent="from-[#EC53B7] to-[#A369F0]"
            />
            <Bullet
              title="Full Control"
              body="Beautiful incoming call screens with mute, speaker, camera flip and privacy blur — exactly where you expect them."
              accent="from-[#A369F0] to-[#3F9BFF]"
            />
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <PhoneFrame glow="pink">
            <CallingMockup />
          </PhoneFrame>
        </div>
      </div>
    </section>
  </>
);

export default Showcases;
