import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, description, disabled }) => (
  <label className={`flex items-center justify-between gap-4 cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <span className="min-w-0">
      {label && <span className="block text-sm font-semibold">{label}</span>}
      {description && <span className="block text-xs text-white/40 mt-0.5">{description}</span>}
    </span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-[#3F9BFF] shadow-[0_0_18px_rgba(63,155,255,0.4)]' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  </label>
);

export default Switch;
