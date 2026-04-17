
import React from 'react';

export const KennyejisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Background color for the square fitting */}
    <rect width="100" height="100" rx="20" fill="#61D5F8" />
    
    {/* Top Arcs */}
    <path 
      d="M30 25 Q 50 15 70 25" 
      stroke="white" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      fill="none" 
    />
    <path 
      d="M35 32 Q 50 25 65 32" 
      stroke="white" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      fill="none" 
      opacity="0.8"
    />

    {/* Wordmark */}
    <text
      x="50%"
      y="58%"
      textAnchor="middle"
      fill="white"
      fontSize="17"
      fontWeight="900"
      fontFamily="serif"
      fontStyle="italic"
      letterSpacing="-0.5"
    >
      Kennyejis
    </text>

    {/* Bottom Arcs */}
    <path 
      d="M35 72 Q 50 79 65 72" 
      stroke="white" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      fill="none" 
      opacity="0.8"
    />
    <path 
      d="M30 79 Q 50 89 70 79" 
      stroke="white" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      fill="none" 
    />
  </svg>
);
