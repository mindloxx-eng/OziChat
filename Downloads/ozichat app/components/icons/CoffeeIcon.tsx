
import React from 'react';

export const CoffeeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        d="M9.75 3v1.5M14.25 3v1.5M6 10.5h13.5a1.5 1.5 0 011.5 1.5v2.25a3 3 0 01-3 3H7.5a3 3 0 01-3-3V12a1.5 1.5 0 011.5-1.5z" 
    />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M19.5 10.5v1.5a3 3 0 01-3 3h-1.5" 
    />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M4.5 17.25h15" 
    />
  </svg>
);
