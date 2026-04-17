import React from 'react';

export const DoubleCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 21.75 9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75L8.25 16.5 11.25 13.5" />
  </svg>
);
