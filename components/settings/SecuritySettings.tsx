
import React from 'react';
import SettingsHeader from './SettingsHeader';
import SettingsListItem from './SettingsListItem';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { BellIcon } from '../icons/BellIcon';
import { KeyIcon } from '../icons/KeyIcon';
import { AppSettings } from '../../types';

interface SecuritySettingsProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onBack, settings, onUpdateSettings }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B0E14] text-black dark:text-[#F1F5F9] transition-colors duration-300">
      <SettingsHeader title="Security" onBack={onBack} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#3F9BFF]/10 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 border border-[#3F9BFF] rounded-full animate-ping opacity-20"></div>
                <ShieldCheckIcon className="w-12 h-12 text-[#3F9BFF]" />
            </div>
            <h2 className="text-xl font-black mb-4 uppercase tracking-tighter">Your transmissions are secure</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed max-w-xs">
                Ozichat protects your privacy with end-to-end encryption. Your messages, calls, and updates stay between you and the people you choose. Not even Ozichat can read or listen to them.
            </p>
        </div>

        <div className="p-6">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Encryption Management</h3>
            <div className="bg-gray-50 dark:bg-[#111827] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5">
                <SettingsListItem
                    icon={BellIcon}
                    label="Security notifications"
                    description="Get notified when security codes change for a contact's phone."
                    onClick={() => onUpdateSettings({ securityNotifications: !settings.securityNotifications })}
                    actionSlot={
                        <button
                            role="switch"
                            aria-checked={settings.securityNotifications}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${settings.securityNotifications ? 'bg-[#3F9BFF]' : 'bg-gray-400 dark:bg-gray-600'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${settings.securityNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    }
                />
            </div>

            <div className="mt-8">
                <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Advanced Keys</h3>
                <div className="bg-gray-50 dark:bg-[#111827] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5">
                    <SettingsListItem
                        icon={KeyIcon}
                        label="Identity Verification"
                        description="View and verify unique security strings"
                        onClick={() => alert('Unique Ozi Identity Key: OZ-9283-XK92-PL12-B091')}
                        hasChevron
                    />
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default SecuritySettings;
