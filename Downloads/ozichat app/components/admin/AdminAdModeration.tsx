import React, { useMemo, useState } from 'react';
import type { Advertisement } from '../../types';
import { ClipboardDocumentListIcon } from '../icons/ClipboardDocumentListIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { BlockIcon } from '../icons/BlockIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeSlashIcon } from '../icons/EyeSlashIcon';
import { ClockIcon } from '../icons/ClockIcon';

interface AdminAdModerationProps {
  advertisements: Advertisement[];
  onUpdateAdvertisements: (ads: Advertisement[]) => void;
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const AdCard: React.FC<{
  ad: Advertisement;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}> = ({ ad, onApprove, onReject }) => {
  const isExpired = new Date(ad.expiryDate) < new Date();

  const StatusBadge = () => {
    if (isExpired && ad.status === 'approved') {
      return (
        <span className="text-xs font-semibold inline-flex items-center px-2 py-0.5 rounded-full bg-gray-600 text-gray-200">
          Expired
        </span>
      );
    }

    switch (ad.status) {
      case 'pending':
        return (
          <span className="text-xs font-semibold inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="text-xs font-semibold inline-flex items-center px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="text-xs font-semibold inline-flex items-center px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
            <BlockIcon className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };


  return (
    <div className={`bg-[#1C1C2E] p-4 rounded-lg border ${isExpired ? 'border-gray-600 opacity-60' : 'border-gray-700'} space-y-3 flex flex-col`}>
        <div className="flex items-start gap-4">
            <div className="w-24 h-24 bg-black rounded-md overflow-hidden flex-shrink-0">
                {ad.videoUrl ? (
                    <video src={ad.videoUrl} controls className="w-full h-full object-cover" />
                ) : ad.imageUrls && ad.imageUrls.length > 0 ? (
                    <img src={ad.imageUrls[0]} alt={ad.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-500 text-sm">No Media</div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <p className="font-bold truncate pr-2">{ad.title}</p>
                    <p className="font-mono text-green-400">${ad.price.toFixed(2)}</p>
                </div>
                <p className="text-sm text-gray-300 mt-1 line-clamp-2">{ad.description}</p>
            </div>
        </div>
        <div className="text-xs text-gray-400 space-y-1 border-t border-gray-700 pt-2 mt-auto">
            <div className="flex justify-between items-center mb-1">
                 <p><strong>Phone:</strong> {ad.advertiserPhone}</p>
                 <StatusBadge />
            </div>
            <div className="flex justify-between items-center">
                <p><strong>Targeting:</strong> {ad.targeting?.type}{ad.targeting?.value ? ` (${ad.targeting.value})` : ''}</p>
                <div className="flex items-center gap-1.5">
                    <EyeIcon className="w-4 h-4" />
                    <span>{ad.views} views</span>
                </div>
            </div>
            <p><strong>Posted:</strong> {formatDate(ad.postedDate)}</p>
            <p><strong>Expires:</strong> {formatDate(ad.expiryDate)}</p>
        </div>
        {(onApprove || onReject) && (
            <div className="flex justify-end items-center gap-2 text-xs pt-2 border-t border-gray-700">
                {ad.status === 'pending' && onApprove && onReject && (
                    <>
                        <button onClick={() => onReject(ad.id)} className="flex-1 px-2 py-2 rounded-md bg-red-600/50 hover:bg-red-600/70 transition-colors flex items-center justify-center gap-1"><BlockIcon className="w-4 h-4" /> Reject</button>
                        <button onClick={() => onApprove(ad.id)} className="flex-1 px-2 py-2 rounded-md bg-green-600/50 hover:bg-green-600/70 transition-colors flex items-center justify-center gap-1"><CheckCircleIcon className="w-4 h-4" /> Approve</button>
                    </>
                )}
                {ad.status === 'approved' && onReject && (
                    <button onClick={() => onReject(ad.id)} className="flex-1 px-2 py-2 rounded-md bg-yellow-600/50 hover:bg-yellow-600/70 transition-colors flex items-center justify-center gap-1"><EyeSlashIcon className="w-4 h-4" /> Remove</button>
                )}
                {ad.status === 'rejected' && onApprove && (
                    <button onClick={() => onApprove(ad.id)} className="flex-1 px-2 py-2 rounded-md bg-blue-600/50 hover:bg-blue-600/70 transition-colors flex items-center justify-center gap-1"><EyeIcon className="w-4 h-4" /> Re-Approve</button>
                )}
            </div>
        )}
    </div>
  );
};

const AdminAdModeration: React.FC<AdminAdModerationProps> = ({ advertisements, onUpdateAdvertisements }) => {
    const [activeFilter, setActiveFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

    const pendingAds = useMemo(() => advertisements.filter(ad => ad.status === 'pending').sort((a,b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()), [advertisements]);
    const approvedAds = useMemo(() => advertisements.filter(ad => ad.status === 'approved').sort((a,b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()), [advertisements]);
    const rejectedAds = useMemo(() => advertisements.filter(ad => ad.status === 'rejected').sort((a,b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()), [advertisements]);

    const handleUpdateStatus = (adId: string, status: 'approved' | 'rejected') => {
        const updatedAds = advertisements.map(ad => ad.id === adId ? { ...ad, status } : ad);
        onUpdateAdvertisements(updatedAds);
    };

    const filters = [
        { id: 'pending', label: 'Pending Approval', count: pendingAds.length, ads: pendingAds, icon: ClockIcon, color: 'text-yellow-400' },
        { id: 'approved', label: 'Live Ads', count: approvedAds.length, ads: approvedAds, icon: CheckCircleIcon, color: 'text-green-400' },
        { id: 'rejected', label: 'Rejected Ads', count: rejectedAds.length, ads: rejectedAds, icon: BlockIcon, color: 'text-red-400' },
    ] as const;

    const currentFilter = filters.find(f => f.id === activeFilter);
    const CurrentIcon = currentFilter?.icon;

    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <ClipboardDocumentListIcon className="w-8 h-8 text-gray-400" />
                <h1 className="text-3xl font-bold">Advertisement Moderation</h1>
            </div>

            <div className="flex mb-6 border-b border-gray-700">
                {filters.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors ${
                            activeFilter === filter.id
                                ? 'border-[#3F9BFF] text-white'
                                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                        }`}
                    >
                        <span>{filter.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${activeFilter === filter.id ? 'bg-[#3F9BFF] text-white' : 'bg-gray-700'}`}>{filter.count}</span>
                    </button>
                ))}
            </div>
            
            <section>
                {currentFilter && CurrentIcon && (
                    <>
                        <h2 className={`text-xl font-semibold ${currentFilter.color} mb-4 flex items-center gap-2`}>
                            <CurrentIcon className="w-6 h-6" />
                            {currentFilter.label} ({currentFilter.count})
                        </h2>
                        {currentFilter.ads.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
                                {currentFilter.ads.map(ad => (
                                    <AdCard
                                        key={ad.id}
                                        ad={ad}
                                        onApprove={ad.status !== 'approved' ? (id) => handleUpdateStatus(id, 'approved') : undefined}
                                        onReject={ad.status !== 'rejected' ? (id) => handleUpdateStatus(id, 'rejected') : undefined}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">No advertisements in this category.</p>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default AdminAdModeration;