
import React, { useMemo, useState, useEffect } from 'react';
import type { Contact } from '../../types';
import { TrashIcon } from '../icons/TrashIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { getCountryFromPhoneNumber } from '../../utils/phone';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { BlockIcon } from '../icons/BlockIcon';
import { BoltIcon } from '../icons/BoltIcon';
// Added missing GlobeAltIcon import to fix "Cannot find name 'GlobeAltIcon'" error
import { GlobeAltIcon } from '../icons/GlobeAltIcon';

interface AdminUserManagementProps {
  contacts: Contact[];
  onUpdateContacts: (contacts: Contact[]) => void;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ contacts, onUpdateContacts }) => {
  const [collapsedCountries, setCollapsedCountries] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<'all' | 'dataSaver' | 'favorites' | 'blocked' | 'broadcasting'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?filter=dataSaver')) {
        setActiveFilter('dataSaver');
    } else if (hash.includes('?filter=favorites')) {
        setActiveFilter('favorites');
    }
     else {
        setActiveFilter('all');
    }
  }, []);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeFilter]);

  const handleDelete = (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        const updatedContacts = contacts.filter(c => c.id !== contactId);
        onUpdateContacts(updatedContacts);
        if (selectedIds.has(contactId)) {
            const newSelected = new Set(selectedIds);
            newSelected.delete(contactId);
            setSelectedIds(newSelected);
        }
    }
  };

  const toggleCountryCollapse = (country: string) => {
    setCollapsedCountries(prev => {
        const newSet = new Set(prev);
        if (newSet.has(country)) {
            newSet.delete(country);
        } else {
            newSet.add(country);
        }
        return newSet;
    });
  };

  const filteredContacts = useMemo(() => {
    switch (activeFilter) {
        case 'dataSaver': return contacts.filter(c => c.useDataSaver);
        case 'favorites': return contacts.filter(c => c.isFavorite);
        case 'blocked': return contacts.filter(c => c.isBlocked);
        case 'broadcasting': return contacts.filter(c => c.location);
        default: return contacts;
    }
  }, [contacts, activeFilter]);

  const groupedContacts = useMemo(() => {
    return filteredContacts.reduce((acc, contact) => {
      const country = getCountryFromPhoneNumber(contact.phone);
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(contact);
      return acc;
    }, {} as Record<string, Contact[]>);
  }, [filteredContacts]);

  const sortedCountries = Object.keys(groupedContacts).sort((a, b) => a.localeCompare(b));

  const handleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
    });
  };

  const handleBulkDelete = () => {
      if (window.confirm(`Are you sure you want to delete ${selectedIds.size} users?`)) {
          const updatedContacts = contacts.filter(c => !selectedIds.has(c.id));
          onUpdateContacts(updatedContacts);
          setSelectedIds(new Set());
      }
  };

  const handleBulkBlock = () => {
      if (window.confirm(`Restrict Identity Link for ${selectedIds.size} users?`)) {
          const updatedContacts = contacts.map(c => selectedIds.has(c.id) ? { ...c, isBlocked: true } : c);
          onUpdateContacts(updatedContacts);
          setSelectedIds(new Set());
      }
  };

  const isAllSelected = filteredContacts.length > 0 && selectedIds.size === filteredContacts.length;

  return (
    <div className="p-10 bg-[#0d1117] min-h-full font-mono">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#3F9BFF]/20 rounded-lg"><UsersIcon className="w-8 h-8 text-[#3F9BFF]" /></div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Identity Management</h1>
                </div>
                <p className="text-[10px] text-gray-600 font-black tracking-[0.4em] ml-1">Secure Node Registration</p>
            </div>
             <div className="flex bg-[#161b22] rounded-2xl p-1.5 border border-white/5 overflow-x-auto no-scrollbar">
                {[
                    {id: 'all', label: 'All Nodes'},
                    {id: 'broadcasting', label: 'Signal Active'},
                    {id: 'blocked', label: 'Restricted'},
                    {id: 'dataSaver', label: 'Low Bandwidth'},
                    {id: 'favorites', label: 'Priority'}
                ].map(f => (
                    <button 
                        key={f.id}
                        onClick={() => setActiveFilter(f.id as any)} 
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${activeFilter === f.id ? 'bg-[#3F9BFF] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
        </div>
        
        {/* Bulk Action HUD */}
        {selectedIds.size > 0 && (
            <div className="sticky top-0 z-20 mb-6 bg-[#161b22]/95 backdrop-blur-2xl border-2 border-[#3F9BFF]/30 p-4 rounded-3xl flex items-center justify-between animate-fade-in shadow-2xl">
                <div className="flex items-center gap-6 px-4">
                    <div className="flex flex-col">
                        <span className="font-black text-[#3F9BFF] text-sm uppercase tracking-widest">{selectedIds.size} identities engaged</span>
                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Bulk Processing Active</span>
                    </div>
                    <button onClick={() => setSelectedIds(new Set())} className="text-[10px] font-black text-gray-500 hover:text-white flex items-center gap-1.5 uppercase tracking-widest transition-colors">
                        <CloseIcon className="w-4 h-4" /> Reset
                    </button>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleBulkBlock}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-600/30"
                    >
                        <BlockIcon className="w-4 h-4" /> Restrict
                    </button>
                    <button 
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-900/10 hover:bg-red-900 text-red-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-900/30"
                    >
                        <TrashIcon className="w-4 h-4" /> Purge
                    </button>
                </div>
            </div>
        )}

        <div className="bg-[#161b22] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[1000px] border-collapse">
                    <thead className="bg-[#1c222b] border-b border-white/5">
                        <tr>
                            <th className="p-6 w-16 text-center">
                                <input 
                                    type="checkbox" 
                                    checked={isAllSelected} 
                                    onChange={handleSelectAll}
                                    className="w-5 h-5 rounded-lg border-gray-700 bg-gray-900 text-[#3F9BFF] focus:ring-[#3F9BFF]"
                                />
                            </th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Identity Node</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Signal Status</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Telemetry (LAT/LNG/ALT)</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Action</th>
                        </tr>
                    </thead>
                    {sortedCountries.map(country => {
                        const isCollapsed = collapsedCountries.has(country);
                        return (
                            <tbody key={country}>
                                <tr className="bg-black/20 group">
                                    <td colSpan={5} className="p-0">
                                        <button 
                                            onClick={() => toggleCountryCollapse(country)}
                                            className="w-full flex justify-between items-center p-4 pl-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] hover:text-[#3F9BFF] transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <GlobeAltIcon className="w-4 h-4 text-slate-700" />
                                                <span>GRID: {country} <span className="text-slate-700 ml-2">[{groupedContacts[country].length}]</span></span>
                                            </div>
                                            {isCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                                        </button>
                                    </td>
                                </tr>
                                {!isCollapsed && groupedContacts[country].map(contact => (
                                    <tr key={contact.id} className={`transition-all border-b border-white/[0.02] last:border-0 ${selectedIds.has(contact.id) ? 'bg-[#3F9BFF]/5' : 'hover:bg-white/[0.01]'}`}>
                                        <td className="p-6 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.has(contact.id)}
                                                onChange={() => handleSelectOne(contact.id)}
                                                className="w-5 h-5 rounded-lg border-gray-700 bg-gray-900 text-[#3F9BFF] focus:ring-[#3F9BFF]"
                                            />
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img src={contact.avatarUrl} alt="" className={`w-12 h-12 rounded-2xl object-cover border-2 shadow-lg ${contact.location ? 'border-green-500' : 'border-white/10'}`} />
                                                    {contact.isBlocked && (
                                                        <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-1 border-2 border-[#161b22] shadow-xl">
                                                            <BlockIcon className="w-2.5 h-2.5 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="font-black text-white text-base block tracking-tight truncate">{contact.name}</span>
                                                    <span className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">{contact.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-2">
                                                {contact.isBlocked ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_red]"></div>
                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Restricted Link</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${contact.location ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#00FF9D]' : 'bg-slate-700'}`}></div>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${contact.location ? 'text-green-500' : 'text-gray-600'}`}>
                                                            {contact.location ? 'Active Broadcaster' : 'Passive Node'}
                                                        </span>
                                                    </div>
                                                )}
                                                {contact.isFavorite && (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                                        <BoltIcon className="w-3 h-3" /> Priority Node
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {contact.location ? (
                                                <div className="space-y-1 font-mono">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] text-gray-600 font-black uppercase w-8">Lat</span>
                                                        <span className="text-xs font-bold text-[#3F9BFF]">{contact.location.latitude.toFixed(6)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] text-gray-600 font-black uppercase w-8">Lng</span>
                                                        <span className="text-xs font-bold text-[#3F9BFF]">{contact.location.longitude.toFixed(6)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 pt-1 border-t border-white/5">
                                                        <span className="text-[9px] text-gray-600 font-black uppercase w-8">Alt</span>
                                                        <span className="text-xs font-black text-green-500">{contact.location.altitude?.toFixed(1) || '0.0'}m</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-700 font-black uppercase tracking-widest">Telemetry Offline</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-center">
                                            <button
                                                onClick={() => handleDelete(contact.id)}
                                                className="p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-red-500/20 shadow-lg"
                                                title="Purge Identity Node"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        );
                    })}
                    {filteredContacts.length === 0 && (
                        <tbody>
                            <tr>
                                <td colSpan={5} className="text-center py-32 text-gray-500">
                                    <UsersIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                    <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40">No identity nodes match current filter</p>
                                </td>
                            </tr>
                        </tbody>
                    )}
                </table>
            </div>
        </div>
        
        <div className="mt-8 flex justify-center opacity-20">
            <p className="text-[10px] font-black uppercase tracking-[0.6em]">End of identity ledger</p>
        </div>
    </div>
  );
};

export default AdminUserManagement;
