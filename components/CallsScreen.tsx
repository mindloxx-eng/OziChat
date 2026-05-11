
import React, { useState, useMemo, useEffect } from 'react';
import type { GlobalCall, Contact, CallType } from '../types';
import { UserIcon } from './icons/UserIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { ArrowDownLeftIcon } from './icons/ArrowDownLeftIcon';
import { ArrowUpRightIcon } from './icons/ArrowUpRightIcon';
import BottomNavBar, { BottomNavBarProps } from './BottomNavBar';
import { PhoneMissedIcon } from './icons/PhoneMissedIcon';
import { VideoIcon } from './icons/VideoIcon';
import { getCallHistory, getMissedCalls, type CallRecord } from '../services/apiService';
import { isAuthenticated, getUserId } from '../services/tokenService';

interface CallsScreenProps {
  calls: GlobalCall[];
  contacts: Contact[];
  onNavigateToProfile: () => void;
  onInitiateCall: (contact: Contact) => void;
  onSelectContactById: (id: string) => void;
  navProps: BottomNavBarProps;
  onStartNewCall: () => void;
}

const formatDateGroup = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
};

const mapRecordToType = (record: CallRecord, currentUserId: number | null): CallType => {
  const state = (record.state || '').toUpperCase();
  if (state === 'MISSED') return 'missed';
  if (currentUserId != null && record.callerId === currentUserId) return 'outgoing';
  return 'incoming';
};

