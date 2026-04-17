
import React from 'react';

export const UfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        d="M19.07 4.93L17.07 6.93M4.93 4.93L6.93 6.93m10.14 10.14l2 2m-14.14-2l-2 2"
    />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 9a4 4 0 00-4 4v1h8v-1a4 4 0 00-4-4z" 
    />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M3 14h18v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1z" 
    />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 18v3" 
    />
  </svg>
);
