import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
  /** Shadow + glow color around the device */
  glow?: 'blue' | 'pink' | 'violet';
}

const GLOWS: Record<NonNullable<PhoneFrameProps['glow']>, string> = {
  blue: 'shadow-[0_40px_120px_-20px_rgba(63,155,255,0.45)]',
  pink: 'shadow-[0_40px_120px_-20px_rgba(236,83,183,0.45)]',
  violet: 'shadow-[0_40px_120px_-20px_rgba(163,105,240,0.45)]',
};

const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, className = '', glow = 'blue' }) => (
  <div className={`relative mx-auto ${className}`}>
    <div
      className={`relative rounded-[44px] bg-gradient-to-b from-[#1c1f2c] to-[#0b0d14] p-[10px] border border-white/10 ${GLOWS[glow]}`}
      style={{ width: 300, height: 620 }}
    >
      <div className="relative w-full h-full rounded-[36px] overflow-hidden bg-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-[110px] h-[26px] bg-black rounded-b-2xl flex items-end justify-center pb-1">
          <div className="w-12 h-1 rounded-full bg-white/10" />
        </div>
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
    <div className="absolute -left-[3px] top-24 w-[3px] h-10 rounded-l-full bg-white/15" />
    <div className="absolute -left-[3px] top-40 w-[3px] h-16 rounded-l-full bg-white/15" />
    <div className="absolute -right-[3px] top-32 w-[3px] h-20 rounded-r-full bg-white/15" />
  </div>
);

export default PhoneFrame;
