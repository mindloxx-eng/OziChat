
import React from 'react';
import SettingsHeader from './SettingsHeader';
import { OzichatLogo } from '../icons/NestfingerLogo';

interface AppInfoScreenProps {
  onBack: () => void;
}

const AppInfoScreen: React.FC<AppInfoScreenProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
      <SettingsHeader title="App Info" onBack={onBack} />
      <main className="flex-1 overflow-y-auto flex flex-col items-center p-8">
        <div className="mt-10 mb-6 bg-white/5 p-6 rounded-3xl">
            <OzichatLogo className="w-48 h-auto" />
        </div>
        
        <h2 className="text-2xl font-bold mb-1">Ozichat</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-mono text-sm">Version 1.0.0 (Build 2024.05.20)</p>
        
        <div className="w-full max-w-sm bg-gray-50 dark:bg-[#2a2a46] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <span className="font-medium">Developer</span>
                <span className="text-gray-600 dark:text-gray-400">Kennyejis LLC</span>
            </div>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <span className="font-medium">Website</span>
                <a href="https://ozichats.com" target="_blank" rel="noreferrer" className="text-[#3F9BFF] hover:underline">ozichats.com</a>
            </div>
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <span className="font-medium">Contact</span>
                <a href="mailto:support@ozichat.com" className="text-[#3F9BFF] hover:underline">support@ozichat.com</a>
            </div>
            <div className="p-4 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => alert("Licenses info coming soon.")}>
                <span className="font-medium">Licenses</span>
                <span className="text-gray-400 text-xl">›</span>
            </div>
        </div>

        <p className="mt-auto text-xs text-gray-400 text-center pb-4">
            © 2024 Ozichat Inc. All rights reserved.
        </p>
      </main>
    </div>
  );
};

export default AppInfoScreen;
