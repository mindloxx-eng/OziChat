import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Contact } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { UserIcon } from './icons/UserIcon';
import BottomNavBar, { BottomNavBarProps } from './BottomNavBar';
import { searchUsers, type UserProfile } from '../services/apiService';
import { isAuthenticated } from '../services/tokenService';

interface AllContactsListScreenProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  navProps: BottomNavBarProps;
}

const AllContactsListScreen: React.FC<AllContactsListScreenProps> = ({ contacts, onSelectContact, navProps }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [serverResults, setServerResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced server search
  useEffect(() => {
    if (!isAuthenticated() || !searchQuery.trim() || searchQuery.trim().length < 2) {
      setServerResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchUsers(searchQuery.trim());
        if (res.success && res.data?.content) {
          const localIds = new Set(contacts.map((c) => c.id));
          const newUsers: Contact[] = res.data.content
            .filter((u: UserProfile) => !localIds.has(String(u.id)))
            .map((u: UserProfile) => ({
              id: String(u.id),
              name: u.displayName,
              avatarUrl: u.avatarUrl || `https://picsum.photos/seed/${u.id}/80/80`,
              lastMessage: u.about || '',
              timestamp: '',
              unreadCount: 0,
              status: 'online',
              phone: u.phone || u.email || '',
            }));
          setServerResults(newUsers);
        }
      } catch (err) {
        console.warn('User search failed:', err);
      }
      setIsSearching(false);
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, contacts]);

  const filteredAndSortedContacts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = query
      ? contacts.filter(c => c.name.toLowerCase().includes(query) || c.phone.replace(/\D/g, '').includes(query.replace(/\D/g, '')))
      : contacts;

    // Merge server results when searching
    const all = query && serverResults.length > 0 ? [...filtered, ...serverResults] : filtered;
    return all.sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, searchQuery, serverResults]);

  const groupedContacts = useMemo(() => {
    return filteredAndSortedContacts.reduce((acc, contact) => {
      const firstLetter = contact.name[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(contact);
      return acc;
    }, {} as Record<string, Contact[]>);
  }, [filteredAndSortedContacts]);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1C1C2E] text-black dark:text-white transition-colors duration-300">
      <header className="p-4 flex flex-col gap-4 shrink-0 bg-white dark:bg-[#1C1C2E] z-10 border-b border-gray-100 dark:border-white/5">
        <h1 className="text-2xl font-bold text-center">Contacts</h1>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-[#2a2a46] border border-gray-300 dark:border-gray-600 rounded-full py-2 pl-10 pr-4 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#553699]"
          />
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto pb-4 scrollbar-hide">
        {isSearching && (
          <div className="flex items-center justify-center py-3 gap-2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-gray-500 font-bold">Searching users...</span>
          </div>
        )}
        {Object.keys(groupedContacts).length > 0 ? (
          <div>
            {alphabet.map(letter => (
              groupedContacts[letter] && (
                <div key={letter} id={`section-${letter}`}>
                  <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] px-4 py-2 bg-gray-50/80 dark:bg-[#2a2a46]/80 backdrop-blur-md sticky top-[108px] z-10">{letter}</h2>
                  {groupedContacts[letter].map(contact => (
                    <div 
                      key={contact.id} 
                      className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => onSelectContact(contact)}
                    >
                      <img src={contact.avatarUrl} alt={contact.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">{contact.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{contact.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 pt-20">
            <UserIcon className="w-16 h-16 mx-auto text-gray-500/20" />
            <p className="mt-4 font-bold uppercase tracking-widest text-[10px]">No Contacts Found</p>
            {searchQuery && <p className="text-xs mt-1">Try a different frequency</p>}
          </div>
        )}
      </main>
      <BottomNavBar {...navProps} />
    </div>
  );
};

export default AllContactsListScreen;