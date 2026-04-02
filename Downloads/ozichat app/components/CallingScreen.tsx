import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Contact } from '../types';
import { PhoneMissedIcon } from './icons/PhoneMissedIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { VideoIcon } from './icons/VideoIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { UserIcon } from './icons/UserIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import { EyeIcon } from './icons/EyeIcon';
import { ArrowsRightLeftIcon } from './icons/ArrowsRightLeftIcon';

interface CallingScreenProps {
  participants: Contact[];
  type: 'audio' | 'video';
  onEndCall: () => void;
  allContacts?: Contact[]; // To allow adding more people
}

const CallingScreen: React.FC<CallingScreenProps> = ({ participants: initialParticipants, type, onEndCall, allContacts = [] }) => {
  const [participants, setParticipants] = useState<Contact[]>(initialParticipants);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected'>('ringing');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(type === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isPrivacyBlurOn, setIsPrivacyBlurOn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bitrate, setBitrate] = useState('4.2 Mbps');
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (callStatus === 'connected') {
        timer = setInterval(() => {
            setDuration(d => d + 1);
            setBitrate((4 + Math.random()).toFixed(1) + ' Mbps');
        }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // Simulate connection
  useEffect(() => {
      const timer = setTimeout(() => setCallStatus('connected'), 2500);
      return () => clearTimeout(timer);
  }, []);

  // Media Stream
  useEffect(() => {
      const enableStream = async () => {
          try {
              if (streamRef.current) {
                  streamRef.current.getTracks().forEach(t => t.stop());
              }
              const stream = await navigator.mediaDevices.getUserMedia({
                  audio: true,
                  video: isVideoEnabled ? { facingMode: cameraFacingMode } : false
              });
              streamRef.current = stream;
              if (localVideoRef.current) {
                  localVideoRef.current.srcObject = stream;
              }
          } catch (err) {
              console.error("Error accessing media devices", err);
          }
      };
      enableStream();
      return () => {
          if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
          }
      };
  }, [isVideoEnabled, cameraFacingMode]);

  const toggleMute = () => {
      if (streamRef.current) {
          const audioTrack = streamRef.current.getAudioTracks()[0];
          if (audioTrack) {
              audioTrack.enabled = !audioTrack.enabled;
              setIsMuted(!audioTrack.enabled);
          }
      }
  };

  const toggleVideo = async () => {
      setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleCamera = () => {
      setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const addParticipant = (contact: Contact) => {
      if (!participants.find(p => p.id === contact.id)) {
          setParticipants(prev => [...prev, contact]);
      }
      setShowAddModal(false);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const ParticipantGrid = () => {
      const count = participants.length + 1; // +1 for self
      let gridClass = 'grid-cols-1';
      if (count === 2) gridClass = 'grid-cols-1 md:grid-cols-2';
      if (count > 2 && count <= 4) gridClass = 'grid-cols-2';
      if (count > 4) gridClass = 'grid-cols-2 md:grid-cols-3';

      return (
          <div className={`grid ${gridClass} gap-3 w-full h-full p-4 auto-rows-fr`}>
              {/* Self View */}
              <div className="relative bg-gray-900 rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-2xl flex items-center justify-center group ring-1 ring-white/5">
                  {isVideoEnabled ? (
                      <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={`w-full h-full object-cover ${cameraFacingMode === 'user' ? 'transform scale-x-[-1]' : ''} transition-all duration-700 ${isPrivacyBlurOn ? 'blur-3xl scale-110' : 'blur-0'}`} 
                      />
                  ) : (
                      <div className="flex flex-col items-center animate-fade-in">
                          <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-4 shadow-xl border border-white/10">
                              <UserIcon className="w-12 h-12 text-gray-400" />
                          </div>
                          <span className="text-white/60 font-black text-xs uppercase tracking-[0.2em]">Video Off</span>
                      </div>
                  )}
                  
                  {/* Indicators Overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                       <button onClick={toggleCamera} className="p-2 bg-black/40 backdrop-blur-md rounded-xl text-white border border-white/10 hover:bg-black/60 transition-colors">
                           <ArrowsRightLeftIcon className="w-4 h-4" />
                       </button>
                  </div>

                  <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-2xl text-[10px] font-black text-white backdrop-blur-md flex items-center gap-2 border border-white/10 tracking-widest uppercase shadow-lg">
                      <div className={`w-1.5 h-1.5 rounded-full ${isMuted ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-green-500 shadow-[0_0_8px_#00FF9D]'}`} />
                      You
                      {isPrivacyBlurOn && <span className="text-blue-400 opacity-80">(Blur Active)</span>}
                  </div>
              </div>

              {/* Remote Participants */}
              {participants.map(p => (
                  <div key={p.id} className="relative bg-gray-900 rounded-[2.5rem] overflow-hidden border-2 border-[#3F9BFF]/20 shadow-2xl flex items-center justify-center ring-1 ring-white/5">
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                          <div className="relative">
                              <div className={`absolute -inset-4 border border-[#3F9BFF]/30 rounded-full ${callStatus === 'ringing' ? 'animate-ping' : ''}`} />
                              <img src={p.avatarUrl} alt="" className="w-28 h-28 rounded-full border-4 border-[#3F9BFF] shadow-2xl object-cover relative z-10" />
                          </div>
                          <p className="mt-6 font-black text-xl tracking-tight text-white drop-shadow-lg">{p.name}</p>
                          <div className="mt-2 flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${callStatus === 'ringing' ? 'bg-amber-500 animate-pulse' : 'bg-green-500 shadow-[0_0_10px_#00FF9D]'}`} />
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{callStatus === 'ringing' ? 'Connecting Signal...' : 'Signal Locked'}</p>
                          </div>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-2xl text-[10px] font-black text-white border border-white/10 backdrop-blur-md tracking-widest uppercase">
                          {p.name}
                      </div>
                      <div className="absolute bottom-4 right-4 text-[8px] font-mono text-gray-500 tracking-tighter uppercase">
                          48kHz // 24Bit // Encrypted
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  const AddParticipantModal = () => (
      <div className="absolute inset-0 bg-black/80 z-[60] flex items-end sm:items-center justify-center animate-fade-in backdrop-blur-md" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#1C1C2E] w-full sm:w-[28rem] sm:rounded-[3rem] rounded-t-[3rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 max-h-[75vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                  <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Link Signal</h3>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Select identity to merge</p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"><ChevronDownIcon className="w-6 h-6 text-gray-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {allContacts.filter(c => !participants.find(p => p.id === c.id)).map(contact => (
                      <button 
                          key={contact.id} 
                          onClick={() => addParticipant(contact)}
                          className="w-full flex items-center gap-4 p-4 hover:bg-white/5 bg-white/[0.02] rounded-[1.5rem] transition-all text-left border border-white/5 group active:scale-[0.98]"
                      >
                          <img src={contact.avatarUrl} className="w-14 h-14 rounded-2xl border-2 border-white/10 group-hover:border-[#3F9BFF] transition-colors object-cover" alt="" />
                          <div className="flex-1 min-w-0">
                                <span className="font-bold text-white text-lg block truncate">{contact.name}</span>
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{contact.phone}</span>
                          </div>
                          <div className="p-3 bg-[#3F9BFF]/10 text-[#3F9BFF] rounded-2xl group-hover:bg-[#3F9BFF] group-hover:text-white transition-all shadow-lg">
                                <UserPlusIcon className="w-6 h-6" />
                          </div>
                      </button>
                  ))}
                  {allContacts.length === participants.length && (
                      <div className="text-center py-12 opacity-30">
                          <p className="text-xs font-black uppercase tracking-[0.3em]">No valid identities found</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white relative overflow-hidden font-mono">
      <style>{`
        @keyframes calling-glow {
            0%, 100% { border-color: rgba(63, 155, 255, 0.2); }
            50% { border-color: rgba(63, 155, 255, 0.6); }
        }
        .animate-call-hud { animation: calling-glow 3s infinite ease-in-out; }
        .control-btn { @apply p-5 rounded-[1.5rem] transition-all shadow-2xl backdrop-blur-xl border border-white/10 active:scale-90 hover:scale-105; }
      `}</style>
      
      {showAddModal && <AddParticipantModal />}
      
      {/* HUD Information Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-40 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-1.5 pointer-events-auto">
              <button onClick={() => setShowAddModal(true)} className="p-3 bg-white/5 rounded-[1.2rem] hover:bg-white/10 backdrop-blur-xl transition-all border border-white/10 shadow-2xl group">
                  <UserPlusIcon className="w-6 h-6 text-[#3F9BFF] group-hover:scale-110 transition-transform" />
              </button>
              <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mt-2">
                   Live: {bitrate}
              </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
               <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 shadow-2xl">
                    <h1 className="text-lg font-black tracking-tight uppercase">
                        {participants.length === 1 ? participants[0].name : `Network Link (${participants.length + 1})`}
                    </h1>
                    <div className="flex items-center justify-end gap-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#00FF9D]" />
                        <p className="text-xs font-black text-green-400 font-mono tracking-widest">
                            {callStatus === 'ringing' ? 'Ringing identities...' : formatDuration(duration)}
                        </p>
                    </div>
               </div>
               <div className="mt-2 text-[8px] font-black text-gray-600 uppercase tracking-[0.4em]">Secure Transmission active</div>
          </div>
      </div>

      {/* Main Grid Area */}
      <main className="flex-1 flex items-center justify-center py-20">
          <ParticipantGrid />
      </main>
      
      {/* Futuristic Controls HUD */}
      <footer className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex justify-center items-center gap-6 z-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <button
          onClick={toggleVideo}
          className={`control-btn ${isVideoEnabled ? 'bg-white text-black shadow-white/10' : 'bg-white/5 text-white'}`}
          title="Toggle Video"
        >
          {isVideoEnabled ? <VideoIcon className="w-6 h-6" /> : <EyeSlashIcon className="w-6 h-6 text-gray-500" />}
        </button>
        
        {isVideoEnabled && (
            <button
                onClick={() => setIsPrivacyBlurOn(!isPrivacyBlurOn)}
                className={`control-btn ${isPrivacyBlurOn ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'bg-white/5 text-white'}`}
                title="Toggle Privacy Blur"
            >
                {isPrivacyBlurOn ? <EyeIcon className="w-6 h-6" /> : <EyeSlashIcon className="w-6 h-6" />}
            </button>
        )}

        <button
          onClick={onEndCall}
          className="p-7 bg-red-600 rounded-[2rem] shadow-[0_0_40px_rgba(220,38,38,0.5)] border-2 border-red-400/30 transform transition-all hover:scale-110 active:scale-95 mx-4"
          title="Disconnect Signal"
        >
          <PhoneMissedIcon className="w-10 h-10 transform rotate-[135deg] text-white" />
        </button>

        <button
          onClick={toggleMute}
          className={`control-btn ${isMuted ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-white/5 text-white'}`}
          title="Toggle Mute"
        >
          <MicrophoneIcon className="w-6 h-6" />
        </button>

        <button
          onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          className={`control-btn ${isSpeakerOn ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-white/5 text-white'}`}
          title="Toggle Speaker"
        >
          <SpeakerWaveIcon className="w-6 h-6" />
        </button>
      </footer>
      
      {/* Background VFX */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#3F9BFF22_0%,transparent_70%)]" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-40" />
      </div>
    </div>
  );
};

export default CallingScreen;