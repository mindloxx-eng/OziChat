import React from 'react';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';

interface SettingsListItemProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  description?: string;
  onClick: () => void;
  hasChevron?: boolean;
  actionSlot?: React.ReactNode;
}

const SettingsListItem: React.FC<SettingsListItemProps> = ({ icon: Icon, label, description, onClick, hasChevron, actionSlot }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center text-left gap-6 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-[#2a2a46] transition-colors"
    >
      <div className="text-gray-500 dark:text-gray-400">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-normal text-base text-black dark:text-white">{label}</h3>
        {description && <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{description}</p>}
      </div>
      {actionSlot}
      {hasChevron && <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
    </button>
  );
};

export default SettingsListItem;