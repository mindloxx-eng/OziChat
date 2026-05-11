import React, { useState } from 'react';
import type { AppSettings, Theme, FontSize } from '../../types';
import Card from '../components/Card';
import Switch from '../components/Switch';
import TextInput from '../components/TextInput';
import { MailIcon, SunIcon, ChipIcon } from '../icons';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (patch: Partial<AppSettings>) => void;
}

const themes: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const sizes: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  const save = () => {
    onUpdate(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Pill = <T extends string>({
    options,
    value,
    onChange,
  }: {
    options: { value: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
  }) => (
    <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            value === o.value
              ? 'bg-[#3F9BFF]/20 text-[#7cb8ff] border border-[#3F9BFF]/40'
              : 'text-white/60 hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      <Card title="Admin account" subtitle="Sign-in notifications and security">
        <div className="space-y-4">
          <TextInput
            label="Admin email"
            type="email"
            icon={<MailIcon className="w-4 h-4" />}
            value={draft.adminEmail}
            onChange={e => setDraft({ ...draft, adminEmail: e.target.value })}
            placeholder="admin@ozichat.com"
            helper="Security alerts are sent here"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Switch
                checked={draft.twoFactorAuthentication}
                onChange={v => setDraft({ ...draft, twoFactorAuthentication: v })}
                label="Two-factor authentication"
                description="Require 6-digit code at sign-in"
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Switch
                checked={draft.securityNotifications}
                onChange={v => setDraft({ ...draft, securityNotifications: v })}
                label="Security notifications"
                description="Email on failed sign-in attempts"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Appearance" subtitle="How the app looks for users">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <SunIcon className="w-4 h-4 text-white/60" /> Theme
              </div>
              <div className="text-xs text-white/40 mt-0.5">Default for new users</div>
            </div>
            <Pill
              options={themes}
              value={draft.theme}
              onChange={v => setDraft({ ...draft, theme: v })}
            />
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ChipIcon className="w-4 h-4 text-white/60" /> Font size
              </div>
              <div className="text-xs text-white/40 mt-0.5">Base text size in the app</div>
            </div>
            <Pill
              options={sizes}
              value={draft.fontSize}
              onChange={v => setDraft({ ...draft, fontSize: v })}
            />
          </div>
        </div>
      </Card>

      <Card title="Privacy defaults" subtitle="Apply to all new accounts">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <Switch
              checked={draft.readReceipts}
              onChange={v => setDraft({ ...draft, readReceipts: v })}
              label="Read receipts"
              description="Show double ticks when messages are read"
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <Switch
              checked={draft.conversationTones}
              onChange={v => setDraft({ ...draft, conversationTones: v })}
              label="In-app sounds"
              description="Play tones for sent/received messages"
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <Switch
              checked={draft.useLessDataForCalls}
              onChange={v => setDraft({ ...draft, useLessDataForCalls: v })}
              label="Low-data calls"
              description="Compress audio/video for slow connections"
            />
          </div>
        </div>
      </Card>

      <div className="sticky bottom-4 z-20">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0E1320]/90 backdrop-blur-xl px-5 py-3 shadow-2xl shadow-black/40">
          <div className="text-sm">
            {saved ? (
              <span className="text-emerald-300 font-bold">✓ Saved</span>
            ) : dirty ? (
              <span className="text-amber-300 font-bold">Unsaved changes</span>
            ) : (
              <span className="text-white/40">All changes saved</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDraft(settings)}
              disabled={!dirty}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/10 text-sm font-semibold disabled:opacity-40"
            >
              Reset
            </button>
            <button
              onClick={save}
              disabled={!dirty}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#3F9BFF] to-[#5b8bff] hover:from-[#5aaaff] hover:to-[#7099ff] text-sm font-bold shadow-lg shadow-[#3F9BFF]/30 disabled:opacity-40 disabled:from-white/10 disabled:to-white/10 disabled:shadow-none"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
