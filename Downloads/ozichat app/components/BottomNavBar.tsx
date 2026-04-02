import React from 'react';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { MapIcon } from './icons/MapIcon';
import { NestfingerIcon } from './icons/NestfingerIcon';
import { EphemeralIcon } from './icons/EphemeralIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';

export interface BottomNavBarProps {
  activeScreen: 'chats' | 'calls' | 'map' | 'all-contacts' | 'ephemeral' | 'ai-assistant' | 'channels';
  onNavigateToChats: () => void;
  onNavigateToCalls: () => void;
  onNavigateToMap: () => void;
  onNavigateToAllContacts: () => void;
  onNavigateToEphemeral?: () => void;
  onNavigateToAI: () => void;
  onNavigateToChannels: () => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ 
  activeScreen, 
  onNavigateToChats, 
  onNavigateToCalls, 
  onNavigateToMap, 
  onNavigateToEphemeral, 
  onNavigateToChannels 
}) => {
  const navItems = [
    { id: 'chats', label: 'Chat', icon: ChatBubbleIcon, action: onNavigateToChats },
    { id: 'calls', label: 'Calls', icon: PhoneIcon, action: onNavigateToCalls },
    { id: 'channels', label: 'Channels', icon: GlobeAltIcon, action: onNavigateToChannels },
    { id: 'ephemeral', label: 'Updates', icon: EphemeralIcon, action: onNavigateToEphemeral },
    { id: 'map', label: 'Map', icon: MapIcon, action: onNavigateToMap },
  ];

  return (
    <footer className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-[#111827]/90 backdrop-blur-2xl border-t border-gray-100 dark:border-white/5 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] transition-colors duration-300">
      <nav className="flex justify-around items-center h-20 px-2 pb-4">
        {navItems.map(item => {
          const isActive = activeScreen === item.id;
          const Icon = item.icon;
          return (
            <button 
                key={item.id}
                onClick={item.action}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative group active:scale-90 ${isActive ? 'text-indigo-500' : 'text-gray-400 dark:text-slate-500 hover:text-indigo-500'}`}
            >
              {isActive && (
                  <div className="absolute top-0 w-8 h-1 bg-indigo-500 rounded-b-full shadow-[0_4px_12px_rgba(99,102,241,0.4)] animate-fade-in"></div>
              )}
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                <Icon className={`w-6 h-6 md:w-7 md:h-7 ${isActive ? 'drop-shadow-[0_0_6px_rgba(99,102,241,0.3)]' : ''}`} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest mt-1 transition-all ${isActive ? 'opacity-100 translate-y-0' : 'opacity-50'}`}>{item.label}</span>
            </button>
          );
        })}

        <a 
          href="https://www.nestfinger.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center justify-center flex-1 h-full transition-all hover:brightness-110 active:scale-95 group"
          aria-label="Visit Nestfinger"
        >
          <div className="p-1 rounded-xl bg-transparent group-hover:bg-white/5 transition-all">
            <NestfingerIcon className="w-12 h-auto" />
          </div>
          <span className="text-[8px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-tighter -mt-1 group-hover:text-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity">Portal</span>
        </a>
      </nav>
    </footer>
  );
};

export default BottomNavBar;