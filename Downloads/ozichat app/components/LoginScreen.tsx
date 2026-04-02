import React, { useState } from 'react';
import { PhoneIcon } from './icons/PhoneIcon';
import { OzichatLogo } from './icons/NestfingerLogo';

interface LoginScreenProps {
  onPhoneSubmit: (phone: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onPhoneSubmit }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || isLoading) return;
    setIsLoading(true);
    // Simulate a network request
    setTimeout(() => {
      onPhoneSubmit(phone);
      setIsLoading(false);
    }, 1000);
  };

  const isButtonDisabled = !phone.trim() || isLoading;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#0F172A] to-[#1E3A8A] text-white">
      <div className="w-full text-center pt-16">
        <OzichatLogo className="w-40 h-auto mx-auto mb-8" />
        <h1 className="text-3xl font-bold mb-2">Enter Your Phone Number</h1>
        <p className="text-gray-300">Ozichat will send an SMS message to verify your phone number.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div>
          <label htmlFor="phone" className="sr-only">Phone Number</label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <PhoneIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#1E293B] border border-slate-700 rounded-2xl p-4 pl-10 text-white text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-[#3F9BFF]"
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
            />
          </div>
        </div>
      </form>

      <div className="w-full max-w-sm">
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20 disabled:bg-slate-700 disabled:hover:bg-slate-700 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Continue'
          )}
        </button>
        <p className="text-xs text-gray-500 mt-4 text-center">
            Carrier SMS charges may apply.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;