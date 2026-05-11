import React, { useMemo, useState } from 'react';
import type { Contact, Group } from '../../types';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { ChatIcon, GroupIcon, HashIcon, TrashIcon, ShieldIcon, FlagIcon } from '../icons';

interface ChatsProps {
  contacts: Contact[];
  groups: Group[];
  onUpdateGroups: (g: Group[]) => void;
  search: string;
}

type Tab = 'groups' | 'channels' | 'activity';

const Chats: React.FC<ChatsProps> = ({ contacts, groups, onUpdateGroups, search }) => {
  const [tab, setTab] = useState<Tab>('groups');
  const [selected, setSelected] = useState<string | null>(null);

  const q = search.trim().toLowerCase();

  const channels = useMemo(
    () => contacts.filter(c => !!c.channelHandle),
    [contacts]
  );

  const stats = useMemo(() => {
    const muted = contacts.filter(c => c.notificationsMuted).length;
    const disappearing = contacts.filter(c => (c.disappearingMessagesTimer ?? 0) > 0).length;
    const e2ee = contacts.length;
    return { muted, disappearing, e2ee };
  }, [contacts]);

  const filteredGroups = useMemo(
    () =>
      groups.filter(g => !q || g.name.toLowerCase().includes(q) || g.lastMessage.toLowerCase().includes(q)),
    [groups, q]
  );

  const filteredChannels = useMemo(
    () =>
      channels.filter(c =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.channelHandle || '').toLowerCase().includes(q)
      ),
    [channels, q]
  );

  const removeGroup = (id: string) => {
    if (!confirm('Disband this group? Members will no longer see it.')) return;
    onUpdateGroups(groups.filter(g => g.id !== id));
    if (selected === id) setSelected(null);
  };

  const detail = selected ? groups.find(g => g.id === selected) : null;
  const detailMembers = detail ? detail.members.map(id => contacts.find(c => c.id === id)).filter(Boolean) as Contact[] : [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total contacts" value={contacts.length.toString()} icon={<ChatIcon className="w-5 h-5" />} accent="blue" />
        <StatCard label="Active groups" value={groups.length.toString()} icon={<GroupIcon className="w-5 h-5" />} accent="violet" />
        <StatCard label="Public channels" value={channels.length.toString()} icon={<HashIcon className="w-5 h-5" />} accent="green" />
        <StatCard label="Disappearing chats" value={stats.disappearing.toString()} icon={<ShieldIcon className="w-5 h-5" />} accent="orange" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {([
          ['groups', `Groups (${groups.length})`],
          ['channels', `Channels (${channels.length})`],
          ['activity', 'Activity & Policy'],
        ] as [Tab, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              tab === k
                ? 'border-[#3F9BFF]/50 bg-[#3F9BFF]/15 text-[#7cb8ff]'
                : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:border-white/20'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'groups' && (
        <Card padded={false} title="Groups" subtitle="All active chat groups">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5">
                <tr>
                  <th className="py-3 px-5 font-bold">Group</th>
                  <th className="py-3 px-5 font-bold">Members</th>
                  <th className="py-3 px-5 font-bold">Last message</th>
                  <th className="py-3 px-5 font-bold">Unread</th>
                  <th className="py-3 px-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map(g => (
                  <tr key={g.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="py-3 px-5">
                      <button onClick={() => setSelected(g.id)} className="flex items-center gap-3 text-left min-w-0">
                        <img src={g.avatarUrl} alt="" className="w-9 h-9 rounded-xl object-cover border border-white/10" />
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{g.name}</div>
                          <div className="text-[11px] text-white/40">{g.timestamp}</div>
                        </div>
                      </button>
                    </td>
                    <td className="py-3 px-5">
                      <Badge tone="violet">{g.members.length} members</Badge>
                    </td>
                    <td className="py-3 px-5 text-white/60 truncate max-w-xs">{g.lastMessage}</td>
                    <td className="py-3 px-5">
                      {g.unreadCount > 0 ? <Badge tone="blue">{g.unreadCount} new</Badge> : <span className="text-white/30">—</span>}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => removeGroup(g.id)}
                          className="p-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 transition-colors"
                          title="Disband group"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredGroups.length && (
                  <tr><td colSpan={5} className="py-12 text-center text-white/40 text-sm">No groups</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'channels' && (
        <Card padded={false} title="Public Channels" subtitle="Users broadcasting on Ozi channels">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 p-5">
            {filteredChannels.map(c => (
              <div key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
                <img src={c.avatarUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold truncate flex items-center gap-2">
                    {c.name}
                    {c.moderationStatus && c.moderationStatus !== 'active' && (
                      <Badge tone={c.moderationStatus === 'banned' ? 'red' : 'amber'}>{c.moderationStatus}</Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-[#7cb8ff] font-mono truncate">{c.channelHandle}</div>
                  <div className="text-[11px] text-white/40 truncate">{c.status}</div>
                </div>
              </div>
            ))}
            {!filteredChannels.length && (
              <div className="col-span-full py-10 text-center text-white/40 text-sm">No channels found</div>
            )}
          </div>
        </Card>
      )}

      {tab === 'activity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Messaging policy" subtitle="Defaults that apply to user chats">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="flex items-center gap-2"><ShieldIcon className="w-4 h-4 text-emerald-300" /> End-to-end encryption</span>
                <Badge tone="green">Always on</Badge>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="flex items-center gap-2"><ChatIcon className="w-4 h-4 text-[#7cb8ff]" /> Disappearing messages</span>
                <Badge tone="blue">{stats.disappearing} chats</Badge>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="flex items-center gap-2"><FlagIcon className="w-4 h-4 text-amber-300" /> Reported users</span>
                <Badge tone="amber">{contacts.filter(c => c.isReported).length}</Badge>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="flex items-center gap-2"><GroupIcon className="w-4 h-4 text-[#a98bff]" /> Muted by users</span>
                <Badge tone="violet">{stats.muted}</Badge>
              </li>
            </ul>
          </Card>

          <Card title="Codec distribution" subtitle="Call quality preferences across users">
            {(() => {
              const audio = new Map<string, number>();
              const video = new Map<string, number>();
              contacts.forEach(c => {
                if (c.audioCodec) audio.set(c.audioCodec, (audio.get(c.audioCodec) || 0) + 1);
                if (c.videoCodec) video.set(c.videoCodec, (video.get(c.videoCodec) || 0) + 1);
              });
              const Row = ({ label, m, total }: { label: string; m: Map<string, number>; total: number }) => (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</div>
                  {Array.from(m.entries()).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold">{k}</span>
                        <span className="text-white/40">{v} users</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#3F9BFF] to-[#8a5bff] rounded-full"
                          style={{ width: `${Math.min(100, (v / Math.max(total, 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
              return (
                <div className="space-y-5">
                  <Row label="Audio codec" m={audio} total={contacts.length} />
                  <Row label="Video codec" m={video} total={contacts.length} />
                </div>
              );
            })()}
          </Card>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0E1320] shadow-2xl shadow-black/60 overflow-hidden">
            <div className="relative h-24 bg-gradient-to-br from-[#3F9BFF]/30 to-[#8a5bff]/20" />
            <div className="px-6 pb-6 -mt-10">
              <img src={detail.avatarUrl} alt="" className="w-20 h-20 rounded-2xl object-cover border-4 border-[#0E1320]" />
              <h3 className="text-xl font-black tracking-tight mt-4">{detail.name}</h3>
              <p className="text-white/50 text-sm">{detail.lastMessage}</p>
              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Members ({detailMembers.length})</div>
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {detailMembers.map(m => (
                    <li key={m.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                      <img src={m.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">{m.name}</div>
                        <div className="text-[11px] text-white/40 truncate">{m.phone}</div>
                      </div>
                      {m.moderationStatus && m.moderationStatus !== 'active' && (
                        <Badge tone={m.moderationStatus === 'banned' ? 'red' : 'amber'}>{m.moderationStatus}</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/10 text-sm font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => removeGroup(detail.id)}
                  className="flex-1 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-sm font-bold"
                >
                  Disband group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
