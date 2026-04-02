
import React from 'react';
import SettingsHeader from './SettingsHeader';
import SettingsListItem from './SettingsListItem';
import { LockClosedIcon } from '../icons/LockClosedIcon';
import { KeyIcon } from '../icons/KeyIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { AppSettings } from '../../types';
import { AppState } from '../../UserApp';

interface AccountSettingsProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onDeleteAccount: () => void;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onBack, settings, onUpdateSettings, onDeleteAccount, setAppState }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B0E14] text-black dark:text-[#F1F5F9] transition-colors duration-300">
      <SettingsHeader title="Account" onBack={onBack} />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-1 bg-gray-50 dark:bg-[#111827] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm">
            <SettingsListItem
                icon={LockClosedIcon}
                label="Privacy"
                description="Visibility, receipts, and blacklists"
                onClick={() => setAppState('settings-privacy')}
                hasChevron
            />
            <SettingsListItem
                icon={ShieldCheckIcon}
                label="Security"
                description="Encryption details and notifications"
                onClick={() => setAppState('settings-security')}
                hasChevron
            />
             <SettingsListItem
                icon={KeyIcon}
                label="Two-step verification"
                description={settings.twoFactorAuthentication ? "Active" : "Add an extra layer of protection"}
                onClick={() => setAppState('settings-two-step')}
                hasChevron
            />
        </div>
        
        <div className="mt-8">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Identity Hub</h3>
            <div className="bg-gray-50 dark:bg-[#111827] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm">
                 <SettingsListItem
                    icon={TrashIcon}
                    label="Delete my account"
                    description="Permanently erase all identity data"
                    onClick={() => setAppState('settings-delete-account')}
                    hasChevron
                />
            </div>
        </div>

        <div className="mt-12 text-center">
            <p className="text-[9px] text-gray-400 dark:text-slate-600 font-black uppercase tracking-[0.4em] leading-relaxed">
                Identity verified by Ozi Private Ledger.<br/>Transactions are cryptographically signed.
            </p>
        </div>
      </main>
    </div>
  );
};

export default AccountSettings;
