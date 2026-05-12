import React from 'react';

type Tone = 'blue' | 'violet' | 'green' | 'amber' | 'red' | 'gray';

const TONES: Record<Tone, string> = {
  blue: 'bg-[#3F9BFF]/15 text-[#7cb8ff] border-[#3F9BFF]/30',
  violet: 'bg-[#8a5bff]/15 text-[#b39bff] border-[#8a5bff]/30',
  green: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  amber: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  red: 'bg-red-500/15 text-red-300 border-red-500/30',
  gray: 'bg-white/5 text-white/60 border-white/10',
};

interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ tone = 'gray', children, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${TONES[tone]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
