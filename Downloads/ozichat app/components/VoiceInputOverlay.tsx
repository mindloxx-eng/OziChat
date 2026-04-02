import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface VoiceInputOverlayProps {
  state: 'idle' | 'connecting' | 'listening' | 'error';
  text: string;
  onClose: () => void;
  onSend: () => void;
}

const VoiceInputOverlay: React.FC<VoiceInputOverlayProps> = ({ state, text, onClose, onSend }) => {
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    if (state === 'listening') {
      // Reset timer when listening starts
      setRecordingTime(0);
      timer = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    }

    // Cleanup function to clear the interval when state changes or component unmounts
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [state]);
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const getStatusContent = () => {
    switch (state) {
      case 'connecting':
        return {
          icon: <MicrophoneIcon className="w-10 h-10" />,
          label: 'Connecting...'
        };
      case 'listening':
        return {
          icon: <MicrophoneIcon className="w-10 h-10" />,
          label: 'Listening...'
        };
      case 'error':
        return {
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          label: 'Connection Error'
        };
      default:
        return { icon: null, label: '' };
    }
  };

  const { icon, label } = getStatusContent();

  const WaveformVisualizer = () => {
    if (state !== 'listening') return null;
    const heights = ['16px', '32px', '48px', '32px', '16px'];
    return (
      <div className="absolute inset-0 flex justify-center items-center gap-2 z-0">
        {heights.map((height, i) => (
          <div
            key={i}
            className="w-2 bg-white/50 rounded-full animate-waveform"
            style={{
              height: height,
              animationDelay: `${i * 120}ms`,
            }}
          />
        ))}
      </div>
    );
  };
  
  const ConnectingVisualizer = () => {
    if (state !== 'connecting') return null;
    return (
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 rounded-full border-2 border-white/50 animate-ripple" 
          style={{ animationDelay: '0s' }}
        ></div>
        <div 
          className="absolute inset-0 rounded-full border-2 border-white/50 animate-ripple" 
          style={{ animationDelay: '1s' }}
        ></div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-between p-4 animate-fade-in">
       <style>{`
            @keyframes waveform {
              0%, 100% { transform: scaleY(0.2); }
              50% { transform: scaleY(1); }
            }
            .animate-waveform {
              animation: waveform 1.2s ease-in-out infinite;
              transform-origin: center;
            }
            @keyframes ripple {
                0% { transform: scale(1); opacity: 0.5; }
                100% { transform: scale(1.5); opacity: 0; }
            }
            .animate-ripple {
              animation: ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
            }
        `}</style>
      
      <div className="w-full flex justify-end">
        <button
          onClick={onClose}
          className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label="Close voice input"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md text-white text-center">
        <div className="relative w-32 h-32 rounded-full flex items-center justify-center bg-white/10 mb-6">
           <ConnectingVisualizer />
           <WaveformVisualizer />
           <div className="relative z-10">{icon}</div>
        </div>
        <p className="font-semibold mb-2">{label}</p>
        <div className="h-5 mb-2 flex items-center justify-center">
          {state === 'listening' && (
              <p className="text-sm text-white/70 font-mono tabular-nums" aria-live="off" aria-atomic="true">
                  {formatTime(recordingTime)}
              </p>
          )}
        </div>
        <p className="text-lg min-h-[56px]">{text || <span className="text-white/50">Start speaking to transcribe...</span>}</p>
      </div>

      <div className="w-full flex justify-center pb-8">
        <button
          onClick={onSend}
          disabled={!text.trim()}
          className="p-4 bg-[#3F9BFF] rounded-full text-white shadow-lg disabled:bg-gray-500 disabled:opacity-50 transition-all transform hover:scale-105"
          aria-label="Send transcribed message"
        >
          <PaperAirplaneIcon className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};

export default VoiceInputOverlay;
