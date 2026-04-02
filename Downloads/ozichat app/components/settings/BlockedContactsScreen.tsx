
import React from 'react';
import SettingsHeader from './SettingsHeader';
import { Contact } from '../../types';
import { TrashIcon } from '../icons/TrashIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';

interface BlockedContactsScreenProps {
  onBack: () => void;
  contacts: Contact[];
  onUpdateContacts: (contacts: Contact[]) => void;
}

const BlockedContactsScreen: React.FC<BlockedContactsScreenProps> = ({ onBack, contacts, onUpdateContacts }) => {
  const blockedContacts = contacts.filter(c => c.isBlocked);

  const handleUnblock = (id: string) => {
    const updated = contacts.map(c => c.id === id ? { ...c, isBlocked: false } : c);
    onUpdateContacts(updated);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B0E14] text-black dark:text-[#F1F5F9] transition-colors duration-300">
      <SettingsHeader title="Blocked Contacts" onBack={onBack} />
      
      <main className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">
            Blocked contacts will no longer be able to call you or send you transmissions. They will not be notified that they are blocked.
        </p>

        {blockedContacts.length > 0 ? (
            <div className="space-y-4">
                {blockedContacts.map(contact => (
                    <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4 min-w-0">
                            <img src={contact.avatarUrl} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                            <div className="min-w-0">
                                <h3 className="font-bold text-base truncate">{contact.name}</h3>
                                <p className="text-[10px] text-gray-400 font-mono">{contact.phone}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleUnblock(contact.id)}
                            className="px-4 py-2 bg-[#3F9BFF]/10 text-[#3F9BFF] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#3F9BFF] hover:text-white transition-all"
                        >
                            Unblock
                        </button>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center pt-20 text-center opacity-40">
                <ShieldCheckIcon className="w-16 h-16 mb-4" />
                <p className="text-lg font-bold">No Blocked Contacts</p>
                <p className="text-xs uppercase tracking-widest mt-1">Your blacklist is currently empty</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default BlockedContactsScreen;
