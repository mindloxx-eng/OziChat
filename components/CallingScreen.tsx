import React, { useEffect, useRef, useState } from 'react';
import type { Contact } from '../types';
import { PhoneMissedIcon } from './icons/PhoneMissedIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { VideoIcon } from './icons/VideoIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { UserIcon } from './icons/UserIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import { EyeIcon } from './icons/EyeIcon';
import { callService, type CallState } from '../services/callService';

interface CallingScreenProps {
  participants: Contact[];
  type: 'audio' | 'video';
  onEndCall: () => void;
  /** Unused for 1-to-1 calls — kept to preserve callsite shape. */
  allContacts?: Contact[];
}

const formatDuration = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const CallingScreen: React.FC<CallingScreenProps> = ({ participants, type, onEndCall }) => {
  const remoteContact = participants[0];
  const [callState, setCallState] = useState<CallState>(callService.getState());
  const [duration, setDuration] = useState(0);
  const [isPrivacyBlurOn, setIsPrivacyBlurOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Subscribe to callService state
  useEffect(() => {
    const unsub = callService.subscribe((s) => setCallState(s));
    return () => unsub();
  }, []);

  // Subscribe to media streams
  useEffect(() => {
    const unsub = callService.onStream((kind, stream) => {
      if (kind === 'local' && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      if (kind === 'remote') {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = stream;
      }
    });
    return () => unsub();
  }, []);

  // Tick duration once connected
  useEffect(() => {
    if (callState.phase !== 'connected') return;
    const start = Date.now();
    const t = setInterval(() => setDuration(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [callState.phase]);

  // Auto-dismiss when call ends or returns to idle
  useEffect(() => {
    if (callState.phase === 'ended' || callState.phase === 'idle') {
      const t = setTimeout(onEndCall, 800);
      return () => clearTimeout(t);
    }
  }, [callState.phase, onEndCall]);

  const isVideoCall = type === 'video' || callState.type === 'VIDEO';
  const isVideoEnabled = callState.isVideoEnabled && isVideoCall;
  const isMuted = callState.isMuted;
  const isOutgoingRinging = callState.phase === 'outgoing-ringing';
  const isConnecting = callState.phase === 'connecting';
  const isConnected = callState.phase === 'connected';

  const handleEndOrCancel = () => {
    if (isOutgoingRinging || isConnecting) {
      callService.cancelOutgoing();
    } else {
      callService.endCall();
    }
  };

  const statusLabel = (() => {
    switch (callState.phase) {
      case 'outgoing-ringing': return 'Ringing…';
      case 'incoming-ringing': return 'Incoming…';
      case 'connecting': return 'Connecting…';
      case 'connected': return formatDuration(duration);
      case 'ended': return callState.endReason ? `Ended (${callState.endReason})` : 'Ended';
      default: return '';
    }
  })();

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white relative overflow-hidden font-mono">
      {/* Hidden audio element for audio-only calls */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* HUD top */}
      <div className="absolute top-0 left-0 right-0 p-6 z-40 flex justify-end items-start pointer-events-none">
        <div className="flex flex-col items-end gap-1 text-right">
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 shadow-2xl">
            <h1 className="text-lg font-black tracking-tight uppercase">
              {remoteContact?.name || callState.remoteUserName || 'Unknown'}
            </h1>
            <div className="flex items-center justify-end gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#00FF9D]' : 'bg-amber-400 animate-pulse'}`} />
              <p className="text-xs font-black text-green-400 font-mono tracking-widest">
                {statusLabel}
              </p>
            </div>
          </div>
          <div className="mt-2 text-[8px] font-black text-gray-600 uppercase tracking-[0.4em]">
            {isVideoCall ? 'Video Call' : 'Audio Call'}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <main className="flex-1 flex items-center justify-center py-20">
        <div className={`grid ${isConnected && isVideoCall ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-3 w-full h-full p-4 auto-rows-fr`}>
          {/* Self view */}
          <div className="relative bg-gray-900 rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-2xl flex items-center justify-center ring-1 ring-white/5">
            {isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform scale-x-[-1] transition-all duration-700 ${isPrivacyBlurOn ? 'blur-3xl scale-110' : 'blur-0'}`}
              />
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-4 shadow-xl border border-white/10">
                  <UserIcon className="w-12 h-12 text-gray-400" />
                </div>
                <span className="text-white/60 font-black text-xs uppercase tracking-[0.2em]">
                  {isVideoCall ? 'Video Off' : 'Audio Call'}
                </span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-2xl text-[10px] font-black text-white backdrop-blur-md flex items-center gap-2 border border-white/10 tracking-widest uppercase shadow-lg">
              <div className={`w-1.5 h-1.5 rounded-full ${isMuted ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-green-500 shadow-[0_0_8px_#00FF9D]'}`} />
              You
              {isPrivacyBlurOn && <span className="text-blue-400 opacity-80">(Blur)</span>}
            </div>
          </div>

          {/* Remote view */}
          <div className="relative bg-gray-900 rounded-[2.5rem] overflow-hidden border-2 border-[#3F9BFF]/20 shadow-2xl flex items-center justify-center ring-1 ring-white/5">
            {isConnected && isVideoCall ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative">
                  <div className={`absolute -inset-4 border border-[#3F9BFF]/30 rounded-full ${isOutgoingRinging || isConnecting ? 'animate-ping' : ''}`} />
                  {(remoteContact?.avatarUrl || callState.remoteUserAvatarUrl) ? (
                    <img
                      src={remoteContact?.avatarUrl || callState.remoteUserAvatarUrl}
                      alt=""
                      className="w-28 h-28 rounded-full border-4 border-[#3F9BFF] shadow-2xl object-cover relative z-10"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full border-4 border-[#3F9BFF] shadow-2xl bg-gray-700 flex items-center justify-center relative z-10">
                      <UserIcon className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                </div>
                <p className="mt-6 font-black text-xl tracking-tight text-white drop-shadow-lg">
                  {remoteContact?.name || callState.remoteUserName}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#00FF9D]' : 'bg-amber-500 animate-pulse'}`} />
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
                    {isConnected ? 'Signal Locked' : statusLabel}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Controls */}
      <footer className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex justify-center items-center gap-6 z-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        {isVideoCall && (
          <button
            onClick={() => callService.toggleVideo()}
            className={`p-5 rounded-[1.5rem] transition-all shadow-2xl backdrop-blur-xl border border-white/10 active:scale-90 hover:scale-105 ${isVideoEnabled ? 'bg-white text-black shadow-white/10' : 'bg-white/5 text-white'}`}
            title="Toggle Video"
          >
            {isVideoEnabled ? <VideoIcon className="w-6 h-6" /> : <EyeSlashIcon className="w-6 h-6 text-gray-500" />}
          </button>
        )}

        {isVideoEnabled && (
          <button
            onClick={() => setIsPrivacyBlurOn(!isPrivacyBlurOn)}
            className={`p-5 rounded-[1.5rem] transition-all shadow-2xl backdrop-blur-xl border border-white/10 active:scale-90 hover:scale-105 ${isPrivacyBlurOn ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'bg-white/5 text-white'}`}
            title="Toggle Privacy Blur"
          >
            {isPrivacyBlurOn ? <EyeIcon className="w-6 h-6" /> : <EyeSlashIcon className="w-6 h-6" />}
          </button>
        )}

        <button
          onClick={handleEndOrCancel}
          className="p-7 bg-red-600 rounded-[2rem] shadow-[0_0_40px_rgba(220,38,38,0.5)] border-2 border-red-400/30 transform transition-all hover:scale-110 active:scale-95 mx-4"
          title={isOutgoingRinging ? 'Cancel' : 'End Call'}
        >
          <PhoneMissedIcon className="w-10 h-10 transform rotate-[135deg] text-white" />
        </button>

        <button
          onClick={() => callService.toggleMute()}
          className={`p-5 rounded-[1.5rem] transition-all shadow-2xl backdrop-blur-xl border border-white/10 active:scale-90 hover:scale-105 ${isMuted ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-white/5 text-white'}`}
          title="Toggle Mute"
        >
          <MicrophoneIcon className="w-6 h-6" />
        </button>

        <button
          onClick={() => setIsSpeakerOn((s) => !s)}
          className={`p-5 rounded-[1.5rem] transition-all shadow-2xl backdrop-blur-xl border border-white/10 active:scale-90 hover:scale-105 ${isSpeakerOn ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-white/5 text-white'}`}
          title="Toggle Speaker"
        >
          <SpeakerWaveIcon className="w-6 h-6" />
        </button>
      </footer>

      {/* Background VFX */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#3F9BFF22_0%,transparent_70%)]" />
      </div>
    </div>
  );
};

export default CallingScreen;
