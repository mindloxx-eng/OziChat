import React, { useEffect, useState } from 'react';
import type { AppSettings, Contact, Group, VideoPost } from '../types';
import * as backend from '../services/backendService';

import AdminShell from './components/AdminShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Chats from './pages/Chats';
import Reels from './pages/Reels';
import MapPage from './pages/MapPage';
import Settings from './pages/Settings';
import { useHashRoute } from './hooks/useHashRoute';

const TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of users and module activity' },
  users: { title: 'Users', subtitle: 'Manage accounts and moderation' },
  chats: { title: 'Chats & Groups', subtitle: 'Messaging, groups and public channels' },
  reels: { title: 'Reels', subtitle: 'Short-form video content moderation' },
  map: { title: 'Live Map', subtitle: 'User locations and geographic activity' },
  settings: { title: 'App settings', subtitle: 'Security, appearance and privacy defaults' },
};

const SEARCH_PLACEHOLDERS: Record<string, string | undefined> = {
  users: 'Search users by name, phone, handle…',
  chats: 'Search groups, channels, handles…',
  reels: 'Search by author, tag, description…',
};

const REELS_KEY = 'ozichat_channel_posts';

const App: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [reels, setReels] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('ozi_admin_auth') === '1');
  const [search, setSearch] = useState('');
  const [route, navigate] = useHashRoute();

  useEffect(() => {
    setContacts(backend.getContacts());
    setSettings(backend.getSettings());
    setGroups(backend.getGroups());
    setReels(backend.getChannelPosts());
    setLoading(false);
  }, []);

  useEffect(() => {
    setSearch('');
  }, [route]);

  const updateContacts = (next: Contact[]) => {
    backend.saveContacts(next);
    setContacts(next);
  };

  const updateGroups = (next: Group[]) => {
    backend.saveGroups(next);
    setGroups(next);
  };

  const updateReels = (next: VideoPost[]) => {
    localStorage.setItem(REELS_KEY, JSON.stringify(next));
    setReels(next);
  };

  const updateSettings = (patch: Partial<AppSettings>) => {
    if (!settings) return;
    const next = { ...settings, ...patch };
    backend.saveSettings(next);
    setSettings(next);
  };

  const logout = () => {
    sessionStorage.removeItem('ozi_admin_auth');
    setAuthed(false);
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen w-full bg-[#0B0E14] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#3F9BFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <Login adminEmail={settings.adminEmail} onSuccess={() => setAuthed(true)} />;
  }

  const meta = TITLES[route] || TITLES.dashboard;
  const placeholder = SEARCH_PLACEHOLDERS[route];

  return (
    <AdminShell
      route={route}
      onNavigate={navigate}
      onLogout={logout}
      title={meta.title}
      subtitle={meta.subtitle}
      adminEmail={settings.adminEmail}
      search={placeholder ? { value: search, onChange: setSearch, placeholder } : undefined}
    >
      {route === 'dashboard' && (
        <Dashboard contacts={contacts} groups={groups} reels={reels} />
      )}
      {route === 'users' && <Users contacts={contacts} search={search} onUpdate={updateContacts} />}
      {route === 'chats' && (
        <Chats contacts={contacts} groups={groups} onUpdateGroups={updateGroups} search={search} />
      )}
      {route === 'reels' && <Reels posts={reels} onUpdate={updateReels} search={search} />}
      {route === 'map' && <MapPage contacts={contacts} />}
      {route === 'settings' && <Settings settings={settings} onUpdate={updateSettings} />}
    </AdminShell>
  );
};

export default App;
