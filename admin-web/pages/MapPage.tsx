import React, { useMemo, useState } from 'react';
import type { Contact } from '../../types';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { MapIcon, PinIcon, UsersIcon, ShieldIcon } from '../icons';

interface MapPageProps {
  contacts: Contact[];
}

const LIVE_WINDOW_MS = 5 * 60 * 1000; // 5 min
const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

const MAP_W = 1000;
const MAP_H = 500;

const project = (lat: number, lng: number) => {
  const x = ((lng + 180) / 360) * MAP_W;
  const y = ((90 - lat) / 180) * MAP_H;
  return { x, y };
};

const liveness = (lastActive?: string): 'live' | 'recent' | 'idle' => {
  if (!lastActive) return 'idle';
  const diff = Date.now() - new Date(lastActive).getTime();
  if (diff < LIVE_WINDOW_MS) return 'live';
  if (diff < RECENT_WINDOW_MS) return 'recent';
  return 'idle';
};

const COLORS = {
  live: '#10b981',
  recent: '#3F9BFF',
  idle: '#a98bff',
};

const MapPage: React.FC<MapPageProps> = ({ contacts }) => {
  const [filter, setFilter] = useState<'all' | 'live' | 'recent' | 'idle'>('all');
  const [hovered, setHovered] = useState<string | null>(null);

  const placed = useMemo(
    () =>
      contacts
        .filter(c => c.location && typeof c.location.latitude === 'number' && typeof c.location.longitude === 'number')
        .map(c => ({
          ...c,
          live: liveness(c.lastActive),
          xy: project(c.location!.latitude, c.location!.longitude),
        })),
    [contacts]
  );

  const filtered = useMemo(
    () => (filter === 'all' ? placed : placed.filter(p => p.live === filter)),
    [placed, filter]
  );

  const counts = useMemo(
    () => ({
      live: placed.filter(p => p.live === 'live').length,
      recent: placed.filter(p => p.live === 'recent').length,
      idle: placed.filter(p => p.live === 'idle').length,
    }),
    [placed]
  );

  const hoveredUser = hovered ? filtered.find(c => c.id === hovered) : null;

  const byRegion = useMemo(() => {
    const region = (lat: number, lng: number): string => {
      if (lng >= -170 && lng < -30 && lat > 0) return 'North America';
      if (lng >= -90 && lng < -30 && lat <= 0) return 'South America';
      if (lng >= -25 && lng < 60 && lat >= 35) return 'Europe';
      if (lng >= -25 && lng < 60 && lat < 35 && lat > -35) return 'Africa';
      if (lng >= 25 && lng < 180 && lat >= 5) return 'Asia';
      if (lng >= 110 && lng < 180 && lat < 5) return 'Oceania';
      return 'Other';
    };
    const m = new Map<string, number>();
    placed.forEach(p => {
      const r = region(p.location!.latitude, p.location!.longitude);
      m.set(r, (m.get(r) || 0) + 1);
    });
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [placed]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Users on map" value={placed.length.toString()} icon={<MapIcon className="w-5 h-5" />} accent="blue" />
        <StatCard label="Live now" value={counts.live.toString()} icon={<PinIcon className="w-5 h-5" />} accent="green" />
        <StatCard label="Active 24h" value={counts.recent.toString()} icon={<UsersIcon className="w-5 h-5" />} accent="violet" />
        <StatCard label="Idle / offline" value={counts.idle.toString()} icon={<ShieldIcon className="w-5 h-5" />} accent="orange" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {([
          ['all', `All (${placed.length})`],
          ['live', `Live (${counts.live})`],
          ['recent', `Recent (${counts.recent})`],
          ['idle', `Idle (${counts.idle})`],
        ] as const).map(([k, label]) => (
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
          </button>
        ))}
      </div>

      <Card title="Live world view" subtitle="Approximate positions from user GPS coordinates" padded={false}>
        <div className="relative aspect-[2/1] w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="mapBg" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="rgba(63,155,255,0.12)" />
                <stop offset="100%" stopColor="rgba(11,14,20,0)" />
              </radialGradient>
              <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.9" fill="rgba(255,255,255,0.07)" />
              </pattern>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>

            <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#mapBg)" />
            <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#dots)" />

            {[0.25, 0.5, 0.75].map(t => (
              <line
                key={t}
                x1="0"
                x2={MAP_W}
                y1={t * MAP_H}
                y2={t * MAP_H}
                stroke="rgba(255,255,255,0.04)"
                strokeDasharray="2 6"
              />
            ))}
            {[0.25, 0.5, 0.75].map(t => (
              <line
                key={`v-${t}`}
                y1="0"
                y2={MAP_H}
                x1={t * MAP_W}
                x2={t * MAP_W}
                stroke="rgba(255,255,255,0.04)"
                strokeDasharray="2 6"
              />
            ))}

            {filtered.map(p => {
              const color = COLORS[p.live];
              return (
                <g
                  key={p.id}
                  transform={`translate(${p.xy.x},${p.xy.y})`}
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                >
                  {p.live === 'live' && (
                    <circle r="14" fill={color} opacity="0.15" filter="url(#glow)">
                      <animate attributeName="r" values="10;22;10" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle r="8" fill={color} opacity="0.18" />
                  <circle r="4" fill={color} stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" />
                </g>
              );
            })}
          </svg>

          {hoveredUser && (
            <div
              className="absolute pointer-events-none z-10 rounded-2xl border border-white/15 bg-[#0E1320]/95 backdrop-blur px-3 py-2 shadow-2xl shadow-black/40 min-w-[180px]"
              style={{
                left: `${(hoveredUser.xy.x / MAP_W) * 100}%`,
                top: `${(hoveredUser.xy.y / MAP_H) * 100}%`,
                transform: 'translate(-50%, calc(-100% - 14px))',
              }}
            >
              <div className="flex items-center gap-2">
                <img src={hoveredUser.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate flex items-center gap-1">
                    {hoveredUser.name}
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: COLORS[hoveredUser.live] }}
                    />
                  </div>
                  <div className="text-[10px] text-white/40 font-mono truncate">
                    {hoveredUser.location!.latitude.toFixed(2)}, {hoveredUser.location!.longitude.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-3 right-3 flex items-center gap-3 rounded-xl border border-white/10 bg-black/50 backdrop-blur px-3 py-2 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.live }} /> Live</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.recent }} /> Recent</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.idle }} /> Idle</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="By region" subtitle="Approximate continent" className="xl:col-span-1">
          <ul className="space-y-2 text-sm">
            {byRegion.length ? (
              byRegion.map(([region, n]) => (
                <li key={region}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{region}</span>
                    <span className="text-white/40 text-xs">{n}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#3F9BFF] to-[#8a5bff] rounded-full"
                      style={{ width: `${(n / Math.max(placed.length, 1)) * 100}%` }}
                    />
                  </div>
                </li>
              ))
            ) : (
              <li className="text-white/40 text-sm py-4 text-center">No location data yet</li>
            )}
          </ul>
        </Card>

        <Card title="Active users" subtitle="Most recently seen" className="xl:col-span-2" padded={false}>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5 sticky top-0 bg-[#0E1320]/95 backdrop-blur">
                <tr>
                  <th className="py-3 px-5 font-bold">User</th>
                  <th className="py-3 px-5 font-bold">Coordinates</th>
                  <th className="py-3 px-5 font-bold">Status</th>
                  <th className="py-3 px-5 font-bold">Last active</th>
                </tr>
              </thead>
              <tbody>
                {[...placed]
                  .sort((a, b) => new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime())
                  .slice(0, 30)
                  .map(p => (
                    <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={p.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{p.name}</div>
                            <div className="text-[11px] text-white/40 truncate">{p.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 font-mono text-[11px] text-white/60">
                        {p.location!.latitude.toFixed(2)}, {p.location!.longitude.toFixed(2)}
                      </td>
                      <td className="py-3 px-5">
                        <Badge tone={p.live === 'live' ? 'green' : p.live === 'recent' ? 'blue' : 'violet'}>
                          {p.live}
                        </Badge>
                      </td>
                      <td className="py-3 px-5 text-white/40 text-xs">
                        {p.lastActive
                          ? new Date(p.lastActive).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                {!placed.length && (
                  <tr><td colSpan={4} className="py-12 text-center text-white/40 text-sm">No users sharing location</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MapPage;
