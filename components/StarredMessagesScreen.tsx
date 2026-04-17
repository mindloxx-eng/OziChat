
import React from 'react';
import SettingsHeader from './settings/SettingsHeader';
import { StarIcon } from './icons/StarIcon';

interface StarredMessagesScreenProps {
  onBack: () => void;
}

const StarredMessagesScreen: React.FC<StarredMessagesScreenProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
      <SettingsHeader title="Starred Messages" onBack={onBack} />
      
      <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 flex items-center justify-center bg-gray-200 dark:bg-[#2a2a46] rounded-full mb-6">
            <StarIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No Starred Messages</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs">
          Tap and hold on any message in a chat to star it, so you can easily find it later.
        </p>
      </main>
    </div>
  );
};

export default StarredMessagesScreen;