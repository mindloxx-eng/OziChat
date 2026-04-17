import React, { useState } from 'react';
import type { Contact, AudioCodec, VideoCodec, VibrationPattern } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { PhotoLibraryIcon } from './icons/PhotoLibraryIcon';
import { BellIcon } from './icons/BellIcon';
import { BlockIcon } from './icons/BlockIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { VideoIcon } from './icons/VideoIcon';
import { CogIcon } from './icons/CogIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { WifiIcon } from './icons/WifiIcon';
import { StarIcon } from './icons/StarIcon';
import { StarOutlineIcon } from './icons/StarOutlineIcon';
import { BellSlashIcon } from './icons/BellSlashIcon';
import { MusicalNoteIcon } from './icons/MusicalNoteIcon';
import { VibrationIcon } from './icons/VibrationIcon';
import { ClockIcon } from './icons/ClockIcon';

interface ContactDetailsScreenProps {
  contact: Contact;
  onBack: () => void;
  onStartChat: () => void;
  onToggleFavorite: (id: string) => void;
  onUpdateSettings: (id: string, settings: Partial<Contact>) => void;
  onNavigateToMedia: () => void;
  onDeleteContact: (id: string) => void;
  onPurgeMessages: (id: string) => void;
  onInitiateCall: (contact: Contact, type: 'audio' | 'video') => void;
  onEditContact: (contact: Contact) => void;
  onBlockContact: (contactId: string) => void;
}

