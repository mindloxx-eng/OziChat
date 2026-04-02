
import React, { useState } from 'react';
import SettingsHeader from './SettingsHeader';
import SettingsListItem from './SettingsListItem';
import { LockClosedIcon } from '../icons/LockClosedIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { AppSettings, PrivacySetting } from '../../types';
import { AppState } from '../../UserApp';

interface PrivacySettingsProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const PrivacyModal: React.FC<{
    title: string;
    currentValue: PrivacySetting;
    onSave: (value: PrivacySetting) => void;
    onClose: () => void;
}> = ({ title, currentValue, onSave, onClose }) => {
    const [selectedValue, setSelectedValue] = useState<PrivacySetting>(currentValue);
    const options: { value: PrivacySetting, label: string }[] = [
        { value: 'everyone', label: 'Everyone' },
        { value: 'myContacts', label: 'My Contacts' },
        { value: 'nobody', label: 'Nobody' },
    ];
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C1C2E] rounded-[2rem] p-8 w-80 shadow-2xl border border-white/5" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-black mb-6 text-black dark:text-white uppercase tracking-tighter">{title}</h3>
                <div className="space-y-3">
                    {options.map(option => (
                        <label key={option.value} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${selectedValue === option.value ? 'bg-[#3F9BFF]/10 border-[#3F9BFF] text-[#3F9BFF]' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-700 dark:text-gray-300'}`}>
                            <span className="text-base font-bold">{option.label}</span>
                            <input
                                type="radio"
                                name="privacy-option"
                                value={option.value}
                                checked={selectedValue === option.value}
                                onChange={() => setSelectedValue(option.value)}
                                className="hidden"
                            />
                            {selectedValue === option.value && <div className="w-2 h-2 rounded-full bg-[#3F9BFF] shadow-[0_0_8px_#3F9BFF]"></div>}
                        </label>
                    ))}
                </div>
                 <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl text-gray-500 font-bold uppercase text-xs">Cancel</button>
                    <button onClick={() => { onSave(selectedValue); onClose(); }} className="px-6 py-2 rounded-xl bg-[#3F9BFF] text-white font-bold uppercase text-xs shadow-lg shadow-blue-500/20">Save</button>
                </div>
            </div>
        </div>
    );
};

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ onBack, settings, onUpdateSettings, setAppState }) => {
  const [modal, setModal] = useState<'lastSeen' | 'profilePhoto' | 'groupAdd' | 'status' | null>(null);

  const privacySettingLabels: Record<PrivacySetting, string> = {
    everyone: "Everyone",
    myContacts: "My Contacts",
    nobody: "Nobody",
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B0E14] text-black dark:text-[#F1F5F9] transition-colors duration-300">
      {modal === 'lastSeen' && 
        <PrivacyModal 
            title="Last Seen"
            currentValue={settings.lastSeen}
            onSave={(value) => onUpdateSettings({ lastSeen: value })}
            onClose={() => setModal(null)}
        />
      }
      {modal === 'profilePhoto' && 
        <PrivacyModal 
            title="Profile Photo"
            currentValue={settings.profilePhoto}
            onSave={(value) => onUpdateSettings({ profilePhoto: value })}
            onClose={() => setModal(null)}
        />
      }
      {modal === 'groupAdd' && 
        <PrivacyModal 
            title="Who can add me to groups"
            currentValue={settings.groupAddPrivacy}
            onSave={(value) => onUpdateSettings({ groupAddPrivacy: value })}
            onClose={() => setModal(null)}
        />
      }

      <SettingsHeader title="Privacy" onBack={onBack} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Visibility Protocols</h3>
            <div className="space-y-1 bg-gray-50 dark:bg-[#111827] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5">
                <SettingsListItem
                    icon={ClockIcon}
                    label="Last seen & online"
                    description={privacySettingLabels[settings.lastSeen]}
                    onClick={() => setModal('lastSeen')}
                    hasChevron
                />
                <SettingsListItem
                    icon={EyeIcon}
                    label="Profile photo"
                    description={privacySettingLabels[settings.profilePhoto]}
                    onClick={() => setModal('profilePhoto')}
                    hasChevron
                />
                <SettingsListItem
                    icon={UsersIcon}
                    label="Groups"
                    description={privacySettingLabels[settings.groupAddPrivacy || 'everyone']}
                    onClick={() => setModal('groupAdd')}
                    hasChevron
                />
            </div>

            <div className="mt-8">
                <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Messaging Security</h3>
                <div className="bg-gray-50 dark:bg-[#111827] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5">
                    <SettingsListItem
                        icon={LockClosedIcon}
                        label="Read receipts"
                        description="Viewed status indicators for sent transmissions"
                        onClick={() => onUpdateSettings({ readReceipts: !settings.readReceipts })}
                        actionSlot={
                            <button
                                role="switch"
                                aria-checked={settings.readReceipts}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${settings.readReceipts ? 'bg-[#3F9BFF]' : 'bg-gray-400 dark:bg-gray-600'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${settings.readReceipts ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        }
                    />
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Blacklist Management</h3>
                <div className="bg-gray-50 dark:bg-[#111827] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5">
                    <SettingsListItem
                        icon={LockClosedIcon}
                        label="Blocked contacts"
                        description="Manage restricted identities"
                        onClick={() => setAppState('settings-blocked-contacts')}
                        hasChevron
                    />
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacySettings;
