import React, { useMemo } from 'react';
import type { Contact, Group, VideoPost } from '../../types';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import DonutChart from '../components/DonutChart';
import Badge from '../components/Badge';
import {
  UsersIcon,
  ShieldIcon,
  ChatIcon,
  GroupIcon,
  VideoIcon,
  MapIcon,
  PinIcon,
  HashIcon,
  HeartIcon,
  EyeIcon,
} from '../icons';

interface DashboardProps {
  contacts: Contact[];
  groups: Group[];
  reels: VideoPost[];
}

const parseCount = (s?: string | number): number => {
  if (typeof s === 'number') return s;
  if (!s) return 0;
  const cleaned = s.replace(/,/g, '').trim().toUpperCase();
  const m = cleaned.match(/^([\d.]+)\s*([KM]?)$/);
  if (!m) return parseInt(cleaned, 10) || 0;
  const n = parseFloat(m[1]);
  if (m[2] === 'K') return Math.round(n * 1_000);
  if (m[2] === 'M') return Math.round(n * 1_000_000);
  return Math.round(n);
};

const fmtBig = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n.toString();

const Dashboard: React.FC<DashboardProps> = ({ contacts, groups, reels }) => {
  const stats = useMemo(() => {
    const active = contacts.filter(c => (c.moderationStatus ?? 'active') === 'active').length;
    const suspended = contacts.filter(c => c.moderationStatus === 'suspended').length;
    const banned = contacts.filter(c => c.moderationStatus === 'banned').length;
    const reported = contacts.filter(c => c.isReported).length;
    return { active, suspended, banned, reported };
  }, [contacts]);

  const moduleStats = useMemo(() => {
    const channels = contacts.filter(c => !!c.channelHandle).length;
    const liveNow = contacts.filter(c => {
      if (!c.lastActive) return false;
      return Date.now() - new Date(c.lastActive).getTime() < 5 * 60 * 1000;
    }).length;
    const placed = contacts.filter(c => c.location).length;
    const reelLikes = reels.reduce((s, p) => s + (p.likeCount ?? parseCount(p.likes)), 0);
    const reelViews = reels.reduce((s, p) => s + (p.viewCount ?? 0), 0);
    return { channels, liveNow, placed, reelLikes, reelViews };
  }, [contacts, reels]);

  const activityTrend = useMemo(() => {
    const days: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const count = contacts.filter(c => {
        if (!c.lastActive) return false;
        const t = new Date(c.lastActive).getTime();
        return t >= day.getTime() && t < next.getTime();
      }).length;
      days.push({
        label: day.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        value: count,
      });
    }
    return days;
  }, [contacts]);

  const moderationSegments = useMemo(
    () => [
      { label: 'Active', value: stats.active, color: '#3F9BFF' },
      { label: 'Suspended', value: stats.suspended, color: '#f59e0b' },
      { label: 'Banned', value: stats.banned, color: '#ef4444' },
    ],
    [stats]
  );

  const recentReels = useMemo(
    () => [...reels].sort((a, b) => b.postedAt - a.postedAt).slice(0, 5),
    [reels]
  );

  const reportedUsers = useMemo(
    () =>
      [...contacts]
        .filter(c => c.isReported)
        .sort(
          (a, b) =>
            new Date(b.reportDate || 0).getTime() - new Date(a.reportDate || 0).getTime()
        )
        .slice(0, 5),
    [contacts]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total users"
          value={contacts.length.toLocaleString()}
          icon={<UsersIcon className="w-5 h-5" />}
          accent="blue"
        />
        <StatCard
          label="Active groups"
          value={groups.length.toString()}
          icon={<GroupIcon className="w-5 h-5" />}
          accent="violet"
        />
        <StatCard
          label="Reels published"
          value={reels.length.toString()}
          icon={<VideoIcon className="w-5 h-5" />}
          accent="green"
        />
        <StatCard
          label="Reported"
          value={stats.reported.toString()}
          icon={<ShieldIcon className="w-5 h-5" />}
          accent="orange"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <a href="#/chats" className="rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 p-4 transition-all">
          <div className="flex items-center gap-2 text-[#7cb8ff]"><HashIcon className="w-4 h-4" /><span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Channels</span></div>
          <div className="text-2xl font-black mt-2">{moduleStats.channels}</div>
        </a>
        <a href="#/reels" className="rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 p-4 transition-all">
          <div className="flex items-center gap-2 text-[#a98bff]"><HeartIcon className="w-4 h-4" /><span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Reel likes</span></div>
          <div className="text-2xl font-black mt-2">{fmtBig(moduleStats.reelLikes)}</div>
        </a>
        <a href="#/reels" className="rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 p-4 transition-all">
          <div className="flex items-center gap-2 text-emerald-300"><EyeIcon className="w-4 h-4" /><span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Reel views</span></div>
          <div className="text-2xl font-black mt-2">{fmtBig(moduleStats.reelViews)}</div>
        </a>
        <a href="#/map" className="rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 p-4 transition-all">
          <div className="flex items-center gap-2 text-[#7cb8ff]"><MapIcon className="w-4 h-4" /><span className="text-[10px] uppercase tracking-widest font-bold text-white/40">On map</span></div>
          <div className="text-2xl font-black mt-2">{moduleStats.placed}</div>
        </a>
        <a href="#/map" className="rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 p-4 transition-all">
          <div className="flex items-center gap-2 text-emerald-300"><PinIcon className="w-4 h-4" /><span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Live now</span></div>
          <div className="text-2xl font-black mt-2">{moduleStats.liveNow}</div>
        </a>
        <a href="#/users" className="rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 p-4 transition-all">
          <div className="flex items-center gap-2 text-amber-300"><ShieldIcon className="w-4 h-4" /><span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Suspended</span></div>
          <div className="text-2xl font-black mt-2">{stats.suspended + stats.banned}</div>
        </a>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card
          className="xl:col-span-2"
          title="User activity"
          subtitle="Daily active users · last 14 days"
          action={<Badge tone="blue">Live</Badge>}
        >
          <LineChart data={activityTrend} formatValue={n => `${n}`} />
        </Card>

        <Card title="User moderation" subtitle="Status breakdown">
          <DonutChart segments={moderationSegments} centerLabel={contacts.length.toString()} centerSub="Total" />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card
          className="xl:col-span-2"
          title="Latest reels"
          subtitle="Most recently published content"
          padded={false}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5">
                <tr>
                  <th className="py-3 px-5 font-bold">Reel</th>
                  <th className="py-3 px-5 font-bold">Author</th>
                  <th className="py-3 px-5 font-bold">Engagement</th>
                  <th className="py-3 px-5 font-bold">When</th>
                </tr>
              </thead>
              <tbody>
                {recentReels.map(p => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-12 rounded-lg bg-black overflow-hidden border border-white/10 shrink-0">
                          {p.thumbnailUrl ? (
                            <img src={p.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <video src={p.videoUrl} muted preload="metadata" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate max-w-[220px]">{p.description}</div>
                          <Badge tone="blue" className="mt-1">{p.category}</Badge>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="text-sm font-semibold truncate">{p.author}</div>
                      <div className="text-[11px] text-white/40 truncate">{p.authorHandle}</div>
                    </td>
                    <td className="py-3 px-5 text-white/70 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><HeartIcon className="w-3.5 h-3.5" />{fmtBig(p.likeCount ?? parseCount(p.likes))}</span>
                        <span className="flex items-center gap-1"><ChatIcon className="w-3.5 h-3.5" />{fmtBig(p.commentCount ?? parseCount(p.comments))}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-white/40 text-xs">
                      {new Date(p.postedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
                {!recentReels.length && (
                  <tr><td colSpan={4} className="py-10 text-center text-white/40 text-sm">No reels published yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Reported users" subtitle="Needs moderator review" padded={false}>
          <ul>
            {reportedUsers.map(u => (
              <li key={u.id} className="flex items-center gap-3 px-5 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-xl object-cover border border-white/10" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate text-sm">{u.name}</div>
                  <div className="text-[11px] text-white/40 truncate">{u.phone}</div>
                </div>
                <Badge tone="amber">{u.warningCount ?? 0} warn</Badge>
              </li>
            ))}
            {!reportedUsers.length && (
              <li className="py-10 text-center text-white/40 text-sm">No reports pending</li>
            )}
            <li className="p-3">
              <a
                href="#/users"
                className="block text-center text-[11px] uppercase tracking-widest font-bold text-[#7cb8ff] hover:text-white py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                Open all users →
              </a>
            </li>
          </ul>
        </Card>
      </div>

      <Card title="Quick actions" subtitle="Common admin tasks">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { label: 'Review reported users', tone: 'amber' as const, hash: '#/users' },
            { label: 'Moderate reels', tone: 'violet' as const, hash: '#/reels' },
            { label: 'Manage groups & channels', tone: 'blue' as const, hash: '#/chats' },
            { label: 'Open live map', tone: 'green' as const, hash: '#/map' },
          ].map(a => (
            <a
              key={a.label}
              href={a.hash}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 px-4 py-3 transition-all"
            >
              <span className="text-sm font-semibold">{a.label}</span>
              <Badge tone={a.tone}>Open</Badge>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
