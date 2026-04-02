
import type { Contact, AppSettings, Group, Advertisement, RevenueEntry, Message, StatusUpdate, VideoPost, Comment } from '../types';
import { initialContacts, defaultSettings, initialGroups, initialAdvertisements, initialRevenueData } from '../data/initialData';

const CONTACTS_KEY = 'ozichat_contacts';
const SETTINGS_KEY = 'ozichat_app_settings';
const GROUPS_KEY = 'ozichat_groups';
const ADVERTISEMENTS_KEY = 'ozichat_advertisements';
const REVENUE_KEY = 'ozichat_revenue';
const MESSAGES_KEY_PREFIX = 'ozichat_messages_';
const MY_ACTIVE_STATUSES_KEY = 'ozichat_my_active_statuses';
const STATUS_VAULT_KEY = 'ozichat_status_vault';
const USER_HANDLE_KEY = 'ozichat_channel_handle';
const USER_HANDLES_LIST_KEY = 'ozichat_channel_handles_list';
const CHANNEL_POSTS_KEY = 'ozichat_channel_posts';
const SUBSCRIPTIONS_KEY = 'ozichat_subscriptions';

const initialVideos: VideoPost[] = [
    {
        id: 'v1',
        videoUrl: 'https://assets.mixkit.co/videos/preview/kit-girl-in-neon-lit-city-at-night-11433-large.mp4',
        author: 'Global Pulse',
        authorHandle: '@globalpulse',
        authorAvatar: 'https://ui-avatars.com/api/?name=GP&background=red&color=fff',
        description: 'Breaking: Network upgrades scheduled for the Ozi grid next week. Expect enhanced E2EE performance. #OziNews #Breaking',
        likes: '1.2M',
        comments: '245',
        commentList: [
            { id: 'c1', author: 'CyberPunk', authorHandle: '@cyber', authorAvatar: '', text: 'This looks revolutionary! 🚀', timestamp: Date.now() - 1800000 },
            { id: 'c2', author: 'PrivacyFirst', authorHandle: '@secure', authorAvatar: '', text: 'Finally a platform that cares about our data.', timestamp: Date.now() - 900000 }
        ],
        category: 'NEWS',
        tags: ['Innovation', 'Privacy', 'Ozi'],
        postedAt: Date.now() - 3600000,
        targeting: { scope: 'global' }
    },
    {
        id: 'v2',
        videoUrl: 'https://assets.mixkit.co/videos/preview/kit-high-tech-digital-circuit-board-background-4351-large.mp4',
        author: 'TechSummit',
        authorHandle: '@techsummit',
        authorAvatar: 'https://ui-avatars.com/api/?name=TS&background=553699&color=fff',
        description: 'Join us live at the Silicon Valley Tech Expo. Exploring the frontiers of digital identity and secure messaging.',
        likes: '850K',
        comments: '12',
        commentList: [
            { id: 'c3', author: 'Wanderer', authorHandle: '@globe', authorAvatar: '', text: 'Where is this? Beautiful! 😍', timestamp: Date.now() - 3600000 }
        ],
        category: 'EVENTS',
        tags: ['Expo', 'Future', 'Tech'],
        postedAt: Date.now() - 7200000,
        targeting: { scope: 'city', value: 'San Francisco' }
    }
];

const initializeData = () => {
  if (!localStorage.getItem(CONTACTS_KEY)) {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(initialContacts));
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  }
  if (!localStorage.getItem(GROUPS_KEY)) {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(initialGroups));
  }
  if (!localStorage.getItem(ADVERTISEMENTS_KEY)) {
    localStorage.setItem(ADVERTISEMENTS_KEY, JSON.stringify(initialAdvertisements));
  }
  if (!localStorage.getItem(REVENUE_KEY)) {
    localStorage.setItem(REVENUE_KEY, JSON.stringify(initialRevenueData));
  }
  if (!localStorage.getItem(CHANNEL_POSTS_KEY)) {
    localStorage.setItem(CHANNEL_POSTS_KEY, JSON.stringify(initialVideos));
  }
  if (!localStorage.getItem(SUBSCRIPTIONS_KEY)) {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify([]));
  }
};

initializeData();

export const getContacts = (): Contact[] => {
  try {
    const contactsJson = localStorage.getItem(CONTACTS_KEY);
    return contactsJson ? JSON.parse(contactsJson) : [];
  } catch (error) {
    console.error("Error getting contacts:", error);
    return [];
  }
};

export const saveContacts = (contacts: Contact[]) => {
  try {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  } catch (error) {
    console.error("Error saving contacts:", error);
  }
};

export const getGroups = (): Group[] => {
  try {
    const groupsJson = localStorage.getItem(GROUPS_KEY);
    return groupsJson ? JSON.parse(groupsJson) : [];
  } catch (error) {
    console.error("Error getting groups:", error);
    return [];
  }
};

export const saveGroups = (groups: Group[]) => {
  try {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error("Error saving groups:", error);
  }
};

export const getAdvertisements = (): Advertisement[] => {
  try {
    const adsJson = localStorage.getItem(ADVERTISEMENTS_KEY);
    const ads: Advertisement[] = adsJson ? JSON.parse(adsJson) : [];
    const now = new Date();
    return ads.filter(ad => ad.status === 'approved' && ad.expiryDate && new Date(ad.expiryDate) > now);
  } catch (error) {
    console.error("Error getting advertisements:", error);
    return [];
  }
};

