import React from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';

interface SettingsHeaderProps {
  title: string;
  onBack: () => void;
  actionButton?: React.ReactNode;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, onBack, actionButton }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-[#1C1C2E] shadow-md z-10 transition-colors duration-300">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-black dark:text-white p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <ChevronLeftIcon />
        </button>
        <h2 className="text-xl font-bold text-black dark:text-white">{title}</h2>
      </div>
      {actionButton && <div>{actionButton}</div>}
    </header>
  );
};

export default SettingsHeader;