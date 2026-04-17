
import React from 'react';

interface LogoIconProps {
  step?: number;
}

export const LogoIcon: React.FC<LogoIconProps & React.SVGProps<SVGSVGElement>> = ({ step = 2, ...props }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="oziBubbleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" /> {/* Bright Cyan */}
          <stop offset="50%" stopColor="#A369F0" />
          <stop offset="100%" stopColor="#F472B6" /> {/* Pink */}
        </linearGradient>
        <filter id="glowEyes" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Bubble Shape */}
      <path 
        d="M50 5C74.85 5 95 25.15 95 50C95 74.85 74.85 95 50 95C41 95 32.5 92.5 25 88L10 93L16 78C12 70 10 60.5 10 50C10 25.15 27.9 5 50 5Z"
        fill="url(#oziBubbleGradient)"
        className={`transition-all duration-1000 ${step >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        style={{ transformOrigin: 'center' }}
      />

      {/* Face Features */}
      <g className={`transition-all duration-500 delay-300 ${step >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} style={{ transformOrigin: 'center' }}>
        {/* Eyes */}
        <circle cx="35" cy="45" r="7" fill="#0055FF" />
        <circle cx="37" cy="43" r="2.5" fill="white" opacity="0.9" />
        
        <circle cx="65" cy="45" r="7" fill="#0055FF" />
        <circle cx="67" cy="43" r="2.5" fill="white" opacity="0.9" />
        
        {/* Cheeks */}
        <circle cx="25" cy="58" r="3.5" fill="#FF69B4" opacity="0.8" />
        <circle cx="75" cy="58" r="3.5" fill="#FF69B4" opacity="0.8" />
        
        {/* Smile */}
        <path 
          d="M 40 68 Q 50 76 60 68" 
          stroke="#0055FF" 
          strokeWidth="4" 
          strokeLinecap="round" 
          fill="none" 
        />
      </g>
    </svg>
  );
};
