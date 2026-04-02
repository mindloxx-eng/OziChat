import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Contact, StatusUpdate } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import BottomNavBar, { BottomNavBarProps } from './BottomNavBar';
import { CameraIcon } from './icons/CameraIcon';
import { NestfingerIcon } from './icons/NestfingerIcon';
import { KennyejisIcon } from './icons/KennyEjiIcon';
import { KAiStudioIcon } from './icons/KAiStudioIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CloseIcon } from './icons/CloseIcon';
import { CheckIcon } from './icons/CheckIcon';
import { PhotoLibraryIcon } from './icons/PhotoLibraryIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import StoryViewer from './StoryViewer';
import * as backend from '../services/backendService';

interface ContactStatus {
  contact: Contact;
  updates: StatusUpdate[];
}

interface EphemeralScreenProps {
  contacts: Contact[];
  onNavigateToProfile: () => void;
  navProps: BottomNavBarProps;
  onNavigateToVault: () => void;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
};

const getRemainingTimeLabel = (timestamp: number) => {
    const expiresAt = timestamp + DAY_IN_MS;
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Archiving...';
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 0) return `Expires in ${hours}h`;
    return `Expires in ${minutes}m`;
};

const EphemeralScreen: React.FC<EphemeralScreenProps> = ({ contacts, onNavigateToProfile, navProps, onNavigateToVault }) => {
  const [viewedUpdateIds, setViewedUpdateIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('ozichat_viewed_status_ids');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [activeStory, setActiveStory] = useState<{ contactName: string; avatarUrl: string; updates: StatusUpdate[]; initialIndex: number } | null>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showTextStatusModal, setShowTextStatusModal] = useState(false);
  const [showCameraView, setShowCameraView] = useState(false);
  const [shutterEffect, setShutterEffect] = useState(false);
  const [textStatus, setTextStatus] = useState('');
  const [textBg, setTextBg] = useState('bg-gradient-to-br from-[#3F9BFF] to-[#553699]');
  const [showViewedSection, setShowViewedSection] = useState(true);
  
  const [userStatuses, setUserStatuses] = useState<StatusUpdate[]>([]);
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [userName, setUserName] = useState<string>('Me');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkAndArchiveExpirations = useCallback(() => {
      const active = backend.getMyActiveStatuses();
      const vault = backend.getStatusVault();
      const now = Date.now();

      const stillActive = active.filter(s => now - s.createdAt < DAY_IN_MS);
      const newlyExpired = active.filter(s => now - s.createdAt >= DAY_IN_MS);

      if (newlyExpired.length > 0) {
          const updatedVault = [...newlyExpired, ...vault];
          backend.saveStatusVault(updatedVault);
          backend.saveMyActiveStatuses(stillActive);
          setUserStatuses(stillActive);
      } else if (active.length !== userStatuses.length) {
          setUserStatuses(active);
      }
  }, [userStatuses.length]);

  useEffect(() => {
      checkAndArchiveExpirations();
      setUserAvatar(localStorage.getItem('ozichat_profile_picture') || '');
      setUserName(localStorage.getItem('ozichat_display_name') || 'Me');
  }, [checkAndArchiveExpirations]);

  useEffect(() => {
      const interval = setInterval(checkAndArchiveExpirations, 15000);
      return () => clearInterval(interval);
  }, [checkAndArchiveExpirations]);

  const allContactUpdates: ContactStatus[] = useMemo(() => {
    return contacts.slice(0, 5).map((contact, i) => {
      // FIX: Added explicit status updates array with 'as const' type to resolve string assignability error.
      const statusUpdates: StatusUpdate[] = [{
          id: `status-${contact.id}-1`,
          type: 'image' as const,
          contentUrl: `https://picsum.photos/seed/${contact.id}/400/800`,
          createdAt: Date.now() - (i + 1) * 3600000,
          viewed: false,
      }].filter(u => Date.now() - u.createdAt < DAY_IN_MS);

      return {
        contact,
        updates: statusUpdates
      };
    }).filter(cs => cs.updates.length > 0);
  }, [contacts]);

  const { recentContactUpdates, viewedContactUpdates } = useMemo(() => {
    const recent: ContactStatus[] = [];
    const viewed: ContactStatus[] = [];

    allContactUpdates.forEach(cs => {
      const isAllViewed = cs.updates.every(u => viewedUpdateIds.has(u.id));
      if (isAllViewed) {
        viewed.push(cs);
      } else {
        recent.push(cs);
      }
    });

    return { recentContactUpdates: recent, viewedContactUpdates: viewed };
  }, [allContactUpdates, viewedUpdateIds]);

  const handleViewedUpdate = (updateId: string) => {
    setViewedUpdateIds(prev => {
      const next = new Set(prev).add(updateId);
      localStorage.setItem('ozichat_viewed_status_ids', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const newUpdate: StatusUpdate = {
              id: `user-status-${Date.now()}`,
              type: file.type.startsWith('video') ? 'video' : 'image',
              contentUrl: event.target?.result as string,
              createdAt: Date.now(),
              viewed: false
          };
          const updated = [newUpdate, ...userStatuses];
          setUserStatuses(updated);
          backend.saveMyActiveStatuses(updated);
          setShowUploadOptions(false);
      };
      reader.readAsDataURL(file);
  };

  const handleCreateTextStatus = () => {
      if (!textStatus.trim()) return;
      const newUpdate: StatusUpdate = {
          id: `user-status-text-${Date.now()}`,
          type: 'text',
          text: textStatus,
          color: textBg,
          createdAt: Date.now(),
          viewed: false
      };
      const updated = [newUpdate, ...userStatuses];
      setUserStatuses(updated);
      backend.saveMyActiveStatuses(updated);
      setTextStatus('');
      setShowTextStatusModal(false);
      setShowUploadOptions(false);
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      if (showCameraView) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          alert("Could not access camera. Please check permissions.");
          setShowCameraView(false);
        }
      }
    };
    startCamera();
    return () => stopCamera();
  }, [showCameraView, stopCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
        setShutterEffect(true);
        setTimeout(() => setShutterEffect(false), 200);

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            const newUpdate: StatusUpdate = {
                id: `user-status-camera-${Date.now()}`,
                type: 'image',
                contentUrl: dataUrl,
                createdAt: Date.now(),
                viewed: false
            };
            const updated = [newUpdate, ...userStatuses];
            setUserStatuses(updated);
            backend.saveMyActiveStatuses(updated);
            
            setTimeout(() => {
                setShowCameraView(false);
                setShowUploadOptions(false);
            }, 300);
        }
    }
  };

  const ecosystemLinks = [
    { name: 'Nestfinger', url: 'https://nestfinger.com', icon: NestfingerIcon, color: 'bg-[#1C1C2E]' },
    { name: 'Kennyejis', url: 'https://kennyejismp.com', icon: KennyejisIcon, color: 'bg-white' },
    { name: 'K-AiStudio', url: 'https://k-aistudio.com', icon: KAiStudioIcon, color: 'bg-[#0A0A1F]' },
  ];

  const colors = [
      'bg-gradient-to-br from-[#3F9BFF] to-[#553699]',
      'bg-gradient-to-br from-[#EC53B7] to-[#A369F0]',
      'bg-gradient-to-br from-[#00FF9D] to-[#008F59]',
      'bg-gradient-to-br from-[#FF9500] to-[#FF3B30]',
      'bg-[#1C1C2E]'
  ];

  const getStatusColor = (createdAt: number, isViewed: boolean) => {
    if (isViewed) return '#9CA3AF'; // Gray for viewed
    const ageHrs = (Date.now() - createdAt) / 3600000;
    if (ageHrs > 23) return '#EF4444'; // Red alert
    if (ageHrs > 12) return '#F59E0B'; // Amber alert
    return '#3F9BFF'; // Fresh
  };

  const StatusRing: React.FC<{ updates: StatusUpdate[], size?: number }> = ({ updates, size = 64 }) => {
      const count = updates.length;
      if (count === 0) return null;
      
      const allViewed = updates.every(u => viewedUpdateIds.has(u.id));
      const oldestUpdate = updates[count - 1];
      const ringColor = getStatusColor(oldestUpdate.createdAt, allViewed);

      if (count === 1) return <div className="absolute inset-0 rounded-2xl border-2 transition-colors duration-500" style={{ borderColor: ringColor }}></div>;
      
      const radius = size / 2;
      const stroke = 2;
      const normalizedRadius = radius - stroke * 2;
      const circumference = normalizedRadius * 2 * Math.PI;
      const gap = 4;
      const length = (circumference - (gap * count)) / count;

      return (
          <svg className="absolute inset-0 -rotate-90 transform" width={size} height={size}>
              {updates.map((update, i) => (
                  <circle
                    key={update.id}
                    stroke={getStatusColor(update.createdAt, viewedUpdateIds.has(update.id))}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={`${length} ${circumference - length}`}
                    strokeDashoffset={-i * (length + gap)}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-500"
                    strokeLinecap="round"
                  />
              ))}
          </svg>
      );
  };

  const StatusItem: React.FC<{ contact: Contact | { name: string, avatarUrl: string }, updates: StatusUpdate[], label?: string }> = ({ contact, updates, label }) => {
    const isUser = 'id' in contact === false;
    const allViewed = updates.every(u => viewedUpdateIds.has(u.id));

    return (
        <div 
            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer group transition-all"
            onClick={() => setActiveStory({ contactName: contact.name, avatarUrl: contact.avatarUrl, updates, initialIndex: 0 })}
        >
            <div className="relative flex-shrink-0">
                <div className={`relative w-14 h-14 transition-opacity ${!isUser && allViewed ? 'opacity-60' : 'opacity-100'}`}>
                    <StatusRing updates={updates} size={56} />
                    <img 
                        src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.name}&background=3F9BFF&color=fff`} 
                        className="w-14 h-14 rounded-xl object-cover p-1" 
                        alt="" 
                    />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`font-bold text-base transition-colors truncate ${allViewed && !isUser ? 'text-gray-500' : 'group-hover:text-[#3F9BFF]'}`}>{contact.name}</h3>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{formatTimeAgo(updates[0].createdAt)}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">{label || (isUser ? 'My Status' : (contact as Contact).status)}</p>
            </div>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
      <style>{`
        .shutter-effect { background: white; animation: shutter 0.2s ease-out forwards; }
        @keyframes shutter { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        .displacing-soon { animation: pulse-warn 1.5s infinite; }
        @keyframes pulse-warn { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.98); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
      
      {activeStory && (
        <StoryViewer
            contactName={activeStory.contactName}
            avatarUrl={activeStory.avatarUrl}
            updates={activeStory.updates}
            initialIndex={activeStory.initialIndex}
            onClose={() => setActiveStory(null)}
            onViewed={handleViewedUpdate}
        />
      )}

      {/* Camera View Overlay */}
      {showCameraView && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
            {shutterEffect && <div className="absolute inset-0 z-[60] shutter-effect pointer-events-none"></div>}
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <button onClick={() => setShowCameraView(false)} className="absolute top-6 left-6 p-2 bg-black/50 rounded-full text-white z-50">
                <CloseIcon className="w-6 h-6" />
            </button>
            <div className="absolute bottom-12 left-0 right-0 flex justify-center z-50">
                <button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white/30 border-4 border-white flex items-center justify-center hover:scale-105 transition-transform">
                    <div className="w-16 h-16 rounded-full bg-white shadow-lg"></div>
                </button>
            </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />

      {/* Text Status Modal */}
      {showTextStatusModal && (
          <div className={`fixed inset-0 z-50 flex flex-col animate-fade-in ${textBg}`}>
              <header className="p-4 flex items-center justify-between bg-black/20 backdrop-blur-md">
                  <button onClick={() => setShowTextStatusModal(false)} className="text-white p-2"><CloseIcon className="w-6 h-6" /></button>
                  <h3 className="text-white font-bold">Text Status</h3>
                  <button onClick={handleCreateTextStatus} className="p-3 bg-white text-black rounded-full shadow-lg transition-transform active:scale-95" disabled={!textStatus.trim()}>
                      <CheckIcon className="w-6 h-6" />
                  </button>
              </header>
              <div className="flex-1 flex items-center justify-center p-8">
                  <textarea autoFocus placeholder="Type a status..." value={textStatus} onChange={(e) => setTextStatus(e.target.value)} className="bg-transparent text-white text-3xl font-bold text-center w-full focus:outline-none placeholder-white/40 resize-none custom-scrollbar" rows={4} />
              </div>
              <div className="p-6 flex justify-center gap-4 bg-black/20 backdrop-blur-md">
                  {colors.map(c => (
                      <button key={c} onClick={() => setTextBg(c)} className={`w-10 h-10 rounded-full border-2 transition-transform active:scale-90 ${c} ${textBg === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`} />
                  ))}
              </div>
          </div>
      )}

      {/* Creation Options Modal */}
      {showUploadOptions && (
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md flex items-end justify-center p-4 animate-fade-in" onClick={() => setShowUploadOptions(false)}>
              <div className="bg-white dark:bg-[#1C1C2E] w-full max-w-sm rounded-[2rem] p-6 shadow-2xl space-y-6 mb-2" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-2 opacity-50"></div>
                  <h3 className="font-black text-center text-xl text-black dark:text-white">New Moment</h3>
                  <div className="grid grid-cols-3 gap-4">
                      <button onClick={() => setShowCameraView(true)} className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-white/5 rounded-3xl gap-2 hover:bg-[#3F9BFF]/10 transition-all active:scale-95 border border-transparent hover:border-[#3F9BFF]/20">
                          <CameraIcon className="w-7 h-7 text-[#3F9BFF]" />
                          <span className="font-bold text-[10px] uppercase tracking-wider text-black dark:text-white">Camera</span>
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-white/5 rounded-3xl gap-2 hover:bg-[#3F9BFF]/10 transition-all active:scale-95 border border-transparent hover:border-[#3F9BFF]/20">
                          <PhotoLibraryIcon className="w-7 h-7 text-blue-400" />
                          <span className="font-bold text-[10px] uppercase tracking-wider text-black dark:text-white">Gallery</span>
                      </button>
                      <button onClick={() => setShowTextStatusModal(true)} className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-white/5 rounded-3xl gap-2 hover:bg-[#3F9BFF]/10 transition-all active:scale-95 border border-transparent hover:border-[#3F9BFF]/20">
                          <PencilIcon className="w-7 h-7 text-purple-400" />
                          <span className="font-bold text-[10px] uppercase tracking-wider text-black dark:text-white">Text</span>
                      </button>
                  </div>
                  <button onClick={() => setShowUploadOptions(false)} className="w-full py-4 text-gray-500 font-bold text-sm bg-gray-50 dark:bg-white/5 rounded-2xl">Cancel</button>
              </div>
          </div>
      )}

      <header className="p-4 pt-8 sticky top-0 bg-white/80 dark:bg-[#10101b]/80 backdrop-blur-xl z-20 flex justify-between items-center border-b border-gray-100 dark:border-white/5">
        <h1 className="text-2xl font-black tracking-tight">Updates</h1>
        <div className="flex gap-1">
            <button onClick={() => setShowCameraView(true)} className="p-2.5 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors" title="Camera"><CameraIcon className="w-6 h-6" /></button>
            <button onClick={() => setShowUploadOptions(true)} className="p-2.5 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors" title="Create"><PlusIcon className="w-6 h-6" /></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-24 custom-scrollbar">
        {/* Status Sections */}
        <section className="mt-6 mb-10">
            {/* My Status */}
            <div 
                className={`flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer group transition-all mb-4 ${userStatuses.length > 0 && (Date.now() - userStatuses[userStatuses.length - 1].createdAt) > (DAY_IN_MS - 3600000) ? 'displacing-soon' : ''}`}
                onClick={() => {
                    if (userStatuses.length > 0) {
                        setActiveStory({ contactName: 'My Status', avatarUrl: userAvatar, updates: userStatuses, initialIndex: 0 });
                    } else {
                        setShowUploadOptions(true);
                    }
                }}
            >
                <div className="relative flex-shrink-0">
                    {userStatuses.length > 0 ? (
                        <div className="relative w-14 h-14">
                            <StatusRing updates={userStatuses} size={56} />
                            <img src={userAvatar || `https://ui-avatars.com/api/?name=${userName}&background=3F9BFF&color=fff`} className="w-14 h-14 rounded-xl object-cover p-1" alt="" />
                        </div>
                    ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 group-hover:border-[#3F9BFF] transition-colors">
                            <PlusIcon className="w-7 h-7 text-[#3F9BFF]" />
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-[#3F9BFF] rounded-full p-1.5 border-2 border-white dark:border-[#10101b] shadow-lg" onClick={(e) => { e.stopPropagation(); setShowUploadOptions(true); }}>
                        <PlusIcon className="w-3 h-3 text-white" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base leading-tight">My Status</h3>
                    <p className={`text-xs mt-1 truncate ${userStatuses.length > 0 && (Date.now() - userStatuses[userStatuses.length - 1].createdAt) > (DAY_IN_MS - 3600000) ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                        {userStatuses.length > 0 ? getRemainingTimeLabel(userStatuses[userStatuses.length - 1].createdAt) : 'Add a status update'}
                    </p>
                </div>
            </div>

            {/* Recent Updates Header */}
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 pl-1">Recent Updates</h2>
            <div className="space-y-1">
                {recentContactUpdates.length > 0 ? recentContactUpdates.map(({ contact, updates }) => (
                    <StatusItem key={'id' in contact ? contact.id : 'user'} contact={contact} updates={updates} />
                )) : (
                    <div className="p-4 text-center opacity-40">
                        <p className="text-xs">No new updates from friends</p>
                    </div>
                )}
            </div>

            {/* Viewed Updates Section */}
            {viewedContactUpdates.length > 0 && (
                <div className="mt-8">
                    <button 
                        onClick={() => setShowViewedSection(!showViewedSection)}
                        className="w-full flex items-center justify-between p-2 mb-2 group"
                    >
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Viewed Updates</h2>
                        {showViewedSection ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
                    </button>
                    {showViewedSection && (
                        <div className="space-y-1 animate-fade-in">
                            {viewedContactUpdates.map(({ contact, updates }) => (
                                <StatusItem key={'id' in contact ? contact.id : 'user'} contact={contact} updates={updates} label="Viewed" />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>

        {/* Ecosystem Horizontal Links */}
        <section className="mb-10">
            <div className="flex justify-between items-center mb-5 px-1">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ecosystem</h2>
                <div className="h-0.5 flex-1 bg-gray-100 dark:bg-white/5 mx-4"></div>
                <SparklesIcon className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
                {ecosystemLinks.map((link) => (
                    <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center justify-center gap-3 flex-shrink-0 w-28 aspect-square rounded-3xl ${link.color} text-white shadow-xl shadow-black/10 hover:scale-[1.05] active:scale-95 transition-all group border border-white/10 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors pointer-events-none"></div>
                        <div className="w-full h-full flex items-center justify-center p-2">
                            {link.name === 'Nestfinger' ? <link.icon className="w-20 h-auto" /> : <link.icon className="w-full h-full" />}
                        </div>
                    </a>
                ))}
            </div>
        </section>
        
        {/* Archive Vault Card */}
        <div onClick={onNavigateToVault} className="bg-gradient-to-br from-[#1C1C2E] to-[#11111d] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer border border-white/5 mb-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#3F9BFF]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[#3F9BFF]/20 transition-all" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Moment Vault</h3>
                    <div className="p-2 bg-white/10 rounded-xl"><PhotoLibraryIcon className="w-5 h-5 text-[#3F9BFF]" /></div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-6 font-medium">Relive your journey. Updates disappear for others after 24h, but your memories are stored here in your secure private vault.</p>
                <div className="flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] text-[#3F9BFF] group-hover:translate-x-2 transition-transform">
                    <span>Enter Vault</span>
                    <PlusIcon className="w-4 h-4 rotate-45" />
                </div>
            </div>
        </div>

        <div className="text-center pb-8 opacity-30">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">End of Updates</p>
        </div>
      </main>
      <BottomNavBar {...navProps} />
    </div>
  );
};

export default EphemeralScreen;