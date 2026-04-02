
import React, { useState } from 'react';
import SettingsHeader from './SettingsHeader';
import { TrashIcon } from '../icons/TrashIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { PhoneIcon } from '../icons/PhoneIcon';

interface DeleteAccountScreenProps {
  onBack: () => void;
  onDelete: () => void;
}

const DeleteAccountScreen: React.FC<DeleteAccountScreenProps> = ({ onBack, onDelete }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // In a real app, this would come from context/auth
  const userCountryCode = "+1"; 
  
  const handleDeleteClick = () => {
      // Basic validation simulation
      if (phoneNumber.length < 5) {
          alert("Please enter your phone number.");
          return;
      }
      onDelete();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
      <SettingsHeader title="Delete Account" onBack={onBack} />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-start gap-4 mb-8 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
                <h3 className="text-red-600 dark:text-red-400 font-bold mb-1">Deleting your account will:</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-4 space-y-1">
                    <li>Delete your account info and profile photo</li>
                    <li>Delete you from all groups</li>
                    <li>Delete your message history on this phone and your backup</li>
                </ul>
            </div>
        </div>

        <div className="space-y-6">
            <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5 text-gray-500" />
                    <span>Confirm your phone number</span>
                </h4>
                <div className="space-y-4">
                    <div className="border-b border-gray-300 dark:border-gray-700 pb-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wide">Country Code</label>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg">{userCountryCode}</span>
                            <span className="text-gray-400 text-sm">(United States)</span>
                        </div>
                    </div>
                    <div className="border-b-2 border-[#3F9BFF] pb-1">
                        <label className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</label>
                        <input 
                            type="tel" 
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-transparent text-xl py-2 focus:outline-none placeholder-gray-300 dark:placeholder-gray-700"
                            placeholder="phone number"
                            autoFocus
                        />
                    </div>
                </div>
            </div>

            <button 
                onClick={handleDeleteClick}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 mt-8"
            >
                <TrashIcon className="w-5 h-5" />
                <span>Delete My Account</span>
            </button>
        </div>
      </main>
    </div>
  );
};

export default DeleteAccountScreen;
