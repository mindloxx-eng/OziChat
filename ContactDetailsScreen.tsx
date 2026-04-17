

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
import { ArrowDownLeftIcon } from './icons/ArrowDownLeftIcon';
import { ArrowUpRightIcon } from './icons/ArrowUpRightIcon';
import { CogIcon } from './icons/CogIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { WifiIcon } from './icons/WifiIcon';
import { ClockIcon } from './icons/ClockIcon';
import { StarIcon } from './icons/StarIcon';
import { StarOutlineIcon } from './icons/StarOutlineIcon';
import { BellSlashIcon } from './icons/BellSlashIcon';
import { MusicalNoteIcon } from './icons/MusicalNoteIcon';
import { VibrationIcon } from './icons/VibrationIcon';


interface ContactDetailsScreenProps {
  contact: Contact;
  onBack: () => void;
  onStartChat: () => void;
  onToggleFavorite: (id: string) => void;
  onUpdateSettings: (id: string, settings: Partial<Contact>) => void;
  onNavigateToMedia: () => void;
  onDeleteContact: (id: string) => void;
}

const CodecSelectionModal: React.FC<{
    title: string;
    options: string[];
    onSelect: (option: any) => void;
    onClose: () => void;
}> = ({ title, options, onSelect, onClose }) => (
    <div 
        className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in"
        onClick={onClose}
    >
        <div 
            className="bg-[#3a3a5c] rounded-2xl p-6 w-72 text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
        >
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            <div className="space-y-2">
                {options.map((option) => (
                    <button 
                        key={option}
                        onClick={() => { onSelect(option); onClose(); }}
                        className="w-full text-left bg-[#2a2a46] hover:bg-[#553699] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        {option}
                    </button>
                ))}
            </div>
            <button
                onClick={onClose}
                className="mt-6 text-gray-400 hover:text-white"
            >
                Cancel
            </button>
        </div>
    </div>
);

