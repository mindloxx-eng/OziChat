import React, { useMemo, useState } from 'react';
import type { Contact } from '../../types';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { BanIcon, CheckIcon, ShieldIcon, XIcon } from '../icons';

interface UsersProps {
  contacts: Contact[];
  search: string;
  onUpdate: (next: Contact[]) => void;
}

type Filter = 'all' | 'active' | 'suspended' | 'banned' | 'reported';

const toneFor = (status?: Contact['moderationStatus']) => {
  switch (status) {
    case 'suspended':
      return 'amber' as const;
    case 'banned':
      return 'red' as const;
    case 'active':
    default:
      return 'green' as const;
  }
};

const Users: React.FC<UsersProps> = ({ contacts, search, onUpdate }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter(c => {
      const status = c.moderationStatus ?? 'active';
      if (filter === 'reported' && !c.isReported) return false;
      if (filter !== 'all' && filter !== 'reported' && status !== filter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.channelHandle || '').toLowerCase().includes(q)
      );
    });
  }, [contacts, filter, search]);

  const setStatus = (id: string, status: NonNullable<Contact['moderationStatus']>) => {
    const next = contacts.map(c => {
      if (c.id !== id) return c;
      const patch: Partial<Contact> = { moderationStatus: status };
      if (status === 'banned') patch.banDate = new Date().toISOString();
      if (status === 'suspended')
        patch.suspensionEndDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      if (status === 'active') {
        patch.banDate = undefined;
        patch.suspensionEndDate = undefined;
        patch.isReported = false;
      }
      return { ...c, ...patch };
    });
    onUpdate(next);
  };

  const counts = useMemo(
    () => ({
      all: contacts.length,
      active: contacts.filter(c => (c.moderationStatus ?? 'active') === 'active').length,
      suspended: contacts.filter(c => c.moderationStatus === 'suspended').length,
      banned: contacts.filter(c => c.moderationStatus === 'banned').length,
      reported: contacts.filter(c => c.isReported).length,
    }),
    [contacts]
  );

  const detail = selected ? contacts.find(c => c.id === selected) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {([
          ['all', 'All'],
          ['active', 'Active'],
          ['reported', 'Reported'],
          ['suspended', 'Suspended'],
          ['banned', 'Banned'],
        ] as [Filter, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              filter === k
                ? 'border-[#3F9BFF]/50 bg-[#3F9BFF]/15 text-[#7cb8ff]'
                : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:border-white/20'
            }`}
          >
            {label}
            <span className="ml-2 text-[10px] text-white/40">{counts[k]}</span>
          </button>
        ))}
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5">
              <tr>
                <th className="py-3 px-5 font-bold">User</th>
                <th className="py-3 px-5 font-bold">Contact</th>
                <th className="py-3 px-5 font-bold">Status</th>
                <th className="py-3 px-5 font-bold">Warnings</th>
                <th className="py-3 px-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const status = c.moderationStatus ?? 'active';
                return (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="py-3 px-5">
                      <button
                        onClick={() => setSelected(c.id)}
                        className="flex items-center gap-3 min-w-0 text-left"
                      >
                        <img
                          src={c.avatarUrl}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover border border-white/10 bg-white/5"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold truncate flex items-center gap-2">
                            {c.name}
                            {c.isFavorite && <span className="text-amber-300 text-xs">★</span>}
                          </div>
                          <div className="text-[11px] text-white/40 truncate">
                            {c.channelHandle || c.email || c.status}
                          </div>
                        </div>
                      </button>
                    </td>
                    <td className="py-3 px-5 text-white/60 font-mono text-xs">{c.phone}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <Badge tone={toneFor(status)}>{status}</Badge>
                        {c.isReported && <Badge tone="amber">Reported</Badge>}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className="text-white/60 font-bold">{c.warningCount ?? 0}</span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setStatus(c.id, 'active')}
                          title="Reinstate"
                          className="p-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-emerald-400/10 hover:border-emerald-400/30 hover:text-emerald-300 transition-colors"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStatus(c.id, 'suspended')}
                          title="Suspend 24h"
                          className="p-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-amber-400/10 hover:border-amber-400/30 hover:text-amber-300 transition-colors"
                        >
                          <ShieldIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStatus(c.id, 'banned')}
                          title="Ban"
                          className="p-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 transition-colors"
                        >
                          <BanIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/40 text-sm">
                    No users match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {detail && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0E1320] shadow-2xl shadow-black/60 overflow-hidden"
          >
            <div className="relative h-28 bg-gradient-to-br from-[#3F9BFF]/30 via-[#8a5bff]/20 to-transparent">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-lg border border-white/10 bg-black/30 hover:bg-black/50 flex items-center justify-center"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 pb-6 -mt-10">
              <img
                src={detail.avatarUrl}
                alt=""
                className="w-20 h-20 rounded-2xl object-cover border-4 border-[#0E1320] bg-white/10"
              />
              <div className="mt-4 flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">{detail.name}</h3>
                <Badge tone={toneFor(detail.moderationStatus ?? 'active')}>
                  {detail.moderationStatus ?? 'active'}
                </Badge>
              </div>
              <div className="text-sm text-white/50 mt-1">{detail.status}</div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <dt className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Phone</dt>
                  <dd className="mt-1 font-mono text-xs">{detail.phone}</dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <dt className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Handle</dt>
                  <dd className="mt-1 font-mono text-xs">{detail.channelHandle || '—'}</dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <dt className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Warnings</dt>
                  <dd className="mt-1 font-bold">{detail.warningCount ?? 0}</dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <dt className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Reported</dt>
                  <dd className="mt-1 font-bold">{detail.isReported ? 'Yes' : 'No'}</dd>
                </div>
              </dl>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    setStatus(detail.id, 'active');
                    setSelected(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 font-bold text-sm hover:bg-emerald-400/20"
                >
                  Reinstate
                </button>
                <button
                  onClick={() => {
                    setStatus(detail.id, 'suspended');
                    setSelected(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 font-bold text-sm hover:bg-amber-400/20"
                >
                  Suspend
                </button>
                <button
                  onClick={() => {
                    setStatus(detail.id, 'banned');
                    setSelected(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 font-bold text-sm hover:bg-red-500/20"
                >
                  Ban
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
