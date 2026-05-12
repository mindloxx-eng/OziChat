import React, { useState } from 'react';
import { OziLogoMark, OziWordmark, LockIcon, MailIcon, ShieldIcon } from '../icons';
import {
  registerAdmin,
  loginAdmin,
  ApiError,
  type AuthData,
} from '../services/adminApi';

interface LoginProps {
  onSuccess: (auth: AuthData) => void;
}

type Mode = 'signin' | 'register';

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<Mode>('signin');

  // shared
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // sign in
  const [siIdentifier, setSiIdentifier] = useState('');
  const [siPassword, setSiPassword] = useState('');

  // register
  const [rDisplayName, setRDisplayName] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPhone, setRPhone] = useState('');
  const [rPassword, setRPassword] = useState('');
  const [rSecret, setRSecret] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const auth = await loginAdmin({ identifier: siIdentifier, password: siPassword });
      onSuccess(auth);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (rPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const auth = await registerAdmin({
        displayName: rDisplayName.trim(),
        email: rEmail.trim(),
        phone: rPhone.trim(),
        password: rPassword,
        adminSecret: rSecret.trim(),
      });
      onSuccess(auth);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0E14] text-white relative overflow-hidden flex items-center justify-center p-6">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 500px at 15% 10%, rgba(63,155,255,0.18), transparent 60%),' +
            'radial-gradient(900px 500px at 85% 90%, rgba(138,91,255,0.18), transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <OziLogoMark className="w-20 h-20 mb-4 drop-shadow-[0_8px_24px_rgba(63,155,255,0.35)]" step={2} />
          <OziWordmark className="h-7 w-auto" />
          <p className="text-white/40 text-sm mt-3">
            {mode === 'signin' ? 'Sign in to the admin console' : 'Create an admin account'}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* tabs */}
          <div className="flex p-1.5 bg-white/[0.03] border-b border-white/5">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                mode === 'signin' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                mode === 'register' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Create admin
            </button>
          </div>

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="p-6 sm:p-8 space-y-4">
              <Field label="Email or phone" icon={<MailIcon className="w-4 h-4 text-white/40" />}>
                <input
                  type="text"
                  value={siIdentifier}
                  onChange={e => setSiIdentifier(e.target.value)}
                  placeholder="admin@ozichat.com or +92 …"
                  required
                  autoComplete="username"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30"
                />
              </Field>
              <Field label="Password" icon={<LockIcon className="w-4 h-4 text-white/40" />}>
                <input
                  type="password"
                  value={siPassword}
                  onChange={e => setSiPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30"
                />
              </Field>

              {error && <ErrorBox>{error}</ErrorBox>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold tracking-tight bg-gradient-to-r from-[#3F9BFF] to-[#5b8bff] hover:from-[#5aaaff] hover:to-[#7099ff] disabled:opacity-50 transition-all shadow-lg shadow-[#3F9BFF]/30"
              >
                {loading ? 'Signing in…' : 'Sign in to Console'}
              </button>

              <p className="text-center text-xs text-white/40">
                Don't have an account yet?{' '}
                <button type="button" onClick={() => { setMode('register'); setError(''); }} className="font-bold text-[#7cb8ff] hover:text-white">
                  Create one
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="p-6 sm:p-8 space-y-4">
              <Field label="Display name">
                <input
                  type="text"
                  value={rDisplayName}
                  onChange={e => setRDisplayName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  autoComplete="name"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30"
                />
              </Field>
              <Field label="Email" icon={<MailIcon className="w-4 h-4 text-white/40" />}>
                <input
                  type="email"
                  value={rEmail}
                  onChange={e => setREmail(e.target.value)}
                  placeholder="admin@ozichat.com"
                  required
                  autoComplete="email"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30"
                />
              </Field>
              <Field label="Phone">
                <input
                  type="tel"
                  value={rPhone}
                  onChange={e => setRPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  required
                  autoComplete="tel"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30"
                />
              </Field>
              <Field label="Password" icon={<LockIcon className="w-4 h-4 text-white/40" />}>
                <input
                  type="password"
                  value={rPassword}
                  onChange={e => setRPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30"
                />
              </Field>
              <Field label="Admin secret" icon={<ShieldIcon className="w-4 h-4 text-[#3F9BFF]" />}>
                <input
                  type="password"
                  value={rSecret}
                  onChange={e => setRSecret(e.target.value)}
                  placeholder="Provided by your administrator"
                  required
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30 font-mono"
                />
              </Field>

              {error && <ErrorBox>{error}</ErrorBox>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold tracking-tight bg-gradient-to-r from-[#3F9BFF] via-[#7c6cff] to-[#A369F0] hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-[#3F9BFF]/30"
              >
                {loading ? 'Creating account…' : 'Create admin account'}
              </button>

              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <ShieldIcon className="w-4 h-4 text-[#3F9BFF] mt-0.5 shrink-0" />
                <p className="text-[11px] text-white/50 font-semibold leading-relaxed">
                  Admin registration requires a shared secret. Anyone with this secret can promote an account to admin — keep it private.
                </p>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-white/30 mt-6 uppercase tracking-widest font-bold">
          Ozichat Admin · Web Console
        </p>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; icon?: React.ReactNode; children: React.ReactNode }> = ({
  label, icon, children,
}) => (
  <label className="block">
    <span className="block text-[11px] font-bold uppercase tracking-widest text-white/50 mb-2">{label}</span>
    <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 focus-within:border-[#3F9BFF]/60 transition-colors">
      {icon}
      {children}
    </span>
  </label>
);

const ErrorBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300 font-semibold">
    {children}
  </div>
);

export default Login;