export const getAllAdvertisementsForAdmin = (): Advertisement[] => {
  try {
    const adsJson = localStorage.getItem(ADVERTISEMENTS_KEY);
    return adsJson ? JSON.parse(adsJson) : [];
  } catch (error) {
    console.error("Error getting all advertisements for admin:", error);
    return [];
  }
};

export const saveAdvertisements = (ads: Advertisement[]) => {
  try {
    localStorage.setItem(ADVERTISEMENTS_KEY, JSON.stringify(ads));
  } catch (error) {
    console.error("Error saving advertisements:", error);
  }
};

export const getRevenueData = (): RevenueEntry[] => {
  try {
    const revenueJson = localStorage.getItem(REVENUE_KEY);
    return revenueJson ? JSON.parse(revenueJson) : [];
  } catch (error) {
    console.error("Error getting revenue data:", error);
    return [];
  }
};

export const saveRevenueData = (revenueData: RevenueEntry[]) => {
  try {
    localStorage.setItem(REVENUE_KEY, JSON.stringify(revenueData));
  } catch (error) {
    console.error("Error saving revenue data:", error);
  }
};

export const getSettings = (): AppSettings => {
    try {
        const settingsJson = localStorage.getItem(SETTINGS_KEY);
        return settingsJson ? { ...defaultSettings, ...JSON.parse(settingsJson) } : defaultSettings;
    } catch (error) {
        console.error("Error getting settings:", error);
        return defaultSettings;
    }
};

export const saveSettings = (settings: AppSettings) => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Error saving settings:", error);
    }
};

export const getChatMessages = (chatId: string): Message[] => {
  try {
    const messagesJson = localStorage.getItem(MESSAGES_KEY_PREFIX + chatId);
    return messagesJson ? JSON.parse(messagesJson) : [];
  } catch (error) {
    console.error(`Error getting messages for chat ${chatId}:`, error);
    return [];
  }
};

export const saveChatMessages = (chatId: string, messages: Message[]) => {
  try {
    localStorage.setItem(MESSAGES_KEY_PREFIX + chatId, JSON.stringify(messages));
  } catch (error) {
    console.error(`Error saving messages for chat ${chatId}:`, error);
  }
};

export const purgeChatMessages = (chatId: string) => {
  try {
    localStorage.removeItem(MESSAGES_KEY_PREFIX + chatId);
  } catch (error) {
    console.error(`Error purging messages for chat ${chatId}:`, error);
  }
};

export const getMyActiveStatuses = (): StatusUpdate[] => {
  try {
    const json = localStorage.getItem(MY_ACTIVE_STATUSES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
};

export const saveMyActiveStatuses = (statuses: StatusUpdate[]) => {
  localStorage.setItem(MY_ACTIVE_STATUSES_KEY, JSON.stringify(statuses));
};

export const getStatusVault = (): StatusUpdate[] => {
  try {
    const json = localStorage.getItem(STATUS_VAULT_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
};

export const saveStatusVault = (statuses: StatusUpdate[]) => {
  localStorage.setItem(STATUS_VAULT_KEY, JSON.stringify(statuses));
};

export const getUserHandle = (): string | null => {
    return localStorage.getItem(USER_HANDLE_KEY);
};

export const saveUserHandle = (handle: string) => {
    localStorage.setItem(USER_HANDLE_KEY, handle);
    const list = getUserHandlesList();
    if (!list.includes(handle)) {
        saveUserHandlesList([...list, handle]);
    }
};

export const getUserHandlesList = (): string[] => {
    const listJson = localStorage.getItem(USER_HANDLES_LIST_KEY);
    return listJson ? JSON.parse(listJson) : [];
};

export const saveUserHandlesList = (handles: string[]) => {
    localStorage.setItem(USER_HANDLES_LIST_KEY, JSON.stringify(handles));
};

export const getChannelPosts = (): VideoPost[] => {
    try {
        const postsJson = localStorage.getItem(CHANNEL_POSTS_KEY);
        return postsJson ? JSON.parse(postsJson) : initialVideos;
    } catch (e) {
        return initialVideos;
    }
};

export const saveChannelPost = (post: VideoPost) => {
    const posts = getChannelPosts();
    const updated = [post, ...posts];
    localStorage.setItem(CHANNEL_POSTS_KEY, JSON.stringify(updated));
};

export const saveCommentToPost = (postId: string, comment: Comment) => {
    const posts = getChannelPosts();
    const updated = posts.map(p => {
        if (p.id === postId) {
            const list = p.commentList || [];
            const newList = [comment, ...list];
            return {
                ...p,
                commentList: newList,
                comments: newList.length.toString()
            };
        }
        return p;
    });
    localStorage.setItem(CHANNEL_POSTS_KEY, JSON.stringify(updated));
};

export const getSubscribedHandles = (): string[] => {
    try {
        const subJson = localStorage.getItem(SUBSCRIPTIONS_KEY);
        return subJson ? JSON.parse(subJson) : [];
    } catch (e) {
        return [];
    }
};

export const saveSubscribedHandles = (handles: string[]) => {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(handles));
};
