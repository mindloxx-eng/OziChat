
import React, { useState, useMemo } from 'react';
import type { Advertisement } from '../types';
import SettingsHeader from './settings/SettingsHeader';
import { PhoneIcon } from './icons/PhoneIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { SearchIcon } from './icons/SearchIcon';
import { EyeIcon } from './icons/EyeIcon';

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

const AdCard: React.FC<{ ad: Advertisement; onSelect: (ad: Advertisement) => void; }> = ({ ad, onSelect }) => {
    return (
        <button 
            onClick={() => onSelect(ad)} 
            className="bg-[#2a2a46] rounded-xl shadow-md overflow-hidden flex flex-col text-left w-full h-full hover:ring-2 hover:ring-[#3F9BFF] transition-all focus:outline-none focus:ring-2 focus:ring-[#3F9BFF] group"
        >
            <div className="w-full aspect-square bg-black relative">
              {ad.videoUrl ? (
                <video src={ad.videoUrl} loop muted playsInline className="w-full h-full object-cover pointer-events-none" />
              ) : ad.imageUrls && ad.imageUrls.length > 0 ? (
                <img src={ad.imageUrls[0]} alt={ad.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-500 text-xs">No Media</div>
              )}
              
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-green-400 font-bold text-xs shadow-sm border border-white/10">
                 ${ad.price.toFixed(2)}
              </div>
            </div>
            
            <div className="p-3 flex flex-col flex-grow w-full">
                 <h3 className="text-sm font-bold text-white mb-1 line-clamp-1 leading-tight">{ad.title}</h3>
                 
                 <p className="text-xs text-gray-400 line-clamp-2 mb-2 leading-snug flex-grow">{ad.description}</p>
                 
                 <div className="flex justify-between items-center text-[10px] text-gray-500 mt-auto pt-2 border-t border-white/5 w-full">
                    <div className="flex items-center gap-1 min-w-0">
                        <EyeIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{ad.views}</span>
                    </div>
                    <span className="whitespace-nowrap">{formatTimeAgo(ad.postedDate)}</span>
                </div>
            </div>
        </button>
    );
};

interface MarketplaceScreenProps {
  advertisements: Advertisement[];
  onBack: () => void;
  onNavigateToAdDetails: (ad: Advertisement) => void;
  onNavigateToPostAd: () => void;
}

type TargetingFilter = 'all' | 'global' | 'country' | 'region' | 'state' | 'city';

const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({ advertisements, onBack, onNavigateToAdDetails, onNavigateToPostAd }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TargetingFilter>('all');

  const filteredAds = useMemo(() => {
    // 1. Filter by the active button
    const locationFiltered = activeFilter === 'all'
      ? advertisements
      : advertisements.filter(ad => ad.targeting?.type === activeFilter);
      
    // 2. Filter by search query on top of location filter
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return locationFiltered;
    }
    return locationFiltered.filter(ad =>
      ad.title.toLowerCase().includes(query) ||
      ad.description.toLowerCase().includes(query)
    );
  }, [advertisements, searchQuery, activeFilter]);
  
  const filterOptions: TargetingFilter[] = ['all', 'global', 'country', 'region', 'state', 'city'];

  return (
    <div className="flex flex-col h-full bg-[#10101b] text-white">
      <SettingsHeader 
        title="Marketplace" 
        onBack={onBack}
        actionButton={
            <button onClick={onNavigateToPostAd} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-[#3F9BFF] hover:bg-blue-600 text-white transition-colors shadow-lg">
                <PlusCircleIcon className="w-4 h-4" />
                <span>Sell</span>
            </button>
        }
      />
      <div className="p-4 pt-2">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon className="w-5 h-5 text-gray-400" />
          </span>
          <input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2a2a46] border border-gray-600 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#3F9BFF] text-sm"
          />
        </div>
      </div>
      
      {/* Filter Buttons */}
      <div className="px-4 pb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {filterOptions.map(option => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors flex-shrink-0 ${
                activeFilter === option
                  ? 'bg-[#553699] text-white'
                  : 'bg-[#2a2a46] text-gray-300 hover:bg-[#3a3a5c]'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-3 pt-0">
        {filteredAds.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredAds.map(ad => (
              <AdCard key={ad.id} ad={ad} onSelect={onNavigateToAdDetails} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 pt-20">
            {searchQuery ? (
              <p>No results found for "{searchQuery}".</p>
            ) : (
              <>
                <p>No advertisements match the filter.</p>
                <p className="text-sm">Check back later!</p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MarketplaceScreen;
