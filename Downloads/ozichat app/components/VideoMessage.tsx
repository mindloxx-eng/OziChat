
import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';

interface VideoMessageProps {
  videoUrl: string;
  duration: number;
}

const VideoMessage: React.FC<VideoMessageProps> = ({ videoUrl, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-full overflow-hidden bg-black shadow-2xl border-4 border-indigo-500/30 group cursor-pointer active:scale-95 transition-transform" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        playsInline
      />
      
      {/* Controls Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity">
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 shadow-lg group-hover:scale-110 transition-transform">
            <PlayIcon className="w-10 h-10 text-white" />
          </div>
        </div>
      )}

      {/* Circular Progress Ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          <circle 
            cx="50" cy="50" r="48" 
            fill="none" 
            stroke="rgba(99, 102, 241, 0.2)" 
            strokeWidth="3"
          />
          <circle 
            cx="50" cy="50" r="48" 
            fill="none" 
            stroke="#6366F1" 
            strokeWidth="3" 
            strokeDasharray="301.59" 
            strokeDashoffset={301.59 - (301.59 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          />
      </svg>

      {/* Time display */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white border border-white/10 tracking-widest uppercase">
        {Math.floor(duration)}s
      </div>
      
      {/* HUD Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_bottom,transparent_50%,rgba(99,102,241,0.1)_50%)] bg-[length:100%_4px]"></div>
    </div>
  );
};

export default VideoMessage;
