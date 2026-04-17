import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';

interface AudioMessageProps {
  audioUrl: string;
  duration: number;
}

const formatTime = (time: number) => {
  if (isNaN(time) || !isFinite(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const AudioMessage: React.FC<AudioMessageProps> = ({ audioUrl, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const wasPlayingBeforeSeek = useRef(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Effect for handling audio playback events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
      }
    };
    const handlePlaybackEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handlePlaybackEnd);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handlePlaybackEnd);
    };
  }, [isSeeking]);

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const updateSeekPosition = useCallback((e: MouseEvent | TouchEvent) => {
    const progressBar = progressBarRef.current;
    const audio = audioRef.current;
    if (!progressBar || !audio || !isFinite(audio.duration)) return;

    const rect = progressBar.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    
    setCurrentTime(percent * audio.duration);
  }, []);

  // Effect for handling drag-to-seek mouse/touch events on the window
  useEffect(() => {
    if (!isSeeking) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      updateSeekPosition(e);
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      const audio = audioRef.current;
      if (audio) {
        // Final position update
        const progressBar = progressBarRef.current;
        if (progressBar) {
          const rect = progressBar.getBoundingClientRect();
          const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
          const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
          audio.currentTime = percent * audio.duration;
        }

        if (wasPlayingBeforeSeek.current) {
          audio.play().catch(console.error);
        }
      }
      setIsSeeking(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isSeeking, updateSeekPosition]);

  const handleInteractionStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    wasPlayingBeforeSeek.current = !audio.paused;
    if (wasPlayingBeforeSeek.current) {
      audio.pause();
    }
    setIsSeeking(true);
    // Directly call the logic with the React event
    const progressBar = progressBarRef.current;
    if (!progressBar || !isFinite(audio.duration)) return;
    const rect = progressBar.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setCurrentTime(percent * audio.duration);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const seekAmount = 5; // Seek 5 seconds
      const newTime = e.key === 'ArrowLeft' 
        ? Math.max(0, audio.currentTime - seekAmount) 
        : Math.min(duration, audio.currentTime + seekAmount);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };


  return (
    <div className="flex items-center gap-3 w-full max-w-[250px]">
      <audio ref={audioRef} src={audioUrl} preload="metadata"></audio>
      <button 
        onClick={togglePlay} 
        className="text-white flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
        aria-label={isPlaying ? "Pause audio message" : "Play audio message"}
      >
        {isPlaying ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
      </button>
      <div 
        ref={progressBarRef}
        onMouseDown={handleInteractionStart}
        onTouchStart={handleInteractionStart}
        onKeyDown={handleKeyDown}
        className="relative flex-grow w-full h-1.5 bg-white/30 rounded-full cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#553699] focus:ring-white"
        role="slider"
        aria-label="Audio progress"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        tabIndex={0}
      >
        <div
          className="absolute top-0 left-0 h-full bg-white rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
        <div 
          className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow transition-transform transform -translate-y-1/2 group-hover:scale-110"
          style={{ left: `${progress}%`, transform: `translateX(-${progress}%) translateY(-50%)` }}
        ></div>
      </div>
      <span className="text-xs text-white/70 font-mono w-10 text-right tabular-nums">{formatTime(duration)}</span>
    </div>
  );
};

export default AudioMessage;
