
import React, { useState, useRef } from 'react';
import type { Contact, Group } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CameraIcon } from './icons/CameraIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SearchIcon } from './icons/SearchIcon';

interface CreateGroupScreenProps {
  contacts: Contact[];
  onBack: () => void;
  onSaveGroup: (groupData: Omit<Group, 'id' | 'lastMessage' | 'timestamp' | 'unreadCount'>) => void;
}

const CreateGroupScreen: React.FC<CreateGroupScreenProps> = ({ contacts, onBack, onSaveGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleContactSelection = (contactId: string) => {
    setSelectedContactIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSaveDisabled = !groupName.trim() || selectedContactIds.size === 0;

  const handleSave = () => {
    if (isSaveDisabled) return;
    onSaveGroup({
      name: groupName.trim(),
      members: Array.from(selectedContactIds),
      avatarUrl: avatarSrc || '',
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarSrc(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1C1C2E] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1C1C2E] shadow-md z-10">
        <button onClick={onBack} className="text-white p-2 rounded-full hover:bg-white/10"><ChevronLeftIcon /></button>
        <h2 className="text-xl font-bold text-white">New Group</h2>
        <button 
          onClick={handleSave} 
          disabled={isSaveDisabled}
          className={`font-semibold transition-colors ${isSaveDisabled ? 'text-gray-500' : 'text-[#3F9BFF] hover:text-blue-400'}`}
        >
          Create
        </button>
      </header>

      {/* Form Content */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center border-4 border-[#553699]">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Group Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserGroupIcon className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <button 
              onClick={handleAvatarClick} 
              className="absolute bottom-0 right-0 bg-[#3F9BFF] p-2 rounded-full text-white hover:bg-blue-500 transition-colors"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name"
            className="flex-1 bg-transparent border-b-2 border-gray-600 focus:border-[#553699] p-2 text-xl font-semibold focus:outline-none transition-colors"
          />
        </div>

        <div className="relative mb-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input
                type="text"
                placeholder="Search contacts to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#2a2a46] border border-gray-600 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#553699]"
            />
        </div>

        <p className="text-sm text-gray-400 mb-2">Select Members ({selectedContactIds.size})</p>
        <div className="flex-1 overflow-y-auto -mx-4 px-4">
            {filteredContacts.map(contact => {
                const isSelected = selectedContactIds.has(contact.id);
                return (
                    <div 
                        key={contact.id}
                        onClick={() => toggleContactSelection(contact.id)}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#2a2a46] cursor-pointer"
                    >
                        <div className="relative">
                            <img src={contact.avatarUrl} alt={contact.name} className="w-12 h-12 rounded-full" />
                            {isSelected && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#3F9BFF] rounded-full flex items-center justify-center border-2 border-[#1C1C2E]">
                                    <CheckIcon className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        <p className="font-semibold">{contact.name}</p>
                    </div>
                );
            })}
        </div>
      </main>
    </div>
  );
};

export default CreateGroupScreen;
