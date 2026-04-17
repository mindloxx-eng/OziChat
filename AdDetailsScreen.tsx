

import React from 'react';
import type { Advertisement } from './types';
import SettingsHeader from './components/settings/SettingsHeader';
import { PhoneIcon } from './components/icons/PhoneIcon';
import { GlobeAltIcon } from './components/icons/GlobeAltIcon';
import { EyeIcon } from './components/icons/EyeIcon';
import { ChatBubbleIcon } from './components/icons/ChatBubbleIcon';

const formatTimeAgo = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

interface AdDetailsScreenProps {
  ad: Advertisement;
  onBack: () => void;
  onChat: (advertiserPhone: string, adTitle: string) => void;
}

const AdDetailsScreen: React.FC<AdDetailsScreenProps> = ({ ad, onBack, onChat }) => {
  return (
    <div className="flex flex-col h-full bg-[#10101b] text-white">
      <SettingsHeader title="Ad Details" onBack={onBack} />
      <main className="flex-1 overflow-y-auto">
        {/* Media */}
        <div className="w-full h-64 bg-black">
          {ad.videoUrl ? (
            <video src={ad.videoUrl} controls className="w-full h-full object-contain" />
          // FIX: Changed ad.imageUrl to ad.imageUrls to match Advertisement type
          ) : ad.imageUrls && ad.imageUrls.length > 0 ? (
            <img src={ad.imageUrls[0]} alt={ad.title} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-500">No Media</div>
          )}
        </div>
        
        <div className="p-4 space-y-4">
          {/* Title and Price */}
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-white flex-1 pr-4">{ad.title}</h1>
            <p className="text-3xl font-bold text-green-400">
                ${ad.price.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Posted {formatTimeAgo(ad.postedDate)}</span>
            <div className="flex items-center gap-1.5">
                <EyeIcon className="w-4 h-4" />
                <span>{ad.views} views</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-base text-gray-300 whitespace-pre-wrap">{ad.description}</p>
          
          {/* Seller Info */}
          <div className="border-t border-gray-700 pt-4 space-y-2">
            <h3 className="font-semibold text-gray-400">Seller Information</h3>
            <div className="flex items-center gap-3 p-3 bg-[#1C1C2E] rounded-lg">
                <PhoneIcon className="w-5 h-5 text-gray-400"/>
                <span className="font-mono text-gray-300">{ad.advertiserPhone}</span>
            </div>
             <div className="flex items-center gap-3 p-3 bg-[#1C1C2E] rounded-lg">
                <GlobeAltIcon className="w-5 h-5 text-gray-400"/>
                <p className="text-sm capitalize">
                    <strong>Targeting:</strong> {ad.targeting?.type}{ad.targeting?.value ? ` (${ad.targeting.value})` : ''}
                </p>
             </div>
             {ad.website && (
                <div className="flex items-center gap-3 p-3 bg-[#1C1C2E] rounded-lg">
                    <GlobeAltIcon className="w-5 h-5 text-gray-400"/>
                    <a href={ad.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
                        {ad.website}
                    </a>
                </div>
             )}
          </div>
        </div>
      </main>
      <footer className="p-4 bg-[#1C1C2E] border-t border-gray-700">
        <div className="flex gap-4">
          <button 
              onClick={() => onChat(ad.advertiserPhone, ad.title)}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
              <ChatBubbleIcon className="w-5 h-5" />
              <span>Chat with Seller</span>
          </button>
          <a 
              href={`tel:${ad.advertiserPhone}`}
              className="w-full bg-[#3F9BFF] hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
              <PhoneIcon className="w-5 h-5" />
              <span>Call Now</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AdDetailsScreen;