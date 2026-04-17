
import React, { useState } from 'react';
import type { Group, ChatListItem } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ShareIcon } from './icons/ShareIcon';
import { joinGroupByToken } from '../services/apiService';

interface JoinGroupScreenProps {
  onBack: () => void;
  onGroupJoined: (chat: ChatListItem) => void;
  initialToken?: string;
}

const JoinGroupScreen: React.FC<JoinGroupScreenProps> = ({ onBack, onGroupJoined, initialToken }) => {
  const [token, setToken] = useState(initialToken || '');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [joinedGroup, setJoinedGroup] = useState<{ name: string; avatar: string; members: number } | null>(null);

  // Extract token from full URL or plain token
  const extractToken = (input: string): string => {
    const trimmed = input.trim();
    // If it's a full URL like https://app.ozichat.com/join/abc123 or .../groups/join/abc123
    const urlMatch = trimmed.match(/\/join\/([A-Za-z0-9_-]+)\/?$/);
    if (urlMatch) return urlMatch[1];
    // Otherwise treat as plain token
    return trimmed;
  };

  const handleJoin = async () => {
    const cleanToken = extractToken(token);
    if (!cleanToken) {
      setError('Please enter an invite link or token');
      return;
    }

    setError('');
    setIsJoining(true);

    try {
      const res = await joinGroupByToken(cleanToken);

      if (res.success && res.data) {
        const g = res.data;
        setJoinedGroup({
          name: g.groupName,
          avatar: g.groupAvatarUrl || '',
          members: g.currentMemberCount || g.members?.length || 0,
        });

        // Auto-navigate after a short delay to show success
        setTimeout(() => {
          const groupChat: Group = {
            id: String(g.conversationId),
            name: g.groupName,
            avatarUrl: g.groupAvatarUrl || `https://picsum.photos/seed/g${g.conversationId}/80/80`,
            members: (g.members || []).map((m) => String(m.userId)),
            lastMessage: 'You joined the group',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unreadCount: 0,
          };
          onGroupJoined(groupChat);
        }, 1500);
      } else {
        setError(res.message || 'Failed to join group. The link may be expired or invalid.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join group. Please check the link and try again.');
    }

    setIsJoining(false);
  };

  // Success state
  if (joinedGroup) {
    return (
      <div className="flex flex-col h-full bg-[#0B0E14] text-white items-center justify-center p-8">
        <div className="w-24 h-24 rounded-[2rem] bg-green-500/20 flex items-center justify-center mb-6 border-2 border-green-500/30">
          <UserGroupIcon className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-2xl font-black mb-2">Joined!</h1>
        <p className="text-lg font-bold text-white mb-1">{joinedGroup.name}</p>
        <p className="text-sm text-gray-500">{joinedGroup.members} members</p>
        <div className="mt-8 flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#3F9BFF] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-400">Opening chat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0B0E14] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 shrink-0">
        <button onClick={onBack} className="p-3 bg-white/5 backdrop-blur-md rounded-2xl hover:bg-white/10 transition-all active:scale-90">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Join Group</p>
        <div className="w-11"></div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center p-8 pt-4">
        {/* Icon */}
        <div className="w-24 h-24 rounded-[2rem] bg-[#3F9BFF]/10 flex items-center justify-center mb-8 border-2 border-[#3F9BFF]/20">
          <ShareIcon className="w-12 h-12 text-[#3F9BFF]" />
        </div>

        <h1 className="text-2xl font-black tracking-tight mb-2">Join via Invite Link</h1>
        <p className="text-sm text-gray-500 text-center mb-8 max-w-[280px]">
          Paste the invite link or token shared by a group admin to join the group
        </p>

        {/* Input */}
        <div className="w-full max-w-sm space-y-4">
          <div className="relative">
            <input
              type="text"
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(''); }}
              placeholder="Paste invite link or token..."
              className="w-full bg-[#111827] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3F9BFF]/50 placeholder-gray-600"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center font-medium">{error}</p>
          )}

          <button
            onClick={handleJoin}
            disabled={!token.trim() || isJoining}
            className="w-full bg-[#3F9BFF] hover:bg-blue-500 text-white font-black py-4 px-8 rounded-2xl text-sm uppercase tracking-widest transition-all active:scale-[0.98] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isJoining ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <UserGroupIcon className="w-5 h-5" />
                <span>Join Group</span>
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-auto w-full max-w-sm">
          <div className="bg-[#111827] rounded-[2rem] p-5 border border-white/5">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">How it works</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-[#3F9BFF] font-black text-sm mt-0.5">1</span>
                <p className="text-xs text-gray-400">A group admin shares an invite link with you</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#3F9BFF] font-black text-sm mt-0.5">2</span>
                <p className="text-xs text-gray-400">Paste the full link or just the token above</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#3F9BFF] font-black text-sm mt-0.5">3</span>
                <p className="text-xs text-gray-400">Tap "Join Group" and you're in!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JoinGroupScreen;
