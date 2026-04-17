
import React, { useState, useEffect } from 'react';
import type { AppSettings, Theme, PrivacySetting, VibrationPattern } from '../../types';
import { defaultSettings } from '../../data/initialData';
import { CogIcon } from '../icons/CogIcon';
import { PaintBrushIcon } from '../icons/PaintBrushIcon';
import { LockClosedIcon } from '../icons/LockClosedIcon';
import { BellIcon } from '../icons/BellIcon';
import { CircleStackIcon } from '../icons/CircleStackIcon';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { CreditCardIcon } from '../icons/CreditCardIcon';

interface AdminSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

type ModalContent = {
    type: 'theme' | 'lastSeen' | 'profilePhoto' | 'sound' | 'vibration';
    title: string;
} | null;

const SelectionModal: React.FC<{
    title: string;
    options: string[];
    currentValue: string;
    onSave: (value: any) => void;
    onClose: () => void;
}> = ({ title, options, currentValue, onSave, onClose }) => {
    const [selectedValue, setSelectedValue] = useState(currentValue);
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-[#2a2a46] rounded-2xl p-6 w-80 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4">{title}</h3>
                <div className="space-y-3">
                    {options.map(option => (
                        <label key={option} className="flex items-center gap-3 p-2 rounded-md hover:bg-[#3a3a5c]">
                            <input
                                type="radio"
                                name="selection-option"
                                value={option}
                                checked={selectedValue === option}
                                onChange={() => setSelectedValue(option)}
                                className="w-5 h-5 text-[#3F9BFF] bg-gray-700 border-gray-600 focus:ring-[#3F9BFF]"
                            />
                            <span className="text-base font-medium capitalize">{option}</span>
                        </label>
                    ))}
                </div>
                 <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={() => { onSave(selectedValue); onClose(); }} className="px-4 py-2 rounded-lg bg-[#3F9BFF] hover:bg-blue-500 font-semibold transition-colors">Save</button>
                </div>
            </div>
        </div>
    );
};

const SettingsToggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#1C1C2E] ${checked ? 'bg-[#3F9BFF]' : 'bg-gray-600'}`}
    >
        <span aria-hidden="true" className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onUpdateSettings }) => {
    const [editableSettings, setEditableSettings] = useState<AppSettings>(settings);
    const [modalContent, setModalContent] = useState<ModalContent>(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    useEffect(() => {
        setEditableSettings(settings);
    }, [settings]);

    const handleSettingChange = (key: keyof AppSettings, value: any) => {
        setEditableSettings(prev => ({ ...prev, [key]: value }));
    };

    const handlePaymentGatewayChange = (
        gateway: 'stripe' | 'paypal',
        key: 'enabled' | 'publicKey' | 'secretKey' | 'clientId',
        value: string | boolean
    ) => {
        setEditableSettings(prev => ({
            ...prev,
            paymentGateways: {
                ...prev.paymentGateways,
                [gateway]: {
                    ...prev.paymentGateways[gateway],
                    [key]: value
                }
            }
        }));
    };

    const handleSave = () => {
        onUpdateSettings(editableSettings);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 2000);
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all settings to their default values?')) {
            setEditableSettings(defaultSettings);
        }
    };
    
    const getModalOptions = () => {
        if (!modalContent) return [];
        switch(modalContent.type) {
            case 'theme': return ['light', 'dark', 'system'];
            case 'lastSeen':
            case 'profilePhoto': return ['everyone', 'myContacts', 'nobody'];
            case 'sound': return ['Default', 'Chime', 'Alert', 'Synth', 'None'];
            case 'vibration': return ['Default', 'Short', 'Long', 'Pulse'];
            default: return [];
        }
    };
    
    const getCurrentModalValue = () => {
        if (!modalContent) return '';
        switch (modalContent.type) {
            case 'theme': return editableSettings.theme;
            case 'lastSeen': return editableSettings.lastSeen;
            case 'profilePhoto': return editableSettings.profilePhoto;
            case 'sound': return editableSettings.notificationSound;
            case 'vibration': return editableSettings.notificationVibration;
        }
    };
    
    const saveModalValue = (value: string) => {
        if (!modalContent) return;
        switch (modalContent.type) {
            case 'theme': handleSettingChange('theme', value as Theme); break;
            case 'lastSeen': handleSettingChange('lastSeen', value as PrivacySetting); break;
            case 'profilePhoto': handleSettingChange('profilePhoto', value as PrivacySetting); break;
            case 'sound': handleSettingChange('notificationSound', value); break;
            case 'vibration': handleSettingChange('notificationVibration', value as VibrationPattern); break;
        }
    };

    return (
    <div className="p-8 relative">
        {modalContent && (
            <SelectionModal 
                title={modalContent.title}
                options={getModalOptions()}
                currentValue={getCurrentModalValue()}
                onSave={saveModalValue}
                onClose={() => setModalContent(null)}
            />
        )}
        
        {showSuccessToast && (
            <div className="fixed top-8 right-8 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-down">
                Settings saved successfully!
            </div>
        )}

        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
                <CogIcon className="w-8 h-8 text-gray-400" />
                <h1 className="text-3xl font-bold">Global Settings</h1>
            </div>
            <div className="flex gap-3">
                <button onClick={handleReset} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors font-semibold">Reset to Default</button>
                <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[#3F9BFF] hover:bg-blue-500 transition-colors font-semibold">Save Changes</button>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="p-4 bg-[#1C1C2E] rounded-lg border border-gray-700 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2"><PaintBrushIcon className="w-5 h-5" /> Appearance</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 rounded-md hover:bg-white/5">
                        <label>Theme</label>
                        <button onClick={() => setModalContent({ type: 'theme', title: 'Select Default Theme' })} className="font-mono capitalize text-blue-400 hover:underline">{editableSettings.theme}</button>
                    </div>
                </div>
            </div>

             <div className="p-4 bg-[#1C1C2E] rounded-lg border border-gray-700 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2"><LockClosedIcon className="w-5 h-5" /> Privacy Defaults</h3>
                <div className="space-y-2 text-sm">
                     <div className="flex justify-between items-center p-2 rounded-md hover:bg-white/5">
                        <label>Last Seen</label>
                        <button onClick={() => setModalContent({ type: 'lastSeen', title: 'Default Last Seen Privacy' })} className="font-mono capitalize text-blue-400 hover:underline">{editableSettings.lastSeen}</button>
                    </div>
                     <div className="flex justify-between items-center p-2 rounded-md hover:bg-white/5">
                        <label>Profile Photo</label>
                        <button onClick={() => setModalContent({ type: 'profilePhoto', title: 'Default Profile Photo Privacy' })} className="font-mono capitalize text-blue-400 hover:underline">{editableSettings.profilePhoto}</button>
                    </div>
                     <div className="flex justify-between items-center p-2 rounded-md hover:bg-white/5">
                        <label>Read Receipts</label>
                        <SettingsToggle checked={editableSettings.readReceipts} onChange={(val) => handleSettingChange('readReceipts', val)} />
                    </div>
                </div>
            </div>

            <div className="p-4 bg-[#1C1C2E] rounded-lg border border-gray-700 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2"><LockClosedIcon className="w-5 h-5" /> Security</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 rounded-md hover:bg-white/5">
                        <div>
                            <label className="font-medium">Two-Step Verification</label>
                            <p className="text-gray-400 text-xs mt-1">Require a verification code in addition to the password when signing in.</p>
                        </div>
                        <SettingsToggle 
                            checked={editableSettings.twoFactorAuthentication} 
                            onChange={(val) => handleSettingChange('twoFactorAuthentication', val)} 
                        />
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-[#1C1C2E] rounded-lg border border-gray-700 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2"><BellIcon className="w-5 h-5" /> Notifications</h3>
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 rounded-md hover:bg-white/5">
                        <label>Conversation Tones</label>
                        <SettingsToggle checked={editableSettings.conversationTones} onChange={(val) => handleSettingChange('conversationTones', val)} />
                    </div>
                     <div className="flex justify-between items-center p-2 rounded-md hover:bg-white/5">
                        <label>Notification Sound</label>
                        <button onClick={() => setModalContent({ type: 'sound', title: 'Default Notification Sound' })} className="font-mono capitalize text-blue-400 hover:underline">{editableSettings.notificationSound}</button>
                    </div>
                     <div className="flex justify-between items-center p-2 rounded-md hover:bg-white/5">
                        <label>Vibration Pattern</label>
                        <button onClick={() => setModalContent({ type: 'vibration', title: 'Default Vibration Pattern' })} className="font-mono capitalize text-blue-400 hover:underline">{editableSettings.notificationVibration}</button>
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-[#1C1C2E] rounded-lg border border-gray-700 space-y-4 xl:col-span-2">
                <h3 className="font-semibold text-lg flex items-center gap-2"><EnvelopeIcon className="w-5 h-5" /> Alerts</h3>
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 rounded-md hover:bg-white/5">
                        <div>
                            <label htmlFor="adminEmail" className="font-medium">Administrator Email</label>
                            <p className="text-gray-400 text-xs mt-1">The email address where critical notifications will be sent.</p>
                        </div>
                        <input
                            id="adminEmail"
                            type="email"
                            value={editableSettings.adminEmail}
                            onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                            className="w-1/3 bg-[#2a2a46] border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-[#553699]"
                            placeholder="admin@example.com"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AdminSettings;
