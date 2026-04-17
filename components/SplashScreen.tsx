import React, { useState, useEffect } from 'react';
import { LogoIcon } from './icons/LogoIcon';

const SplashScreen: React.FC = () => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setVisible(true);
      setStep(1);
    }, 200);
    const timer2 = setTimeout(() => setStep(2), 900);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0F172A] to-[#020617] text-white select-none">
      <div className={`transition-all duration-1000 ease-in-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
         <div className="w-40 h-40">
            <LogoIcon step={step} />
         </div>
      </div>
       <div className={`transition-opacity duration-700 ease-in-out delay-1000 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
         <h1 className="text-4xl font-bold mt-4 tracking-tight">Ozichat</h1>
       </div>
    </div>
  );
};

export default SplashScreen;