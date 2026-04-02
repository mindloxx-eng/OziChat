import React, { useState, useMemo, useEffect } from 'react';
import { UserIcon } from './icons/UserIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import * as backend from '../services/backendService';

interface VerificationScreenProps {
  onVerificationComplete: () => void;
}

const VerificationScreen: React.FC<VerificationScreenProps> = ({ onVerificationComplete }) => {
  const [name, setName] = useState(localStorage.getItem('ozichat_display_name') || '');
  const [channelName, setChannelName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [userPhone, setUserPhone] = useState('');

  useEffect(() => {
    const phone = localStorage.getItem('ozichat_user_phone') || 'No Phone Linked';
    setUserPhone(phone);
  }, []);

  // Automatically generate handle from channel name
  const handle = useMemo(() => {
    if (!channelName.trim()) return '';
    return '@' + channelName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
  }, [channelName]);

  const handleSubmit = () => {
    if (!name.trim() || !channelName.trim()) return;

    setIsVerifying(true);
    localStorage.setItem('ozichat_display_name', name.trim());
    backend.saveUserHandle(handle);
    localStorage.setItem('ozichat_setup_status', 'complete');
    window.dispatchEvent(new Event('storage'));
    
    // Simulate verification process
    setTimeout(() => {
      onVerificationComplete();
    }, 1500);
  };

  const handleSkip = () => {
    if (!name.trim()) {
        localStorage.setItem('ozichat_display_name', 'Ozi User');
    } else {
        localStorage.setItem('ozichat_display_name', name.trim());
    }
    localStorage.setItem('ozichat_setup_status', 'skipped');
    onVerificationComplete();
  };

  const canSubmit = name.trim() && channelName.trim() && !isVerifying;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6 bg-[#050508] text-white overflow-y-auto custom-scrollbar relative">
      <style>{`
        .verified-glass {
            background: rgba(0, 255, 157, 0.05);
            border: 1px solid rgba(0, 255, 157, 0.2);
            backdrop-filter: blur(10px);
        }
        .hud-scanline {
            background: linear-gradient(to bottom, transparent 50%, rgba(63, 155, 255, 0.03) 50%);
            background-size: 100% 4px;
        }
      `}</style>
      
      <div className="absolute inset-0 hud-scanline pointer-events-none opacity-40"></div>

      {/* Header section */}
      <div className="text-center w-full pt-8 relative z-10">
        <button 
            onClick={handleSkip}
            className="absolute top-0 right-0 px-4 py-2 text-[10px] font-black text-slate-500 hover:text-white transition-colors tracking-widest uppercase"
        >
            Skip Setup
        </button>
        <div className="w-20 h-20 mx-auto mb-6 bg-indigo-500/10 rounded-3xl flex items-center justify-center border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
          <ShieldCheckIcon className="w-10 h-10 text-[#3F9BFF]" />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">Identify Link</h1>
        <p className="text-slate-400 text-sm font-medium">Link your unique channel handle to your verified phone identity.</p>
      </div>

      {/* Form section */}
      <div className="w-full max-w-sm space-y-8 my-8 z-10">
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Display Name</label>
          <input
            type="text"
            id="fullName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#111827] border border-white/5 rounded-2xl p-5 text-white focus:outline-none focus:ring-2 focus:ring-[#3F9BFF] transition-all font-bold shadow-inner"
            placeholder="e.g. John Ozi"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="channelName" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Channel Handle</label>
          <div className="relative group">
              <input
                type="text"
                id="channelName"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full bg-[#111827] border border-white/5 rounded-2xl p-5 text-white focus:outline-none focus:ring-2 focus:ring-[#3F9BFF] transition-all font-bold shadow-inner"
                placeholder="Unique Name"
              />
              {handle && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#3F9BFF] px-4 py-1.5 rounded-full text-[10px] font-black tracking-tighter animate-fade-in shadow-lg">
                      {handle}
                  </div>
              )}
          </div>
          <p className="text-[10px] text-slate-500 mt-3 ml-2 flex items-center gap-2">
              <GlobeAltIcon className="w-3 h-3" />
              Your address: <span className="text-indigo-400 font-bold uppercase">ozi.chat/{handle || '...'}</span>
          </p>
        </div>

        {/* Phone Verification Confirm Block */}
        <div className="space-y-2 pt-2">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Identity Source</label>
          <div className="verified-glass p-5 rounded-[2rem] flex items-center justify-between border border-[#00FF9D]/20">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#00FF9D]/10 rounded-2xl">
                      <PhoneIcon className="w-6 h-6 text-[#00FF9D]" />
                  </div>
                  <div>
                      <p className="text-xs font-black text-[#00FF9D] uppercase tracking-widest">Phone Verified</p>
                      <p className="text-sm font-mono text-white/90">{userPhone}</p>
                  </div>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-[#00FF9D] animate-pulse" />
          </div>
          <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest ml-2">Verified via Ozi Protocol</p>
        </div>
      </div>

      {/* Footer section */}
      <div className="w-full max-w-sm pb-10 space-y-6 z-10">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-[#3F9BFF] hover:bg-blue-500 text-white font-black py-5 px-8 rounded-[2rem] text-sm uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-2xl shadow-indigo-500/20 disabled:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isVerifying ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>ACTIVATE CHANNEL <GlobeAltIcon className="w-5 h-5" /></>
          )}
        </button>
        <p className="text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">
            Identity secured via private cloud link
        </p>
      </div>
    </div>
  );
};

export default VerificationScreen;