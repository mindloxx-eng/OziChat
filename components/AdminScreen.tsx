
import React from 'react';
import type { Contact, AppSettings } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import SettingsHeader from './settings/SettingsHeader';

interface AdminScreenProps {
  onBack: () => void;
  contacts: Contact[];
  settings: AppSettings;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-[#2a2a46] p-4 rounded-lg flex items-center gap-4 shadow">
        <div className="bg-[#553699] p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const AdminScreen: React.FC<AdminScreenProps> = ({ onBack, contacts, settings }) => {
    const totalMessages = 4; // Simulated from ChatScreen initial state
    const favoriteContacts = contacts.filter(c => c.isFavorite).length;
    const mutedContacts = contacts.filter(c => c.notificationsMuted).length;
    
    const systemLogs = [
        { level: 'INFO', timestamp: '11:37 AM', message: 'User sent message to Nina' },
        { level: 'INFO', timestamp: '11:36 AM', message: 'Gemini API responded to user' },
        { level: 'WARN', timestamp: '10:15 AM', message: 'Unread message count for Alex is 2' },
        { level: 'INFO', timestamp: 'Yesterday', message: 'Contact "Mom" was marked as favorite' },
        { level: 'INFO', timestamp: '2 days ago', message: 'App theme set to "system"' },
    ];

    return (
    <div className="flex flex-col h-full bg-[#10101b] text-white">
      <SettingsHeader title="Admin Panel" onBack={onBack} />
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Dashboard Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-semibold">Dashboard</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Total Contacts" value={contacts.length} icon={<UsersIcon className="w-5 h-5" />} />
            <StatCard title="Total Messages" value={totalMessages} icon={<ClipboardDocumentListIcon className="w-5 h-5" />} />
            <StatCard title="Favorites" value={favoriteContacts} icon={<UsersIcon className="w-5 h-5" />} />
            <StatCard title="Muted" value={mutedContacts} icon={<UsersIcon className="w-5 h-5" />} />
          </div>
        </section>

        {/* Contact Management Section */}
        <section>
           <div className="flex items-center gap-3 mb-4">
            <UsersIcon className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-semibold">Contact Management</h2>
          </div>
          <div className="bg-[#2a2a46] rounded-lg max-h-60 overflow-y-auto">
            <ul className="divide-y divide-gray-700">
                {contacts.map(contact => (
                    <li key={contact.id} className="flex items-center gap-4 p-3">
                        <img src={contact.avatarUrl} alt={contact.name} className="w-10 h-10 rounded-full" />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{contact.name}</p>
                            <p className="text-sm text-gray-400 truncate">{contact.phone}</p>
                        </div>
                        <span className="text-xs bg-[#553699] px-2 py-1 rounded-full">User</span>
                    </li>
                ))}
            </ul>
          </div>
        </section>
        
        {/* System Logs Section */}
        <section>
            <div className="flex items-center gap-3 mb-4">
                <ClipboardDocumentListIcon className="w-6 h-6 text-gray-400" />
                <h2 className="text-xl font-semibold">System Logs</h2>
            </div>
            <div className="bg-[#0D1117] font-mono text-sm p-3 rounded-lg max-h-48 overflow-y-auto">
                {systemLogs.map((log, index) => (
                    <p key={index} className="whitespace-pre-wrap">
                        <span className="text-gray-500">{log.timestamp} </span>
                        <span className={log.level === 'WARN' ? 'text-yellow-400' : 'text-blue-400'}>[{log.level}] </span>
                        <span>{log.message}</span>
                    </p>
                ))}
            </div>
        </section>

      </main>
    </div>
  );
};

export default AdminScreen;
