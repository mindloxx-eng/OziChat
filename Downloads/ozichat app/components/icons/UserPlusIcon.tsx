
import React from 'react';

export const UserPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M19 7.5v9m-4.5-4.5h9M3 20.25a6 6 0 1112 0m-3-9a3 3 0 11-6 0 3 3 0 016 0z" 
    />
  </svg>
);
