

import React, { useState, useEffect } from 'react';
import { OzichatLogo } from './icons/NestfingerLogo';

const PoweredByScreen: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1C1C2E] to-[#3a2d5c] text-white select-none">
      <div className={`transition-opacity duration-1000 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-gray-400 text-sm mb-2 text-center">Powered by</p>
        <OzichatLogo className="w-40 h-auto" />
      </div>
    </div>
  );
};

export default PoweredByScreen;