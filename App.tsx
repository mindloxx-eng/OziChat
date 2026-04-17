
import React, { useState, useEffect } from 'react';
import UserApp from './UserApp';
import AdminApp from './AdminApp';
import AdminLoginScreen from './components/AdminLoginScreen';
import * as backend from './services/backendService';
import type { Contact, AppSettings, Advertisement } from './types';
import { SafeArea } from 'capacitor-plugin-safe-area';

const App: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Admin View States
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    useEffect(() => {
        // Get native safe area insets and set as CSS variables
        SafeArea.getSafeAreaInsets().then(({ insets }) => {
            document.documentElement.style.setProperty('--safe-area-top', `${insets.top}px`);
            document.documentElement.style.setProperty('--safe-area-bottom', `${insets.bottom}px`);
            document.documentElement.style.setProperty('--safe-area-left', `${insets.left}px`);
            document.documentElement.style.setProperty('--safe-area-right', `${insets.right}px`);
        }).catch(() => {
            // Fallback for web - no insets needed
        });
    }, []);

    useEffect(() => {
        // Load initial data from backend service
        setContacts(backend.getContacts());
        setSettings(backend.getSettings());
        setAdvertisements(backend.getAllAdvertisementsForAdmin());
        setIsLoading(false);

        // Simple Hash Routing for Admin Entry
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#/adminmgr')) {
                setIsAdminMode(true);
            } else {
                setIsAdminMode(false);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial check

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleUpdateContacts = (updatedContacts: Contact[]) => {
        backend.saveContacts(updatedContacts);
        setContacts(updatedContacts);
    };

    const handleUpdateSettings = (updatedSettings: Partial<AppSettings>) => {
        if (settings) {
            const newSettings = { ...settings, ...updatedSettings };
            backend.saveSettings(newSettings);
            setSettings(newSettings);
        }
    };

    const handleUpdateAdvertisements = (updatedAds: Advertisement[]) => {
        backend.saveAdvertisements(updatedAds);
        setAdvertisements(updatedAds);
    };

    const handleAdminLogout = () => {
        setIsAdminAuthenticated(false);
        setIsAdminMode(false);
        window.location.hash = '#/';
    };
    
    const appBgClass = "bg-gray-100 dark:bg-[#0B0E14]";

    if (isLoading || !settings) {
        return (
            <div className={`h-full flex items-center justify-center ${appBgClass}`}>
                <div className="w-10 h-10 border-4 border-[#3F9BFF] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Render Admin Flow
    if (isAdminMode) {
        if (!isAdminAuthenticated) {
            return (
                <AdminLoginScreen 
                    settings={settings} 
                    onLoginSuccess={() => setIsAdminAuthenticated(true)} 
                />
            );
        }
        return (
            <AdminApp 
                contacts={contacts}
                settings={settings}
                advertisements={advertisements}
                onUpdateContacts={handleUpdateContacts}
                onUpdateSettings={handleUpdateSettings}
                onUpdateAdvertisements={handleUpdateAdvertisements}
                onLogout={handleAdminLogout}
            />
        );
    }

    // Default User App
    return (
        <div className={`h-full w-full overflow-hidden relative ${appBgClass}`}>
            <UserApp 
                contacts={contacts} 
                settings={settings} 
                onUpdateContacts={handleUpdateContacts} 
                onUpdateSettings={handleUpdateSettings}
            />
        </div>
    );
};

export default App;
