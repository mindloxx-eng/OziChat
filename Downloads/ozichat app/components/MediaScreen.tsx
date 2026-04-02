
import React from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { PhotoLibraryIcon } from './icons/PhotoLibraryIcon';

interface MediaScreenProps {
  contactName: string;
  onBack: () => void;
}

const MediaScreen: React.FC<MediaScreenProps> = ({ contactName, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-[#1C1C2E] text-white">
      {/* Header */}
      <header className="flex items-center p-4 bg-[#1C1C2E] shadow-md z-10">
        <button onClick={onBack} className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"><ChevronLeftIcon /></button>
        <h2 className="text-xl font-bold text-white text-center flex-1">Media</h2>
        <div className="w-10"></div> {/* Placeholder for balance */}
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 flex items-center justify-center bg-[#2a2a46] rounded-full mb-6">
            <PhotoLibraryIcon className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No Media</h1>
        <p className="text-gray-400 max-w-xs">
          Photos, videos, links, and docs you share with {contactName} will appear here.
        </p>
      </main>
    </div>
  );
};

export default MediaScreen;