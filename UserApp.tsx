
import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import OziIntroAnimation from './components/OziIntroAnimation';
import LoginScreen from './components/LoginScreen';
import OtpScreen from './components/OtpScreen';
import VerificationScreen from './components/VerificationScreen';
import type { Contact, Group, GlobalCall, AppSettings, ChatListItem, Advertisement } from './types';
import * as backend from './services/backendService';
import { App as CapApp } from '@capacitor/app';
import { getConversations, getOrCreateDirectConversation, getGroup, getGroupMembers, updateGroup, addGroupMembers, removeGroupMember, changeGroupMemberRole, createGroupInviteLink, revokeGroupInviteLink, joinGroupByToken, getGroupPinnedMessages, pinGroupMessage, unpinGroupMessage, setGroupAnnouncement, getUserById, searchUsers, normalizeMediaUrl, logout as apiLogout, getMyProfile } from './services/apiService';
import { isAuthenticated, getUserId, clearAuthTokens } from './services/tokenService';
import { wsService } from './services/websocketService';

// Lazy load non-critical screens
const ChatScreen = lazy(() => import('./components/ChatScreen'));
const ProfileScreen = lazy(() => import('./components/ProfileScreen'));
const ContactsScreen = lazy(() => import('./components/ContactsScreen'));
const ContactDetailsScreen = lazy(() => import('./components/ContactDetailsScreen'));
const AddContactScreen = lazy(() => import('./components/AddContactScreen'));
const MapScreen = lazy(() => import('./components/MapScreen'));
const CallsScreen = lazy(() => import('./components/CallsScreen'));
const MediaScreen = lazy(() => import('./components/MediaScreen'));
const SettingsScreen = lazy(() => import('./components/SettingsScreen'));
const AccountSettings = lazy(() => import('./components/settings/AccountSettings'));
const PrivacySettings = lazy(() => import('./components/settings/PrivacySettings'));
const SecuritySettings = lazy(() => import('./components/settings/SecuritySettings'));
const BlockedContactsScreen = lazy(() => import('./components/settings/BlockedContactsScreen'));
const AppearanceSettings = lazy(() => import('./components/settings/AppearanceSettings'));
const NotificationsSettings = lazy(() => import('./components/settings/NotificationsSettings'));
const DataStorageSettings = lazy(() => import('./components/settings/DataStorageSettings'));
const ManageStorageScreen = lazy(() => import('./components/settings/ManageStorageScreen'));
const HelpSettings = lazy(() => import('./components/settings/HelpSettings'));
const HelpCenterScreen = lazy(() => import('./components/settings/HelpCenterScreen'));
const ContactUsScreen = lazy(() => import('./components/settings/ContactUsScreen'));
const TermsPrivacyScreen = lazy(() => import('./components/settings/TermsPrivacyScreen'));
const AppInfoScreen = lazy(() => import('./components/settings/AppInfoScreen'));
const TwoStepVerificationScreen = lazy(() => import('./components/settings/TwoStepVerificationScreen'));
const DeleteAccountScreen = lazy(() => import('./components/settings/DeleteAccountScreen'));
const CreateGroupScreen = lazy(() => import('./components/CreateGroupScreen'));
const GroupDetailsScreen = lazy(() => import('./components/GroupDetailsScreen'));
const JoinGroupScreen = lazy(() => import('./components/JoinGroupScreen'));
const MarketplaceScreen = lazy(() => import('./components/MarketplaceScreen'));
const PostAdScreen = lazy(() => import('./components/PostAdScreen'));
const AdDetailsScreen = lazy(() => import('./components/AdDetailsScreen'));
const AllContactsListScreen = lazy(() => import('./components/AllContactsListScreen'));
const AdPaymentScreen = lazy(() => import('./components/AdPaymentScreen'));
const AdCheckoutScreen = lazy(() => import('./components/AdCheckoutScreen'));
const CallingScreen = lazy(() => import('./components/CallingScreen'));
const StarredMessagesScreen = lazy(() => import('./components/StarredMessagesScreen'));
const EphemeralScreen = lazy(() => import('./components/EphemeralScreen'));
const AIAssistantScreen = lazy(() => import('./components/AIAssistantScreen'));
const VoiceAssistantScreen = lazy(() => import('./components/VoiceAssistantScreen'));
const ChannelsScreen = lazy(() => import('./components/ChannelsScreen'));
const StatusVaultScreen = lazy(() => import('./components/StatusVaultScreen'));

export type AppState = 'splash' | 'ozi-intro' | 'onboarding' | 'login' | 'otp' | 'verification' | 'contacts' | 'chat' | 'profile' | 'contact-details' | 'group-details' | 'join-group' | 'add-contact' | 'edit-contact' | 'map' | 'calls' | 'media' | 'settings' | 'settings-account' | 'settings-privacy' | 'settings-security' | 'settings-blocked-contacts' | 'settings-appearance' | 'settings-notifications' | 'settings-data' | 'settings-storage-manage' | 'settings-help' | 'settings-two-step' | 'settings-delete-account' | 'help-center' | 'contact-us' | 'terms-privacy' | 'app-info' | 'create-group' | 'marketplace' | 'post-ad' | 'ad-details' | 'all-contacts' | 'ad-payment' | 'ad-checkout' | 'calling' | 'starred-messages' | 'ephemeral' | 'ai-assistant' | 'voice-assistant' | 'channels' | 'status-vault';

