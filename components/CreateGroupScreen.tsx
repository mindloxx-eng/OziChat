
import React, { useState, useRef, useEffect } from 'react';
import type { Contact, Group, ChatListItem } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CameraIcon } from './icons/CameraIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SearchIcon } from './icons/SearchIcon';
import { createGroup, getConversations, getConversationById, uploadMedia } from '../services/apiService';
import { isAuthenticated, getUserId } from '../services/tokenService';

interface CreateGroupScreenProps {
  contacts: Contact[];
  onBack: () => void;
  onSaveGroup: (groupData: Omit<Group, 'id' | 'lastMessage' | 'timestamp' | 'unreadCount'>) => void;
  onGroupCreated?: (chat: ChatListItem) => void;
}

interface ApiUser {
  userId: number;
  displayName: string;
  avatarUrl: string;
}

const CreateGroupScreen: React.FC<CreateGroupScreenProps> = ({ contacts, onBack, onSaveGroup, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API users fetched from conversations
  const [apiUsers, setApiUsers] = useState<ApiUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch real users from conversations API on mount
  useEffect(() => {
    if (!isAuthenticated()) return;
    setIsLoadingUsers(true);
    const myId = getUserId();

    getConversations()
      .then(async (res) => {
        const conversations = res.data || [];
        const directConvs = conversations.filter((c) => c.type === 'DIRECT');

        // Fetch detail for each DIRECT conversation to get userId
        const results = await Promise.allSettled(
          directConvs.map(async (conv) => {
            const detail = await getConversationById(conv.conversationId);
            if (!detail.success || !detail.data.members) return null;
            const other = detail.data.members.find((m) => m.userId !== myId) || detail.data.members[0];
            if (!other) return null;
            return {
              userId: other.userId,
              displayName: conv.displayName || other.displayName,
              avatarUrl: conv.avatarUrl || other.avatarUrl || `https://picsum.photos/seed/${other.userId}/80/80`,
            } as ApiUser;
          })
        );

        const users = results
          .filter((r): r is PromiseFulfilledResult<ApiUser | null> => r.status === 'fulfilled')
          .map((r) => r.value)
          .filter((u): u is ApiUser => u !== null);

        // Deduplicate by userId
        const seen = new Set<number>();
        const unique = users.filter((u) => {
          if (seen.has(u.userId)) return false;
          seen.add(u.userId);
          return true;
        });

        setApiUsers(unique);
        console.log('🟢 Loaded users for group selection:', unique);
      })
      .catch((err) => console.warn('Failed to load users:', err))
      .finally(() => setIsLoadingUsers(false));
  }, []);

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

  // Use API users if available, fallback to local contacts
  const useApiUsers = isAuthenticated() && apiUsers.length > 0;

  const filteredApiUsers = apiUsers.filter((u) =>
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSaveDisabled = !groupName.trim() || selectedContactIds.size === 0;

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaveDisabled || isSaving) return;
    setIsSaving(true);

    if (isAuthenticated()) {
      try {
        const memberIds = Array.from(selectedContactIds).map(Number).filter((n) => !isNaN(n));
        const res = await createGroup({
          groupName: groupName.trim(),
          groupDescription: '',
          groupAvatarUrl: s3AvatarUrl || undefined,
          memberIds,
        });
        console.log('🟢 Group created on server:', res.data);

        if (res.success && res.data && onGroupCreated) {
          // Navigate directly to the new group chat using server data
          const g = res.data;
          const groupChat: Group = {
            id: String(g.conversationId),
            name: g.groupName,
            avatarUrl: g.groupAvatarUrl || avatarSrc || `https://picsum.photos/seed/g${g.conversationId}/80/80`,
            members: (g.members || []).map((m) => String(m.userId)),
            lastMessage: 'Group created. Say hi!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unreadCount: 0,
          };
          onGroupCreated(groupChat);
          setIsSaving(false);
          return;
        }
      } catch (err) {
        console.warn('Server group creation failed (saving locally):', err);
      }
    }

    // Fallback: save locally
    onSaveGroup({
      name: groupName.trim(),
      members: Array.from(selectedContactIds),
      avatarUrl: avatarSrc || '',
    });
    setIsSaving(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const [s3AvatarUrl, setS3AvatarUrl] = useState<string | undefined>();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => setAvatarSrc(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload to S3 for server use
      if (isAuthenticated()) {
        try {
          const res = await uploadMedia(file, 'group');
          if (res.success && res.data?.url) {
            setS3AvatarUrl(res.data.url);
            console.log('🟢 Group avatar uploaded:', res.data.url);
          }
        } catch (err) {
          console.warn('Group avatar S3 upload failed:', err);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1C1C2E] text-white">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between p-4 bg-[#1C1C2E] shadow-md z-10">
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
            {isLoadingUsers && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#3F9BFF] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-sm text-gray-400">Loading users...</span>
              </div>
            )}

            {/* API users from conversations */}
            {useApiUsers && !isLoadingUsers && filteredApiUsers.map(user => {
                const idStr = String(user.userId);
                const isSelected = selectedContactIds.has(idStr);
                return (
                    <div
                        key={idStr}
                        onClick={() => toggleContactSelection(idStr)}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#2a2a46] cursor-pointer"
                    >
                        <div className="relative">
                            <img src={user.avatarUrl} alt={user.displayName} className="w-12 h-12 rounded-full object-cover" />
                            {isSelected && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#3F9BFF] rounded-full flex items-center justify-center border-2 border-[#1C1C2E]">
                                    <CheckIcon className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        <p className="font-semibold">{user.displayName}</p>
                    </div>
                );
            })}

            {/* Fallback: local contacts (when not authenticated or no API users) */}
            {!useApiUsers && !isLoadingUsers && filteredContacts.map(contact => {
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

            {!isLoadingUsers && useApiUsers && filteredApiUsers.length === 0 && searchQuery && (
              <p className="text-center text-gray-500 py-6 text-sm">No users found</p>
            )}
        </div>
      </main>
    </div>
  );
};

export default CreateGroupScreen;
