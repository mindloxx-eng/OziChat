import React, { useState } from 'react';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { OzichatLogo } from './icons/NestfingerLogo';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { sendOtp, register, login as apiLogin } from '../services/apiService';

interface LoginScreenProps {
  onEmailSubmit: (email: string) => void;
  onAuthSuccess?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onEmailSubmit, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register' | 'otp'>('login');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim() || isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      await apiLogin({ identifier: email, password, platform: 'WEB' });
      if (onAuthSuccess) onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !displayName.trim() || isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      // Register the user — backend auto-sends OTP on register
      console.log('📝 Registering user...');
      await register({ email, password, displayName });
      console.log('✅ Register success — navigating to OTP verify screen');

      // Navigate directly to OTP verification screen
      // (send-otp NOT called — backend sends OTP as part of register)
      onEmailSubmit(email);
    } catch (err: any) {
      console.error('❌ Register failed:', err);
      if (err.status === 409) {
        setError('Account already exists. Please login instead.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      const response = await sendOtp(email);
      if (response.success) {
        onEmailSubmit(email);
      } else {
        console.warn('Send OTP failed, navigating anyway:', response.message);
        onEmailSubmit(email);
      }
    } catch (err) {
      console.warn('Send OTP error, navigating anyway:', err);
      onEmailSubmit(email);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') handleLogin();
    else if (mode === 'register') handleRegister();
    else handleOtpFlow(e);
  };

  const isButtonDisabled =
    isLoading ||
    !email.trim() ||
    (mode !== 'otp' && !password.trim()) ||
    (mode === 'register' && !displayName.trim());

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#0F172A] to-[#1E3A8A] text-white">
      <div className="w-full text-center pt-16">
        <OzichatLogo className="w-40 h-auto mx-auto mb-8" />
        <h1 className="text-3xl font-bold mb-2">
          {mode === 'register' ? 'Create Account' : mode === 'otp' ? 'Enter Your Email' : 'Welcome Back'}
        </h1>
        <p className="text-gray-300">
          {mode === 'register'
            ? 'Sign up to start messaging'
            : mode === 'otp'
            ? 'Ozichat will send a verification code to your email.'
            : 'Login to your OziChat account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {mode === 'register' && (
          <div>
            <label htmlFor="displayName" className="sr-only">Display Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-2xl p-4 pl-10 text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#3F9BFF]"
                placeholder="Display Name"
                autoComplete="name"
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="sr-only">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <EnvelopeIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1E293B] border border-slate-700 rounded-2xl p-4 pl-10 text-white text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-[#3F9BFF]"
              placeholder="example@email.com"
              autoComplete="email"
            />
          </div>
        </div>

        {mode !== 'otp' && (
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <LockClosedIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-2xl p-4 pl-10 text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#3F9BFF]"
                placeholder="Password"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
      </form>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20 disabled:bg-slate-700 disabled:hover:bg-slate-700 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : mode === 'register' ? (
            'Create Account'
          ) : mode === 'otp' ? (
            'Send Code'
          ) : (
            'Login'
          )}
        </button>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-xs text-slate-500 uppercase">or</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {mode === 'login' ? (
          <>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className="w-full text-center py-3 text-[#3F9BFF] hover:text-blue-300 text-sm font-semibold transition-colors"
            >
              Don't have an account? Register
            </button>
            <button
              onClick={() => { setMode('otp'); setError(''); }}
              className="w-full text-center py-2 text-slate-500 hover:text-slate-300 text-xs transition-colors"
            >
              Login with OTP instead
            </button>
          </>
        ) : mode === 'register' ? (
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className="w-full text-center py-3 text-[#3F9BFF] hover:text-blue-300 text-sm font-semibold transition-colors"
          >
            Already have an account? Login
          </button>
        ) : (
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className="w-full text-center py-3 text-[#3F9BFF] hover:text-blue-300 text-sm font-semibold transition-colors"
          >
            Back to password login
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
