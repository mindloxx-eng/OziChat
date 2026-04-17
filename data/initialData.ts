import type { Contact, AppSettings, Group, Advertisement, RevenueEntry } from '../types';

export const initialContacts: Contact[] = [
  { 
    id: '1', 
    name: 'Nina', 
    avatarUrl: 'https://picsum.photos/seed/1/80/80', 
    lastMessage: 'Perfect, see you then!', 
    timestamp: '11:37 AM', 
    unreadCount: 0, 
    status: 'On a mission to build beautiful things ✨', 
    phone: '+1 (555) 123-4567',
    isFavorite: true,
    location: { latitude: 37.788252, longitude: -122.432411, altitude: 42.5 }, // San Francisco
    lastActive: new Date().toISOString(), // Just now (Live)
    callHistory: [
      { id: 'c1', type: 'missed', timestamp: 'Today, 2:45 PM' },
      { id: 'c2', type: 'outgoing', timestamp: 'Today, 11:30 AM', duration: 185 }, // 3m 5s
      { id: 'c3', type: 'incoming', timestamp: 'Yesterday, 6:15 PM', duration: 420 }, // 7m 0s
    ],
    audioCodec: 'Opus',
    videoCodec: 'H.264',
    useDataSaver: false,
    notificationsMuted: false,
    notificationSound: 'Default',
    vibrationPattern: 'Default',
    moderationStatus: 'active',
    warningCount: 0,
  },
  { 
    id: '2', 
    name: 'Alex', 
    avatarUrl: 'https://picsum.photos/seed/2/80/80', 
    lastMessage: 'Check out this location.', 
    timestamp: '10:15 AM', 
    unreadCount: 2, 
    status: 'Exploring the city', 
    phone: '+1 (555) 987-6543',
    isFavorite: false,
    location: { latitude: 37.757712, longitude: -122.437651, altitude: 110.2 }, // San Francisco
    lastActive: new Date().toISOString(),
    callHistory: [
        { id: 'c4', type: 'incoming', timestamp: 'Today, 9:05 AM', duration: 55 },
        { id: 'c5', type: 'outgoing', timestamp: 'Yesterday, 8:00 PM', duration: 890 },
    ],
    audioCodec: 'Opus',
    videoCodec: 'H.264',
    useDataSaver: false,
    notificationsMuted: true,
    notificationSound: 'Default',
    vibrationPattern: 'Default',
    moderationStatus: 'active',
    isReported: true,
    reportDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Reported yesterday
    warningCount: 1,
  },
  { 
    id: '3', 
    name: 'Mom', 
    avatarUrl: 'https://picsum.photos/seed/3/80/80', 
    lastMessage: 'Don\'t forget to buy milk.', 
    timestamp: 'Yesterday', 
    unreadCount: 0, 
    status: 'Family first ❤️', 
    phone: '+1 (555) 234-5678',
    isFavorite: true,
    location: { latitude: 37.769411, longitude: -122.486222, altitude: 15.8 }, // Near Golden Gate Park
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    callHistory: [
        { id: 'c6', type: 'missed', timestamp: 'Yesterday, 5:30 PM' },
        { id: 'c7', type: 'incoming', timestamp: '2 days ago, 10:10 AM', duration: 1205 },
    ],
    audioCodec: 'AAC',
    videoCodec: 'VP9',
    useDataSaver: true,
    notificationsMuted: false,
    notificationSound: 'Chime',
    vibrationPattern: 'Long',
    moderationStatus: 'suspended',
    suspensionEndDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    warningCount: 0,
  },
  { 
    id: '4', 
    name: 'John', 
    avatarUrl: 'https://picsum.photos/seed/4/80/80', 
    lastMessage: 'Project update looks good.', 
    timestamp: 'Yesterday', 
    unreadCount: 0, 
    status: 'Coding my world.', 
    phone: '+1 (555) 345-6789',
    isFavorite: false,
    location: { latitude: 37.795433, longitude: -122.394011, altitude: 8.5 }, // Financial District
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    callHistory: [
      { id: 'c8', type: 'outgoing', timestamp: 'Yesterday, 1:20 PM', duration: 45 },
    ],
    audioCodec: 'Opus',
    videoCodec: 'H.264',
    useDataSaver: false,
    notificationsMuted: false,
    notificationSound: 'Default',
    vibrationPattern: 'Default',
    moderationStatus: 'banned',
    banDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    warningCount: 2,
  },
  { 
    id: '5', 
    name: 'Design Team', 
    avatarUrl: 'https://picsum.photos/seed/5/80/80', 
    lastMessage: 'Sarah: Can you check the latest mockups?', 
    timestamp: '2 days ago', 
    unreadCount: 1, 
    status: 'Pixel perfect designs group.', 
    phone: '+1 (555) 456-7890',
    isFavorite: false,
     location: { latitude: 37.774911, longitude: -122.419455, altitude: 31.0 }, // Civic Center
    callHistory: [
      { id: 'c9', type: 'incoming', timestamp: '2 days ago, 4:00 PM', duration: 15 },
      { id: 'c10', type: 'missed', timestamp: '3 days ago, 11:00 AM' },
    ],
    audioCodec: 'Opus',
    videoCodec: 'H.265',
    useDataSaver: false,
    notificationsMuted: false,
    notificationSound: 'Default',
    vibrationPattern: 'Default',
    moderationStatus: 'active',
    isReported: true,
    reportDate: new Date().toISOString(), // Reported today
    warningCount: 0,
  },
  { 
    id: '6', 
    name: 'Adekunle Adebayo', 
    avatarUrl: 'https://picsum.photos/seed/6/80/80', 
    lastMessage: 'The event was a success!', 
    timestamp: '3 days ago', 
    unreadCount: 0, 
    status: 'Building the future.', 
    phone: '+234 801 234 5678',
    isFavorite: false,
    location: { latitude: 9.0765, longitude: 7.3986, altitude: 480.0 }, // Abuja
    moderationStatus: 'active',
  },
  {
    id: '7',
    name: 'Sophie Williams',
    avatarUrl: 'https://picsum.photos/seed/7/80/80',
    lastMessage: 'Can we reschedule for tomorrow?',
    timestamp: '3 days ago',
    unreadCount: 0,
    status: 'Enjoying a cup of tea.',
    phone: '+44 20 7946 0958',
    isFavorite: true,
    location: { latitude: 51.5074, longitude: -0.1278, altitude: 12.0 }, // London
    moderationStatus: 'active',
  }
];

