
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { ChatListItem, Contact, Group } from '../types';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { SearchIcon } from './icons/SearchIcon';
import BottomNavBar, { BottomNavBarProps } from './BottomNavBar';
import { CogIcon } from './icons/CogIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { StoreIcon } from './icons/StoreIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { AIAssistantIcon } from './icons/AIAssistantIcon';
import { UserIcon } from './icons/UserIcon';
import { BlockIcon } from './icons/BlockIcon';
import { LogoIcon } from './icons/LogoIcon';
import { OzichatLogo } from './icons/NestfingerLogo';

interface ContactsScreenProps {
  chatList: ChatListItem[];
  onSelectChat: (chat: ChatListItem) => void;
  onNavigateToProfile: () => void;
  onNavigateToAddContact: () => void;
  onNavigateToCreateGroup: () => void;
  onNavigateToSettings: () => void;
  onNavigateToMarketplace: () => void;
  onNavigateToAllContacts: () => void;
  onNavigateToAI: () => void;
  navProps: BottomNavBarProps;
}

const ContactItem = React.memo<{ item: ChatListItem; onClick: (item: ChatListItem) => void }>(({ item, onClick }) => {
    const isBlocked = 'isBlocked' in item && item.isBlocked;
    
    return (
        <div 
            onClick={() => onClick(item)}
            className={`flex items-center gap-4 p-4 rounded-[1.2rem] cursor-pointer transition-all active:scale-[0.98] mb-1 hover:bg-gray-100/50 dark:hover:bg-white/5 ${isBlocked ? 'opacity-60 grayscale-[0.5]' : ''}`}
        >
            <div className="relative flex-shrink-0">
                <img src={item.avatarUrl} alt={item.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-transparent dark:border-white/10" />
                {item.unreadCount > 0 && !isBlocked && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white dark:border-[#0B0E14]"></div>
                )}
                {isBlocked && (
                    <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-white dark:border-[#0B0E14] shadow-sm">
                        <BlockIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                )}
            </div>
            <div className="flex-1 pb-1">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-lg tracking-tight dark:text-[#F1F5F9]">{item.name}</h2>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${item.unreadCount > 0 && !isBlocked ? 'text-indigo-500' : 'text-gray-400 dark:text-slate-500'}`}>
                        {item.timestamp}
                    </p>
                </div>
                <div className="flex justify-between items-start mt-0.5">
                    <p className="text-sm truncate max-w-[200px] text-gray-500 dark:text-slate-400">
                        {isBlocked ? 'Link restricted' : item.lastMessage}
                    </p>
                    {item.unreadCount > 0 && !isBlocked && (
                        <span className="bg-indigo-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-lg shadow-md">
                            {item.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
});

const ContactsScreen: React.FC<ContactsScreenProps> = ({ chatList, onSelectChat, onNavigateToProfile, onNavigateToAddContact, onNavigateToCreateGroup, onNavigateToSettings, onNavigateToMarketplace, onNavigateToAllContacts, onNavigateToAI, navProps }) => {
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Your Name');
  const [userStatus, setUserStatus] = useState<string>('Available');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProfileData = () => {
      setUserAvatar(localStorage.getItem('ozichat_profile_picture'));
      setUserName(localStorage.getItem('ozichat_display_name') || 'Your Name');
      setUserStatus(localStorage.getItem('ozichat_status_message') || 'Available');
    };
    loadProfileData();
    window.addEventListener('storage', loadProfileData);
    return () => window.removeEventListener('storage', loadProfileData);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const filteredChatList = useMemo(() => {
    if (!searchQuery.trim()) return chatList;
    return chatList.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ('lastMessage' in chat && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [chatList, searchQuery]);

  const menuItems = [
    { label: 'New Group', icon: UserGroupIcon, action: onNavigateToCreateGroup },
    { label: 'New Contact', icon: PencilSquareIcon, action: onNavigateToAddContact },
    { label: 'All Contacts', icon: UsersIcon, action: onNavigateToAllContacts },
    { label: 'Settings', icon: CogIcon, action: onNavigateToSettings },
  ];

  const UserAvatar = () => (
    <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border transition-all hover:scale-105 shadow-md bg-gray-200 dark:bg-slate-800 border-gray-100 dark:border-white/10`}>
      {userAvatar ? (
        <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
      ) : (
        <UserIcon className="w-6 h-6 text-gray-500 dark:text-slate-400" />
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B0E14] text-black dark:text-[#F1F5F9] transition-colors duration-300">
        <style>{`
            @keyframes fade-in-up-fast {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up-fast { animation: fade-in-up-fast 0.2s ease-out forwards; }
        `}</style>
      
      <header className={`p-4 pt-6 flex flex-col gap-5 sticky top-0 backdrop-blur-xl z-20 transition-all duration-300 shadow-md dark:shadow-none border-b bg-white/95 dark:bg-[#111827]/90 border-gray-100 dark:border-white/5`}>
        <div className="flex items-center justify-between">
            <button onClick={onNavigateToMarketplace} className="text-gray-600 dark:text-slate-300 p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90 border border-gray-100 dark:border-white/5">
                <StoreIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
                <LogoIcon className="w-8 h-8" step={2} />
                <OzichatLogo className="h-8 w-auto" />
            </div>
            <div className="flex items-center gap-2">
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(prev => !prev)} className="focus:outline-none rounded-xl">
                        <UserAvatar />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-full mt-3 right-0 w-72 bg-white dark:bg-[#1F2937] rounded-3xl shadow-2xl p-3 z-30 border border-gray-100 dark:border-white/10 animate-fade-in-up-fast flex flex-col origin-top-right backdrop-blur-3xl">
                            <div 
                                className="p-4 rounded-2xl mb-2 flex items-center gap-3 cursor-pointer transition-all border border-transparent active:scale-[0.98] bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
                                onClick={() => {
                                    onNavigateToProfile();
                                    setIsMenuOpen(false);
                                }}
                            >
                                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border shadow-sm border-white dark:border-white/10">
                                    {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt="User"/> : <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-slate-700"><UserIcon className="w-6 h-6 text-gray-500 dark:text-slate-400"/></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-lg leading-tight truncate text-black dark:text-[#F1F5F9]">{userName}</h3>
                                    <p className="text-xs truncate font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400">
                                        {userStatus}
                                    </p>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="space-y-1">
                                {menuItems.map((item, index) => {
                                   const Icon = item.icon;
                                   return (
                                     <button
                                       key={index}
                                       onClick={() => {
                                         item.action();
                                         setIsMenuOpen(false);
                                       }}
                                       className="w-full flex items-center gap-4 text-left p-3 rounded-2xl text-black dark:text-[#F1F5F9] hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95 group"
                                     >
                                       <div className="p-2.5 bg-gray-100 dark:bg-slate-700 rounded-xl group-hover:bg-indigo-500/10 transition-colors shadow-sm">
                                          <Icon className="w-5 h-5 text-indigo-500" />
                                       </div>
                                       <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                     </button>
                                   );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Real-time search bar */}
        <div className="relative group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
            <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search encrypted transmissions..."
                className="w-full bg-gray-50 dark:bg-black/20 border-none rounded-2xl pl-12 pr-6 py-3.5 text-sm font-bold text-black dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-gray-400"
            />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-20 mt-4 custom-scrollbar">
        <div 
            onClick={onNavigateToAI}
            className="flex items-center gap-4 p-5 mb-6 rounded-[1.8rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/5 hover:scale-[1.01] transition-all group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-indigo-900 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                <AIAssistantIcon className="w-8 h-8" />
            </div>
            <div className="flex-1 relative z-10">
                <div className="flex justify-between items-center">
                    <h2 className="font-black text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Ozi AI</h2>
                    <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-indigo-600 text-white shadow-md">ONLINE</span>
                </div>
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Transmissions Summary & Mapping Engine</p>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </div>

        {filteredChatList.length > 0 ? (
            <div className="flex flex-col">
                {filteredChatList.map(item => (
                    <ContactItem key={item.id} item={item} onClick={onSelectChat} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-slate-600 pt-20 animate-fade-in">
                <SearchIcon className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-[10px]">
                    {searchQuery ? 'No results found for your query' : 'No Active Transmissions'}
                </p>
            </div>
        )}
      </main>

      <div className="text-center text-gray-400 dark:text-slate-600 text-[9px] font-black uppercase tracking-[0.4em] pb-2 absolute bottom-20 left-0 right-0 z-0 opacity-40 pointer-events-none">
        End-to-End Encryption
      </div>

      <BottomNavBar {...navProps} />
    </div>
  );
};

export default ContactsScreen;
