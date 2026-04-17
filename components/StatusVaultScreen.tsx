
import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PhotoLibraryIcon } from './icons/PhotoLibraryIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CloseIcon } from './icons/CloseIcon';
import type { StatusUpdate } from '../types';
import * as backend from '../services/backendService';

const StatusVaultScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [archivedStatuses, setArchivedStatuses] = useState<StatusUpdate[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<StatusUpdate | null>(null);

    useEffect(() => {
        const vault = backend.getStatusVault();
        setArchivedStatuses(vault);
    }, []);

    const handleDelete = (id: string) => {
        if (window.confirm('Remove this status from your private archive?')) {
            const updated = archivedStatuses.filter(s => s.id !== id);
            setArchivedStatuses(updated);
            backend.saveStatusVault(updated);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#10101b] text-white animate-fade-in relative">
            {/* Header */}
            <header className="p-4 pt-6 flex items-center justify-between border-b border-white/5 shrink-0 bg-[#10101b] z-20">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-black">Status Vault</h1>
                </div>
                <div className="p-2 bg-[#3F9BFF]/10 rounded-lg">
                    <PhotoLibraryIcon className="w-5 h-5 text-[#3F9BFF]" />
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2">Private Archive</p>
                    <p className="text-sm text-gray-400 leading-relaxed">Your past status updates are saved here automatically. Only you can access this encrypted vault.</p>
                </div>

                {archivedStatuses.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 pb-10">
                        {archivedStatuses.map(status => (
                            <div 
                                key={status.id} 
                                className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900 border border-white/5 shadow-2xl transition-all hover:scale-[1.02] cursor-pointer"
                                onClick={() => setSelectedStatus(status)}
                            >
                                {status.type === 'image' ? (
                                    <img src={status.contentUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                                ) : status.type === 'video' ? (
                                    <video src={status.contentUrl} className="w-full h-full object-cover opacity-80" muted />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center p-4 text-center ${status.color}`}>
                                        <p className="text-xs font-bold line-clamp-4">{status.text}</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                                
                                <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/90 drop-shadow-md">{formatDate(status.createdAt)}</span>
                                </div>

                                {/* Overlay Actions */}
                                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(status.id); }}
                                        className="p-2 bg-red-500/90 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition-colors shadow-lg"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                        <PhotoLibraryIcon className="w-16 h-16 mb-4" />
                        <p className="text-lg font-bold">Vault is empty</p>
                        <p className="text-xs uppercase tracking-widest">Your stories will appear here after 24h</p>
                    </div>
                )}
            </main>

            {/* Fullscreen Preview */}
            {selectedStatus && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
                    <header className="absolute top-0 left-0 right-0 p-4 pt-8 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                        <div className="flex flex-col">
                            <span className="font-bold text-white drop-shadow-md">Archived Moment</span>
                            <span className="text-xs text-white/60 drop-shadow-md">{formatDate(selectedStatus.createdAt)}</span>
                        </div>
                        <div className="flex gap-2">
                             <button className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/10">
                                <ShareIcon className="w-5 h-5" />
                            </button>
                             <button className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/10">
                                <ArrowDownTrayIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => setSelectedStatus(null)} className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/10">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </header>
                    <div className="flex-1 flex items-center justify-center">
                        {selectedStatus.type === 'image' ? (
                            <img src={selectedStatus.contentUrl} className="w-full h-full object-contain" alt="" />
                        ) : selectedStatus.type === 'video' ? (
                            <video src={selectedStatus.contentUrl} className="w-full h-full object-contain" controls autoPlay />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center p-8 text-center ${selectedStatus.color}`}>
                                <p className="text-white text-3xl font-bold">{selectedStatus.text}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusVaultScreen;
