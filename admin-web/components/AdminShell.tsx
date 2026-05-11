import React from 'react';
import {
  DashboardIcon,
  UsersIcon,
  ChatIcon,
  VideoIcon,
  MapIcon,
  SettingsIcon,
  LogoutIcon,
  SearchIcon,
  BellIcon,
  OziLogoMark,
  OziWordmark,
} from '../icons';
import type { AdminRoute } from '../hooks/useHashRoute';

interface AdminShellProps {
  route: AdminRoute;
  onNavigate: (r: AdminRoute) => void;
  onLogout: () => void;
  title: string;
  subtitle?: string;
  adminEmail: string;
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  children: React.ReactNode;
}

const NAV: { id: AdminRoute; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; group?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, group: 'Overview' },
  { id: 'users', label: 'Users', icon: UsersIcon, group: 'Overview' },
  { id: 'chats', label: 'Chats & Groups', icon: ChatIcon, group: 'Modules' },
  { id: 'reels', label: 'Reels', icon: VideoIcon, group: 'Modules' },
  { id: 'map', label: 'Live Map', icon: MapIcon, group: 'Modules' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, group: 'System' },
];

const AdminShell: React.FC<AdminShellProps> = ({
  route,
  onNavigate,
  onLogout,
  title,
  subtitle,
  adminEmail,
  search,
  children,
}) => {
  return (
    <div className="min-h-screen w-full bg-[#0B0E14] text-white relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(800px 400px at 0% 0%, rgba(63,155,255,0.10), transparent 60%),' +
            'radial-gradient(700px 500px at 100% 100%, rgba(138,91,255,0.08), transparent 60%)',
        }}
      />

      <div className="relative flex min-h-screen">
        <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-white/5 bg-[#0E1320]/70 backdrop-blur-xl">
          <div className="px-5 py-6 flex items-center gap-3">
            <OziLogoMark className="w-10 h-10 shrink-0" step={2} />
            <div className="leading-tight min-w-0">
              <OziWordmark className="h-5 w-auto" />
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 mt-1">Admin Console</div>
            </div>
          </div>

          <nav className="px-3 mt-2 space-y-1 overflow-y-auto">
            {NAV.map((item, i) => {
              const Icon = item.icon;
              const active = route === item.id;
              const showGroup = item.group && (i === 0 || NAV[i - 1].group !== item.group);
              return (
                <React.Fragment key={item.id}>
                  {showGroup && (
                    <div className={`px-3 pt-${i === 0 ? '0' : '3'} pb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/30`}>
                      {item.group}
                    </div>
                  )}
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`group relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-[#3F9BFF]/20 to-[#8a5bff]/10 text-white border border-white/10 shadow-inner shadow-[#3F9BFF]/10'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-all ${
                        active ? 'bg-[#3F9BFF] shadow-[0_0_12px_rgba(63,155,255,0.7)]' : 'bg-transparent'
                      }`}
                    />
                    <Icon className={`w-[18px] h-[18px] ${active ? 'text-[#3F9BFF]' : 'text-white/50 group-hover:text-white/80'}`} />
                    <span>{item.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </nav>

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3F9BFF] to-[#8a5bff] flex items-center justify-center font-black">
                  A
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold truncate">Admin</div>
                  <div className="text-[10px] text-white/40 truncate">{adminEmail}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogoutIcon className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col">
          <header className="px-6 lg:px-10 pt-7 pb-5 flex items-center gap-4 sticky top-0 z-10 bg-gradient-to-b from-[#0B0E14] via-[#0B0E14]/95 to-transparent backdrop-blur-md">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight truncate">{title}</h1>
              {subtitle && <p className="text-white/40 text-sm mt-1">{subtitle}</p>}
            </div>

            {search && (
              <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-72 focus-within:border-[#3F9BFF]/60 focus-within:bg-white/[0.07] transition-colors">
                <SearchIcon className="w-4 h-4 text-white/40" />
                <input
                  value={search.value}
                  onChange={e => search.onChange(e.target.value)}
                  placeholder={search.placeholder || 'Search…'}
                  className="bg-transparent outline-none text-sm w-full placeholder:text-white/30"
                />
              </div>
            )}

            <button className="relative w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <BellIcon className="w-[18px] h-[18px] text-white/70" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#3F9BFF]" />
            </button>
          </header>

          <div className="px-6 lg:px-10 pb-12 flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
