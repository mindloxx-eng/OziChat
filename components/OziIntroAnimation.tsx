
import React, { useEffect, useState } from 'react';

interface OziIntroAnimationProps {
  onComplete: () => void;
}

const OziIntroAnimation: React.FC<OziIntroAnimationProps> = ({ onComplete }) => {
  const [showSpeech, setShowSpeech] = useState(false);

  useEffect(() => {
    const speechTimer = setTimeout(() => setShowSpeech(true), 800);
    const completeTimer = setTimeout(() => onComplete(), 4000);

    return () => {
      clearTimeout(speechTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050510] overflow-hidden relative">
      <style>{`
        @keyframes mesh-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .mesh-bg {
          background: linear-gradient(-45deg, #05051A, #1A237E, #4A148C, #05051A);
          background-size: 400% 400%;
          animation: mesh-gradient 10s ease infinite;
        }
        @keyframes ozi-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes ring-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes ozi-pop-in {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-ozi-float { animation: ozi-float 4s ease-in-out infinite; }
        .animate-ozi-pop { animation: ozi-pop-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-ring-slow { animation: ring-spin 15s linear infinite; }
        .glass-bubble {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
        }
      `}</style>

      <div className="absolute inset-0 mesh-bg opacity-80"></div>

      {/* Orbitals */}
      <div className="absolute top-1/2 left-1/2 w-[450px] h-[450px] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-full h-full border border-indigo-500/20 rounded-full animate-ring-slow border-dashed"></div>
          <div className="absolute top-1/2 left-1/2 w-[90%] h-[90%] border border-pink-500/10 rounded-full animate-spin"></div>
      </div>

      <div className="relative animate-ozi-pop z-10">
        <div className="animate-ozi-float flex flex-col items-center">
            <svg width="280" height="280" viewBox="0 0 100 100" className="drop-shadow-[0_0_30px_rgba(97,213,248,0.3)]">
            <defs>
                <linearGradient id="oziBubbleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22D3EE" /> {/* Bright Cyan */}
                  <stop offset="50%" stopColor="#A369F0" />
                  <stop offset="100%" stopColor="#F472B6" /> {/* Pink */}
                </linearGradient>
            </defs>
            
            {/* Logo Bubble Body */}
            <path 
              d="M50 5C74.85 5 95 25.15 95 50C95 74.85 74.85 95 50 95C41 95 32.5 92.5 25 88L10 93L16 78C12 70 10 60.5 10 50C10 25.15 27.9 5 50 5Z"
              fill="url(#oziBubbleGradient)"
            />

            {/* Eyes */}
            <circle cx="35" cy="45" r="7" fill="#0055FF">
                <animate attributeName="r" values="7;7.5;7" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="37" cy="43" r="2.5" fill="white" opacity="0.9" />

            <circle cx="65" cy="45" r="7" fill="#0055FF">
                <animate attributeName="r" values="7;7.5;7" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="67" cy="43" r="2.5" fill="white" opacity="0.9" />
            
            {/* Cheeks */}
            <circle cx="25" cy="58" r="3.5" fill="#FF69B4" opacity="0.8" />
            <circle cx="75" cy="58" r="3.5" fill="#FF69B4" opacity="0.8" />

            {/* Smile */}
            <path d="M 40 68 Q 50 76 60 68" stroke="#0055FF" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>

            {/* Welcome Bubble */}
            {showSpeech && (
            <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 glass-bubble px-8 py-4 rounded-[2rem] rounded-bl-none shadow-2xl animate-fade-in-up min-w-max">
                <p className="font-black text-3xl tracking-tight text-white">
                    Hi, I'm <span className="text-[#61D5F8]">Ozi!</span>
                </p>
            </div>
            )}
        </div>
      </div>
      
      <div className="absolute bottom-16 flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '1.2s' }}>
        <h2 className="text-white/30 text-[10px] font-black tracking-[0.8em] uppercase">Secure Link Initialized</h2>
      </div>
    </div>
  );
};

export default OziIntroAnimation;
