
import { useState, useEffect } from 'react';
import type { AppSettings } from '../types';

const SETTINGS_KEY = 'ozichat_app_settings';

const defaultSettings: AppSettings = {
  // Appearance
  theme: 'system',
  wallpaper: 'default',
  fontSize: 'medium',

  // Privacy
  lastSeen: 'everyone',
  profilePhoto: 'everyone',
  readReceipts: true,
  groupAddPrivacy: 'everyone',
  statusPrivacy: 'myContacts',

  // Notifications
  conversationTones: true,
  notificationSound: 'Default',
  notificationVibration: 'Default',
  
  // Data and Storage
  autoDownloadMobile: {
    photos: true,
    audio: true,
    videos: false,
    documents: false,
  },
  autoDownloadWifi: {
    photos: true,
    audio: true,
    videos: true,
    documents: true,
  },
  useLessDataForCalls: false,

  // Security
  twoFactorAuthentication: false,
  securityNotifications: true,
  adminEmail: 'admin@ozichat.com',
  paymentGateways: {
    stripe: {
      enabled: true,
      publicKey: 'pk_test_51...',
      secretKey: 'sk_test_51...',
    },
    paypal: {
      enabled: false,
      clientId: 'AY...',
    },
    googlePay: {
      enabled: false,
      merchantId: '',
    },
  },
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const storedSettings = window.localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        // Merge stored settings with defaults to ensure new settings are added
        return { ...defaultSettings, ...JSON.parse(storedSettings) };
      }
    } catch (error) {
      console.error('Error reading settings from localStorage', error);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage', error);
    }
  }, [settings]);

  return { settings, setSettings };
};
