
import React, { useState, useRef, useEffect } from 'react';
import SettingsHeader from './SettingsHeader';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

interface TwoStepVerificationScreenProps {
  onBack: () => void;
  isEnabled: boolean;
  onUpdate: (enabled: boolean) => void;
}

const TwoStepVerificationScreen: React.FC<TwoStepVerificationScreenProps> = ({ onBack, isEnabled, onUpdate }) => {
  const [step, setStep] = useState<'intro' | 'set_pin' | 'confirm_pin' | 'success'>('intro');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  
  // Use local state for immediate UI feedback before persisting
  const [localEnabled, setLocalEnabled] = useState(isEnabled);

  useEffect(() => {
      setLocalEnabled(isEnabled);
      if (isEnabled) setStep('intro');
  }, [isEnabled]);

  const handleTurnOn = () => {
      setStep('set_pin');
  };

  const handleTurnOff = () => {
      onUpdate(false);
      setLocalEnabled(false);
      setPin('');
      setConfirmPin('');
  };

  const handlePinChange = (val: string, type: 'pin' | 'confirm') => {
      // Only allow numbers
      if (!/^\d*$/.test(val)) return;
      if (val.length > 6) return;

      if (type === 'pin') {
          setPin(val);
          if (val.length === 6) {
              setTimeout(() => setStep('confirm_pin'), 300);
          }
      } else {
          setConfirmPin(val);
          if (val.length === 6) {
              if (val === pin) {
                  onUpdate(true);
                  setLocalEnabled(true);
                  setStep('success');
              } else {
                  setError("PINs don't match. Please try again.");
                  setTimeout(() => {
                      setConfirmPin('');
                      setError('');
                  }, 1500);
              }
          }
      }
  };

  const renderPinInput = (value: string, onChange: (val: string) => void, autoFocus = true) => (
      <div className="flex justify-center my-8">
          <input
            type="tel"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent border-b-2 border-[#3F9BFF] text-3xl text-center w-40 tracking-[0.5em] focus:outline-none text-black dark:text-white font-mono"
            maxLength={6}
            autoFocus={autoFocus}
            placeholder="......"
          />
      </div>
  );

  const renderContent = () => {
      if (localEnabled && step === 'intro') {
          return (
              <div className="flex flex-col items-center text-center p-6 space-y-6">
                  <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-2">
                      <CheckCircleIcon className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white">Two-step verification is on</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm max-w-xs">
                      You'll need to enter your PIN when registering your phone number with Ozichat again.
                  </p>
                  <button 
                    onClick={handleTurnOff}
                    className="w-full py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-semibold rounded-xl transition-colors"
                  >
                      Turn Off
                  </button>
              </div>
          );
      } else if (step === 'success') {
           return (
              <div className="flex flex-col items-center text-center p-6 space-y-6 animate-fade-in">
                  <div className="w-24 h-24 bg-[#3F9BFF]/10 rounded-full flex items-center justify-center mb-2">
                      <CheckCircleIcon className="w-12 h-12 text-[#3F9BFF]" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white">Two-step verification is enabled</h3>
                  <button 
                    onClick={onBack}
                    className="w-full py-3 bg-[#3F9BFF] text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors mt-8"
                  >
                      Done
                  </button>
              </div>
          );
      } else if (step === 'set_pin') {
          return (
              <div className="flex flex-col items-center text-center p-6 animate-fade-in">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-2">Create a 6-digit PIN</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                      Create a PIN that you can remember.
                  </p>
                  {renderPinInput(pin, (v) => handlePinChange(v, 'pin'))}
              </div>
          );
      } else if (step === 'confirm_pin') {
          return (
              <div className="flex flex-col items-center text-center p-6 animate-fade-in">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-2">Confirm your PIN</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                      Re-enter your 6-digit PIN to confirm.
                  </p>
                  {renderPinInput(confirmPin, (v) => handlePinChange(v, 'confirm'))}
                  {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
              </div>
          );
      }

      // Intro (Disabled state)
      return (
          <div className="flex flex-col items-center text-center p-6 space-y-6">
              <div className="w-24 h-24 bg-[#3F9BFF]/10 rounded-full flex items-center justify-center mb-2">
                  <ShieldCheckIcon className="w-12 h-12 text-[#3F9BFF]" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  For extra security, turn on two-step verification, which will require a PIN when registering your phone number with Ozichat again.
              </p>
              <button 
                onClick={handleTurnOn}
                className="w-full py-3 bg-[#3F9BFF] text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
              >
                  Turn On
              </button>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#10101b] transition-colors duration-300">
      <SettingsHeader title="Two-Step Verification" onBack={onBack} />
      <main className="flex-1 overflow-y-auto">
          {renderContent()}
      </main>
    </div>
  );
};

export default TwoStepVerificationScreen;
