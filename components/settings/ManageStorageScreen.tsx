
import React, { useState, useMemo } from 'react';
import SettingsHeader from './SettingsHeader';
import { TrashIcon } from '../icons/TrashIcon';
import { Contact, Group } from '../../types';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { PhotoLibraryIcon } from '../icons/PhotoLibraryIcon';
import { VideoIcon } from '../icons/VideoIcon';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { CloseIcon } from '../icons/CloseIcon';

interface ManageStorageScreenProps {
  onBack: () => void;
  chats: (Contact | Group)[];
}

const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ManageStorageScreen: React.FC<ManageStorageScreenProps> = ({ onBack, chats }) => {
    const [chatStorage, setChatStorage] = useState(() => {
        return chats.map(chat => ({
            ...chat,
            size: Math.floor(Math.random() * 200 * 1024 * 1024) 
        })).sort((a, b) => b.size - a.size);
    });

    const [cacheSize, setCacheSize] = useState(150 * 1024 * 1024);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    
    // Detailed items state
    const [detailsItems, setDetailsItems] = useState<{id: string, type: 'video' | 'image' | 'audio' | 'document', size: number, date: string}[]>([]);
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [previewItem, setPreviewItem] = useState<{id: string, type: string, size: number, date: string} | null>(null);

    const totalUsed = chatStorage.reduce((acc, curr) => acc + curr.size, 0) + cacheSize;
    const totalSpace = 64 * 1024 * 1024 * 1024; 
    
    const mediaSize = totalUsed * 0.7;
    const messagesSize = totalUsed * 0.1;
    const otherSize = totalUsed * 0.2;

    const handleClearCache = () => {
        if(window.confirm("Clear temporary cache files? This won't delete your chats.")) {
            setCacheSize(0);
        }
    };

    const handleDeleteChatData = (e: React.MouseEvent, chatId: string, size: number) => {
        e.stopPropagation();
        if (window.confirm(`Delete all media and messages for this chat? This will free up ${formatBytes(size)}.`)) {
            setChatStorage(prev => prev.map(c => c.id === chatId ? { ...c, size: 0 } : c).filter(c => c.size > 0));
        }
    };

    const openChatReview = (id: string) => {
        setSelectedChatId(id);
        setIsSelectionMode(false);
        setSelectedItemIds(new Set());
        const chat = chatStorage.find(c => c.id === id);
        if (!chat) return;

        const itemCount = Math.max(1, Math.floor(chat.size / (5 * 1024 * 1024))); 
        
        const items = Array.from({ length: itemCount }).map((_, i) => ({
            id: `item-${id}-${i}`,
            type: (['video', 'image', 'audio', 'document'][i % 4]) as 'video' | 'image' | 'audio' | 'document',
            size: Math.floor(chat.size / itemCount), 
            date: new Date(Date.now() - i * 86400000 * 2).toLocaleDateString(),
        }));
        setDetailsItems(items);
    };

    const handleItemClick = (item: typeof detailsItems[0]) => {
        if (isSelectionMode) {
            toggleItemSelection(item.id);
        } else {
            setPreviewItem(item);
        }
    };

    const toggleItemSelection = (itemId: string) => {
        setSelectedItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) newSet.delete(itemId);
            else newSet.add(itemId);
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedItemIds.size === detailsItems.length) {
            setSelectedItemIds(new Set());
        } else {
            setSelectedItemIds(new Set(detailsItems.map(i => i.id)));
        }
    };

    const deleteSelectedItems = () => {
        if (selectedItemIds.size === 0) return;
        
        if (window.confirm(`Delete ${selectedItemIds.size} items?`)) {
            const removedSize = detailsItems.filter(i => selectedItemIds.has(i.id)).reduce((acc, curr) => acc + curr.size, 0);
            
            setDetailsItems(prev => prev.filter(i => !selectedItemIds.has(i.id)));
            setSelectedItemIds(new Set());
            setIsSelectionMode(false);

            setChatStorage(prev => prev.map(c => c.id === selectedChatId ? { ...c, size: Math.max(0, c.size - removedSize) } : c));
        }
    };

    const selectedChat = chatStorage.find(c => c.id === selectedChatId);

    if (selectedChatId && selectedChat) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300 relative">
                <SettingsHeader 
                    title={selectedChat.name} 
                    onBack={() => setSelectedChatId(null)} 
                    actionButton={
                        detailsItems.length > 0 ? (
                            <button 
                                onClick={() => {
                                    setIsSelectionMode(!isSelectionMode);
                                    setSelectedItemIds(new Set());
                                }}
                                className="text-[#3F9BFF] font-semibold text-sm px-2"
                            >
                                {isSelectionMode ? 'Cancel' : 'Select'}
                            </button>
                        ) : undefined
                    }
                />
                
                <main className="flex-1 overflow-y-auto p-4 pb-4">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-2xl font-bold">{formatBytes(selectedChat.size)}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Used in this chat</p>
                        </div>
                        {isSelectionMode && (
                            <button 
                                onClick={toggleSelectAll} 
                                className="text-[#3F9BFF] text-sm font-medium"
                            >
                                {selectedItemIds.size === detailsItems.length ? 'Deselect All' : 'Select All'}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-1 mb-6">
                        {detailsItems.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => handleItemClick(item)}
                                className={`aspect-square relative cursor-pointer group overflow-hidden rounded-lg bg-gray-100 dark:bg-[#2a2a46] border-2 transition-all ${selectedItemIds.has(item.id) ? 'border-[#3F9BFF] bg-[#3F9BFF]/10' : 'border-transparent'}`}
                            >
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    {item.type === 'video' ? <VideoIcon className="w-8 h-8" /> : 
                                     item.type === 'audio' ? <MicrophoneIcon className="w-8 h-8" /> : 
                                     item.type === 'document' ? <div className="w-8 h-8 border-2 border-current rounded flex items-center justify-center text-[8px] font-bold">DOC</div> :
                                     <PhotoLibraryIcon className="w-8 h-8" />}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-[10px] p-1.5 pt-4 truncate flex justify-between items-end">
                                    <span className="font-mono">{formatBytes(item.size)}</span>
                                </div>
                                
                                {/* Selection Overlay */}
                                {isSelectionMode && (
                                    <div className={`absolute inset-0 flex items-start justify-end p-1 transition-colors ${selectedItemIds.has(item.id) ? 'bg-[#3F9BFF]/20' : 'bg-black/10'}`}>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedItemIds.has(item.id) ? 'bg-[#3F9BFF] border-[#3F9BFF]' : 'border-white bg-black/20'}`}>
                                            {selectedItemIds.has(item.id) && <CheckCircleIcon className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {detailsItems.length === 0 && (
                            <div className="col-span-3 text-center py-20 text-gray-500">
                                <p>No media found.</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Bottom Delete Bar */}
                {isSelectionMode && selectedItemIds.size > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#1C1C2E] border-t border-gray-200 dark:border-gray-800 shadow-lg animate-fade-in-up">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">{selectedItemIds.size} items selected</span>
                            <span className="text-gray-900 dark:text-white font-bold">
                                {formatBytes(detailsItems.filter(i => selectedItemIds.has(i.id)).reduce((acc, curr) => acc + curr.size, 0))}
                            </span>
                        </div>
                        <button 
                            onClick={deleteSelectedItems} 
                            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <TrashIcon className="w-5 h-5" /> Delete Items
                        </button>
                    </div>
                )}

                {/* Preview Modal */}
                {previewItem && (
                    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-center items-center p-4 animate-fade-in" onClick={() => setPreviewItem(null)}>
                        <button onClick={() => setPreviewItem(null)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <div className="max-w-md w-full bg-[#1C1C2E] rounded-2xl p-6 text-center" onClick={e => e.stopPropagation()}>
                            <div className="w-full h-48 bg-black/50 rounded-xl mb-4 flex items-center justify-center text-gray-500">
                                {previewItem.type === 'video' ? <VideoIcon className="w-16 h-16" /> : 
                                 previewItem.type === 'audio' ? <MicrophoneIcon className="w-16 h-16" /> : 
                                 <PhotoLibraryIcon className="w-16 h-16" />}
                            </div>
                            <p className="text-white font-bold text-lg mb-1 capitalize">{previewItem.type} File</p>
                            <p className="text-gray-400 text-sm mb-4">{formatBytes(previewItem.size)} • {previewItem.date}</p>
                            <button 
                                onClick={() => {
                                    setPreviewItem(null);
                                    setSelectedItemIds(new Set([previewItem.id]));
                                    setIsSelectionMode(true);
                                    // Trigger delete flow immediately or just enter selection mode? 
                                    // Let's just select it and show selection mode.
                                }}
                                className="w-full py-2 bg-[#3F9BFF] hover:bg-blue-600 rounded-lg text-white font-semibold"
                            >
                                Select Item
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
            <SettingsHeader title="Manage Storage" onBack={onBack} />
            <main className="flex-1 overflow-y-auto p-4">
                {/* Usage Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="text-[#3F9BFF]">{formatBytes(totalUsed)} Used</span>
                        <span className="text-gray-400">{formatBytes(totalSpace - totalUsed)} Free</span>
                    </div>
                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                        <div className="h-full bg-[#3F9BFF]" style={{ width: `${(mediaSize / totalSpace) * 100}%` }}></div>
                        <div className="h-full bg-green-500" style={{ width: `${(messagesSize / totalSpace) * 100}%` }}></div>
                        <div className="h-full bg-yellow-500" style={{ width: `${(otherSize / totalSpace) * 100}%` }}></div>
                    </div>
                    <div className="flex gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400 justify-start font-medium">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#3F9BFF]"></div> Media</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Messages</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div> Other</div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chats</h3>
                    <button className="text-[#3F9BFF] text-sm font-semibold hover:text-blue-400 transition-colors">Search</button>
                </div>
                
                <div className="bg-gray-50 dark:bg-[#2a2a46] rounded-2xl overflow-hidden mb-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    {chatStorage.length > 0 ? chatStorage.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-100 dark:hover:bg-[#3a3a5c] transition-colors cursor-pointer group" onClick={() => openChatReview(item.id)}>
                            <div className="flex items-center gap-4">
                                <img src={item.avatarUrl} className="w-12 h-12 rounded-full object-cover" alt="" />
                                <div>
                                    <p className="font-bold text-base">{item.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatBytes(item.size)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={(e) => handleDeleteChatData(e, item.id, item.size)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete all data"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                                <ChevronRightIcon className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-gray-500">No chat data found.</div>
                    )}
                </div>
                
                {cacheSize > 0 && (
                    <button onClick={handleClearCache} className="w-full py-4 text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border border-red-500/20">
                        <TrashIcon className="w-5 h-5" />
                        Clear Cache ({formatBytes(cacheSize)})
                    </button>
                )}
            </main>
        </div>
    );
};

export default ManageStorageScreen;
