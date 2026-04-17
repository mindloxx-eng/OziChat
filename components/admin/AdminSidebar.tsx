
import React from 'react';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { LogoutIcon } from '../icons/LogoutIcon';
import { OzichatLogo } from '../icons/NestfingerLogo';
import { AdminScreenType } from '../../AdminApp';
import { CogIcon } from '../icons/CogIcon';
import { ShieldExclamationIcon } from '../icons/ShieldExclamationIcon';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { CreditCardIcon } from '../icons/CreditCardIcon';
import { ClipboardDocumentListIcon } from '../icons/ClipboardDocumentListIcon';

interface AdminSidebarProps {
  onLogout: () => void;
  activeScreen: AdminScreenType;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout, activeScreen }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'moderation', label: 'Moderation', icon: ShieldExclamationIcon },
    { id: 'advertisements', label: 'Advertisements', icon: ClipboardDocumentListIcon },
    { id: 'revenue', label: 'Revenue', icon: CurrencyDollarIcon },
    { id: 'payments', label: 'Payments', icon: CreditCardIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon },
  ];
  return (
    <aside className="w-64 bg-[#1C1C2E] p-4 flex flex-col justify-between border-r border-gray-700">
      <div>
        <div className="mb-8 p-2">
            <OzichatLogo className="w-32 h-auto" />
        </div>
        <nav className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => window.location.hash = `#/adminmgr/${item.id}`}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  isActive ? 'bg-[#553699] text-white' : 'text-gray-300 hover:bg-[#2a2a46]'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
      >
        <LogoutIcon className="w-6 h-6" />
        <span className="font-semibold">Logout</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;
