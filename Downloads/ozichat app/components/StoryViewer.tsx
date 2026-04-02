
import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { UserIcon } from './icons/UserIcon';
import { ClockIcon } from './icons/ClockIcon';
import type { StatusUpdate } from '../types';

interface StoryViewerProps {
    contactName: string;
    avatarUrl: string;
    updates: StatusUpdate[];
    initialIndex?: number;
    onClose: () => void;
    onViewed?: (updateId: string) => void;
}

const STORY_DURATION = 5000; // 5 seconds per status

const getRemainingTime = (timestamp: number) => {
    const expiresAt = timestamp + (24 * 60 * 60 * 1000);
    const diff = expiresAt - Date.now();
    
    if (diff <= 0) return 'Archiving...';
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 0) return `${hours}h remaining`;
    return `${minutes}m remaining`;
};

const getStatusColor = (createdAt: number) => {
    const ageHrs = (Date.now() - createdAt) / 3600000;
    if (ageHrs > 20) return '#EF4444'; // Red alert for expiring
    if (ageHrs > 12) return '#F59E0B'; // Amber alert
    return '#3F9BFF'; // Fresh Blue
};

const StoryViewer: React.FC<StoryViewerProps> = ({ contactName, avatarUrl, updates, initialIndex = 0, onClose, onViewed }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const currentUpdate = updates[currentIndex];
        if (currentUpdate && onViewed) {
            onViewed(currentUpdate.id);
        }

        // Start vanishing animation 500ms before switching
        const animationTimer = window.setTimeout(() => {
            setIsTransitioning(true);
        }, STORY_DURATION - 500);

        // Auto-advance after duration
        const nextTimer = window.setTimeout(() => {
            handleNextStory();
        }, STORY_DURATION);
        
        return () => {
            clearTimeout(animationTimer);
            clearTimeout(nextTimer);
            setIsTransitioning(false);
        };
    }, [currentIndex]);

    const handleNextStory = () => {
        if (currentIndex < updates.length - 1) {
            setIsTransitioning(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose(); 
        }
    };

    const handlePrevStory = () => {
        setIsTransitioning(false);
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            onClose();
        }
    };

    const currentUpdate = updates[currentIndex];
    const timeLeft = getRemainingTime(currentUpdate.createdAt);
    const ageColor = getStatusColor(currentUpdate.createdAt);
    const isExpiringSoon = (currentUpdate.createdAt + (24 * 60 * 60 * 1000)) - Date.now() < 3600000;

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in overflow-hidden">
            <style>{`
                .ephemeral-vanishing {
                    animation: vanish 0.6s ease-in forwards;
                }
                @keyframes vanish {
                    0% { opacity: 1; transform: scale(1); filter: blur(0px); }
                    100% { opacity: 0; transform: scale(1.05); filter: blur(10px); }
                }
                .progress-bar-fill {
                    transition: width ${STORY_DURATION}ms linear;
                }
            `}</style>

            {/* Progress Bar Container */}
            <div className="flex gap-1 p-2 pt-4 absolute top-0 left-0 right-0 z-20">
                {updates.map((_, idx) => (
                    <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-white progress-bar-fill ${
                                idx === currentIndex ? 'w-full' : 
                                idx < currentIndex ? 'w-full !transition-none' : 
                                'w-0 !transition-none'
                            }`}
                        />
                    </div>
                ))}
            </div>

            {/* Header Overlay */}
            <div className="absolute top-8 left-0 right-0 p-4 flex items-center justify-between z-20 pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <button onClick={onClose} className="text-white p-1 hover:bg-white/10 rounded-full transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 shadow-lg transition-colors duration-500" style={{ borderColor: ageColor }}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-full h-full p-1 bg-gray-500 text-white" />
                        )}
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm shadow-black drop-shadow-md">{contactName}</p>
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest drop-shadow-md transition-colors ${isExpiringSoon ? 'text-red-400 animate-pulse' : 'text-white/70'}`}>
                            <ClockIcon className="w-3 h-3" />
                            <span>{timeLeft}</span>
                        </div>
                    </div>
                </div>
                
                {isExpiringSoon && (
                    <div className="bg-red-500/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white border border-red-400/50 shadow-lg animate-pulse pointer-events-auto">
                        ARCHIVING SOON
                    </div>
                )}
            </div>

            {/* Content Area - Main Playback */}
            <div 
                className={`flex-1 relative flex items-center justify-center bg-black h-full transition-all duration-300 ${isTransitioning ? 'ephemeral-vanishing' : ''}`} 
                onClick={(e) => {
                    const width = e.currentTarget.offsetWidth;
                    const x = (e.nativeEvent as any).offsetX;
                    if (x < width / 3) handlePrevStory();
                    else handleNextStory();
                }}
            >
                {currentUpdate.type === 'image' ? (
                    <img
                        src={currentUpdate.contentUrl}
                        className="w-full h-full object-contain"
                        alt="Status"
                    />
                ) : currentUpdate.type === 'video' ? (
                    <video
                        src={currentUpdate.contentUrl}
                        className="w-full h-full object-contain"
                        autoPlay
                        muted
                        playsInline
                    />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center p-8 text-center ${currentUpdate.color || 'bg-gradient-to-br from-purple-600 to-blue-500'}`}>
                        <p className="text-white text-3xl font-black leading-tight drop-shadow-lg">{currentUpdate.text}</p>
                    </div>
                )}
            </div>
            
            {/* Ephemeral Footer Hint */}
            <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none z-20">
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Moment {currentIndex + 1} of {updates.length}</p>
                <div className="flex justify-center gap-1">
                     <div className="w-1 h-1 rounded-full bg-white/10"></div>
                     <div className="w-1 h-1 rounded-full bg-white/30"></div>
                     <div className="w-1 h-1 rounded-full bg-white/10"></div>
                </div>
            </div>
        </div>
    );
};

export default StoryViewer;
