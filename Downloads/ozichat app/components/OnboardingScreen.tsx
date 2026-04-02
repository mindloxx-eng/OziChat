import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { AIAssistantIcon } from './icons/AIAssistantIcon';
import { MapIcon } from './icons/MapIcon';

interface OnboardingScreenProps {
  onGetStarted: () => void;
}

const Feature: React.FC<{ icon: React.FC<any>, title: string, description: string }> = ({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-white/10 p-3 rounded-full">
            <Icon className="w-6 h-6 text-[#3F9BFF]" />
        </div>
        <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    </div>
);


const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="w-full h-full flex flex-col justify-between text-center p-8 bg-gradient-to-b from-[#0F172A] to-[#1E3A8A] text-white">
      <div className="flex-grow flex flex-col justify-center items-center">
        <div className="w-28 h-28 mb-6">
          <LogoIcon step={2} />
        </div>
        <h1 className="text-4xl font-bold mb-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>Welcome to Ozichat</h1>
        <p className="text-lg text-gray-300 mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>Secure, private messaging, powered by Gemini.</p>

        <div className="space-y-6 text-left max-w-sm animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Feature 
                icon={ShieldCheckIcon}
                title="Secure Messaging"
                description="Your conversations are private with end-to-end encryption."
            />
            <Feature 
                icon={AIAssistantIcon}
                title="AI Assistant"
                description="Get help, summarize chats, and more with our smart assistant."
            />
            <Feature 
                icon={MapIcon}
                title="Global Connection"
                description="Connect with your friends and family, wherever they are."
            />
        </div>
      </div>
      
      <div className="flex-shrink-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <button
          onClick={onGetStarted}
          className="w-full max-w-xs bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20"
        >
          Get Started
        </button>
        <p className="text-xs text-gray-500 mt-4">
            By continuing, you agree to our <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default OnboardingScreen;