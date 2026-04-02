
import React from 'react';

export const NestfingerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="nfBrandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#61D5F8" />
        <stop offset="50%" stopColor="#A369F0" />
        <stop offset="100%" stopColor="#EC53B7" />
      </linearGradient>
    </defs>
    
    {/* Bold "NF" Monogram as seen in the design image */}
    <text
      x="50%"
      y="58%"
      textAnchor="middle"
      fill="url(#nfBrandGradient)"
      fontSize="48"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="-3"
    >
      NF
    </text>

    {/* Elegant nest strokes at the base of the letters */}
    <g fill="none" stroke="url(#nfBrandGradient)" strokeWidth="3.5" strokeLinecap="round">
      <path d="M 22 70 Q 50 92 78 70" opacity="0.9" />
      <path d="M 30 78 Q 50 96 70 78" opacity="0.6" />
      <path d="M 38 84 Q 50 98 62 84" opacity="0.3" />
    </g>
  </svg>
);

export const OzichatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="8" cy="10" r="1.5" fill="currentColor" />
        <circle cx="16" cy="10" r="1.5" fill="currentColor" />
        <path d="M8 14.5C9 16 11 17 12 17C13 17 15 16 16 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