const SelectionModal: React.FC<{
    title: string;
    options: { value: any; label: string }[];
    onSelect: (option: any) => void;
    onClose: () => void;
}> = ({ title, options, onSelect, onClose }) => (
    <div 
        className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center animate-fade-in backdrop-blur-sm"
        onClick={onClose}
    >
        <div 
            className="bg-[#1C1C2E] rounded-[2rem] p-8 w-80 text-center shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
        >
            <h3 className="text-xl font-black mb-6 text-white uppercase tracking-tighter">{title}</h3>
            <div className="space-y-2">
                {options.map((option) => (
                    <button 
                        key={option.label}
                        onClick={() => { onSelect(option.value); onClose(); }}
                        className="w-full text-left bg-white/5 hover:bg-[#3F9BFF]/20 text-white font-bold py-4 px-5 rounded-2xl transition-all border border-transparent hover:border-[#3F9BFF]/30 active:scale-95"
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            <button
                onClick={onClose}
                className="mt-6 text-gray-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors"
            >
                Cancel
            </button>
        </div>
    </div>
);

const ContactDetailsScreen: React.FC<ContactDetailsScreenProps> = ({ 
  contact, 
  onBack, 
  onStartChat, 
  onToggleFavorite, 
  onUpdateSettings, 
  onNavigateToMedia, 
  onDeleteContact,
  onPurgeMessages,
  onInitiateCall,
  onEditContact,
  onBlockContact
}) => {
  const [modal, setModal] = useState<'audio' | 'video' | 'sound' | 'vibration' | 'disappearing' | null>(null);

  const audioCodecOptions = ['Opus', 'AAC', 'G.711'].map(o => ({ value: o, label: o }));
  const videoCodecOptions = ['H.265', 'VP9', 'H.264'].map(o => ({ value: o, label: o }));
  const soundOptions = ['Default', 'Chime', 'Alert', 'Synth'].map(o => ({ value: o, label: o }));
  const vibrationOptions = ['Default', 'Short', 'Long', 'Pulse'].map(o => ({ value: o, label: o }));
  const disappearingOptions = [
      { value: 0, label: 'Off' },
      { value: 24, label: '24 Hours' },
      { value: 168, label: '7 Days' },
      { value: 2160, label: '90 Days' },
  ];

  const handleBlockClick = () => {
      const action = contact.isBlocked ? 'unblock' : 'block';
      if (window.confirm(`Are you sure you want to ${action} ${contact.name}?`)) {
          onBlockContact(contact.id);
      }
  };

  const handlePurgeClick = () => {
      if (window.confirm(`Permanently purge all transmission history for ${contact.name}? This action is irreversible.`)) {
          onPurgeMessages(contact.id);
      }
  };

  const getDisappearingLabel = (hours?: number) => {
      if (!hours) return 'Off';
      if (hours === 24) return '24 Hours';
      if (hours === 168) return '7 Days';
      return '90 Days';
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0E14] text-white">
        {modal === 'audio' && (
            <SelectionModal 
                title="Audio Codec"
                options={audioCodecOptions}
                onSelect={(codec) => onUpdateSettings(contact.id, { audioCodec: codec })}
                onClose={() => setModal(null)}
            />
        )}
        {modal === 'video' && (
            <SelectionModal 
                title="Video Codec"
                options={videoCodecOptions}
                onSelect={(codec) => onUpdateSettings(contact.id, { videoCodec: codec })}
                onClose={() => setModal(null)}
            />
        )}
         {modal === 'sound' && (
            <SelectionModal
                title="Notification Sound"
                options={soundOptions}
                onSelect={(sound) => onUpdateSettings(contact.id, { notificationSound: sound })}
                onClose={() => setModal(null)}
            />
        )}
        {modal === 'vibration' && (
            <SelectionModal
                title="Vibration"
                options={vibrationOptions}
                onSelect={(pattern) => onUpdateSettings(contact.id, { vibrationPattern: pattern })}
                onClose={() => setModal(null)}
            />
        )}
        {modal === 'disappearing' && (
            <SelectionModal
                title="Disappearing Messages"
                options={disappearingOptions}
                onSelect={(val) => onUpdateSettings(contact.id, { disappearingMessagesTimer: val })}
                onClose={() => setModal(null)}
            />
        )}

      <header className="flex items-center justify-between p-6 bg-gradient-to-b from-[#0B0E14] to-transparent z-10 shrink-0">
        <button onClick={onBack} className="p-3 bg-white/5 backdrop-blur-md rounded-2xl hover:bg-white/10 transition-all text-white active:scale-90">
            <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
            <button onClick={() => onToggleFavorite(contact.id)} className="p-3 bg-white/5 backdrop-blur-md rounded-2xl hover:bg-white/10 transition-all">
                {contact.isFavorite ? <StarIcon className="w-5 h-5 text-yellow-400" /> : <StarOutlineIcon className="w-5 h-5" />}
            </button>
            <button onClick={() => onEditContact(contact)} className="p-3 bg-white/5 backdrop-blur-md rounded-2xl hover:bg-white/10 transition-all">
              <PencilIcon className="w-5 h-5" />
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
        <div className="flex flex-col items-center p-8 pt-0 text-center">
          <div className="relative mb-6">
              <img src={contact.avatarUrl} alt={contact.name} className="w-32 h-32 rounded-[2.5rem] border-2 border-[#3F9BFF] object-cover shadow-2xl" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">{contact.name}</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mb-4">Signal ID: {contact.id}</p>
          <div className="bg-[#3F9BFF]/10 text-[#3F9BFF] px-4 py-1.5 rounded-full border border-[#3F9BFF]/20 text-xs font-bold italic">
            "{contact.status}"
          </div>
        </div>
        
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-3">
                <button onClick={onStartChat} className="flex flex-col items-center gap-3 p-5 bg-white/5 rounded-3xl hover:bg-[#3F9BFF]/10 transition-all active:scale-95 group border border-transparent hover:border-[#3F9BFF]/30">
                    <ChatBubbleIcon className="w-6 h-6 text-[#3F9BFF]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Message</span>
                </button>
                <button onClick={() => onInitiateCall(contact, 'audio')} className="flex flex-col items-center gap-3 p-5 bg-white/5 rounded-3xl hover:bg-green-500/10 transition-all active:scale-95 group border border-transparent hover:border-green-500/30">
                    <PhoneIcon className="w-6 h-6 text-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Voice</span>
                </button>
                 <button onClick={() => onInitiateCall(contact, 'video')} className="flex flex-col items-center gap-3 p-5 bg-white/5 rounded-3xl hover:bg-purple-500/10 transition-all active:scale-95 group border border-transparent hover:border-purple-500/30">
                    <VideoIcon className="w-6 h-6 text-purple-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Video</span>
                </button>
            </div>

          <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Privacy Protocols</h3>
              <div className="bg-[#111827] rounded-[2rem] overflow-hidden border border-white/5 shadow-sm">
                  <button onClick={() => setModal('disappearing')} className="w-full flex justify-between items-center p-5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <ClockIcon className="w-6 h-6 text-indigo-400" />
                        <div className="text-left">
                            <p className="text-sm font-bold">Disappearing Messages</p>
                            <p className="text-[10px] text-gray-500 font-medium">Self-destruct transmission timer</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest">{getDisappearingLabel(contact.disappearingMessagesTimer)}</span>
                        <ChevronRightIcon className="w-4 h-4 text-gray-700" />
                      </div>
                  </button>
              </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Call Integrity</h3>
             <div className="bg-[#111827] rounded-[2rem] overflow-hidden border border-white/5 shadow-sm">
                <button onClick={() => setModal('audio')} className="w-full flex justify-between items-center p-5 hover:bg-white/5 transition-colors border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <SpeakerWaveIcon className="w-6 h-6 text-[#3F9BFF]/60" />
                    <span className="text-sm font-bold">Audio Protocol</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-mono text-xs">{contact.audioCodec || 'Opus'}</span>
                    <ChevronRightIcon className="w-4 h-4 text-gray-700" />
                  </div>
                </button>
                <button onClick={() => setModal('video')} className="w-full flex justify-between items-center p-5 hover:bg-white/5 transition-colors border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <VideoCameraIcon className="w-6 h-6 text-[#3F9BFF]/60" />
                    <span className="text-sm font-bold">Video Link</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-mono text-xs">{contact.videoCodec || 'H.264'}</span>
                    <ChevronRightIcon className="w-4 h-4 text-gray-700" />
                  </div>
                </button>
                 <div className="w-full flex justify-between items-center p-5">
                  <div className="flex items-center gap-4">
                    <WifiIcon className="w-6 h-6 text-[#3F9BFF]/60" />
                    <span className="text-sm font-bold">Data Optimization</span>
                  </div>
                   <button
                      role="switch"
                      aria-checked={contact.useDataSaver}
                      onClick={() => onUpdateSettings(contact.id, { useDataSaver: !contact.useDataSaver })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${contact.useDataSaver ? 'bg-[#3F9BFF]' : 'bg-gray-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${contact.useDataSaver ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
              </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Local Preferences</h3>
             <div className="bg-[#111827] rounded-[2rem] overflow-hidden border border-white/5 shadow-sm">
                <div className="w-full flex justify-between items-center p-5 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <BellSlashIcon className="w-6 h-6 text-gray-500" />
                    <span className="text-sm font-bold">Mute Signal</span>
                  </div>
                   <button
                      role="switch"
                      aria-checked={contact.notificationsMuted}
                      onClick={() => onUpdateSettings(contact.id, { notificationsMuted: !contact.notificationsMuted })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${contact.notificationsMuted ? 'bg-amber-500' : 'bg-gray-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${contact.notificationsMuted ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                 <button onClick={() => setModal('sound')} className="w-full flex justify-between items-center p-5 border-b border-white/5 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                        <MusicalNoteIcon className="w-6 h-6 text-gray-500" />
                        <span className="text-sm font-bold">Custom Tone</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{contact.notificationSound || 'Default'}</span>
                        <ChevronRightIcon className="w-4 h-4 text-gray-700" />
                    </div>
                </button>
                <button onClick={() => setModal('vibration')} className="w-full flex justify-between items-center p-5 hover:bg-white/5 transition-colors">
                     <div className="flex items-center gap-4">
                        <VibrationIcon className="w-6 h-6 text-gray-500" />
                        <span className="text-sm font-bold">Vibration Pattern</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{contact.vibrationPattern || 'Default'}</span>
                        <ChevronRightIcon className="w-4 h-4 text-gray-700" />
                    </div>
                </button>
              </div>
          </div>
          
          <div className="pt-6 space-y-4">
            <button onClick={handleBlockClick} className={`w-full p-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] border transition-all active:scale-95 flex items-center justify-center gap-3 ${contact.isBlocked ? 'bg-red-600 text-white border-white shadow-xl shadow-red-600/30' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}>
                <BlockIcon className="w-5 h-5" />
                <span>{contact.isBlocked ? 'Release' : 'Restrict'} Identity</span>
            </button>
             <button onClick={handlePurgeClick} className="w-full p-5 bg-white/5 rounded-[2rem] text-gray-500 font-black text-xs uppercase tracking-[0.2em] border border-transparent hover:text-red-400 transition-all active:scale-95 flex items-center justify-center gap-3">
                <TrashIcon className="w-5 h-5" />
                <span>Purge Local Cache</span>
            </button>
            <button onClick={() => { if(window.confirm(`Delete ${contact.name} and all data?`)) onDeleteContact(contact.id); }} className="w-full p-5 bg-black rounded-[2rem] text-slate-600 font-black text-[9px] uppercase tracking-[0.4em] border border-white/5 hover:border-red-500/40 transition-all active:scale-95">
                Remove Identity Entirely
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactDetailsScreen;