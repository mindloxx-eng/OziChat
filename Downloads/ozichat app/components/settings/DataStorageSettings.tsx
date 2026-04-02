
import React, { useState } from 'react';
import SettingsHeader from './SettingsHeader';
import SettingsListItem from './SettingsListItem';
import { AppSettings } from '../../types';
import { CircleStackIcon } from '../icons/CircleStackIcon';
import { WifiIcon } from '../icons/WifiIcon';

interface DataStorageSettingsProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onNavigateToManageStorage: () => void;
}

const MediaAutoDownloadModal: React.FC<{
    title: string;
    config: { photos: boolean; audio: boolean; videos: boolean; documents: boolean };
    onSave: (newConfig: { photos: boolean; audio: boolean; videos: boolean; documents: boolean }) => void;
    onClose: () => void;
}> = ({ title, config, onSave, onClose }) => {
    const [localConfig, setLocalConfig] = useState(config);

    const toggle = (key: keyof typeof config) => {
        setLocalConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#3a3a5c] rounded-2xl p-6 w-80 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">{title}</h3>
                <div className="space-y-4">
                    {(Object.keys(localConfig) as Array<keyof typeof config>).map(key => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-base font-medium text-black dark:text-white capitalize">{key}</span>
                            <button
                                role="switch"
                                aria-checked={localConfig[key]}
                                onClick={() => toggle(key)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#10101b] ${localConfig[key] ? 'bg-[#3F9BFF]' : 'bg-gray-400 dark:bg-gray-600'}`}
                            >
                                <span aria-hidden="true" className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${localConfig[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={() => { onSave(localConfig); onClose(); }} className="px-4 py-2 rounded-lg bg-[#3F9BFF] hover:bg-blue-500 text-white font-semibold transition-colors">Save</button>
                </div>
            </div>
        </div>
    );
};

const DataStorageSettings: React.FC<DataStorageSettingsProps> = ({ onBack, settings, onUpdateSettings, onNavigateToManageStorage }) => {
  const [activeModal, setActiveModal] = useState<'mobile' | 'wifi' | null>(null);

  const getAutoDownloadDescription = (config: AppSettings['autoDownloadMobile']) => {
    const enabled = Object.entries(config)
      .filter(([, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));
    if (enabled.length === 0) return 'No media';
    if (enabled.length === 4) return 'All media';
    return enabled.join(', ');
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
      {activeModal === 'mobile' && (
          <MediaAutoDownloadModal 
            title="When using mobile data"
            config={settings.autoDownloadMobile}
            onSave={(newConfig) => onUpdateSettings({ autoDownloadMobile: newConfig })}
            onClose={() => setActiveModal(null)}
          />
      )}
      {activeModal === 'wifi' && (
          <MediaAutoDownloadModal 
            title="When connected on Wi-Fi"
            config={settings.autoDownloadWifi}
            onSave={(newConfig) => onUpdateSettings({ autoDownloadWifi: newConfig })}
            onClose={() => setActiveModal(null)}
          />
      )}

      <SettingsHeader title="Data and Storage" onBack={onBack} />
      
      <main className="flex-1 overflow-y-auto">
        <SettingsListItem
          icon={CircleStackIcon}
          label="Manage storage"
          description="See how much storage Ozichat is using."
          onClick={onNavigateToManageStorage}
          hasChevron
        />
        
        <div className="p-4 text-sm font-semibold text-[#3F9BFF] dark:text-blue-400 mt-4">
            MEDIA AUTO-DOWNLOAD
            <p className="font-normal text-xs mt-1 text-gray-500 dark:text-gray-400">Voice messages are always automatically downloaded.</p>
        </div>
         <SettingsListItem
          icon={CircleStackIcon}
          label="When using mobile data"
          description={getAutoDownloadDescription(settings.autoDownloadMobile)}
          onClick={() => setActiveModal('mobile')}
          hasChevron
        />
        <SettingsListItem
          icon={CircleStackIcon}
          label="When connected on Wi-Fi"
          description={getAutoDownloadDescription(settings.autoDownloadWifi)}
          onClick={() => setActiveModal('wifi')}
          hasChevron
        />

        <div className="p-4 text-sm font-semibold text-[#3F9BFF] dark:text-blue-400 mt-4">CALL SETTINGS</div>
         <SettingsListItem
            icon={WifiIcon}
            label="Use less data for calls"
            description="Reduces data usage during Ozichat calls."
            onClick={() => onUpdateSettings({ useLessDataForCalls: !settings.useLessDataForCalls })}
            actionSlot={
                <button
                    role="switch"
                    aria-checked={settings.useLessDataForCalls}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#10101b] ${settings.useLessDataForCalls ? 'bg-[#3F9BFF]' : 'bg-gray-400 dark:bg-gray-600'}`}
                >
                    <span aria-hidden="true" className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.useLessDataForCalls ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            }
        />
      </main>
    </div>
  );
};

export default DataStorageSettings;