const ContactDetailsScreen: React.FC<ContactDetailsScreenProps> = ({ contact, onBack, onStartChat, onToggleFavorite, onUpdateSettings, onNavigateToMedia, onDeleteContact }) => {
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [showVibrationModal, setShowVibrationModal] = useState(false);

  const audioCodecOptions: AudioCodec[] = ['Opus', 'AAC', 'G.711'];
  const videoCodecOptions: VideoCodec[] = ['H.265', 'VP9', 'H.264'];
  const soundOptions = ['Default', 'Chime', 'Alert', 'Synth'];
  const vibrationOptions: VibrationPattern[] = ['Default', 'Short', 'Long', 'Pulse'];

  return (
    <div className="flex flex-col h-full bg-[#1C1C2E] text-white">
        {showAudioModal && (
            <CodecSelectionModal 
                title="Select Audio Codec"
                options={audioCodecOptions}
                onSelect={(codec: AudioCodec) => onUpdateSettings(contact.id, { audioCodec: codec })}
                onClose={() => setShowAudioModal(false)}
            />
        )}
        {showVideoModal && (
            <CodecSelectionModal 
                title="Select Video Codec"
                options={videoCodecOptions}
                onSelect={(codec: VideoCodec) => onUpdateSettings(contact.id, { videoCodec: codec })}
                onClose={() => setShowVideoModal(false)}
            />
        )}
         {showSoundModal && (
            <CodecSelectionModal
                title="Select Notification Sound"
                options={soundOptions}
                onSelect={(sound: string) => onUpdateSettings(contact.id, { notificationSound: sound })}
                onClose={() => setShowSoundModal(false)}
            />
        )}
        {showVibrationModal && (
            <CodecSelectionModal
                title="Select Vibration Pattern"
                options={vibrationOptions}
                onSelect={(pattern: VibrationPattern) => onUpdateSettings(contact.id, { vibrationPattern: pattern })}
                onClose={() => setShowVibrationModal(false)}
            />
        )}
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1C1C2E] shadow-md z-10">
        <button onClick={onBack} className="text-white p-2 rounded-full hover:bg-white/10"><ChevronLeftIcon /></button>
        <h2 className="text-xl font-bold text-white">Contact Info</h2>
        <div className="flex items-center gap-2">
            <button onClick={() => onToggleFavorite(contact.id)} className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                {contact.isFavorite ? <StarIcon className="w-6 h-6 text-yellow-400" /> : <StarOutlineIcon className="w-6 h-6" />}
            </button>
            <button onClick={() => alert('Edit contact feature is coming soon!')} className="text-white p-2 rounded-full hover:bg-white/10">
              <PencilIcon className="w-6 h-6" />
            </button>
        </div>
      </header>

      {/* Profile Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center p-8 border-b border-gray-700">
          <img src={contact.avatarUrl} alt={contact.name} className="w-28 h-28 rounded-full border-4 border-[#553699] mb-4" />
          <h1 className="text-3xl font-bold">{contact.name}</h1>
          <p className="text-gray-400 mt-1 text-center">{contact.status}</p>
        </div>
        
        <div className="p-4 space-y-4">
            {/* Actions */}
            <div className="flex justify-center space-x-6 mb-4">
                <button onClick={onStartChat} className="flex flex-col items-center gap-1 text-[#3F9BFF] hover:text-blue-400 transition-colors">
                    <ChatBubbleIcon className="w-7 h-7" />
                    <span className="text-xs font-semibold">Message</span>
                </button>
                <button onClick={() => alert('Calling feature is coming soon!')} className="flex flex-col items-center gap-1 text-[#3F9BFF] hover:text-blue-400 transition-colors">
                    <PhoneIcon className="w-7 h-7" />
                    <span className="text-xs font-semibold">Call</span>
                </button>
                 <button onClick={() => alert('Video call feature is coming soon!')} className="flex flex-col items-center gap-1 text-[#3F9BFF] hover:text-blue-400 transition-colors">
                    <VideoIcon className="w-7 h-7" />
                    <span className="text-xs font-semibold">Video</span>
                </button>
            </div>


          {/* Phone Info */}
          <div className="bg-[#2a2a46] rounded-lg p-4">
            <p className="text-gray-400 text-sm">Phone</p>
            <p className="text-[#3F9BFF] text-lg">{contact.phone}</p>
          </div>
          
          {/* Call Quality */}
          <div className="bg-[#2a2a46] rounded-lg">
             <div className="w-full flex justify-between items-center p-4">
                <div className="flex items-center gap-4">
                    <CogIcon className="w-6 h-6 text-gray-400" />
                    <span className="font-semibold">Call Quality Settings</span>
                </div>
            </div>
            <button onClick={() => setShowAudioModal(true)} className="w-full flex justify-between items-center p-4 border-t border-gray-700 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <SpeakerWaveIcon className="w-6 h-6 text-gray-400" />
                <span>Audio Codec</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{contact.audioCodec || 'Opus'}</span>
                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
              </div>
            </button>
            <button onClick={() => setShowVideoModal(true)} className="w-full flex justify-between items-center p-4 border-t border-gray-700 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <VideoCameraIcon className="w-6 h-6 text-gray-400" />
                <span>Video Codec</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{contact.videoCodec || 'H.264'}</span>
                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
              </div>
            </button>
             <div className="w-full flex justify-between items-center p-4 border-t border-gray-700">
              <div className="flex items-center gap-4">
                <WifiIcon className="w-6 h-6 text-gray-400" />
                <span>Use Data Saver</span>
              </div>
               <button
                  role="switch"
                  aria-checked={contact.useDataSaver}
                  onClick={() => onUpdateSettings(contact.id, { useDataSaver: !contact.useDataSaver })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#2a2a46] ${contact.useDataSaver ? 'bg-[#3F9BFF]' : 'bg-gray-600'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200