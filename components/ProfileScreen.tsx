import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { UserIcon } from './icons/UserIcon';
import { CameraIcon } from './icons/CameraIcon';
import { PhotoLibraryIcon } from './icons/PhotoLibraryIcon';
import { CloseIcon } from './icons/CloseIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CheckIcon } from './icons/CheckIcon';
import { QrCodeIcon } from './icons/QrCodeIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { InfoCircleIcon } from './icons/InfoCircleIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CopyIcon } from './icons/CopyIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { KeyIcon } from './icons/KeyIcon';
import * as backend from '../services/backendService';
import { uploadMedia, updateMyProfile, normalizeMediaUrl } from '../services/apiService';
import { isAuthenticated } from '../services/tokenService';

interface ProfileScreenProps {
  onBack: () => void;
  onNavigateToVerification: () => void;
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onNavigateToVerification, onLogout }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [phone, setPhone] = useState('');
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [handlesList, setHandlesList] = useState<string[]>([]);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showCameraView, setShowCameraView] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const loadProfileData = () => {
        const savedName = localStorage.getItem('ozichat_display_name') || 'Ozi User';
        const savedStatus = localStorage.getItem('ozichat_status_message') || 'Living in the future 🚀';
        const savedImage = localStorage.getItem('ozichat_profile_picture');
        const savedPhone = localStorage.getItem('ozichat_user_phone') || '+1 (555) 019-2834';

        setName(savedName);
        setStatus(savedStatus);
        setImageSrc(savedImage);
        setPhone(savedPhone);

        setActiveHandle(backend.getUserHandle());
        setHandlesList(backend.getUserHandlesList());
    };
    loadProfileData();
    window.addEventListener('storage', loadProfileData);

    // Sync from server on mount
    if (isAuthenticated()) {
      import('../services/apiService').then(({ getMyProfile: fetchProfile }) => {
        fetchProfile().then((res) => {
          if (res.success && res.data) {
            const p = res.data;
            if (p.displayName) { localStorage.setItem('ozichat_display_name', p.displayName); setName(p.displayName); }
            if (p.avatarUrl) { const url = normalizeMediaUrl(p.avatarUrl); localStorage.setItem('ozichat_profile_picture', url); setImageSrc(url); }
            if (p.about) { localStorage.setItem('ozichat_status_message', p.about); setStatus(p.about); }
            if (p.phone) { localStorage.setItem('ozichat_user_phone', p.phone); setPhone(p.phone); }
          }
        }).catch(() => {});
      });
    }

    return () => window.removeEventListener('storage', loadProfileData);
  }, []);

  const profileStrength = useMemo(() => {
      let strength = 20;
      if (imageSrc) strength += 20;
      if (activeHandle) strength += 30;
      if (status !== 'Living in the future 🚀') strength += 15;
      if (handlesList.length > 1) strength += 15;
      return strength;
  }, [imageSrc, activeHandle, status, handlesList]);

  const saveProfile = (updates: { name?: string; status?: string; image?: string | null }) => {
      if (updates.name !== undefined) {
          localStorage.setItem('ozichat_display_name', updates.name);
          setName(updates.name);
      }
      if (updates.status !== undefined) {
          localStorage.setItem('ozichat_status_message', updates.status);
          setStatus(updates.status);
      }
      if (updates.image !== undefined) {
          if (updates.image) {
              localStorage.setItem('ozichat_profile_picture', updates.image);
          } else {
              localStorage.removeItem('ozichat_profile_picture');
          }
          setImageSrc(updates.image);
      }
      window.dispatchEvent(new Event('storage'));

      // Sync name/about to server
      if (isAuthenticated() && (updates.name !== undefined || updates.status !== undefined)) {
        const serverUpdate: Record<string, string> = {};
        if (updates.name !== undefined) serverUpdate.displayName = updates.name;
        if (updates.status !== undefined) serverUpdate.about = updates.status;
        updateMyProfile(serverUpdate).catch((err: any) => console.warn('Profile server sync failed:', err));
      }
  };

  const handleCopyLink = () => {
    if (!activeHandle) return;
    const link = `ozi.chat/${activeHandle}`;
    navigator.clipboard.writeText(link);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
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
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            saveProfile({ image: dataUrl });

            // Upload to S3 and update server profile
            if (isAuthenticated()) {
              try {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], `avatar_${Date.now()}.jpg`, { type: 'image/jpeg' });
                const res = await uploadMedia(file, 'profile');
                if (res.success && res.data?.url) {
                  await updateMyProfile({ avatarUrl: res.data.url });
                  console.log('🟢 Profile picture uploaded to S3:', res.data.url);
                }
              } catch (err) {
                console.warn('S3 profile upload failed (local copy saved):', err);
              }
            }
        }
    }
    setShowCameraView(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);

      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
          saveProfile({ image: e.target?.result as string });
      };
      reader.readAsDataURL(file);

      // Upload to S3 and update server profile
      if (isAuthenticated()) {
        try {
          const res = await uploadMedia(file, 'profile');
          if (res.success && res.data?.url) {
            await updateMyProfile({ avatarUrl: res.data.url });
            console.log('🟢 Profile picture uploaded to S3:', res.data.url);
          }
        } catch (err) {
          console.warn('S3 profile upload failed (local copy saved):', err);
        }
      }

      setIsUploading(false);
    }
    setShowUploadOptions(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white overflow-hidden relative">
      <style>{`
        .ozi-glass {
            background: rgba(28, 28, 46, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .ozi-neon-text {
            color: #3F9BFF;
            text-shadow: 0 0 10px rgba(63, 155, 255, 0.4);
        }
        @keyframes rotate-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-rotate { animation: rotate-slow 10s linear infinite; }
        .hud-scanline {
            background: linear-gradient(to bottom, transparent 50%, rgba(63, 155, 255, 0.03) 50%);
            background-size: 100% 4px;
        }
      `}</style>
      
      <div className="absolute inset-0 hud-scanline pointer-events-none opacity-40"></div>

      {/* Header HUD */}
      <header className="flex items-center justify-between p-6 z-20 shrink-0 bg-gradient-to-b from-[#050508] to-transparent">
        <button onClick={onBack} className="p-3 ozi-glass rounded-2xl hover:bg-white/5 transition-all text-white active:scale-90">
            <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center text-center">
            <h1 className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-500">Identity Panel</h1>
            <span className="text-[8px] font-mono animate-pulse text-[#3F9BFF]">
                SECURE LINK ACTIVE
            </span>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setShowQrCode(true)} className="p-3 ozi-glass rounded-2xl hover:bg-white/5 transition-all active:scale-90 text-[#3F9BFF]">
                <QrCodeIcon className="w-5 h-5" />
            </button>
            <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-3 ozi-glass rounded-2xl hover:bg-red-500/10 transition-all active:scale-90 text-red-400 border border-red-500/20"
                title="Logout"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
        {/* Profile Core HUD */}
        <section className="flex flex-col items-center pt-4 pb-10 relative">
            <div className="relative group cursor-pointer" onClick={() => setShowUploadOptions(true)}>
                {/* Rotating Hub Ring */}
                <div className="absolute -inset-4 border rounded-full animate-rotate border-dashed opacity-50 border-[#3F9BFF]/20"></div>
                <div className="absolute -inset-2 border-2 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin border-[#3F9BFF]"></div>
                
                <div className="w-44 h-44 rounded-[3.5rem] overflow-hidden border-2 shadow-2xl relative z-10 bg-[#1C1C2E] transition-all duration-500 border-white/10 group-hover:scale-105">
                    {imageSrc ? <img src={imageSrc} className="w-full h-full object-cover" alt="" /> : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1C1C2E]">
                            <UserIcon className="w-16 h-16 text-gray-700" />
                        </div>
                    )}
                    {isUploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20"><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin border-[#3F9BFF]"></div></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 z-10">
                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                          <CameraIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-10 text-center px-6 space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <h2 className="text-3xl font-black tracking-tight">{name}</h2>
                    <PencilIcon onClick={() => { const n = prompt('Enter name:', name); if(n) saveProfile({name: n}); }} className="w-4 h-4 text-gray-600 cursor-pointer hover:text-white" />
                </div>
                {activeHandle ? (
                    <div className="flex items-center justify-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                        <span className="text-sm font-bold tracking-tight ozi-neon-text">{activeHandle}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Verified</span>
                    </div>
                ) : (
                    <button onClick={onNavigateToVerification} className="text-[#3F9BFF] text-[10px] font-black uppercase tracking-widest hover:underline">Claim Ozi Handle</button>
                )}
            </div>

            {/* Profile Strength Meter */}
            <div className="mt-8 w-full max-w-xs px-6">
                <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">
                    <span>Identity Trust Rating</span>
                    <span className="text-[#3F9BFF]">{profileStrength}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-1000 shadow-lg bg-[#3F9BFF] shadow-[#3F9BFF]/50" style={{ width: `${profileStrength}%` }}></div>
                </div>
            </div>
        </section>

        <div className="px-6 space-y-4 max-w-lg mx-auto">
            {/* Ozi Public Channel Card */}
            <div className="p-6 rounded-[2.5rem] ozi-glass shadow-2xl relative overflow-hidden group border">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 bg-[#3F9BFF]/5"></div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-[#3F9BFF]/10 text-[#3F9BFF]"><GlobeAltIcon className="w-6 h-6" /></div>
                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Public Address</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Verified Ozi ID</p>
                        </div>
                    </div>
                    {activeHandle && (
                        <button onClick={handleCopyLink} className={`p-3 rounded-2xl transition-all ${copyFeedback ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                            {copyFeedback ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                        </button>
                    )}
                </div>
                
                {activeHandle ? (
                    <div className="bg-black/30 border rounded-2xl p-5 flex items-center justify-between group cursor-pointer transition-colors border-white/5 hover:border-[#3F9BFF]/30">
                        <p className="font-mono text-sm text-[#3F9BFF]">ozi.chat/{activeHandle}</p>
                        <ShareIcon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                ) : (
                    <button onClick={onNavigateToVerification} className="w-full bg-[#3F9BFF] hover:bg-blue-500 p-5 rounded-2xl flex items-center justify-center gap-3 text-xs font-black transition-all shadow-xl shadow-[#3F9BFF]/20">
                        <SparklesIcon className="w-5 h-5" /> CLAIM IDENTITY
                    </button>
                )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-[2.2rem] ozi-glass flex flex-col gap-2">
                    <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Privacy Shield</h4>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Standard</span>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                </div>
                <div className="p-5 rounded-[2.2rem] ozi-glass flex flex-col gap-2">
                    <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">E2EE Key Rank</h4>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Grade A+</span>
                        <ShieldCheckIcon className="w-4 h-4 text-[#3F9BFF]" />
                    </div>
                </div>
            </div>

            {/* Status Field */}
            <div className="ozi-glass p-5 rounded-[2rem] flex flex-col gap-4 cursor-pointer hover:bg-white/5 transition-all group" onClick={() => setShowStatusModal(true)}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl text-gray-500 group-hover:text-white transition-colors"><InfoCircleIcon className="w-6 h-6" /></div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Current Vibe</p>
                        <p className="text-sm font-medium line-clamp-1 text-gray-200">
                            {status}
                        </p>
                    </div>
                    <PencilIcon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                </div>
            </div>

            {/* System Info */}
            <div className="ozi-glass p-5 rounded-[2rem] flex items-center gap-4 opacity-70">
                <div className="p-3 bg-white/5 rounded-2xl text-gray-500"><PhoneIcon className="w-6 h-6" /></div>
                <div className="flex-1">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Authenticated Device</p>
                    <p className="text-sm text-gray-400 font-mono tracking-tight">{phone}</p>
                </div>
                <KeyIcon className="w-5 h-5 text-gray-700" />
            </div>

            {/* Account Settings Shortcut */}
            <button 
                onClick={() => window.location.hash = '#/settings/account'}
                className="w-full p-6 ozi-glass rounded-[2rem] flex items-center justify-between group hover:border-[#3F9BFF]/20"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400"><ShieldCheckIcon className="w-6 h-6" /></div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold">Privacy & Security</h3>
                        <p className="text-[10px] text-gray-500">Manage encryption keys and visibility</p>
                    </div>
                </div>
                <ChevronLeftIcon className="w-5 h-5 rotate-180 text-gray-600 group-hover:text-white transition-colors" />
            </button>
        </div>

        <div className="text-center mt-12 px-10">
            <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.3em] leading-relaxed">
                Identity secured via Ozi Private Cloud System.<br/>No metadata indexed for commercial use.
            </p>
        </div>
      </main>

      {/* Modal Overlays (Status, Camera, etc) */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in" onClick={() => setShowStatusModal(false)}>
            <div className="bg-[#1C1C2E] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowStatusModal(false)} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white"><CloseIcon className="w-5 h-5" /></button>
                <h3 className="text-xl font-black mb-6 uppercase tracking-tighter">Update Vibe</h3>
                <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#3F9BFF] resize-none" 
                    rows={4} value={status} onChange={(e) => setStatus(e.target.value)} 
                    placeholder="What's your current state?" autoFocus 
                />
                <button 
                    onClick={() => { saveProfile({ status }); setShowStatusModal(false); }}
                    className="w-full mt-6 bg-[#3F9BFF] py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#3F9BFF]/20 active:scale-95 transition-all"
                >
                    Update Status
                </button>
            </div>
        </div>
      )}

      {/* Upload Options HUD */}
      {showUploadOptions && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-end justify-center p-6 backdrop-blur-md animate-fade-in" onClick={() => setShowUploadOptions(false)}>
            <div className="bg-[#1C1C2E] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-4 mb-4" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1 bg-gray-800 rounded-full mx-auto mb-4 opacity-50"></div>
                
                <h3 className="text-center font-black text-lg uppercase tracking-widest mb-2">Profile Identity</h3>

                <button onClick={() => { setShowUploadOptions(false); setShowCameraView(true); }} className="w-full flex items-center gap-4 p-5 bg-white/5 rounded-2xl hover:bg-[#3F9BFF]/10 transition-colors group">
                    <div className="p-2 rounded-xl group-hover:bg-[#3F9BFF]/20 transition-all bg-[#3F9BFF]/10">
                      <CameraIcon className="w-6 h-6 text-[#3F9BFF]" />
                    </div>
                    <span className="font-bold text-sm">Camera Capture</span>
                </button>
                
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-4 p-5 bg-white/5 rounded-2xl hover:bg-purple-500/10 transition-colors group">
                    <div className="p-2 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-all">
                      <PhotoLibraryIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="font-bold text-sm">Access Data Vault (Gallery)</span>
                </button>

                {imageSrc && (
                    <button onClick={() => { saveProfile({ image: null }); setShowUploadOptions(false); }} className="w-full flex items-center gap-4 p-5 bg-red-500/10 rounded-2xl hover:bg-red-500/20 transition-colors group">
                        <div className="p-2 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-all">
                          <TrashIcon className="w-6 h-6 text-red-500" />
                        </div>
                        <span className="font-bold text-sm text-red-500">Remove Current Photo</span>
                    </button>
                )}
                
                <button onClick={() => setShowUploadOptions(false)} className="w-full py-4 text-gray-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
            </div>
        </div>
      )}

      {/* QR Code Expansion HUD */}
      {showQrCode && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl animate-fade-in" onClick={() => setShowQrCode(false)}>
              <div className="bg-[#1C1C2E] border-2 w-full max-w-sm rounded-[3.5rem] p-10 flex flex-col items-center relative border-[#3F9BFF]/30 shadow-[0_0_50px_rgba(63,155,255,0.2)]" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowQrCode(false)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-gray-300 hover:text-white"><CloseIcon className="w-5 h-5" /></button>
                  <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 mb-6 shadow-xl border-[#3F9BFF] shadow-[#3F9BFF]/20">
                      {imageSrc ? <img src={imageSrc} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-gray-800 flex items-center justify-center"><UserIcon className="w-10 h-10 text-gray-600" /></div>}
                  </div>
                  <h2 className="text-2xl font-black mb-1 uppercase tracking-tighter text-white">{name}</h2>
                  <p className="text-[10px] font-mono mb-8 uppercase tracking-widest text-[#3F9BFF]">{activeHandle || 'Guest Identity'}</p>
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-inner mb-8 opacity-80"><div className="w-48 h-48 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=OzichatUser')] bg-contain"></div></div>
                  <p className="text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">Identity Signal Encoded</p>
              </div>
          </div>
      )}

      {showCameraView && (
        <div className="fixed inset-0 bg-black z-[110] flex flex-col items-center justify-center animate-fade-in">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <button onClick={() => setShowCameraView(false)} className="absolute top-8 left-8 p-4 bg-black/50 rounded-full text-white backdrop-blur-md"><CloseIcon className="w-6 h-6" /></button>
            <div className="absolute bottom-12"><button onClick={handleCapture} className="w-24 h-24 rounded-full bg-white/20 border-8 border-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"><div className="w-16 h-16 rounded-full bg-white shadow-lg"></div></button></div>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-[#1C1C2E] border border-red-500/20 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Logout?</h3>
              <p className="text-sm text-gray-400 mb-6">
                You will need to login again to access your account.
              </p>
              <div className="w-full space-y-3">
                <button
                  onClick={() => { setShowLogoutConfirm(false); onLogout(); }}
                  className="w-full bg-red-500 hover:bg-red-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all text-white"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;