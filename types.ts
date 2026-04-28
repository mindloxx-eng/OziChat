export type Sender = 'user' | 'bot';

export interface Message {
  id: string;
  text?: string;
  cipherText?: string;
  sender: Sender;
  timestamp: string;
  audioUrl?: string;
  imageUrl?: string;
  videoUrl?: string; // Support for video messages/notes
  duration?: number;
  status?: 'sent' | 'delivered' | 'read' | 'scheduled';
  scheduledTime?: string; // ISO string for scheduled messages
  replyTo?: string; // ID of the message this is a reply to
  senderName?: string; // For group chats
  iv?: string; // Base64 encoded Initialization Vector for E2EE
  liveLocation?: {
    latitude: number;
    longitude: number;
    endTime: string; // ISO string
    isActive: boolean;
  };
  reactions?: { [emoji: string]: string[] }; // emoji -> array of sender IDs (e.g., ['user', 'bot'])
}

export type CallType = 'incoming' | 'outgoing' | 'missed';

export interface Call {
  id: string;
  type: CallType;
  timestamp: string;
  duration?: number; // in seconds
}

export interface GlobalCall extends Call {
  contactId: string;
  contactName: string;
  contactAvatarUrl: string;
  date?: Date;
}

export type AudioCodec = 'Opus' | 'AAC' | 'G.711';
export type VideoCodec = 'H.265' | 'VP9' | 'H.264';
export type VibrationPattern = 'Default' | 'Short' | 'Long' | 'Pulse';

export interface Contact {
  id: string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  status: string;
  phone: string;
  channelHandle?: string; // Unique Ozi Channel Handle
  isFavorite?: boolean;
  isBlocked?: boolean;
  callHistory?: Call[];
  audioCodec?: AudioCodec;
  videoCodec?: VideoCodec;
  useDataSaver?: boolean;
  notificationsMuted?: boolean;
  notificationSound?: string;
  vibrationPattern?: VibrationPattern;
  disappearingMessagesTimer?: number; // In hours, 0 means off
  location?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  // Advanced Tracking & Safety
  lastActive?: string; // ISO string for map tracking
  // Moderation fields
  moderationStatus?: 'active' | 'suspended' | 'banned';
  suspensionEndDate?: string; // ISO string
  banDate?: string; // ISO string
  isReported?: boolean;
  reportDate?: string; // ISO string
  warningCount?: number;
}

export interface Group {
  id: string;
  name: string;
  avatarUrl: string;
  members: string[]; // Array of contact IDs
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export type ChatListItem = Contact | Group;

export interface TranscriptionEntry {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export type GeographicScope = 'city' | 'state' | 'region' | 'country' | 'continent' | 'global';

export interface Comment {
  id: string;
  author: string;
  authorHandle: string;
  authorAvatar: string;
  text: string;
  timestamp: number;
}

export interface VideoPost {
  id: string;
  videoUrl: string;
  author: string;
  authorHandle: string;
  authorAvatar: string;
  description: string;
  likes: string;
  comments: string; // Display string e.g. "1.2K"
  commentList?: Comment[];
  category: string;
  tags: string[];
  postedAt: number;
  targeting: {
    scope: GeographicScope;
    value?: string;
  };
  // Backend-backed reel metadata (optional; present when sourced from /api/v1/reels)
  remoteId?: string;
  authorUserId?: number;
  thumbnailUrl?: string;
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewCount?: number;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrls?: string[];
  videoUrl?: string;
  advertiserPhone: string;
  website?: string;
  postedDate: string; // ISO string
  price: number;
  expiryDate: string; // ISO string
  listingDuration?: number;
  targeting?: {
    type: GeographicScope;
    value?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  views: number;
}

export interface RevenueEntry {
  id: string;
  contactId: string;
  amount: number;
  date: string; // ISO string
  location: string;
}

export interface StatusUpdate {
  id: string;
  type: 'image' | 'video' | 'text';
  contentUrl?: string; // For image/video
  text?: string; // For text status
  color?: string; // Background for text
  createdAt: number; // Timestamp in ms
  viewed: boolean;
}

// --- App Settings ---
export type Theme = 'light' | 'dark' | 'system';
export type PrivacySetting = 'everyone' | 'myContacts' | 'nobody';
export type FontSize = 'small' | 'medium' | 'large';
export type Wallpaper = 'default' | 'wallpaper1' | 'wallpaper2' | 'wallpaper3' | string;

export interface AppSettings {
  // Appearance
  theme: Theme;
  wallpaper: Wallpaper;
  fontSize: FontSize;

  // Privacy
  lastSeen: PrivacySetting;
  profilePhoto: PrivacySetting;
  readReceipts: boolean;
  groupAddPrivacy: PrivacySetting;
  statusPrivacy: PrivacySetting;

  // Notifications
  conversationTones: boolean;
  notificationSound: string;
  notificationVibration: VibrationPattern;
  
  // Data and Storage
  autoDownloadMobile: {
    photos: boolean;
    audio: boolean;
    videos: boolean;
    documents: boolean;
  };
  autoDownloadWifi: {
    photos: boolean;
    audio: boolean;
    videos: boolean;
    documents: boolean;
  };
  useLessDataForCalls: boolean;

  // Security
  twoFactorAuthentication: boolean;
  securityNotifications: boolean;
  adminEmail: string;

  // Payment Gateways
  paymentGateways: {
    stripe: {
      enabled: boolean;
      publicKey: string;
      secretKey: string; // Note: In a real app, this would be on a backend.
    };
    paypal: {
      enabled: boolean;
      clientId: string;
    };
    googlePay: {
      enabled: boolean;
      merchantId: string;
    };
  };
}