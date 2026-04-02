import React, { useMemo } from 'react';
import type { Contact, AppSettings, RevenueEntry, VideoPost } from '../../types';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { StarIcon } from '../icons/StarIcon';
import { WifiIcon } from '../icons/WifiIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { UserPlusIcon } from '../icons/UserPlusIcon';
import { CogIcon } from '../icons/CogIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { GlobeAltIcon } from '../icons/GlobeAltIcon';
import { VideoCameraIcon } from '../icons/VideoCameraIcon';
import { BlockIcon } from '../icons/BlockIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { BoltIcon } from '../icons/BoltIcon';
import * as backend from '../../services/backendService';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color?: string; onClick?: () => void }> = ({ title, value, icon, color = 'bg-[#553699]', onClick }) => {
    const cardContent = (
        <div className={`bg-[#161b22]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-5 shadow-2xl hover:border-[#3F9BFF]/40 transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''}`}>
            <div className={`${color} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 font-black tracking-[0.2em] uppercase mb-1">{title}</p>
                <p className="text-3xl font-black text-white tracking-tighter truncate">{value}</p>
            </div>
        </div>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className="text-left w-full focus:outline-none">
                {cardContent}
            </button>
        );
    }

    return cardContent;
};

interface AdminDashboardProps {
  contacts: Contact[];
  settings: AppSettings;
  revenueData: RevenueEntry[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ contacts, settings, revenueData }) => {
    const videos = useMemo(() => backend.getChannelPosts(), []);
    
    const activeGpsLinks = contacts.filter(c => c.location).length;
    const blockedIdentities = contacts.filter(c => c.isBlocked).length;
    const totalChannelPosts = videos.length;
    
    const totalRevenue = revenueData.reduce((sum, entry) => sum + entry.amount, 0);
    const formattedRevenue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(totalRevenue);

    // Simulated network load for the AI engine
    const aiLoad = useMemo(() => Math.floor(Math.random() * 15) + 12, []);

    const recentActivities = [
        { id: '1', type: 'gps', text: 'Identity Nina activated HD-GPS Broadcaster', time: '1m ago', icon: BoltIcon, color: 'text-green-400', bg: 'bg-green-400/10' },
        { id: '2', type: 'video', text: 'New HD Transmission posted on @globalpulse', time: '14m ago', icon: VideoCameraIcon, color: 'text-[#3F9BFF]', bg: 'bg-[#3F9BFF]/10' },
        { id: '3', type: 'block', text: 'User initiated Secure Identity Restrict on "Alex"', time: '45m ago', icon: BlockIcon, color: 'text-red-400', bg: 'bg-red-400/10' },
        { id: '4', type: 'ai', text: 'AI Sync: Summarized chat for 12 nodes', time: '2h ago', icon: SparklesIcon, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ];

    return (
    <div className="p-10 bg-[#0d1117] min-h-full font-mono">
        <style>{`
            .dashboard-grid { background-image: radial-gradient(rgba(63, 155, 255, 0.1) 1px, transparent 1px); background-size: 30px 30px; }
            @keyframes scanline { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
            .admin-scan { position: absolute; top: 0; left: 0; right: 0; height: 1px; background: rgba(63, 155, 255, 0.2); animation: scanline 4s linear infinite; pointer-events: none; }
        `}</style>
        
        <div className="admin-scan"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg"><ChartBarIcon className="w-8 h-8 text-indigo-400" /></div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Command Center</h1>
                </div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em] ml-1">Ozichat Global Network Monitor</p>
            </div>
            
            <div className="flex gap-4">
                <div className="bg-[#161b22] px-6 py-3 rounded-2xl border border-white/5 flex flex-col items-end">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Network Status</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#00FF9D]"></div>
                        <span className="text-sm font-black text-white tracking-widest uppercase">Nominal</span>
                    </div>
                </div>
            </div>
        </div>

        {/* High-Impact Stat HUD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard 
                title="Secure Identities" 
                value={contacts.length} 
                icon={<UsersIcon className="w-7 h-7 text-white" />} 
                onClick={() => window.location.hash = '#/adminmgr/users'}
            />
            <StatCard 
                title="Active GPS Links" 
                value={activeGpsLinks} 
                color="bg-[#00FF9D]"
                icon={<BoltIcon className="w-7 h-7 text-black" />} 
                onClick={() => window.location.hash = '#/adminmgr/users'}
            />
            <StatCard 
                title="Channel Posts" 
                value={totalChannelPosts} 
                color="bg-[#3F9BFF]"
                icon={<VideoCameraIcon className="w-7 h-7 text-white" />} 
                onClick={() => window.location.hash = '#/adminmgr/advertisements'}
            />
            <StatCard 
                title="Network Revenue" 
                value={formattedRevenue} 
                color="bg-amber-500"
                icon={<CurrencyDollarIcon className="w-7 h-7 text-white" />} 
                onClick={() => window.location.hash = '#/adminmgr/revenue'}
            />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
            {/* Secondary Metrics */}
            <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatCard 
                    title="Blocked Identities" 
                    value={blockedIdentities} 
                    color="bg-red-600"
                    icon={<BlockIcon className="w-7 h-7 text-white" />} 
                />
                <StatCard 
                    title="AI System Load" 
                    value={`${aiLoad}%`} 
                    color="bg-purple-600"
                    icon={<SparklesIcon className="w-7 h-7 text-white" />} 
                />
                 <StatCard 
                    title="Sat-Com Latency" 
                    value="24ms" 
                    color="bg-slate-700"
                    icon={<GlobeAltIcon className="w-7 h-7 text-white" />} 
                />
            </div>

            {/* Real-time Ticker */}
            <div className="bg-[#161b22] rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#3F9BFF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-[#3F9BFF]" /> Signal Feed
                </h2>
                <div className="space-y-6">
                    {recentActivities.map(activity => {
                        const Icon = activity.icon;
                        return (
                            <div key={activity.id} className="flex items-start gap-4 group/item">
                                <div className={`mt-1 p-2 rounded-xl ${activity.bg} ${activity.color} shadow-sm group-hover/item:scale-110 transition-transform`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0 border-b border-white/5 pb-4 last:border-0">
                                    <p className="text-xs font-bold text-white tracking-tight leading-relaxed">{activity.text}</p>
                                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">{activity.time}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Feature Specific Monitoring */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Channel Network Monitor */}
            <div className="bg-[#161b22] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <VideoCameraIcon className="w-6 h-6 text-[#3F9BFF]" />
                        Channel Network Monitor
                    </h2>
                    <span className="px-3 py-1 bg-[#3F9BFF]/10 text-[#3F9BFF] rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-[#3F9BFF]/20">HD-AUTO ENABLED</span>
                </div>
                
                <div className="grid grid-cols-3 gap-6 mb-10">
                    {['NEWS', 'EVENTS', 'MOMENTS'].map(cat => {
                        const count = videos.filter(v => v.category === cat).length;
                        return (
                            <div key={cat} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 text-center">
                                <p className="text-[9px] text-gray-500 font-black tracking-widest uppercase mb-1">{cat}</p>
                                <p className="text-2xl font-black text-white">{count}</p>
                            </div>
                        )
                    })}
                </div>

                <div className="space-y-4">
                    {videos.slice(0, 2).map(video => (
                        <div key={video.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group cursor-default">
                             <img src={video.authorAvatar} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                             <div className="flex-1">
                                 <div className="flex justify-between items-center">
                                    <p className="text-sm font-black text-white">@{video.authorHandle.replace('@','')}</p>
                                    <span className="text-[10px] font-black text-green-500">{video.likes} LIKES</span>
                                 </div>
                                 <p className="text-xs text-gray-500 truncate mt-1">{video.description}</p>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Core Diagnostics */}
            <div className="bg-[#161b22] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-purple-400" />
                        AI Core Diagnostics
                    </h2>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></div>
                        <span className="text-[10px] font-black text-purple-400 tracking-widest uppercase">Neural Link Sync</span>
                    </div>
                </div>

                <div className="flex-1 space-y-6">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                            <span>Processing Capacity</span>
                            <span className="text-purple-400">88% Free</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-purple-500 w-[12%] shadow-[0_0_10px_#A855F7]"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                            <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Voice Threads</p>
                            <p className="text-xl font-black text-white">Active</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                            <p className="text-[9px] text-gray-600 font-black uppercase mb-1">E2EE Handshake</p>
                            <p className="text-xl font-black text-white">Verified</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">
                        <span>Diagnostic Cycle: 2.4s</span>
                        <span className="text-purple-900/50">Ozi Intelligence v3.1</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;