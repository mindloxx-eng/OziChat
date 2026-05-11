import React, { useState } from 'react';
import { OziLogoMark, OziWordmark, LockIcon, MailIcon, ShieldIcon } from '../icons';

interface LoginProps {
  onSuccess: () => void;
  adminEmail: string;
}

const Login: React.FC<LoginProps> = ({ onSuccess, adminEmail }) => {
  const [email, setEmail] = useState(adminEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (password === 'admin123') {
        sessionStorage.setItem('ozi_admin_auth', '1');
        onSuccess();
      } else {
        setError('Wrong password. Try the demo key shown below.');
      }
      setLoading(false);
    }, 450);
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
      <div aria-hidden className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <OziLogoMark className="w-20 h-20 mb-4 drop-shadow-[0_8px_24px_rgba(63,155,255,0.35)]" step={2} />
          <OziWordmark className="h-7 w-auto" />
          <p className="text-white/40 text-sm mt-3">Sign in to the admin console</p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 space-y-5 shadow-2xl shadow-black/40"
        >
          <label className="block">
            <span className="block text-[11px] font-bold uppercase tracking-widest text-white/50 mb-2">Email</span>
            <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 focus-within:border-[#3F9BFF]/60">
              <MailIcon className="w-4 h-4 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@ozichat.com"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30"
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="block text-[11px] font-bold uppercase tracking-widest text-white/50 mb-2">Password</span>
            <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 focus-within:border-[#3F9BFF]/60">
              <LockIcon className="w-4 h-4 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30"
                required
              />
            </span>
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300 font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold tracking-tight bg-gradient-to-r from-[#3F9BFF] to-[#5b8bff] hover:from-[#5aaaff] hover:to-[#7099ff] disabled:opacity-50 transition-all shadow-lg shadow-[#3F9BFF]/30"
          >
            {loading ? 'Signing in…' : 'Sign in to Console'}
          </button>

          <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <ShieldIcon className="w-4 h-4 text-[#3F9BFF] mt-0.5 shrink-0" />
            <div className="text-[11px] text-white/50 font-semibold leading-relaxed">
              <span className="text-white/70 block">Demo credentials</span>
              Password: <span className="font-mono text-[#7cb8ff]">admin123</span>
            </div>
          </div>
        </form>

        <p className="text-center text-[11px] text-white/30 mt-6 uppercase tracking-widest font-bold">
          Ozichat Admin · Web Console
        </p>
      </div>
    </div>
  );
};

export default Login;
