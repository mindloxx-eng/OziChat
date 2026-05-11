import React from 'react';
import { TrendUpIcon, TrendDownIcon } from '../icons';

interface StatCardProps {
  label: string;
  value: string;
  delta?: number; // percentage
  icon: React.ReactNode;
  accent?: 'blue' | 'violet' | 'green' | 'orange';
}

const ACCENT: Record<NonNullable<StatCardProps['accent']>, string> = {
  blue: 'from-[#3F9BFF]/30 to-[#3F9BFF]/0 text-[#3F9BFF]',
  violet: 'from-[#8a5bff]/30 to-[#8a5bff]/0 text-[#a98bff]',
  green: 'from-emerald-400/30 to-emerald-400/0 text-emerald-300',
  orange: 'from-amber-400/30 to-amber-400/0 text-amber-300',
};

const StatCard: React.FC<StatCardProps> = ({ label, value, delta, icon, accent = 'blue' }) => {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 overflow-hidden">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${ACCENT[accent]} blur-2xl opacity-60`} />
      <div className="relative flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${ACCENT[accent].split(' ').pop()}`}>
          {icon}
        </div>
        {typeof delta === 'number' && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full border ${
              up
                ? 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10'
                : 'text-red-300 border-red-400/20 bg-red-400/10'
            }`}
          >
            {up ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="relative mt-5">
        <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">{label}</div>
        <div className="text-3xl font-black tracking-tight mt-1">{value}</div>
      </div>
    </div>
  );
};

export default StatCard;
