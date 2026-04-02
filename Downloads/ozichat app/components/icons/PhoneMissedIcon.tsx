import React from 'react';

export const PhoneMissedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.211-.998-.552-1.348l-2.454-2.454a2.25 2.25 0 00-3.182 0l-1.339 1.339a1.125 1.125 0 01-1.591 0l-4.04-4.04a1.125 1.125 0 010-1.591l1.339-1.339a2.25 2.25 0 000-3.182L6.098 3.552a2.25 2.25 0 00-1.348-.552H3a2.25 2.25 0 00-2.25 2.25v2.25z" 
    />
     <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M15.75 2.25l-4.5 4.5m0-4.5l4.5 4.5"
     />
  </svg>
);
