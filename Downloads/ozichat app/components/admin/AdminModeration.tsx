

import React, { useState, useEffect, useMemo } from 'react';
import type { Contact, AppSettings } from '../../types';
import { ShieldExclamationIcon } from '../icons/ShieldExclamationIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { UserMinusIcon } from '../icons/UserMinusIcon';
import { UserPlusIcon } from '../icons/UserPlusIcon';
import { sendEmail } from '../../services/emailService';

interface AdminModerationProps {
  contacts: Contact[];
  onUpdateContacts: (contacts: Contact[]) => void;
  settings: AppSettings;
}

const AdminModeration: React.FC<AdminModerationProps> = ({ contacts, onUpdateContacts, settings }) => {
    
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            const contactsWithExpiredSuspensions = contacts.filter(c =>
                c.moderationStatus === 'suspended' &&
                c.suspensionEndDate &&
                new Date(c.suspensionEndDate) <= now
            );

            if (contactsWithExpiredSuspensions.length > 0) {
                const updatedContacts = contacts.map(c => {
                    if (c.moderationStatus === 'suspended' && c.suspensionEndDate && new Date(c.suspensionEndDate) <= now) {
                        return {
                            ...c,
                            moderationStatus: 'active' as const,
                            suspensionEndDate: undefined,
                            warningCount: (c.warningCount || 0) + 1,
                        };
                    }
                    return c;
                });
                onUpdateContacts(updatedContacts);
            }
        }, 5000); // Check every 5 seconds
        return () => clearInterval(timer);
    }, [contacts, onUpdateContacts]);

    const reportedContacts = useMemo(() => {
        return contacts.filter(c => c.isReported && c.moderationStatus === 'active');
    }, [contacts]);
    
    const suspendedContacts = useMemo(() => {
        return contacts.filter(c => c.moderationStatus === 'suspended');
    }, [contacts]);

    const bannedContacts = useMemo(() => {
        return contacts.filter(c => c.moderationStatus === 'banned');
    }, [contacts]);

    const handleDismissReport = (contactId: string) => {
        const updatedContacts = contacts.map(c => 
            c.id === contactId ? { ...c, isReported: false } : c
        );
        onUpdateContacts(updatedContacts);
    };

    const handleSuspend = (contactId: string) => {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) return;
        
        const suspensionEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const updatedContacts = contacts.map(c => 
            c.id === contactId ? { ...c, moderationStatus: 'suspended' as const, suspensionEndDate, isReported: false } : c
        );
        onUpdateContacts(updatedContacts);
        
        sendEmail(
            settings.adminEmail,
            `User Suspended: ${contact.name}`,
            `The user "${contact.name}" (${contact.phone}) has been suspended for 24 hours. The suspension will automatically lift at ${new Date(suspensionEndDate).toLocaleString()}.`
        );
    };

    const handleBan = (contactId: string) => {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) return;

        const banDate = new Date().toISOString();
        const updatedContacts = contacts.map(c => 
            c.id === contactId ? { ...c, moderationStatus: 'banned' as const, banDate, isReported: false, suspensionEndDate: undefined } : c
        );
        onUpdateContacts(updatedContacts);

        sendEmail(
            settings.adminEmail,
            `User Banned: ${contact.name}`,
            `The user "${contact.name}" (${contact.phone}) has been permanently banned.`
        );
    };
    
    const handleLiftSuspension = (contactId: string) => {
        const updatedContacts = contacts.map(c => 
            c.id === contactId ? { 
                ...c, 
                moderationStatus: 'active' as const, 
                suspensionEndDate: undefined,
                warningCount: (c.warningCount || 0) + 1,
            } : c
        );
        onUpdateContacts(updatedContacts);
    };

    const handleUnban = (contactId: string) => {
        const updatedContacts = contacts.map(c => 
            c.id === contactId ? { ...c, moderationStatus: 'active' as const, banDate: undefined } : c
        );
        onUpdateContacts(updatedContacts);
    };
    
    const getTimeRemaining = (endDateStr?: string) => {
        if (!endDateStr) return 'N/A';
        const endDate = new Date(endDateStr);
        const diffMs = endDate.getTime() - currentTime.getTime();

        if (diffMs <= 0) return 'Expired';

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m remaining`;
    };
    
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
    <div className="p-8 space-y-12">
        <div className="flex items-center gap-3">
            <ShieldExclamationIcon className="w-8 h-8 text-gray-400" />
            <h1 className="text-3xl font-bold">Content Moderation</h1>
        </div>

        {/* Reported Numbers */}
        <section>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                    Reported Numbers ({reportedContacts.length})
                </h2>
            </div>
            {reportedContacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportedContacts.map(contact => (
                        <div key={contact.id} className="bg-[#1C1C2E] p-4 rounded-lg border border-gray-700 space-y-3">
                            <div className="flex items-center gap-3">
                                <img src={contact.avatarUrl} alt={contact.name} className="w-12 h-12 rounded-full" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold">{contact.name}</p>
                                        {contact.warningCount && contact.warningCount > 0 && (
                                            <span className="text-xs font-semibold bg-orange-500/30 text-orange-300 px-2 py-0.5 rounded-full">
                                                {contact.warningCount} {contact.warningCount > 1 ? 'Warnings' : 'Warning'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">{contact.phone}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-2 text-xs">
                                <button onClick={() => handleDismissReport(contact.id)} className="flex-1 px-2 py-2 rounded-md bg-green-600/50 hover:bg-green-600/70 transition-colors">Dismiss Report</button>
                                <button onClick={() => handleSuspend(contact.id)} className="flex-1 px-2 py-2 rounded-md bg-yellow-600/50 hover:bg-yellow-600/70 transition-colors">Suspend (24h)</button>
                                <button onClick={() => handleBan(contact.id)} className="flex-1 px-2 py-2 rounded-md bg-red-600/50 hover:bg-red-600/70 transition-colors">Ban Permanently</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">No new reports to review.</p>
            )}
        </section>

        {/* Suspended Members */}
        <section>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-orange-400 flex items-center gap-2">
                    <ClockIcon className="w-6 h-6" />
                    Suspended Members (24h) ({suspendedContacts.length})
                </h2>
            </div>
            {suspendedContacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {suspendedContacts.map(contact => (
                        <div key={contact.id} className="bg-[#1C1C2E] p-4 rounded-lg border border-gray-700 space-y-3">
                            <div className="flex items-center gap-3">
                                <img src={contact.avatarUrl} alt={contact.name} className="w-12 h-12 rounded-full" />
                                <div>
                                    <p className="font-bold">{contact.name}</p>
                                    <p className="text-sm text-gray-400">{getTimeRemaining(contact.suspensionEndDate)}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-2 text-xs">
                                <button onClick={() => handleLiftSuspension(contact.id)} className="flex-1 px-2 py-2 rounded-md bg-blue-600/50 hover:bg-blue-600/70 transition-colors">Lift Suspension</button>
                                <button onClick={() => handleBan(contact.id)} className="flex-1 px-2 py-2 rounded-md bg-red-600/50 hover:bg-red-600/70 transition-colors">Ban Permanently</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">No users are currently suspended.</p>
            )}
        </section>

        {/* Banned Users */}
        <section>
            <h2 className="text-xl font-semibold text-red-400 flex items-center gap-2 mb-4">
                <UserMinusIcon className="w-6 h-6" />
                Banned Users ({bannedContacts.length})
            </h2>
            {bannedContacts.length > 0 ? (
                 <div className="bg-[#1C1C2E] rounded-lg shadow-lg overflow-hidden border border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#2a2a46]">
                                <tr>
                                    <th className="p-4 font-semibold">Name</th>
                                    <th className="p-4 font-semibold">Phone Number</th>
                                    <th className="p-4 font-semibold">Date Banned</th>
                                    <th className="p-4 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {bannedContacts.map(contact => (
                                    <tr key={contact.id} className="hover:bg-black/20 transition-colors">
                                        <td className="p-4 flex items-center gap-3">
                                            <img src={contact.avatarUrl} alt={contact.name} className="w-10 h-10 rounded-full" />
                                            <span className="font-medium">{contact.name}</span>
                                        </td>
                                        <td className="p-4 text-gray-400">{contact.phone}</td>
                                        <td className="p-4 text-gray-400">{formatDate(contact.banDate)}</td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleUnban(contact.id)}
                                                className="text-xs font-semibold px-4 py-2 rounded-md bg-green-600/50 hover:bg-green-600/70 transition-colors flex items-center gap-1.5 mx-auto"
                                            >
                                                <UserPlusIcon className="w-4 h-4" />
                                                Unban User
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                 <p className="text-gray-400">No users are currently banned.</p>
            )}
        </section>
    </div>
  );
};

export default AdminModeration;