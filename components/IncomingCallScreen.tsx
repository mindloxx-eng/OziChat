import React from 'react';
import { PhoneIcon } from './icons/PhoneIcon';
import { PhoneMissedIcon } from './icons/PhoneMissedIcon';
import { VideoIcon } from './icons/VideoIcon';
import { UserIcon } from './icons/UserIcon';

interface IncomingCallScreenProps {
  callerName: string;
  callerAvatarUrl?: string;
  callType: 'AUDIO' | 'VIDEO';
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({
  callerName,
  callerAvatarUrl,
  callType,
  onAccept,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-gradient-to-b from-[#0c0c1c] via-[#1a1330] to-[#050508] text-white p-8 animate-fade-in">
      {/* Top — caller info */}
      <div className="flex flex-col items-center mt-20 gap-4">
        <p className="text-xs font-black uppercase tracking-[0.4em] text-blue-400">
          Incoming {callType === 'VIDEO' ? 'Video' : 'Audio'} Call
        </p>
        <div className="relative">
          <div className="absolute -inset-4 border border-[#3F9BFF]/40 rounded-full animate-ping" />
          <div className="absolute -inset-8 border border-[#3F9BFF]/20 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
          {callerAvatarUrl ? (
            <img
              src={callerAvatarUrl}
              alt={callerName}
              className="w-36 h-36 rounded-full border-4 border-[#3F9BFF] shadow-2xl object-cover relative z-10"
            />
          ) : (
            <div className="w-36 h-36 rounded-full border-4 border-[#3F9BFF] shadow-2xl bg-gray-700 flex items-center justify-center relative z-10">
              <UserIcon className="w-20 h-20 text-gray-300" />
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold mt-4 text-center">{callerName}</h1>
        <p className="text-sm text-gray-400 flex items-center gap-2">
          {callType === 'VIDEO' ? <VideoIcon className="w-4 h-4" /> : <PhoneIcon className="w-4 h-4" />}
          <span className="uppercase tracking-widest text-[10px] font-bold">Ringing…</span>
        </p>
      </div>

      {/* Bottom — accept / reject */}
      <div className="w-full max-w-md flex items-center justify-around mb-12">
        <button
          onClick={onReject}
          className="flex flex-col items-center gap-2 group"
          aria-label="Reject call"
        >
          <span className="p-6 bg-red-600 rounded-full shadow-[0_0_40px_rgba(220,38,38,0.5)] border-2 border-red-400/30 transform transition-all group-hover:scale-110 group-active:scale-95">
            <PhoneMissedIcon className="w-8 h-8 text-white transform rotate-[135deg]" />
          </span>
          <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Decline</span>
        </button>

        <button
          onClick={onAccept}
          className="flex flex-col items-center gap-2 group"
          aria-label="Accept call"
        >
          <span className="p-6 bg-green-600 rounded-full shadow-[0_0_40px_rgba(34,197,94,0.5)] border-2 border-green-400/30 transform transition-all group-hover:scale-110 group-active:scale-95 animate-pulse">
            {callType === 'VIDEO' ? (
              <VideoIcon className="w-8 h-8 text-white" />
            ) : (
              <PhoneIcon className="w-8 h-8 text-white" />
            )}
          </span>
          <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Accept</span>
        </button>
      </div>
    </div>
  );
};

export default IncomingCallScreen;
