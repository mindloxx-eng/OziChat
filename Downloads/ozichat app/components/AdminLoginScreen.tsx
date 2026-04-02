
import React, { useState, useEffect } from 'react';
import { OzichatLogo } from './icons/NestfingerLogo';
import { KeyIcon } from './icons/KeyIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { InfoCircleIcon } from './icons/InfoCircleIcon';
import type { AppSettings } from '../types';
import { sendEmail } from '../services/emailService';

interface AdminLoginScreenProps {
  onLoginSuccess: () => void;
  settings: AppSettings;
}

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onLoginSuccess, settings }) => {
  const [view, setView] = useState<'login' | 'reset' | 'two-step'>('login');
  
  // Login states
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  
  // Reset states
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // 2-Step Verification states
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (failedAttempts >= 3) {
      sendEmail(
        settings.adminEmail,
        'Security Alert: Multiple Failed Login Attempts',
        `There have been ${failedAttempts} failed login attempts to the admin panel. If this was not you, please secure your account.`
      );
      setFailedAttempts(0);
    }
  }, [failedAttempts, settings.adminEmail]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setLoginError('');

    setTimeout(() => {
      if (password === 'admin123') {
        setFailedAttempts(0);
        if (settings.twoFactorAuthentication) {
          setView('two-step');
          setPassword('');
        } else {
          onLoginSuccess();
        }
      } else {
        setLoginError('Invalid password.');
        setFailedAttempts(prev => prev + 1);
      }
      setIsLoading(false);
    }, 500);
  };
  
  const handleTwoStepVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setOtpError('');

    setTimeout(() => {
        if (otp === '123456') {
            onLoginSuccess();
        } else {
            setOtpError('Invalid verification code.');
        }
        setIsLoading(false);
    }, 500);
  };
  
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setResetError('');
    setResetSuccess('');

    if (newPassword !== confirmPassword) {
      setResetError('New passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      if (recoveryCode !== '123456') {
        setResetError('Invalid recovery code.');
      } else {
        setResetSuccess('Password has been reset successfully. Please log in.');
        sendEmail(
            settings.adminEmail,
            'Security Alert: Admin Password Reset',
            `The password for the admin panel was successfully reset at ${new Date().toLocaleString()}.`
        );
        setView('login');
      }
      setIsLoading(false);
    }, 1000);
  };

  const renderLoginView = () => (
    <div className="w-full max-w-xs">
        <h1 className="text-2xl font-black mb-2 text-center uppercase tracking-tighter">Command Center</h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-center">Identity Verification Required</p>
        
        {resetSuccess && <p className="text-green-400 text-xs text-center mb-6 bg-green-500/10 p-3 rounded-2xl border border-green-500/20">{resetSuccess}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
                <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Terminal Key"
                    className="w-full bg-[#161625] border border-white/5 rounded-[1.4rem] p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#3F9BFF] transition-all font-mono"
                />
            </div>
            {loginError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{loginError}</p>}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3F9BFF] hover:bg-blue-500 text-white font-black py-4 px-8 rounded-[1.4rem] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center disabled:opacity-50 uppercase text-xs tracking-widest"
            >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'INITIALIZE LINK'}
            </button>
             <div className="text-center mt-6">
                <button type="button" onClick={() => setView('reset')} className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
                    Lost Credentials?
                </button>
            </div>
        </form>

        <div className="mt-12 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3">
            <InfoCircleIcon className="w-4 h-4 text-[#3F9BFF] flex-shrink-0 mt-0.5" />
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                <p>DEMO MODE ACTIVE</p>
                <p className="text-white/60">KEY: <span className="font-mono text-[#3F9BFF]">admin123</span></p>
            </div>
        </div>
    </div>
  );

  const renderTwoStepView = () => (
    <div className="w-full max-w-xs">
        <h1 className="text-2xl font-black mb-2 text-center uppercase tracking-tighter">2-Step Auth</h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-center">Enter Secondary Sync Code</p>
        
        <form onSubmit={handleTwoStepVerification} className="space-y-4">
            <div className="relative">
                <input
                    id="otp-code"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full bg-[#161625] border border-white/5 rounded-[1.4rem] p-4 text-white tracking-[1em] text-center focus:outline-none focus:ring-2 focus:ring-[#3F9BFF] transition-all font-mono text-xl"
                />
            </div>
            {otpError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{otpError}</p>}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3F9BFF] hover:bg-blue-500 text-white font-black py-4 px-8 rounded-[1.4rem] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center disabled:opacity-50 uppercase text-xs tracking-widest"
            >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'VERIFY IDENTITY'}
            </button>
            <div className="text-center mt-6">
                <button type="button" onClick={() => { setView('login'); setOtpError(''); setLoginError('') }} className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
                    Return to Terminal
                </button>
            </div>
        </form>

        <div className="mt-12 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3">
            <InfoCircleIcon className="w-4 h-4 text-[#3F9BFF] flex-shrink-0 mt-0.5" />
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                <p>SYNC CODE</p>
                <p className="text-white/60">CODE: <span className="font-mono text-[#3F9BFF]">123456</span></p>
            </div>
        </div>
    </div>
  );

  const renderResetView = () => (
    <div className="w-full max-w-xs">
        <h1 className="text-2xl font-black mb-2 text-center uppercase tracking-tighter">Emergency Reset</h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-center">Node Recovery Protocol</p>
        
        <form onSubmit={handleResetPassword} className="space-y-4">
             <input
                type="text"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                placeholder="Recovery Seed"
                className="w-full bg-[#161625] border border-white/5 rounded-[1.4rem] p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#3F9BFF] font-mono text-sm"
            />
            <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Terminal Key"
                className="w-full bg-[#161625] border border-white/5 rounded-[1.4rem] p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#3F9BFF] font-mono text-sm"
            />
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Key"
                className="w-full bg-[#161625] border border-white/5 rounded-[1.4rem] p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#3F9BFF] font-mono text-sm"
            />
            
            {resetError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{resetError}</p>}
            
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3F9BFF] hover:bg-blue-500 text-white font-black py-4 px-8 rounded-[1.4rem] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center disabled:opacity-50 uppercase text-xs tracking-widest"
            >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'RESET NODE'}
            </button>
            <div className="text-center mt-6">
                <button type="button" onClick={() => { setView('login'); setResetError(''); }} className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
                    Back to Terminal
                </button>
            </div>
        </form>
    </div>
  );

  const renderCurrentView = () => {
    switch(view) {
        case 'reset':
            return renderResetView();
        case 'two-step':
            return renderTwoStepView();
        case 'login':
        default:
            return renderLoginView();
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#050508] text-white relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3F9BFF 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="mb-12 relative">
            <div className="absolute -inset-4 border border-[#3F9BFF] rounded-full animate-ping opacity-20"></div>
            <OzichatLogo className="w-48 h-auto relative z-10" />
        </div>
        {renderCurrentView()}
    </div>
  );
};

export default AdminLoginScreen;
