import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  icon?: React.ReactNode;
  error?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, helper, icon, error, className = '', ...rest }) => (
  <label className="block">
    {label && (
      <span className="block text-[11px] font-bold uppercase tracking-widest text-white/50 mb-2">{label}</span>
    )}
    <span
      className={`relative flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-all bg-white/[0.04] ${
        error ? 'border-red-500/60' : 'border-white/10 focus-within:border-[#3F9BFF]/60 focus-within:bg-white/[0.07]'
      }`}
    >
      {icon && <span className="text-white/40">{icon}</span>}
      <input
        {...rest}
        className={`flex-1 bg-transparent outline-none text-sm placeholder:text-white/30 ${className}`}
      />
    </span>
    {helper && !error && <span className="block text-xs text-white/40 mt-1.5">{helper}</span>}
    {error && <span className="block text-xs text-red-400 mt-1.5">{error}</span>}
  </label>
);

export default TextInput;
