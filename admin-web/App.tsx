import React, { useEffect, useState } from 'react';

import AdminShell from './components/AdminShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import { useHashRoute } from './hooks/useHashRoute';
import { clearSession, getSession, type AuthData } from './services/adminApi';

const TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of all user accounts' },
  users: { title: 'User management', subtitle: 'Full lifecycle control — list, filter, status and password operations' },
};

const SEARCH_PLACEHOLDERS: Record<string, string | undefined> = {
  users: 'Search by name, email or phone…',
};

const App: React.FC = () => {
  const [session, setSessionState] = useState(() => getSession());
  const [search, setSearch] = useState('');
  const [route, navigate] = useHashRoute();

  useEffect(() => {
    setSearch('');
  }, [route]);

  const onSignedIn = (auth: AuthData) => {
    setSessionState(getSession());
    // navigate to dashboard after successful sign-in
    if (route !== 'dashboard' && route !== 'users') {
      navigate('dashboard');
    }
    // ensure re-render uses fresh user data
    void auth;
  };

  const logout = () => {
    clearSession();
    setSessionState(null);
    window.location.hash = '#/';
  };

  if (!session) {
    return <Login onSuccess={onSignedIn} />;
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
      adminName={session.user.displayName}
      adminEmail={session.user.email}
      search={placeholder ? { value: search, onChange: setSearch, placeholder } : undefined}
    >
      {route === 'dashboard' && <Dashboard />}
      {route === 'users' && <Users search={search} />}
    </AdminShell>
  );
};

export default App;
