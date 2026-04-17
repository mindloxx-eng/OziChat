import React from 'react';

export const MapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M9 6.75V15m0 0v2.25m0-2.25h1.5m-1.5 0h-1.5m0-11.25h1.5m-1.5 0h-1.5m1.5 0V3m0 3.75v3.75m0-3.75h1.5m-1.5 0h-1.5m6.375 0h1.5m-1.5 0h-1.5m1.5 0V3m0 3.75v3.75m0-3.75h1.5m-1.5 0h-1.5m-6 3.75h1.5m-1.5 0h-1.5m1.5 0V15m0 2.25v-2.25m0 0h1.5m-1.5 0h-1.5M12 9.75l-1.5 1.5-1.5-1.5M12 12.75l-1.5-1.5-1.5 1.5m3 0l-1.5-1.5-1.5 1.5M12 15.75l-1.5-1.5-1.5 1.5M15 9.75l-1.5 1.5-1.5-1.5M15 12.75l-1.5-1.5-1.5 1.5m3 0l-1.5-1.5-1.5 1.5M15 15.75l-1.5-1.5-1.5 1.5" 
    />
  </svg>
);