const recordToGlobalCall = (
  record: CallRecord,
  contacts: Contact[],
  currentUserId: number | null
): GlobalCall => {
  const type = mapRecordToType(record, currentUserId);
  const isOutgoing = type === 'outgoing';
  const remoteId = isOutgoing ? record.calleeId : record.callerId;
  const remoteName = isOutgoing ? record.calleeName : record.callerName;
  const matchedContact = contacts.find(
    (c) => c.id === String(remoteId) || c.name === remoteName
  );
  const initiatedAt = record.initiatedAt;
  const date = initiatedAt ? new Date(initiatedAt) : new Date();

  return {
    id: record.id,
    type,
    timestamp: date.toLocaleString(),
    duration: record.durationSeconds,
    contactId: matchedContact?.id || String(remoteId),
    contactName: matchedContact?.name || remoteName || 'Unknown',
    contactAvatarUrl:
      matchedContact?.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(remoteName || 'User')}&background=random&color=fff`,
    date,
  };
};

const CallsScreen: React.FC<CallsScreenProps> = ({ calls, contacts, onNavigateToProfile, onSelectContactById, onInitiateCall, navProps, onStartNewCall }) => {
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'missed'>('all');
  const [historyCalls, setHistoryCalls] = useState<GlobalCall[]>([]);
  const [missedCalls, setMissedCalls] = useState<GlobalCall[]>([]);
  const [isLoadingCalls, setIsLoadingCalls] = useState(false);

  useEffect(() => {
    const loadProfileData = () => {
      setUserAvatar(localStorage.getItem('ozichat_profile_picture'));
    };
    loadProfileData();
    window.addEventListener('storage', loadProfileData);
    return () => window.removeEventListener('storage', loadProfileData);
  }, []);

  // Fetch call history + missed calls from backend
  useEffect(() => {
    if (!isAuthenticated()) return;
    let cancelled = false;
    const currentUserId = getUserId();

    const load = async () => {
      setIsLoadingCalls(true);
      try {
        const [historyRes, missedRes] = await Promise.all([
          getCallHistory(0, 50).catch((err) => {
            console.warn('getCallHistory failed:', err?.message || err);
            return null;
          }),
          getMissedCalls(0, 50).catch((err) => {
            console.warn('getMissedCalls failed:', err?.message || err);
            return null;
          }),
        ]);
        if (cancelled) return;

        if (historyRes?.success && Array.isArray(historyRes.data)) {
          setHistoryCalls(
            historyRes.data.map((r) => recordToGlobalCall(r, contacts, currentUserId))
          );
        }
        if (missedRes?.success && Array.isArray(missedRes.data)) {
          setMissedCalls(
            missedRes.data.map((r) => recordToGlobalCall({ ...r, state: 'MISSED' }, contacts, currentUserId))
          );
        }
      } finally {
        if (!cancelled) setIsLoadingCalls(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [contacts]);

  // Backend-only call list, dedup by id, sort newest-first
  const mergedCalls = useMemo<GlobalCall[]>(() => {
    const byId = new Map<string, GlobalCall>();
    [...historyCalls, ...missedCalls].forEach((call) => {
      if (!call?.id) return;
      if (!byId.has(call.id)) byId.set(call.id, call);
    });
    return Array.from(byId.values()).sort((a, b) => {
      const ad = a.date?.getTime() ?? 0;
      const bd = b.date?.getTime() ?? 0;
      return bd - ad;
    });
  }, [historyCalls, missedCalls]);

  const filteredCalls = useMemo(() => {
    if (filter === 'missed') {
      return mergedCalls.filter(call => call.type === 'missed');
    }
    return mergedCalls;
  }, [mergedCalls, filter]);
  
  const groupedCalls = useMemo(() => {
    return filteredCalls.reduce((acc, call) => {
        if (!call.date) {
            return acc; // Skip calls without a date for safety
        }
        const dateKey = call.date.toISOString().split('T')[0];
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(call);
        return acc;
    }, {} as Record<string, GlobalCall[]>);
  }, [filteredCalls]);

  const UserAvatar = () => (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
      {userAvatar ? (
        <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
      ) : (
        <UserIcon className="w-6 h-6 text-gray-500 dark:text-gray-300" />
      )}
    </div>
  );

  const renderCallIcon = (type: GlobalCall['type']) => {
    const isMissed = type === 'missed';
    const isOutgoing = type === 'outgoing';
    
    if (isOutgoing) {
        return <ArrowUpRightIcon className="w-4 h-4 text-green-500" />;
    }
    return <ArrowDownLeftIcon className={`w-4 h-4 ${isMissed ? 'text-red-500' : 'text-blue-500'}`} />;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1C1C2E] text-black dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="p-4 flex flex-col gap-4 shrink-0 bg-white/80 dark:bg-[#1C1C2E]/80 backdrop-blur-md z-10 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
            <button onClick={onNavigateToProfile} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1C1C2E] focus:ring-gray-500 dark:focus:ring-white rounded-full">
                <UserAvatar />
            </button>
            <h1 className="text-2xl font-bold">Calls</h1>
            <button onClick={onStartNewCall} className="text-black dark:text-white p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <PhoneMissedIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="flex bg-gray-200 dark:bg-[#2a2a46] rounded-full p-1">
            <button 
                onClick={() => setFilter('all')} 
                className={`w-1/2 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${filter === 'all' ? 'bg-white dark:bg-[#553699] text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-300'}`}
            >
                All
            </button>
            <button 
                onClick={() => setFilter('missed')} 
                className={`w-1/2 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${filter === 'missed' ? 'bg-white dark:bg-[#553699] text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-300'}`}
            >
                Missed
            </button>
        </div>
      </header>
      
      {/* Call List */}
      <main className="flex-1 overflow-y-auto px-4 pb-4">
        {Object.keys(groupedCalls).length > 0 ? (
            <div className="flex flex-col space-y-6 pt-4">
               {Object.keys(groupedCalls).map((date) => {
                    const callsInGroup = groupedCalls[date];
                    return (
                    <div key={date}>
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">{formatDateGroup(date)}</h3>
                        <div className="bg-gray-50 dark:bg-[#2a2a46]/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 backdrop-blur-sm">
                        {callsInGroup.map((call, index) => {
                            const contact = contacts.find(c => c.id === call.contactId);
                            const isLast = index === callsInGroup.length - 1;
                            return (
                            <div 
                                key={call.id} 
                                onClick={() => onSelectContactById(call.contactId)}
                                className={`flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors ${!isLast ? 'border-b border-gray-200 dark:border-white/5' : ''}`}
                            >
                                <div className="relative">
                                    <img src={call.contactAvatarUrl} alt={call.contactName} className="w-12 h-12 rounded-full object-cover bg-gray-300 dark:bg-gray-600" />
                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1C1C2E] rounded-full p-0.5">
                                        <div className="bg-gray-100 dark:bg-[#3a3a5c] rounded-full p-1">
                                            {renderCallIcon(call.type)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h2 className={`font-semibold text-base truncate ${call.type === 'missed' ? 'text-red-500' : 'text-black dark:text-white'}`}>
                                        {call.contactName}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="capitalize">{call.type}</span>
                                        {call.duration && (
                                            <>
                                                <span>•</span>
                                                <span>{formatDuration(call.duration)}</span>
                                            </>
                                        )}
                                        {call.type !== 'missed' && !call.duration && (
                                            <>
                                                <span>•</span>
                                                <span>0s</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-1">
                                    <p className="text-xs text-gray-400 font-mono">{call.timestamp.split(',')[1]?.trim() || call.timestamp}</p>
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            if (contact) { onInitiateCall(contact); } else { alert('Could not find contact to call.'); } 
                                        }} 
                                        className="p-2 text-[#3F9BFF] hover:bg-[#3F9BFF]/10 rounded-full transition-colors"
                                        aria-label={`Call ${call.contactName}`}
                                    >
                                        <PhoneIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )})}
                        </div>
                    </div>
                );
                })}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-[#2a2a46] rounded-full flex items-center justify-center">
                    <PhoneMissedIcon className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                </div>
                <p>{isLoadingCalls ? 'Loading calls…' : `No ${filter} calls yet.`}</p>
            </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavBar {...navProps} />

    </div>
  );
};

export default CallsScreen;