interface UserAppProps {
  contacts: Contact[];
  settings: AppSettings;
  onUpdateContacts: (contacts: Contact[]) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const parseTimestamp = (timestampStr: string): Date => {
  const now = new Date();
  const date = new Date();
  const timeMatch = timestampStr.match(/(\d{1,2}:\d{2})\s*(AM|PM)/);
  if (timeMatch) {
    const [_, time, modifier] = timeMatch;
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    date.setHours(hours, minutes, 0, 0);
  }

  if (timestampStr.startsWith('Today')) {
    date.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (timestampStr.startsWith('Yesterday')) {
    date.setDate(now.getDate() - 1);
  } else if (timestampStr.includes('days ago')) {
    const daysAgo = parseInt(timestampStr.split(' ')[0], 10);
    date.setDate(now.getDate() - daysAgo);
  }

  return date;
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full bg-white dark:bg-[#0B0E14]">
    <div className="w-10 h-10 border-4 border-[#3F9BFF] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const UserApp: React.FC<UserAppProps> = ({ contacts, settings, onUpdateContacts, onUpdateSettings }) => {
  const [appState, setAppState] = useState<AppState>('splash');
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);
  const [selectedAdForDetails, setSelectedAdForDetails] = useState<Advertisement | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [adInProgress, setAdInProgress] = useState<Omit<Advertisement, 'id' | 'status' | 'views' | 'postedDate' | 'expiryDate' | 'listingDuration'> | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number, duration: number} | null>(null);
  const [email, setEmail] = useState('');
  const [callInfo, setCallInfo] = useState<{ participants: Contact[]; type: 'audio' | 'video' } | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [apiConversations, setApiConversations] = useState<Contact[]>([]);
  const [apiGroups, setApiGroups] = useState<Group[]>([]);


  useEffect(() => {
    setGroups(backend.getGroups());
    setAdvertisements(backend.getAdvertisements());

    // Listen for auth expiry to redirect to login
    const handleAuthExpired = () => {
      console.log('🔴 Auth expired — redirecting to login');
      wsService.disconnect();
      setAppState('login');
    };
    window.addEventListener('ozichat:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('ozichat:auth-expired', handleAuthExpired);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(() => {
        const hasOnboarded = localStorage.getItem('ozichat_onboarded');
        if (hasOnboarded && isAuthenticated()) {
            // Already logged in — go straight to contacts
            wsService.connect();
            setAppState('contacts');
        } else if (hasOnboarded) {
            setAppState('login');
        } else {
            setAppState('ozi-intro');
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  // Handle Android hardware back button
  useEffect(() => {
    const backHandler = CapApp.addListener('backButton', () => {
      // Main tabs — minimize app instead of closing
      const mainScreens = ['contacts', 'calls', 'channels', 'ephemeral', 'map', 'all-contacts', 'ai-assistant'];
      if (mainScreens.includes(appState)) {
        CapApp.minimizeApp();
        return;
      }

      // Auth flow screens — minimize app
      if (['splash', 'ozi-intro', 'onboarding', 'login'].includes(appState)) {
        CapApp.minimizeApp();
        return;
      }

      // Map back navigation for every screen
      const backMap: Record<string, string> = {
        'otp': 'login',
        'verification': 'login',
        'chat': 'contacts',
        'profile': 'chat',
        'contact-details': 'chat',
        'group-details': 'chat',
        'join-group': 'contacts',
        'add-contact': 'contacts',
        'edit-contact': 'contact-details',
        'create-group': 'contacts',
        'media': 'contact-details',
        'calling': 'contacts',
        'settings': 'contacts',
        'settings-account': 'settings',
        'settings-privacy': 'settings-account',
        'settings-security': 'settings-account',
        'settings-two-step': 'settings-account',
        'settings-delete-account': 'settings-account',
        'settings-blocked-contacts': 'settings-privacy',
        'settings-appearance': 'settings',
        'settings-notifications': 'settings',
        'settings-data': 'settings',
        'settings-storage-manage': 'settings-data',
        'settings-help': 'settings',
        'help-center': 'settings-help',
        'contact-us': 'settings-help',
        'terms-privacy': 'settings-help',
        'app-info': 'settings-help',
        'starred-messages': 'settings',
        'marketplace': 'contacts',
        'ad-details': 'marketplace',
        'post-ad': 'marketplace',
        'ad-payment': 'post-ad',
        'ad-checkout': 'ad-payment',
        'voice-assistant': 'ai-assistant',
        'status-vault': 'ephemeral',
      };

      const target = backMap[appState];
      if (target) {
        if (appState === 'chat') setSelectedChat(null);
        if (appState === 'ad-details') setSelectedAdForDetails(null);
        setAppState(target as AppState);
      } else {
        setAppState('contacts');
      }
    });

    return () => {
      backHandler.then(h => h.remove());
    };
  }, [appState]);

  // Fetch conversations + sync profile from API when user reaches home screen
  useEffect(() => {
    if (appState === 'contacts' && isAuthenticated()) {
      // Sync profile from server → localStorage
      getMyProfile()
        .then((res) => {
          if (res.success && res.data) {
            const p = res.data;
            if (p.displayName) localStorage.setItem('ozichat_display_name', p.displayName);
            if (p.avatarUrl) localStorage.setItem('ozichat_profile_picture', normalizeMediaUrl(p.avatarUrl));
            if (p.about) localStorage.setItem('ozichat_status_message', p.about);
            if (p.phone) localStorage.setItem('ozichat_user_phone', p.phone);
            if (p.email) localStorage.setItem('ozichat_user_email', p.email);
            window.dispatchEvent(new Event('storage'));
            console.log('🟢 Profile synced from server:', p.displayName);
          }
        })
        .catch((err) => console.warn('Profile sync failed:', err));

      getConversations()
        .then((response) => {
          const conversations = response.data || [];

          const directContacts: Contact[] = [];
          const groupChats: Group[] = [];

          conversations.forEach((conv) => {
            const timestamp = conv.updatedAt
              ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';
            const avatarUrl = normalizeMediaUrl(conv.avatarUrl) || `https://picsum.photos/seed/${conv.conversationId}/80/80`;

            if (conv.type === 'GROUP') {
              groupChats.push({
                id: String(conv.conversationId),
                name: conv.displayName || 'Group',
                avatarUrl,
                members: [],
                lastMessage: 'Tap to start chatting',
                timestamp,
                unreadCount: 0,
              });
            } else {
              directContacts.push({
                id: String(conv.conversationId),
                name: conv.displayName || 'Unknown',
                avatarUrl,
                lastMessage: 'Tap to start chatting',
                timestamp,
                unreadCount: 0,
                status: 'online',
                phone: '',
              });
            }
          });

          setApiConversations(directContacts);
          setApiGroups(groupChats);

          // Subscribe to EVERY conversation room (DIRECT + GROUP) on page load.
          // Safe to call even if WS isn't connected yet — queued and activated on connect.
          conversations.forEach((conv) => {
            if (conv.conversationId) {
              wsService.subscribeToConversation(conv.conversationId);
            }
          });
          console.log(`📡 Queued/activated subscriptions for ${conversations.length} conversation rooms`);
        })
        .catch((err) => {
          console.warn('Failed to fetch conversations:', err);
        });

      // Ensure WebSocket is connected
      if (!wsService.isConnected()) {
        wsService.connect();
      }
    }
  }, [appState]);

  const chatList = useMemo<ChatListItem[]>(() => {
    // When authenticated, show ONLY server data (no static demo contacts)
    if (isAuthenticated()) {
      const allChats: ChatListItem[] = [...apiConversations, ...apiGroups];
      const seen = new Set<string>();
      const unique = allChats.filter((chat) => {
        if (seen.has(chat.id)) return false;
        seen.add(chat.id);
        return true;
      });
      return unique.sort((a, b) => {
        return parseTimestamp(b.timestamp).getTime() - parseTimestamp(a.timestamp).getTime();
      });
    }

    // Unauthenticated fallback — local/demo data
    const allChats: ChatListItem[] = [...contacts, ...groups];
    const seen = new Set<string>();
    const unique = allChats.filter((chat) => {
      if (seen.has(chat.id)) return false;
      seen.add(chat.id);
      return true;
    });
    return unique.sort((a, b) => {
      return parseTimestamp(b.timestamp).getTime() - parseTimestamp(a.timestamp).getTime();
    });
  }, [contacts, groups, apiConversations, apiGroups]);

  const globalCallLog = useMemo<GlobalCall[]>(() => {
    const allCalls: (GlobalCall & { date: Date })[] = [];
    contacts.forEach(contact => {
        if(contact.callHistory) {
            contact.callHistory.forEach(call => {
                allCalls.push({
                    ...call,
                    contactId: contact.id,
                    contactName: contact.name,
                    contactAvatarUrl: contact.avatarUrl,
                    date: parseTimestamp(call.timestamp),
                });
            });
        }
    });
    return allCalls.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [contacts]);

  const handleGetStarted = () => {
    localStorage.setItem('ozichat_onboarded', 'true');
    setAppState('login');
  };

  // Called when LOGIN with password succeeds → go straight to chats
  const handleAuthSuccess = () => {
    wsService.connect();
    localStorage.setItem('ozichat_setup_status', 'complete');
    setAppState('contacts');
  };

  const handleEmailSubmit = (emailValue: string) => {
    setEmail(emailValue);
    setAppState('otp');
  };

  // Called when OTP verification succeeds (after register flow) → go to chats
  const handleOtpSuccess = () => {
    if (isAuthenticated()) {
      wsService.connect();
    }
    localStorage.setItem('ozichat_setup_status', 'complete');
    setAppState('contacts');
  };
  const handleBackToLogin = () => {
    setEmail('');
    setAppState('login');
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.warn('Logout API failed (clearing local tokens anyway):', err);
      clearAuthTokens();
    }
    wsService.disconnect();
    setAppState('login');
  };
  const handleSelectChat = (chat: ChatListItem) => {
    setSelectedChat(chat);
    setAppState('chat');
  };

  // Start a new direct conversation with a user by their userId
  const handleStartDirectChat = async (targetUserId: number, fallbackName?: string) => {
    if (!isAuthenticated()) return;
    try {
      const res = await getOrCreateDirectConversation(targetUserId);
      if (res.success && res.data) {
        const conv = res.data;
        const myId = getUserId();
        const other = conv.members?.find((m) => m.userId !== myId) || conv.members?.[0];
        const chatItem: Contact = {
          id: String(conv.id),
          name: other?.displayName || fallbackName || 'Unknown',
          avatarUrl: other?.avatarUrl || `https://picsum.photos/seed/${conv.id}/80/80`,
          lastMessage: conv.lastMessage?.contentPreview || 'Tap to start chatting',
          timestamp: conv.updatedAt
            ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          unreadCount: conv.unreadCount ?? 0,
          status: 'online',
          phone: '',
        };
        setSelectedChat(chatItem);
        setAppState('chat');
      }
    } catch (err) {
      console.warn('Failed to create direct conversation:', err);
    }
  };
  // Expose for testing from browser console
  (window as any).startDirectChat = handleStartDirectChat;
  (window as any).groupApi = {
    getGroup,
    getGroupMembers,
    updateGroup,
    addGroupMembers,
    removeGroupMember,
    changeGroupMemberRole,
    createGroupInviteLink,
    revokeGroupInviteLink,
    joinGroupByToken,
    getGroupPinnedMessages,
    pinGroupMessage,
    unpinGroupMessage,
    setGroupAnnouncement,
  };
  (window as any).userApi = {
    getMyProfile,
    getUserById,
    searchUsers,
  };
  (window as any).wsService = wsService; // For manual retry() after CORS fix

  const handleNavigateToProfile = () => setAppState('profile');
  const handleNavigateToContactDetails = () => {
    // Route to group details if selectedChat is a Group
    if (selectedChat && 'members' in selectedChat) {
      setAppState('group-details');
    } else {
      setAppState('contact-details');
    }
  };
  const handleNavigateToAddContact = () => setAppState('add-contact');
  const handleNavigateToCreateGroup = () => setAppState('create-group');
  const handleNavigateToMap = () => setAppState('map');
  const handleNavigateToCalls = () => setAppState('calls');
  const handleNavigateToChats = () => setAppState('contacts');
  const handleNavigateToEphemeral = () => setAppState('ephemeral');
  const handleNavigateToChannels = () => setAppState('channels');
  const handleNavigateToMedia = () => setAppState('media');
  const handleNavigateToSettings = () => setAppState('settings');
  const handleNavigateToMarketplace = () => setAppState('marketplace');
  const handleNavigateToPostAd = () => setAppState('post-ad');
  const handleNavigateToAllContacts = () => setAppState('all-contacts');
  const handleNavigateToStarredMessages = () => setAppState('starred-messages');
  const handleNavigateToAIChat = () => setAppState('ai-assistant');
  const handleNavigateToVoiceAssistant = () => setAppState('voice-assistant');
  const handleNavigateToStatusVault = () => setAppState('status-vault');

  const handleNavigateToAdDetails = (ad: Advertisement) => {
    // Increment view count
    const allAds = backend.getAllAdvertisementsForAdmin();
    const updatedAds = allAds.map(currentAd =>
      currentAd.id === ad.id
        ? { ...currentAd, views: (currentAd.views || 0) + 1 }
        : currentAd
    );
    backend.saveAdvertisements(updatedAds);

    // Use the updated ad data for the details screen and local state
    const updatedAd = updatedAds.find(a => a.id === ad.id);
    if (updatedAd) {
        setSelectedAdForDetails(updatedAd);
        // Also update the ad in the main marketplace list
        setAdvertisements(prevAds => prevAds.map(prevAd => prevAd.id === ad.id ? updatedAd : prevAd));
    } else {
        // Fallback to original ad if something goes wrong
        setSelectedAdForDetails(ad);
    }

    setAppState('ad-details');
  };
  const handleBackToContacts = () => {
    setSelectedChat(null);
    setAppState('contacts');
  };
  const handleBackToPreviousScreen = () => {
     if(appState === 'profile') setAppState('chat');
     else if (appState === 'settings-privacy' || appState === 'settings-security' || appState === 'settings-two-step' || appState === 'settings-delete-account') {
         setAppState('settings-account');
     } else if (appState === 'settings-blocked-contacts') {
         setAppState('settings-privacy');
     } else if (appState === 'settings-storage-manage') {
         setAppState('settings-data');
     } else if (['help-center', 'contact-us', 'terms-privacy', 'app-info'].includes(appState)) {
         setAppState('settings-help');
     } else if (appState.startsWith('settings-')) {
         setAppState('settings');
     } else {
         setAppState('contacts');
     }
  }
  const handleBackToChat = () => setAppState('chat');
  const handleBackToContactDetails = () => setAppState('contact-details');
  const handleBackToMarketplace = () => {
    setSelectedAdForDetails(null);
    setAppState('marketplace');
  };

  const handleNavigateToAdPayment = (adData: Omit<Advertisement, 'id' | 'status' | 'views' | 'postedDate' | 'expiryDate' | 'listingDuration'>) => {
    setAdInProgress(adData);
    setAppState('ad-payment');
  };

  const handleSelectAdPlan = (plan: {name: string, price: number, duration: number}) => {
      setSelectedPlan(plan);
      setAppState('ad-checkout');
  };

  const handlePostAdSuccess = (newAd: Advertisement) => {
    const allAds = backend.getAllAdvertisementsForAdmin();
    const updatedAds = [newAd, ...allAds];
    backend.saveAdvertisements(updatedAds);
    // Refresh the local ads state to show the newly approved ad
    setAdvertisements(backend.getAdvertisements());
    setAdInProgress(null);
    setSelectedPlan(null);
    setAppState('marketplace');
  };

  const handleSaveContact = (newContactData: Omit<Contact, 'id' | 'lastMessage' | 'timestamp' | 'unreadCount' | 'status'>) => {
    const newContact: Contact = {
      ...newContactData,
      id: Date.now().toString(),
      avatarUrl: newContactData.avatarUrl || `https://picsum.photos/seed/${Date.now()}/80/80`,
      lastMessage: 'Tap to start chatting!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: 0,
      status: 'Hey there! I am using Ozichat.',
      callHistory: [],
      audioCodec: 'Opus',
      videoCodec: 'H.264',
      useDataSaver: false,
    };
    onUpdateContacts([newContact, ...contacts]);
    setAppState('contacts');
  };

  // Dedicated handler for adding a fully formed contact (e.g. from Map)
  const handleAddContact = (contact: Contact) => {
      // Check if already exists by ID
      if (contacts.some(c => c.id === contact.id)) return;
      onUpdateContacts([contact, ...contacts]);
  };

  const handleUpdateContactInfo = (contactData: Omit<Contact, 'id' | 'lastMessage' | 'timestamp' | 'unreadCount' | 'status'>) => {
      if (!editingContact) return;
      const updatedContacts = contacts.map(c => 
        c.id === editingContact.id 
            ? { ...c, ...contactData } 
            : c
      );
      onUpdateContacts(updatedContacts);
      if (selectedChat && selectedChat.id === editingContact.id) {
          setSelectedChat({ ...selectedChat, ...contactData });
      }
      setEditingContact(null);
      setAppState('contact-details');
  };

  const handleSaveGroup = (groupData: Omit<Group, 'id' | 'lastMessage' | 'timestamp' | 'unreadCount'>) => {
    const newGroup: Group = {
        ...groupData,
        id: `g${Date.now()}`,
        avatarUrl: groupData.avatarUrl || `https://picsum.photos/seed/g${Date.now()}/80/80`,
        lastMessage: 'Group created. Say hi!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadCount: 1,
    };
    const updatedGroups = [newGroup, ...groups];
    setGroups(updatedGroups);
    backend.saveGroups(updatedGroups);
    setAppState('contacts');
  };

  const handleToggleFavorite = (contactId: string) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, isFavorite: !contact.isFavorite }
        : contact
    );
    onUpdateContacts(updatedContacts);
    if (selectedChat && 'isFavorite' in selectedChat && selectedChat.id === contactId) {
        setSelectedChat(prev => (prev && 'isFavorite' in prev) ? { ...prev, isFavorite: !prev.isFavorite } : prev);
    }
  };

  const handleUpdateContactSettings = (contactId: string, contactSettings: Partial<Contact>) => {
    const updatedContacts = contacts.map(c => (c.id === contactId ? { ...c, ...contactSettings } : c));
    onUpdateContacts(updatedContacts);
    if (selectedChat && 'phone' in selectedChat && selectedChat.id === contactId) {
      setSelectedChat(prev => (prev ? { ...prev, ...contactSettings } : null));
    }
  };

  const handleDeleteContact = (contactId: string) => {
    backend.purgeChatMessages(contactId);
    const updatedContacts = contacts.filter(c => c.id !== contactId);
    onUpdateContacts(updatedContacts);
    setAppState('contacts');
    setSelectedChat(null);
  };

  const handlePurgeMessages = (contactId: string) => {
    backend.purgeChatMessages(contactId);
    alert('Local cache for this transmission has been purged.');
  };
  
  const handleInitiateCall = (target: Contact | Contact[], type: 'audio' | 'video') => {
    const participants = Array.isArray(target) ? target : [target];
    const validParticipants = participants.filter(c => !c.isBlocked);
    if (validParticipants.length === 0) return;

    setCallInfo({ participants: validParticipants, type });
    setAppState('calling');
  };
  
  const handleEndCall = () => {
      setCallInfo(null);
      setAppState('contacts');
  };

  const handleDeleteAccount = async () => {
    await handleLogout();
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('ozichat_')) {
            localStorage.removeItem(key);
        }
    });
    window.location.reload();
  };

  const handleChatWithAdvertiser = (advertiserPhone: string, adTitle: string) => {
    let advertiserContact = contacts.find(c => c.phone === advertiserPhone);

    if (!advertiserContact) {
      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        name: `Seller: ${adTitle.substring(0, 20)}...`,
        avatarUrl: `https://i.pravatar.cc/150?u=${advertiserPhone}`, // Use phone for a consistent generic avatar
        phone: advertiserPhone,
        lastMessage: `Regarding your ad: "${adTitle}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadCount: 0,
        status: 'Marketplace Seller',
        callHistory: [],
        audioCodec: 'Opus',
        videoCodec: 'H.264',
        useDataSaver: false,
        moderationStatus: 'active',
      };
      const updatedContacts = [newContact, ...contacts];
      onUpdateContacts(updatedContacts);
      advertiserContact = newContact;
    }

    setSelectedChat(advertiserContact);
    setAppState('chat');
  };

  const handleEditContact = (contact: Contact) => {
      setEditingContact(contact);
      setAppState('edit-contact');
  };

  const handleBlockContact = (contactId: string) => {
      const updatedContacts = contacts.map(c => 
        c.id === contactId ? { ...c, isBlocked: !c.isBlocked } : c
      );
      onUpdateContacts(updatedContacts);
      // Update selected chat if it's the blocked contact
      if (selectedChat && selectedChat.id === contactId) {
          setSelectedChat(prev => prev ? { ...prev, isBlocked: !('isBlocked' in prev && prev.isBlocked) } : null);
      }
  };

  const renderContent = () => {
    const navProps = {
        onNavigateToChats: handleNavigateToChats,
        onNavigateToCalls: handleNavigateToCalls,
        onNavigateToMap: handleNavigateToMap,
        onNavigateToAllContacts: handleNavigateToAllContacts,
        onNavigateToEphemeral: handleNavigateToEphemeral,
        onNavigateToChannels: handleNavigateToChannels,
        onNavigateToAI: handleNavigateToAIChat,
    };

    switch (appState) {
      case 'splash': return <SplashScreen />;
      case 'ozi-intro': return <OziIntroAnimation onComplete={() => setAppState('onboarding')} />;
      case 'onboarding': return <OnboardingScreen onGetStarted={handleGetStarted} />;
      case 'login': return <LoginScreen onEmailSubmit={handleEmailSubmit} onAuthSuccess={handleAuthSuccess} />;
      case 'otp': return <OtpScreen email={email} onOtpSuccess={handleOtpSuccess} onBackToLogin={handleBackToLogin} />;
      case 'verification': return <VerificationScreen onVerificationComplete={() => setAppState('contacts')} />;
      case 'contacts':
        return <ContactsScreen 
                    chatList={chatList} 
                    onSelectChat={handleSelectChat} 
                    onNavigateToProfile={handleNavigateToProfile} 
                    onNavigateToAddContact={handleNavigateToAddContact}
                    onNavigateToCreateGroup={handleNavigateToCreateGroup}
                    onNavigateToJoinGroup={() => setAppState('join-group')}
                    onNavigateToSettings={handleNavigateToSettings}
                    onNavigateToMarketplace={handleNavigateToMarketplace}
                    onNavigateToAllContacts={handleNavigateToAllContacts}
                    onNavigateToAI={handleNavigateToAIChat}
                    navProps={{...navProps, activeScreen: 'chats'}}
                />;
      case 'calls':
        return <CallsScreen 
                    calls={globalCallLog} 
                    contacts={contacts}
                    onNavigateToProfile={handleNavigateToProfile}
                    onInitiateCall={(contact) => handleInitiateCall(contact, 'audio')}
                    onSelectContactById={(contactId) => {
                        const contact = contacts.find(c => c.id === contactId);
                        if (contact) handleSelectChat(contact);
                    }}
                    navProps={{...navProps, activeScreen: 'calls'}}
                    onStartNewCall={() => setAppState('all-contacts')}
                />;
      case 'channels':
        return <ChannelsScreen 
                    navProps={{...navProps, activeScreen: 'channels'}} 
                />;
      case 'ephemeral':
        return <EphemeralScreen
                    contacts={contacts}
                    onNavigateToProfile={handleNavigateToProfile}
                    navProps={{...navProps, activeScreen: 'ephemeral'}}
                    onNavigateToVault={handleNavigateToStatusVault}
               />;
      case 'status-vault':
        return <StatusVaultScreen onBack={() => setAppState('ephemeral')} />;
      case 'ai-assistant':
        return <AIAssistantScreen 
                    navProps={{...navProps, activeScreen: 'ai-assistant'}} 
                    onNavigateToVoiceAssistant={handleNavigateToVoiceAssistant}
                />;
      case 'voice-assistant':
        return <VoiceAssistantScreen 
                  onBack={() => setAppState('ai-assistant')} 
                  contacts={contacts}
                  onUpdateContactSettings={handleUpdateContactSettings}
               />;
      case 'chat':
        if (!selectedChat) return <ContactsScreen chatList={chatList} onSelectChat={handleSelectChat} onNavigateToProfile={handleNavigateToProfile} onNavigateToAddContact={handleNavigateToAddContact} onNavigateToCreateGroup={handleNavigateToCreateGroup} onNavigateToJoinGroup={() => setAppState('join-group')} onNavigateToSettings={handleNavigateToSettings} onNavigateToMarketplace={handleNavigateToMarketplace} onNavigateToAllContacts={handleNavigateToAllContacts} onNavigateToAI={handleNavigateToAIChat} navProps={{...navProps, activeScreen: 'chats'}} />;
        return <ChatScreen 
            chat={selectedChat} 
            contacts={contacts} 
            onBack={handleBackToContacts} 
            onNavigateToProfile={handleNavigateToProfile} 
            onNavigateToContactDetails={handleNavigateToContactDetails} 
            settings={settings}
            onInitiateCall={handleInitiateCall}
        />;
      case 'profile': return <ProfileScreen onBack={handleBackToChat} onNavigateToVerification={() => setAppState('verification')} onLogout={handleLogout} />;
      case 'map': return <MapScreen contacts={contacts} advertisements={advertisements} onBack={handleBackToContacts} onSelectContact={(c) => handleSelectChat(c)} onInitiateCall={handleInitiateCall} onAddContact={handleAddContact} onNavigateToAd={(ad) => handleNavigateToAdDetails(ad)} />;
      case 'contact-details':
        if (!selectedChat || !('phone' in selectedChat)) return <ContactsScreen chatList={chatList} onSelectChat={handleSelectChat} onNavigateToProfile={handleNavigateToProfile} onNavigateToAddContact={handleNavigateToAddContact} onNavigateToCreateGroup={handleNavigateToCreateGroup} onNavigateToJoinGroup={() => setAppState('join-group')} onNavigateToSettings={handleNavigateToSettings} onNavigateToMarketplace={handleNavigateToMarketplace} onNavigateToAllContacts={handleNavigateToAllContacts} onNavigateToAI={handleNavigateToAIChat} navProps={{...navProps, activeScreen: 'chats'}} />;
        return <ContactDetailsScreen 
            contact={selectedChat} 
            onBack={handleBackToChat} 
            onStartChat={handleBackToChat} 
            onToggleFavorite={handleToggleFavorite} 
            onUpdateSettings={handleUpdateContactSettings} 
            onNavigateToMedia={handleNavigateToMedia} 
            onDeleteContact={handleDeleteContact} 
            onPurgeMessages={handlePurgeMessages}
            onInitiateCall={handleInitiateCall}
            onEditContact={handleEditContact}
            onBlockContact={handleBlockContact}
        />;
      case 'group-details':
        if (!selectedChat || !('members' in selectedChat)) return <ContactsScreen chatList={chatList} onSelectChat={handleSelectChat} onNavigateToProfile={handleNavigateToProfile} onNavigateToAddContact={handleNavigateToAddContact} onNavigateToCreateGroup={handleNavigateToCreateGroup} onNavigateToJoinGroup={() => setAppState('join-group')} onNavigateToSettings={handleNavigateToSettings} onNavigateToMarketplace={handleNavigateToMarketplace} onNavigateToAllContacts={handleNavigateToAllContacts} onNavigateToAI={handleNavigateToAIChat} navProps={{...navProps, activeScreen: 'chats'}} />;
        return <GroupDetailsScreen group={selectedChat as Group} onBack={handleBackToChat} />;
      case 'add-contact': return <AddContactScreen onSave={handleSaveContact} onBack={handleBackToContacts} />;
      case 'edit-contact': 
        if (!editingContact) return <ContactsScreen chatList={chatList} onSelectChat={handleSelectChat} onNavigateToProfile={handleNavigateToProfile} onNavigateToAddContact={handleNavigateToAddContact} onNavigateToCreateGroup={handleNavigateToCreateGroup} onNavigateToJoinGroup={() => setAppState('join-group')} onNavigateToSettings={handleNavigateToSettings} onNavigateToMarketplace={handleNavigateToMarketplace} onNavigateToAllContacts={handleNavigateToAllContacts} onNavigateToAI={handleNavigateToAIChat} navProps={{...navProps, activeScreen: 'chats'}} />;
        return <AddContactScreen onSave={handleUpdateContactInfo} onBack={handleBackToContactDetails} initialContact={editingContact} />;
      case 'create-group': return <CreateGroupScreen contacts={contacts} onBack={handleBackToContacts} onSaveGroup={handleSaveGroup} onGroupCreated={(chat) => { setSelectedChat(chat); setAppState('chat'); }} />;
      case 'join-group': return <JoinGroupScreen onBack={handleBackToContacts} onGroupJoined={(chat) => { setSelectedChat(chat); setAppState('chat'); }} />;
      case 'media':
        if (!selectedChat) return <ContactsScreen chatList={chatList} onSelectChat={handleSelectChat} onNavigateToProfile={handleNavigateToProfile} onNavigateToAddContact={handleNavigateToAddContact} onNavigateToCreateGroup={handleNavigateToCreateGroup} onNavigateToJoinGroup={() => setAppState('join-group')} onNavigateToSettings={handleNavigateToSettings} onNavigateToMarketplace={handleNavigateToMarketplace} onNavigateToAllContacts={handleNavigateToAllContacts} onNavigateToAI={handleNavigateToAIChat} navProps={{...navProps, activeScreen: 'chats'}} />;
        return <MediaScreen contactName={selectedChat.name} onBack={handleBackToContactDetails} />;
      case 'settings': return <SettingsScreen onBack={handleBackToContacts} setAppState={setAppState} onNavigateToStarredMessages={handleNavigateToStarredMessages} />;
      case 'settings-account': return <AccountSettings onBack={() => setAppState('settings')} settings={settings} onUpdateSettings={onUpdateSettings} onDeleteAccount={handleDeleteAccount} setAppState={setAppState} />;
      case 'settings-privacy': return <PrivacySettings onBack={() => setAppState('settings-account')} settings={settings} onUpdateSettings={onUpdateSettings} setAppState={setAppState} />;
      case 'settings-security': return <SecuritySettings onBack={() => setAppState('settings-account')} settings={settings} onUpdateSettings={onUpdateSettings} />;
      case 'settings-blocked-contacts': return <BlockedContactsScreen onBack={() => setAppState('settings-privacy')} contacts={contacts} onUpdateContacts={onUpdateContacts} />;
      case 'settings-appearance': return <AppearanceSettings onBack={() => setAppState('settings')} settings={settings} onUpdateSettings={onUpdateSettings} />;
      case 'settings-notifications': return <NotificationsSettings onBack={() => setAppState('settings')} settings={settings} onUpdateSettings={onUpdateSettings} />;
      case 'settings-data': return <DataStorageSettings onBack={() => setAppState('settings')} settings={settings} onUpdateSettings={onUpdateSettings} onNavigateToManageStorage={() => setAppState('settings-storage-manage')} />;
      case 'settings-storage-manage': return <ManageStorageScreen onBack={() => setAppState('settings-data')} chats={[...contacts, ...groups]} />;
      case 'settings-two-step': return <TwoStepVerificationScreen onBack={() => setAppState('settings-account')} isEnabled={settings.twoFactorAuthentication} onUpdate={(enabled) => onUpdateSettings({ twoFactorAuthentication: enabled })} />;
      case 'settings-delete-account': return <DeleteAccountScreen onBack={() => setAppState('settings-account')} onDelete={handleDeleteAccount} />;
      case 'settings-help': 
        return <HelpSettings 
            onBack={() => setAppState('settings')} 
            onNavigateToHelpCenter={() => setAppState('help-center')}
            onNavigateToContactUs={() => setAppState('contact-us')}
            onNavigateToTerms={() => setAppState('terms-privacy')}
            onNavigateToAppInfo={() => setAppState('app-info')}
        />;
      case 'help-center': return <HelpCenterScreen onBack={() => setAppState('settings-help')} />;
      case 'contact-us': return <ContactUsScreen onBack={() => setAppState('settings-help')} />;
      case 'terms-privacy': return <TermsPrivacyScreen onBack={() => setAppState('settings-help')} />;
      case 'app-info': return <AppInfoScreen onBack={() => setAppState('settings-help')} />;
      case 'starred-messages': return <StarredMessagesScreen onBack={handleBackToPreviousScreen} />;
      case 'marketplace': return <MarketplaceScreen advertisements={advertisements} onBack={handleBackToContacts} onNavigateToAdDetails={handleNavigateToAdDetails} onNavigateToPostAd={handleNavigateToPostAd} />;
      case 'ad-details':
        if (!selectedAdForDetails) return <MarketplaceScreen advertisements={advertisements} onBack={handleBackToContacts} onNavigateToAdDetails={handleNavigateToAdDetails} onNavigateToPostAd={handleNavigateToPostAd} />;
        return <AdDetailsScreen ad={selectedAdForDetails} onBack={handleBackToMarketplace} onChat={handleChatWithAdvertiser} />;
      case 'post-ad':
        return <PostAdScreen onBack={() => setAppState('marketplace')} onNext={handleNavigateToAdPayment} />;
      case 'ad-payment':
        if (!adInProgress) return <MarketplaceScreen advertisements={advertisements} onBack={handleBackToContacts} onNavigateToAdDetails={handleNavigateToAdDetails} onNavigateToPostAd={handleNavigateToPostAd} />;
        return <AdPaymentScreen onBack={() => setAppState('post-ad')} onSelectPlan={handleSelectAdPlan} />;
      case 'ad-checkout':
        if (!adInProgress || !selectedPlan) return <MarketplaceScreen advertisements={advertisements} onBack={handleBackToContacts} onNavigateToAdDetails={handleNavigateToAdDetails} onNavigateToPostAd={handleNavigateToPostAd} />;
        return <AdCheckoutScreen adData={adInProgress} plan={selectedPlan} settings={settings} onBack={() => setAppState('ad-payment')} onPaymentSuccess={handlePostAdSuccess} />;
      case 'all-contacts': 
        return <AllContactsListScreen 
                  contacts={contacts} 
                  onSelectContact={handleSelectChat}
                  onEditContact={handleEditContact}
                  navProps={{...navProps, activeScreen: 'all-contacts'}}
                />;
      case 'calling':
        if (!callInfo) return <ContactsScreen chatList={chatList} onSelectChat={handleSelectChat} onNavigateToProfile={handleNavigateToProfile} onNavigateToAddContact={handleNavigateToAddContact} onNavigateToCreateGroup={handleNavigateToCreateGroup} onNavigateToJoinGroup={() => setAppState('join-group')} onNavigateToSettings={handleNavigateToSettings} onNavigateToMarketplace={handleNavigateToMarketplace} onNavigateToAllContacts={handleNavigateToAllContacts} onNavigateToAI={handleNavigateToAIChat} navProps={{...navProps, activeScreen: 'chats'}} />;
        return <CallingScreen 
                  participants={callInfo.participants} 
                  type={callInfo.type} 
                  onEndCall={handleEndCall} 
                  allContacts={contacts}
                />;
      default: return <SplashScreen />;
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="h-full w-full bg-white dark:bg-[#0B0E14] transition-colors duration-300 relative">
        {renderContent()}
      </div>
    </Suspense>
  );
};

export default UserApp;
