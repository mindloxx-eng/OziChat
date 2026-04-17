
import React, { useState, useEffect } from 'react';
import type { Contact, AppSettings, RevenueEntry, Advertisement } from '../types';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUserManagement from './components/admin/AdminUserManagement';
import AdminSidebar from './components/admin/AdminSidebar';
import AdminSettings from './components/admin/AdminSettings';
import AdminModeration from './components/admin/AdminModeration';
import AdminRevenueScreen from './components/admin/AdminRevenueScreen';
import AdminPaymentSettings from './components/admin/AdminPaymentSettings';
import AdminAdModeration from './components/admin/AdminAdModeration';
import * as backend from './services/backendService';


interface AdminAppProps {
  contacts: Contact[];
  settings: AppSettings;
  advertisements: Advertisement[];
  onUpdateContacts: (contacts: Contact[]) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onUpdateAdvertisements: (ads: Advertisement[]) => void;
  onLogout: () => void;
}

export type AdminScreenType = 'dashboard' | 'users' | 'settings' | 'moderation' | 'revenue' | 'payments' | 'advertisements';

const getAdminRoute = (): AdminScreenType => {
    const hash = window.location.hash.replace(/^#\/?/, ''); // e.g., "adminmgr/users"
    if (hash === 'adminmgr/dashboard') return 'dashboard';
    if (hash.startsWith('adminmgr/users')) return 'users';
    if (hash === 'adminmgr/settings') return 'settings';
    if (hash === 'adminmgr/moderation') return 'moderation';
    if (hash === 'adminmgr/revenue') return 'revenue';
    if (hash === 'adminmgr/payments') return 'payments';
    if (hash === 'adminmgr/advertisements') return 'advertisements';
    return 'dashboard'; // Default to dashboard
};

const AdminApp: React.FC<AdminAppProps> = ({ contacts, settings, advertisements, onUpdateContacts, onUpdateSettings, onUpdateAdvertisements, onLogout }) => {
  const [activeScreen, setActiveScreen] = useState<AdminScreenType>(getAdminRoute());
  const [revenueData, setRevenueData] = useState<RevenueEntry[]>([]);

  useEffect(() => {
    setRevenueData(backend.getRevenueData());

    const handleHashChange = () => {
        setActiveScreen(getAdminRoute());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
        window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderContent = () => {
    switch (activeScreen) {
      case 'users':
        return <AdminUserManagement contacts={contacts} onUpdateContacts={onUpdateContacts} />;
      case 'settings':
        return <AdminSettings settings={settings} onUpdateSettings={onUpdateSettings} />;
      case 'moderation':
        return <AdminModeration contacts={contacts} onUpdateContacts={onUpdateContacts} settings={settings} />;
      case 'advertisements':
        return <AdminAdModeration advertisements={advertisements} onUpdateAdvertisements={onUpdateAdvertisements} />;
      case 'revenue':
        return <AdminRevenueScreen revenueData={revenueData} contacts={contacts} />;
      case 'payments':
        return <AdminPaymentSettings settings={settings} onUpdateSettings={onUpdateSettings} />;
      case 'dashboard':
      default:
        return <AdminDashboard contacts={contacts} settings={settings} revenueData={revenueData} />;
    }
  };

  return (
    <div className="flex h-full bg-[#10101b] text-white">
      <AdminSidebar onLogout={onLogout} activeScreen={activeScreen} />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminApp;
