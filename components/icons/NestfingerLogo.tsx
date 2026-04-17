
import React from 'react';

export const OzichatLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 240 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="ozichatTextGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#61D5F8" />
        <stop offset="45%" stopColor="#3F9BFF" />
        <stop offset="75%" stopColor="#A369F0" />
        <stop offset="100%" stopColor="#EC53B7" />
      </linearGradient>
    </defs>
    <text
      x="0"
      y="32"
      fill="url(#ozichatTextGradient)"
      fontSize="34"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="1.2"
      style={{ textTransform: 'uppercase' }}
    >
      OZICHAT
    </text>
  </svg>
);

export const NestfingerLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 320 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="nestfingerTextGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#61D5F8" />
        <stop offset="50%" stopColor="#A369F0" />
        <stop offset="100%" stopColor="#EC53B7" />
      </linearGradient>
    </defs>
    <text
      x="0"
      y="32"
      fill="url(#nestfingerTextGradient)"
      fontSize="34"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="1.2"
      style={{ textTransform: 'uppercase' }}
    >
      NESTFINGER
    </text>
  </svg>
);
