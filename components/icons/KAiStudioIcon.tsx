
import React from 'react';

export const KAiStudioIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Purple-Blue Background Square */}
    <rect width="100" height="100" rx="20" fill="#553699" />
    
    {/* Top Decorative Arcs */}
    <path 
      d="M25 30 Q 50 20 75 30" 
      stroke="white" 
      strokeWidth="3" 
      strokeLinecap="round" 
      fill="none" 
      opacity="0.9"
    />
    <path 
      d="M30 38 Q 50 30 70 38" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      fill="none" 
      opacity="0.6"
    />

    {/* Center Text */}
    <text
      x="50%"
      y="60%"
      textAnchor="middle"
      fill="white"
      fontSize="28"
      fontWeight="900"
      fontFamily="Poppins, sans-serif"
    >
      K AI
    </text>

    {/* Bottom Decorative Arcs */}
    <path 
      d="M30 72 Q 50 80 70 72" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      fill="none" 
      opacity="0.6"
    />
    <path 
      d="M25 80 Q 50 90 75 80" 
      stroke="white" 
      strokeWidth="3" 
      strokeLinecap="round" 
      fill="none" 
      opacity="0.9"
    />
  </svg>
);
