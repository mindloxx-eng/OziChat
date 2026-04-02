
import React, { useState, useRef } from 'react';
import SettingsHeader from './SettingsHeader';
import SettingsListItem from './SettingsListItem';
import { SunIcon } from '../icons/SunIcon';
import { MoonIcon } from '../icons/MoonIcon';
import { ComputerDesktopIcon } from '../icons/ComputerDesktopIcon';
import { PhotoLibraryIcon } from '../icons/PhotoLibraryIcon';
import { CameraIcon } from '../icons/CameraIcon';
import { AppSettings, Theme, FontSize, Wallpaper } from '../../types';

interface AppearanceSettingsProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const ThemeSelectionModal: React.FC<{
  currentTheme: Theme;
  onSelect: (theme: Theme) => void;
  onClose: () => void;
}> = ({ currentTheme, onSelect, onClose }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const themes: { value: Theme; label: string; icon: React.FC<any> }[] = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System Default', icon: ComputerDesktopIcon },
  ];
  return (
    <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#3a3a5c] rounded-2xl p-6 w-80 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4">Choose Theme</h3>
        <div className="space-y-3">
          {themes.map(theme => (
            <label key={theme.value} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer">
              <input
                type="radio"
                name="theme-option"
                value={theme.value}
                checked={selectedTheme === theme.value}
                onChange={() => setSelectedTheme(theme.value)}
                className="w-5 h-5 text-[#3F9BFF] bg-gray-100 border-gray-300 focus:ring-[#3F9BFF] dark:bg-gray-700 dark:border-gray-600"
              />
               <theme.icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              <span className="text-base font-medium text-black dark:text-white">{theme.label}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
          <button onClick={() => { onSelect(selectedTheme); onClose(); }} className="px-4 py-2 rounded-lg bg-[#3F9BFF] hover:bg-blue-500 text-white font-semibold transition-colors">OK</button>
        </div>
      </div>
    </div>
  );
};

const WallpaperSelectionModal: React.FC<{
  currentWallpaper: Wallpaper;
  onSelect: (wallpaper: Wallpaper) => void;
  onClose: () => void;
}> = ({ currentWallpaper, onSelect, onClose }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const wallpapers: { value: Wallpaper; label: string; thumb: string; }[] = [
        { value: 'default', label: 'Default', thumb: 'https://i.ibb.co/hK2Vb6p/thumb-default.png' },
        { value: 'wallpaper1', label: 'Abstract', thumb: 'https://i.ibb.co/688j2d2/wallpaper1.png' },
        { value: 'wallpaper2', label: 'Gradient', thumb: 'https://i.ibb.co/3kC201y/wallpaper2.png' },
        { value: 'wallpaper3', label: 'Geometric', thumb: 'https://i.ibb.co/qN252s1/wallpaper3.png' },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File is too large. Please select an image under 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result;
                if (typeof result === 'string') {
                    onSelect(result);
                    onClose();
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#3a3a5c] rounded-2xl p-6 w-[90%] max-w-sm shadow-lg flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">Chat Wallpaper</h3>
                <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Upload Option */}
                    <div 
                        onClick={() => fileInputRef.current?.click()} 
                        className="cursor-pointer group flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-500 hover:border-[#3F9BFF] dark:hover:border-[#3F9BFF] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        <CameraIcon className="w-8 h-8 text-gray-400 group-hover:text-[#3F9BFF] transition-colors" />
                        <p className="text-sm mt-2 font-medium text-gray-500 dark:text-gray-400 group-hover:text-[#3F9BFF] dark:group-hover:text-white transition-colors">Upload Photo</p>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    {wallpapers.map(wp => (
                        <div key={wp.value} onClick={() => { onSelect(wp.value); onClose(); }} className="cursor-pointer group">
                            <img src={wp.thumb} alt={wp.label} className={`w-full h-32 object-cover rounded-lg border-4 transition-colors ${currentWallpaper === wp.value ? 'border-[#3F9BFF]' : 'border-transparent group-hover:border-gray-400/50'}`} />
                            <p className="text-center text-sm mt-2 font-medium text-black dark:text-white">{wp.label}</p>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
                </div>
            </div>
        </div>
    );
};


const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ onBack, settings, onUpdateSettings }) => {
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);

  const themeLabel = settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1);

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
      {showThemeModal && <ThemeSelectionModal currentTheme={settings.theme} onSelect={(theme) => onUpdateSettings({ theme })} onClose={() => setShowThemeModal(false)} />}
      {showWallpaperModal && <WallpaperSelectionModal currentWallpaper={settings.wallpaper} onSelect={(wp) => onUpdateSettings({ wallpaper: wp })} onClose={() => setShowWallpaperModal(false)} />}
      
      <SettingsHeader title="Appearance" onBack={onBack} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 text-sm font-semibold text-[#3F9BFF] dark:text-blue-400">DISPLAY</div>
        <SettingsListItem
          icon={settings.theme === 'dark' ? MoonIcon : SunIcon}
          label="Theme"
          description={themeLabel}
          onClick={() => setShowThemeModal(true)}
          hasChevron
        />

        <div className="p-4 text-sm font-semibold text-[#3F9BFF] dark:text-blue-400 mt-4">CHAT SETTINGS</div>
        <SettingsListItem
          icon={PhotoLibraryIcon}
          label="Wallpaper"
          description="Set a background for your chats"
          onClick={() => setShowWallpaperModal(true)}
          hasChevron
        />
        <div className="p-4 space-y-2">
            <label className="block text-sm text-gray-600 dark:text-gray-400">Font size</label>
            <div className="flex items-center gap-4">
                <span className="text-base text-black dark:text-white">A</span>
                <input
                    type="range"
                    min="0"
                    max="2"
                    step="1"
                    value={{ small: 0, medium: 1, large: 2 }[settings.fontSize]}
                    onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        const newSize: FontSize = value === 0 ? 'small' : value === 2 ? 'large' : 'medium';
                        onUpdateSettings({ fontSize: newSize });
                    }}
                    className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#3F9BFF]"
                />
                <span className="text-2xl text-black dark:text-white">A</span>
            </div>
        </div>
      </main>
    </div>
  );
};

export default AppearanceSettings;
