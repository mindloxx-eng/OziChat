import React from 'react';
import { AppState } from '../UserApp';
import SettingsHeader from './settings/SettingsHeader';
import SettingsListItem from './settings/SettingsListItem';
import { UserIcon } from './icons/UserIcon';
import { KeyIcon } from './icons/KeyIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import { BellIcon } from './icons/BellIcon';
import { CircleStackIcon } from './icons/CircleStackIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { StarIcon } from './icons/StarIcon';
import { OzichatLogo } from './icons/NestfingerLogo';

interface SettingsScreenProps {
  onBack: () => void;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onNavigateToStarredMessages: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, setAppState, onNavigateToStarredMessages }) => {
  const user = {
    name: localStorage.getItem('ozichat_display_name') || 'User',
    status: localStorage.getItem('ozichat_status_message') || 'Available',
    avatarUrl: localStorage.getItem('ozichat_profile_picture'),
  };

  const menuItems = [
    { icon: UserIcon, label: 'Account', description: 'Privacy, security, change number', action: () => setAppState('settings-account') },
    { icon: PaintBrushIcon, label: 'Appearance', description: 'Theme, wallpapers, chat settings', action: () => setAppState('settings-appearance') },
    { icon: BellIcon, label: 'Notifications', description: 'Message, group & call tones', action: () => setAppState('settings-notifications') },
    { icon: CircleStackIcon, label: 'Data and storage', description: 'Network usage, auto-download', action: () => setAppState('settings-data') },
    { icon: StarIcon, label: 'Starred messages', description: 'View your starred messages', action: onNavigateToStarredMessages },
    { icon: QuestionMarkCircleIcon, label: 'Help', description: 'Help center, contact us, privacy policy', action: () => setAppState('settings-help') },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
      <SettingsHeader title="Settings" onBack={onBack} />
      
      <main className="flex-1 overflow-y-auto pb-4">
        <div 
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-[#2a2a46] transition-colors"
            onClick={() => setAppState('profile')}
        >
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10 text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-xl">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{user.status}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700">
            {menuItems.map((item, index) => (
                <SettingsListItem
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    description={item.description}
                    onClick={item.action}
                    hasChevron
                />
            ))}
        </div>
        
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <p className="font-semibold text-xs uppercase tracking-widest">from</p>
            <OzichatLogo className="w-32 mx-auto mt-2 opacity-60" />
        </div>
      </main>
    </div>
  );
};

export default SettingsScreen;