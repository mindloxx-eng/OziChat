import React from 'react';

export const UserMinusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 12v-1.5a3.375 3.375 0 00-3.375-3.375H8.25" 
    />
     <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 12v5.25A2.25 2.25 0 019.75 19.5H8.25A2.25 2.25 0 016 17.25V15" 
    />
  </svg>
);