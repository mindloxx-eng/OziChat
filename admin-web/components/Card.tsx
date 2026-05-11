import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  padded?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle, action, padded = true }) => {
  return (
    <div
      className={`relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div>
            {title && <h3 className="text-[15px] font-bold tracking-tight">{title}</h3>}
            {subtitle && <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </div>
  );
};

export default Card;
