
import React from 'react';

export const EphemeralIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    {...props}
  >
    {/* Central Moment Dot */}
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    
    {/* Segmented Story Ring */}
    <path
      strokeLinecap="round"
      d="M12 4.5c4.142 0 7.5 3.358 7.5 7.5"
      className="opacity-100"
    />
    <path
      strokeLinecap="round"
      d="M19.5 12c0 4.142-3.358 7.5-7.5 7.5"
      className="opacity-70"
    />
    <path
      strokeLinecap="round"
      d="M12 19.5c-4.142 0-7.5-3.358-7.5-7.5"
      className="opacity-40"
    />
    <path
      strokeLinecap="round"
      d="M4.5 12c0-4.142 3.358-7.5 7.5-7.5"
      className="opacity-20"
    />

    {/* Outer Orbiting Moments */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2v2M12 20v2M2 12h2M20 12h2"
      className="opacity-50"
    />
  </svg>
);
