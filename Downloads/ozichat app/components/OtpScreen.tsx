import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface OtpScreenProps {
  phoneNumber: string;
  onOtpSuccess: () => void;
  onBackToLogin: () => void;
}

const OtpScreen: React.FC<OtpScreenProps> = ({ phoneNumber, onOtpSuccess, onBackToLogin }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
        timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);


  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1]!.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(paste)) {
      const newOtp = paste.split('');
      setOtp(newOtp);
      inputsRef.current[5]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    
    setError('');
    setIsLoading(true);

    // Simulate verification
    setTimeout(() => {
      // In a real app, you'd send 'code' to your backend for verification.
      if (/^\d{6}$/.test(code)) {
        onOtpSuccess();
      } else {
        setError("Invalid verification code.");
      }
      setIsLoading(false);
    }, 1500);
  };
  
  const handleResend = () => {
    if (resendCooldown === 0) {
        // Simulate resending code
        setResendCooldown(30);
    }
  };

  const isButtonDisabled = otp.join("").length < 6 || isLoading;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#0F172A] to-[#1E3A8A] text-white">
      <div className="w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center border-2 border-[#3F9BFF]">
          <ShieldCheckIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Verification Code</h1>
        <p className="text-gray-300">Enter the code sent to</p>
        <p className="font-semibold text-[#3F9BFF] mt-1 tracking-wide">{phoneNumber}</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((data, index) => (
            <input
              key={index}
              type="tel"
              name="otp"
              maxLength={1}
              className="w-12 h-14 text-center text-2xl font-semibold bg-[#1E293B] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3F9BFF] transition-all"
              value={data}
              onChange={e => handleChange(e.target, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              onFocus={e => e.target.select()}
              ref={el => { inputsRef.current[index] = el; }}
              autoComplete="one-time-code"
            />
          ))}
        </div>
        {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
      </form>

      <div className="w-full max-w-sm">
         <div className="text-center mb-6">
            <button 
                onClick={handleResend} 
                disabled={resendCooldown > 0} 
                className="text-sm text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
            </button>
         </div>
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20 disabled:bg-slate-700 disabled:hover:bg-slate-700 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Verify'
          )}
        </button>
        <button onClick={onBackToLogin} className="w-full text-center mt-4 text-slate-400 hover:text-white text-sm transition-colors">
          Change Number
        </button>
      </div>
    </div>
  );
};

export default OtpScreen;