export const initialGroups: Group[] = [
  {
    id: 'g1',
    name: 'Weekend Trip',
    avatarUrl: 'https://picsum.photos/seed/g1/80/80',
    members: ['1', '2', '4'], // Nina, Alex, John
    lastMessage: 'Alex: Sounds like a plan!',
    timestamp: '11:05 AM',
    unreadCount: 1,
  },
  {
    id: 'g2',
    name: 'Project Phoenix',
    avatarUrl: 'https://picsum.photos/seed/g2/80/80',
    members: ['1', '4', '5'], // Nina, John, Design Team contact
    lastMessage: 'John: I\'ll send the updated timeline.',
    timestamp: 'Yesterday',
    unreadCount: 0,
  },
];

const now = new Date();
const createDate = (daysAgo: number) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
const createExpiryDate = (daysFromNow: number) => new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000).toISOString();


export const initialAdvertisements: Advertisement[] = [
  {
    id: 'ad1',
    title: 'Vintage Leather Sofa',
    description: 'Comfortable 3-seater vintage leather sofa. Great condition, minor wear. Perfect for any living room. Pickup only.',
    imageUrls: [
        'https://images.unsplash.com/photo-1540574163024-58ea3f3b1b58?q=80&w=800',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800',
        'https://images.unsplash.com/photo-1493663284031-b7e33ef2d92a?q=80&w=800',
    ],
    advertiserPhone: '+1 (555) 111-2222',
    website: 'https://example.com/vintage-furniture',
    postedDate: createDate(2),
    price: 450.00,
    expiryDate: createExpiryDate(5),
    targeting: { type: 'city', value: 'San Francisco' },
    status: 'approved',
    views: 125,
  },
  {
    id: 'ad2',
    title: 'Professional Camera Drone',
    description: '4K camera drone with 3 batteries and carrying case. Flown only a few times. Captures amazing aerial footage.',
    videoUrl: 'https://videos.pexels.com/video-files/1851190/1851190-sd_640_360_30fps.mp4',
    advertiserPhone: '+1 (555) 333-4444',
    website: 'https://example.com/drones-for-sale',
    postedDate: createDate(5),
    price: 799.99,
    expiryDate: createExpiryDate(2),
    targeting: { type: 'global' },
    status: 'approved',
    views: 342,
  },
  {
    id: 'ad3',
    title: 'Handmade Ceramic Mugs',
    description: 'Set of 4 beautiful handmade ceramic mugs. Each one is unique. Dishwasher and microwave safe.',
    imageUrls: ['https://images.unsplash.com/photo-1594312247936-a511a375494c?q=80&w=800'],
    advertiserPhone: '+1 (555) 555-6666',
    postedDate: createDate(0), // today
    price: 60.00,
    expiryDate: createExpiryDate(7),
    targeting: { type: 'country', value: 'USA' },
    status: 'pending',
    views: 15,
  },
  {
    id: 'ad4',
    title: 'Mountain Bike - Large Frame',
    description: 'Excellent condition mountain bike. Recently tuned up. Great for trails and city riding. Selling because I upgraded.',
    imageUrls: ['https://images.unsplash.com/photo-1511994293819-0238a9d19747?q=80&w=800'],
    advertiserPhone: '+1 (555) 777-8888',
    postedDate: createDate(9),
    price: 650.00,
    expiryDate: createDate(1), // Expired yesterday
    status: 'approved',
    views: 89,
  },
  {
    id: 'ad5',
    title: 'Used Textbooks',
    description: 'Various college textbooks, mostly STEM subjects. Contact for titles. Sold as a lot.',
    imageUrls: ['https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800'],
    advertiserPhone: '+1 (555) 999-0000',
    postedDate: createDate(3),
    price: 150.00,
    expiryDate: createExpiryDate(27),
    status: 'rejected',
    views: 45,
  },
];

export const initialRevenueData: RevenueEntry[] = [
    { id: 'rev1', contactId: '1', amount: 15.99, date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), location: 'San Francisco, CA' },
    { id: 'rev2', contactId: '2', amount: 25.00, date: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(), location: 'San Francisco, CA' },
    { id: 'rev3', contactId: '7', amount: 12.50, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), location: 'London, UK' },
    { id: 'rev4', contactId: '6', amount: 30.00, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), location: 'Abuja, NG' },
    { id: 'rev5', contactId: '3', amount: 5.00, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), location: 'San Francisco, CA' },
];


export const defaultSettings: AppSettings = {
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

  // Payment Gateways
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
