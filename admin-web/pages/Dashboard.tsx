import React, { useEffect, useState } from 'react';
import { listUsers, type ApiUser } from '../services/adminApi';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import DonutChart from '../components/DonutChart';
import Badge from '../components/Badge';
import { UsersIcon, ShieldIcon, CheckIcon, BanIcon } from '../icons';

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Use a large page size — server may cap to its own max. For very large
    // tenants, replace with a dedicated /admin/stats endpoint when available.
    listUsers({ size: 1000, sort: 'NEWEST', status: 'ALL' })
      .then(r => { if (!cancelled) setUsers(r.content); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const total = users.length;
  const active = users.filter(u => !u.deletedAt && u.isActive).length;
  const inactive = users.filter(u => !u.deletedAt && !u.isActive).length;
  const deleted = users.filter(u => !!u.deletedAt).length;
  const verified = users.filter(u => u.isVerified && !u.deletedAt).length;
  const unverified = users.filter(u => !u.isVerified && !u.deletedAt).length;
  const admins = users.filter(u => u.role === 'ADMIN' && !u.deletedAt).length;

  const last24h = users.filter(u => {
    if (!u.lastSeenAt) return false;
    return Date.now() - new Date(u.lastSeenAt).getTime() < 24 * 3600 * 1000;
  }).length;

  // Last 30 days registration trend
  const days: { label: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const next = new Date(start);
    next.setDate(next.getDate() + 1);
    const count = users.filter(u => {
      const t = new Date(u.createdAt).getTime();
      return t >= start.getTime() && t < next.getTime();
    }).length;
    days.push({
      label: start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      value: count,
    });
  }

  const recent = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total users" value={total.toLocaleString()} icon={<UsersIcon className="w-5 h-5" />} accent="blue" />
        <StatCard label="Active" value={active.toLocaleString()} icon={<CheckIcon className="w-5 h-5" />} accent="green" />
        <StatCard label="Deleted" value={deleted.toLocaleString()} icon={<BanIcon className="w-5 h-5" />} accent="orange" />
        <StatCard label="Active 24h" value={last24h.toLocaleString()} icon={<ShieldIcon className="w-5 h-5" />} accent="violet" />
      </div>

      {error && (
        <Card className="border-red-500/30">
          <p className="text-sm text-red-300">⚠ {error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card
          className="xl:col-span-2"
          title="Registrations"
          subtitle="New accounts · last 30 days"
          action={<Badge tone="blue">Live</Badge>}
        >
          {loading ? (
            <div className="h-[220px] flex items-center justify-center text-white/40 text-sm">
              <div className="w-6 h-6 border-4 border-[#3F9BFF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <LineChart data={days} formatValue={n => `${n}`} />
          )}
        </Card>

        <Card title="Account breakdown" subtitle="By verification & role">
          <DonutChart
            segments={[
              { label: 'Verified', value: verified, color: '#3F9BFF' },
              { label: 'Unverified', value: unverified, color: '#f59e0b' },
              { label: 'Admins', value: admins, color: '#A369F0' },
              { label: 'Inactive', value: inactive, color: '#6b7280' },
              { label: 'Deleted', value: deleted, color: '#ef4444' },
            ]}
            centerLabel={total.toString()}
            centerSub="Total"
          />
        </Card>
      </div>

      <Card title="Recently registered" subtitle="Latest accounts" padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5">
              <tr>
                <th className="py-3 px-5 font-bold">User</th>
                <th className="py-3 px-5 font-bold">Role</th>
                <th className="py-3 px-5 font-bold">Status</th>
                <th className="py-3 px-5 font-bold">Registered</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(u => {
                const statusTone = u.deletedAt ? 'red' : !u.isActive ? 'gray' : 'green';
                const statusLabel = u.deletedAt ? 'Deleted' : !u.isActive ? 'Inactive' : 'Active';
                return (
                  <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3 min-w-0">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-xl object-cover border border-white/10" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3F9BFF] to-[#8a5bff] border border-white/10 flex items-center justify-center text-sm font-black">
                            {u.displayName.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{u.displayName}</div>
                          <div className="text-[11px] text-white/40 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5"><Badge tone={u.role === 'ADMIN' ? 'violet' : 'gray'}>{u.role}</Badge></td>
                    <td className="py-3 px-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone={statusTone}>{statusLabel}</Badge>
                        {u.isVerified ? <Badge tone="blue">Verified</Badge> : <Badge tone="amber">Unverified</Badge>}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-white/60 text-xs whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
              {!recent.length && !loading && (
                <tr><td colSpan={4} className="py-10 text-center text-white/40 text-sm">No users yet</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-white/5">
            <a
              href="#/users"
              className="block text-center text-[11px] uppercase tracking-widest font-bold text-[#7cb8ff] hover:text-white py-1 transition-colors"
            >
              Open user management →
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
