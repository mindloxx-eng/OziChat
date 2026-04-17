import React from 'react';

export const PaintBrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.47 2.118 2.25 2.25 0 01-2.47-2.118c0-.823.407-1.588 1.128-2.062a3 3 0 005.78-1.128 2.25 2.25 0 012.118-2.47 2.25 2.25 0 012.118 2.47c.394.813.023 1.733-.828 2.336a3 3 0 00-1.128 5.78 2.25 2.25 0 01-2.118 2.47 2.25 2.25 0 01-2.118-2.47 3 3 0 001.128-5.78z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12.378 1.602a.75.75 0 00-.75-.75h-4.5a.75.75 0 00-.75.75v4.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-4.5z" 
    />
  </svg>
);