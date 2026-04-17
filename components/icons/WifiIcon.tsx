import React from 'react';

export const WifiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M8.288 15.038a5.25 5.25 0 017.424 0M5.636 12.382a9 9 0 0112.728 0M12 18.75a.375.375 0 11-.75 0 .375.375 0 01.75 0z" 
    />
  </svg>
);