
import React, { useState, useRef, useEffect } from 'react';
import type { Contact } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { UserIcon } from './icons/UserIcon';
import { CameraIcon } from './icons/CameraIcon';
import { TrashIcon } from './icons/TrashIcon';
import { uploadMedia } from '../services/apiService';
import { isAuthenticated } from '../services/tokenService';

interface AddContactScreenProps {
  onBack: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'lastMessage' | 'timestamp' | 'unreadCount' | 'status'>) => void;
  initialContact?: Contact; // Optional prop for edit mode
}

const AddContactScreen: React.FC<AddContactScreenProps> = ({ onBack, onSave, initialContact }) => {
  const [name, setName] = useState(initialContact?.name || '');
  const [phone, setPhone] = useState(initialContact?.phone || '');
  const [avatarSrc, setAvatarSrc] = useState<string | null>(initialContact?.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialContact) {
      setName(initialContact.name);
      setPhone(initialContact.phone);
      setAvatarSrc(initialContact.avatarUrl);
    }
  }, [initialContact]);

  const isSaveDisabled = !name.trim() || !phone.trim();

  const handleSave = () => {
    if (isSaveDisabled) return;
    const contactName = name.trim();
    onSave({
      name: contactName,
      phone: phone.trim(),
      avatarUrl: avatarSrc || `https://ui-avatars.com/api/?name=${encodeURIComponent(contactName)}&background=random&color=fff`,
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAvatar = () => {
    setAvatarSrc(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Local preview with resize
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 512;
          const MAX_HEIGHT = 512;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            setAvatarSrc(dataUrl);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Upload to S3
      if (isAuthenticated()) {
        try {
          const res = await uploadMedia(file, 'profile');
          if (res.success && res.data?.url) {
            setAvatarSrc(res.data.url);
            console.log('🟢 Contact avatar uploaded:', res.data.url);
          }
        } catch (err) {
          console.warn('Contact avatar S3 upload failed:', err);
        }
      }
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1C1C2E] text-white">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between p-4 bg-[#1C1C2E] shadow-md z-10">
        <button onClick={onBack} className="text-white p-2 rounded-full hover:bg-white/10"><ChevronLeftIcon /></button>
        <h2 className="text-xl font-bold text-white">{initialContact ? 'Edit Contact' : 'New Contact'}</h2>
        <button 
          onClick={handleSave} 
          disabled={isSaveDisabled}
          className={`font-semibold transition-colors ${isSaveDisabled ? 'text-gray-500' : 'text-[#3F9BFF] hover:text-blue-400'}`}
        >
          Save
        </button>
      </header>

      {/* Form Content */}
      <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
        <div className="relative mb-6 group">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center border-4 border-[#553699] shadow-lg">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Contact Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-20 h-20 text-gray-400" />
            )}
          </div>
          
          <button 
            onClick={handleAvatarClick} 
            className="absolute bottom-0 right-0 bg-[#3F9BFF] p-2 rounded-full text-white hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white shadow-md z-10"
            aria-label="Upload contact picture"
          >
            <CameraIcon className="w-5 h-5" />
          </button>

          {avatarSrc && (
            <button 
                onClick={handleRemoveAvatar}
                className="absolute top-0 right-0 bg-red-500 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors focus:outline-none shadow-md z-10 transform translate-x-1/4 -translate-y-1/4"
                aria-label="Remove contact picture"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-400 mb-2">Name</label>
            <input
              type="text"
              id="contactName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#2a2a46] border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#553699]"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
            <input
              type="tel"
              id="contactPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#2a2a46] border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#553699]"
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddContactScreen;
