
import React from 'react';

export const GhostIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 2a7 7 0 00-7 7v11l3.5-3.5L12 20l3.5-3.5L19 20V9a7 7 0 00-7-7z" 
    />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M9 10h.01" 
    />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M15 10h.01" 
    />
  </svg>
);
