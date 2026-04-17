import React, { useState } from 'react';
import SettingsHeader from './SettingsHeader';
import SettingsListItem from './SettingsListItem';
import { AppSettings, VibrationPattern } from '../../types';
import { BellIcon } from '../icons/BellIcon';
import { MusicalNoteIcon } from '../icons/MusicalNoteIcon';
import { VibrationIcon } from '../icons/VibrationIcon';

interface NotificationsSettingsProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const SelectionModal: React.FC<{
    title: string;
    options: string[];
    currentValue: string;
    onSave: (value: any) => void;
    onClose: () => void;
}> = ({ title, options, currentValue, onSave, onClose }) => {
    const [selectedValue, setSelectedValue] = useState(currentValue);
    
    return (
        <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#3a3a5c] rounded-2xl p-6 w-80 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4">{title}</h3>
                <div className="space-y-3">
                    {options.map(option => (
                        <label key={option} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10">
                            <input
                                type="radio"
                                name="selection-option"
                                value={option}
                                checked={selectedValue === option}
                                onChange={() => setSelectedValue(option)}
                                className="w-5 h-5 text-[#3F9BFF] bg-gray-100 border-gray-300 focus:ring-[#3F9BFF] dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-base font-medium text-black dark:text-white">{option}</span>
                        </label>
                    ))}
                </div>
                 <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={() => { onSave(selectedValue); onClose(); }} className="px-4 py-2 rounded-lg bg-[#3F9BFF] hover:bg-blue-500 text-white font-semibold transition-colors">OK</button>
                </div>
            </div>
        </div>
    );
};


const NotificationsSettings: React.FC<NotificationsSettingsProps> = ({ onBack, settings, onUpdateSettings }) => {
  const [modal, setModal] = useState<'sound' | 'vibration' | null>(null);

  const soundOptions = ['Default', 'Chime', 'Alert', 'Synth', 'None'];
  const vibrationOptions: VibrationPattern[] = ['Default', 'Short', 'Long', 'Pulse'];
  
  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
      {modal === 'sound' && (
        <SelectionModal
            title="Notification Tone"
            options={soundOptions}
            currentValue={settings.notificationSound}
            onSave={(value) => onUpdateSettings({ notificationSound: value })}
            onClose={() => setModal(null)}
        />
      )}
       {modal === 'vibration' && (
        <SelectionModal
            title="Vibration Pattern"
            options={vibrationOptions}
            currentValue={settings.notificationVibration}
            onSave={(value: VibrationPattern) => onUpdateSettings({ notificationVibration: value })}
            onClose={() => setModal(null)}
        />
      )}

      <SettingsHeader title="Notifications" onBack={onBack} />
      
      <main className="flex-1 overflow-y-auto">
        <SettingsListItem
          icon={BellIcon}
          label="Conversation tones"
          description="Play sounds for incoming and outgoing messages."
          onClick={() => onUpdateSettings({ conversationTones: !settings.conversationTones })}
          actionSlot={
            <button
                role="switch"
                aria-checked={settings.conversationTones}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#10101b] ${settings.conversationTones ? 'bg-[#3F9BFF]' : 'bg-gray-400 dark:bg-gray-600'}`}
            >
                <span aria-hidden="true" className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.conversationTones ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          }
        />
        
        <div className="p-4 text-sm font-semibold text-[#3F9BFF] dark:text-blue-400 mt-4">MESSAGES</div>
        <SettingsListItem
          icon={MusicalNoteIcon}
          label="Notification tone"
          description={settings.notificationSound}
          onClick={() => setModal('sound')}
          hasChevron
        />
        <SettingsListItem
          icon={VibrationIcon}
          label="Vibrate"
          description={settings.notificationVibration}
          onClick={() => setModal('vibration')}
          hasChevron
        />
      </main>
    </div>
  );
};

export default NotificationsSettings;