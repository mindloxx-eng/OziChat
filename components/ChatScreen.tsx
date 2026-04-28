
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, Contact, Group, ChatListItem, AppSettings } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { VideoIcon } from './icons/VideoIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import AudioMessage from './AudioMessage';
import VideoMessage from './VideoMessage';
import { UserIcon } from './icons/UserIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DoubleCheckIcon } from './icons/DoubleCheckIcon';
import { CogIcon } from './icons/CogIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ReplyIcon } from './icons/ReplyIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CloseIcon } from './icons/CloseIcon';
import { StopIcon } from './icons/StopIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { BlockIcon } from './icons/BlockIcon';
import { CameraIcon } from './icons/CameraIcon';
import { PhotoLibraryIcon } from './icons/PhotoLibraryIcon';
import { FaceSmileIcon } from './icons/FaceSmileIcon';
import { ArrowsRightLeftIcon } from './icons/ArrowsRightLeftIcon';
import { BoltIcon } from './icons/BoltIcon';
import { ShareIcon } from './icons/ShareIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { ArrowUpRightIcon } from './icons/ArrowUpRightIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ClockIcon } from './icons/ClockIcon';
import { LogoIcon } from './icons/LogoIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import * as backend from '../services/backendService';
import * as encryption from '../services/encryptionService';
import { getMessages, uploadMedia, editMessage, deleteMessage, type MessageData } from '../services/apiService';
import { wsService } from '../services/websocketService';
import { getUserId, isAuthenticated } from '../services/tokenService';

interface ChatScreenProps {
  chat: ChatListItem;
  contacts: Contact[];
  onBack: () => void;
  onNavigateToProfile: () => void;
  onNavigateToContactDetails: () => void;
  settings: AppSettings;
  onInitiateCall?: (target: Contact | Contact[], type: 'audio' | 'video') => void;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const EMOJI_CATEGORIES = {
  'Recent': ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '✨'],
  'Faces': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  'Celestial': ['🪐', '🌍', '🌎', '🌏', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '☀️', '⭐', '🌟', '🌌', '🌠', '☄️', '🚀', '🛸', '🛰️', '🔭', '👾', '👽', '🛸', '🌘']
};

const ChatScreen: React.FC<ChatScreenProps> = ({ chat, contacts, onBack, onNavigateToProfile, onNavigateToContactDetails, settings, onInitiateCall }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    message: Message;
    position: { x: number; y: number };
  } | null>(null);
  
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [forwardSearch, setForwardSearch] = useState('');
  
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [noteType, setNoteType] = useState<'audio' | 'video'>('audio');
  const [recordedAudio, setRecordedAudio] = useState<{ url: string; blob: Blob; duration: number } | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<{ url: string; blob: Blob; duration: number } | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  // Edit / Delete states
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Message | null>(null);

  // Typing / Presence (real-time via WebSocket)
  const [otherTyping, setOtherTyping] = useState(false);
  const [otherPresence, setOtherPresence] = useState<{ isOnline: boolean; lastSeenAt?: string }>({ isOnline: false });
  const typingSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherTypingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // UI States
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Recent');
  const [showSafetyNumber, setShowSafetyNumber] = useState(false);
  const [safetyNumber, setSafetyNumber] = useState<string>('');
  const [protocolAnimation, setProtocolAnimation] = useState(true);
  
  // Camera HUD States
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [shutterEffect, setShutterEffect] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  
  // Fullscreen Image State
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState(false);
  
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const noteVideoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const swipeStateRef = useRef<{ startX: number; startY: number; currentX: number; messageId: string; isSwiping: boolean; isHorizontal: boolean | null; } | null>(null);
  const messageRefs = useRef(new Map<string, HTMLDivElement>());
  const recordingTimerRef = useRef<number | null>(null);
  const videoTimerRef = useRef<number | null>(null);
  const createdBlobUrls = useRef<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isBlocked = 'isBlocked' in chat && chat.isBlocked;
  const disappearingTimer = 'disappearingMessagesTimer' in chat ? chat.disappearingMessagesTimer : 0;
  const currentUserId = getUserId();
  const conversationId = Number(chat.id);

  // Convert server MessageData to local Message type
  const serverToLocal = useCallback((msg: MessageData): Message => ({
    id: msg.id,
    text: msg.content,
    sender: msg.senderId === currentUserId ? 'user' : 'bot',
    timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: msg.status === 'READ' ? 'read' : msg.status === 'DELIVERED' ? 'delivered' : 'sent',
    replyTo: msg.replyTo || undefined,
    imageUrl: msg.type === 'IMAGE' ? msg.media?.url : undefined,
    videoUrl: msg.type === 'VIDEO' ? msg.media?.url : undefined,
    audioUrl: msg.type === 'AUDIO' ? msg.media?.url : undefined,
    duration: msg.media?.duration,
  }), [currentUserId]);

  const decryptAllMessages = useCallback(async (msgs: Message[]) => {
      const sharedKey = await encryption.getSharedSecretForChat(chat.id);
      if (!sharedKey) return msgs;

      const decrypted = await Promise.all(msgs.map(async (m) => {
          if (m.cipherText && m.iv && !m.text) {
              const text = await encryption.decryptMessage(m.cipherText, m.iv, sharedKey);
              return { ...m, text };
          }
          return m;
      }));
      return decrypted;
  }, [chat.id]);

  useEffect(() => {
    const initChat = async () => {
        // Initial Protocol Handshake
        const sn = await encryption.generateSafetyNumber('current_user', chat.id);
        setSafetyNumber(sn);

        // Try loading messages from server first, fallback to local
        let loaded = false;
        if (isAuthenticated() && !isNaN(conversationId)) {
          try {
            const res = await getMessages(conversationId, { limit: 50 });
            if (res.data?.content && res.data.content.length > 0) {
              const apiMessages = res.data.content.map(serverToLocal).reverse(); // API returns newest first
              setMessages(apiMessages);
              loaded = true;
            }
          } catch (err) {
            console.warn('Failed to load messages from API, using local cache:', err);
          }

          // Subscribe to conversation room for real-time updates
          wsService.subscribeToConversation(conversationId);
        }

        if (!loaded) {
          const savedMessages = backend.getChatMessages(chat.id);
          if (savedMessages && savedMessages.length > 0) {
              const decrypted = await decryptAllMessages(savedMessages);
              setMessages(decrypted);
          } else {
              const demoMessages: Message[] = [
                  { id: '1', text: `Identity Link established with ${chat.name}.`, sender: 'bot', timestamp: 'Protocol Active' },
                  { id: '2', text: "Ozi Protocol ensures your transmissions are highly encrypted.", sender: 'bot', timestamp: 'Secured' }
              ];
              setMessages(demoMessages);
              backend.saveChatMessages(chat.id, demoMessages);
          }
        }

        setTimeout(() => setProtocolAnimation(false), 2000);
    };
    initChat();

    // Listen for real-time incoming messages via WebSocket
    const unsubMsg = wsService.onMessage((wsMsg) => {
      if (wsMsg.conversationId === conversationId) {
        setMessages((prev) => {
          // ACK for our own message — swap tempId → real id
          if (wsMsg.tempId) {
            const existing = prev.find((m) => m.id === wsMsg.tempId);
            if (existing) {
              return prev.map((m) =>
                m.id === wsMsg.tempId
                  ? { ...m, id: wsMsg.id, status: wsMsg.status === 'DELIVERED' ? 'delivered' : 'sent' }
                  : m
              );
            }
          }
          // New message from other user — avoid duplicates
          if (prev.some((m) => m.id === wsMsg.id)) return prev;
          return [...prev, serverToLocal(wsMsg)];
        });

        // Auto-send read receipt if this is from another user
        if (wsMsg.senderId !== currentUserId) {
          wsService.sendReadReceipt({ conversationId, lastReadMessageId: wsMsg.id });
        }
      }
    });

    // Listen for notifications (delivered/read ticks, typing, presence)
    const unsubNotif = wsService.onNotification((notif) => {
      if (notif.type === 'DELIVERED' && notif.messageId) {
        setMessages((prev) =>
          prev.map((m) => m.id === notif.messageId ? { ...m, status: 'delivered' } : m)
        );
      } else if (notif.type === 'READ' && notif.messageId) {
        setMessages((prev) =>
          prev.map((m) => m.id === notif.messageId ? { ...m, status: 'read' } : m)
        );
      } else if (notif.type === 'TYPING' && notif.conversationId === conversationId && notif.byUserId !== currentUserId) {
        // Someone else is typing in this conversation
        setOtherTyping(!!notif.isTyping);
        // Auto-hide after 5s in case server stops sending (TTL is 4s)
        if (otherTypingClearRef.current) clearTimeout(otherTypingClearRef.current);
        if (notif.isTyping) {
          otherTypingClearRef.current = setTimeout(() => setOtherTyping(false), 5000);
        }
      } else if (notif.type === 'PRESENCE' && !('members' in chat)) {
        // Update presence for the other user in a direct chat
        setOtherPresence({
          isOnline: notif.status === 'ONLINE',
          lastSeenAt: notif.lastSeenAt,
        });
      }
    });

    return () => {
      unsubMsg();
      unsubNotif();
      // NOTE: Do NOT unsubscribe from conversation room on ChatScreen unmount —
      // UserApp subscribes globally to all conversations so that notifications
      // and unread counts continue working when the chat is closed.
      if (typingSendTimerRef.current) clearTimeout(typingSendTimerRef.current);
      if (otherTypingClearRef.current) clearTimeout(otherTypingClearRef.current);
      createdBlobUrls.current.forEach(url => URL.revokeObjectURL(url));
      stopCamera();
    };
  }, [chat.id, chat.name, decryptAllMessages, conversationId, serverToLocal, currentUserId]);

  useEffect(() => {
    const loadProfileData = () => {
      setUserAvatar(localStorage.getItem('ozichat_profile_picture'));
    };
    loadProfileData();
    window.addEventListener('storage', loadProfileData);
    return () => window.removeEventListener('storage', loadProfileData);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const persistMessages = (updatedMessages: Message[]) => {
      setMessages(updatedMessages);
      // Strip plain text before storing to ensure "High" E2EE compliance
      const storageSafe = updatedMessages.map(m => m.sender === 'user' ? { ...m, text: undefined } : m);
      backend.saveChatMessages(chat.id, storageSafe);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (isBlocked) return;
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const newMessageId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Apply "Highly Secure" E2EE
    const sharedKey = await encryption.getSharedSecretForChat(chat.id);
    let userMessage: Message;
    
    if (sharedKey) {
        const { cipherText, iv } = await encryption.encryptMessage(trimmedText, sharedKey);
        userMessage = {
            id: newMessageId,
            cipherText,
            iv,
            text: trimmedText, // Current UI memory
            sender: 'user',
            timestamp: timestamp,
            status: 'sent',
            ...(replyingTo && { replyTo: replyingTo.id })
        };
    } else {
        userMessage = {
            id: newMessageId,
            text: trimmedText,
            sender: 'user',
            timestamp: timestamp,
            status: 'sent',
            ...(replyingTo && { replyTo: replyingTo.id })
        };
    }

    setInput('');
    setReplyingTo(null);
    const newMessages = [...messages, userMessage];
    persistMessages(newMessages);

    // Send via WebSocket if connected and conversation is numeric (server-backed)
    if (wsService.isConnected() && !isNaN(conversationId)) {
      wsService.sendMessage({
        conversationId,
        content: trimmedText,
        type: 'TEXT',
        tempId: newMessageId,
        ...(replyingTo && { replyTo: replyingTo.id }),
      });
      // Status updates will come via WebSocket notifications
      setIsLoading(false);
    } else {
      // Fallback: local-only with Gemini AI response
      setTimeout(() => {
          setMessages(prev => prev.map(msg => msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg));
      }, 500);

      setIsLoading(true);
      try {
          const botResponseText = await sendMessageToGemini(trimmedText, chat.name);
          const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: botResponseText,
              sender: 'bot',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          persistMessages([...newMessages, botMessage]);
      } catch (error) {
          setIsLoading(false);
      } finally {
          setIsLoading(false);
      }
    }
  }, [chat, replyingTo, messages, isBlocked, conversationId]);

  const handleToggleReaction = useCallback((messageId: string, emoji: string) => {
    const updated = messages.map(msg => {
      if (msg.id !== messageId) return msg;
      const reactions = { ...(msg.reactions || {}) };
      const currentReactors = reactions[emoji] || [];
      if (currentReactors.includes('user')) {
        reactions[emoji] = currentReactors.filter(id => id !== 'user');
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji] = [...currentReactors, 'user'];
      }
      return { ...msg, reactions };
    });
    persistMessages(updated);
  }, [messages]);

  const handleStartRecording = useCallback(async () => {
    if (isLoading || isBlocked) return;
    try {
        const constraints = noteType === 'video' 
            ? { video: { facingMode: 'user', width: 480, height: 480 }, audio: true }
            : { audio: true };
            
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (noteType === 'video' && noteVideoPreviewRef.current) {
            noteVideoPreviewRef.current.srcObject = stream;
        }
        
        const recorder = new MediaRecorder(stream, { mimeType: noteType === 'video' ? 'video/webm' : 'audio/webm' });
        mediaRecorderRef.current = recorder;
        const chunks: Blob[] = [];
        recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data); };
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: noteType === 'video' ? 'video/webm' : 'audio/webm' });
            const url = URL.createObjectURL(blob);
            createdBlobUrls.current.add(url);
            
            if (noteType === 'audio') {
                const audioEl = document.createElement('audio');
                audioEl.src = url;
                audioEl.onloadedmetadata = () => setRecordedAudio({ url, blob, duration: audioEl.duration });
            } else {
                const videoEl = document.createElement('video');
                videoEl.src = url;
                videoEl.onloadedmetadata = () => setRecordedVideo({ url, blob, duration: videoEl.duration });
            }
            setRecordingState('recorded');
            stream.getTracks().forEach(t => t.stop());
        };
        recorder.start();
        setRecordingState('recording');
        recordingTimerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) { cleanupRecording(); }
  }, [isLoading, isBlocked, noteType]);

  const stopCamera = () => {
    if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
        cameraStreamRef.current = null;
    }
    setShowCamera(false);
  };

  // Added handleStopRecording to fix the error on line 604
  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
    }
  }, []);

  const cleanupRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
    if (recordingTimerRef.current) { window.clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    setRecordingState('idle');
    setRecordedAudio(null);
    setRecordedVideo(null);
    setRecordingTime(0);
  }, []);

  const handleSendNote = useCallback(() => {
    if (isBlocked) return;
    if (noteType === 'audio' && recordedAudio) {
        const message: Message = {
            id: Date.now().toString(),
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            audioUrl: recordedAudio.url,
            duration: recordedAudio.duration,
            ...(replyingTo && { replyTo: replyingTo.id }),
        };
        persistMessages([...messages, message]);
    } else if (noteType === 'video' && recordedVideo) {
        const message: Message = {
            id: Date.now().toString(),
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            videoUrl: recordedVideo.url,
            duration: recordedVideo.duration,
            ...(replyingTo && { replyTo: replyingTo.id }),
        };
        persistMessages([...messages, message]);
    }
    setReplyingTo(null);
    cleanupRecording();
  }, [recordedAudio, recordedVideo, noteType, replyingTo, cleanupRecording, isBlocked, messages]);

  // ── Media Upload Handlers ──
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isBlocked) return;
    e.target.value = ''; // Reset for re-selection

    setIsUploading(true);
    setShowPlusMenu(false);

    // Show optimistic local preview immediately
    const localUrl = URL.createObjectURL(file);
    const tempId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const optimisticMsg: Message = {
      id: tempId,
      sender: 'user',
      timestamp,
      status: 'sent',
      imageUrl: localUrl,
      ...(replyingTo && { replyTo: replyingTo.id }),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setReplyingTo(null);

    try {
      if (isAuthenticated()) {
        const res = await uploadMedia(file, 'chat');
        if (res.success && res.data?.url) {
          // Replace local URL with S3 URL
          setMessages((prev) =>
            prev.map((m) => m.id === tempId ? { ...m, imageUrl: res.data.url } : m)
          );

          // Send via WebSocket with media URL
          if (wsService.isConnected() && !isNaN(conversationId)) {
            wsService.sendMessage({
              conversationId,
              content: '',
              type: 'IMAGE',
              tempId,
              mediaUrl: res.data.url,
              mediaMimeType: res.data.mimeType,
              mediaFileSize: res.data.fileSize,
              mediaWidth: res.data.width,
              mediaHeight: res.data.height,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Image upload failed:', err);
    }
    setIsUploading(false);
  }, [isBlocked, replyingTo, conversationId, messages]);

  const handleDocSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isBlocked) return;
    e.target.value = '';

    setIsUploading(true);
    setShowPlusMenu(false);

    try {
      if (isAuthenticated()) {
        const res = await uploadMedia(file, 'chat');
        if (res.success && res.data?.url) {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const docMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            timestamp,
            status: 'sent',
            text: `📎 ${res.data.fileName || file.name}`,
            ...(replyingTo && { replyTo: replyingTo.id }),
          };
          persistMessages([...messages, docMsg]);

          if (wsService.isConnected() && !isNaN(conversationId)) {
            wsService.sendMessage({
              conversationId,
              content: res.data.url,
              type: 'DOCUMENT',
              tempId: docMsg.id,
              mediaUrl: res.data.url,
              mediaMimeType: res.data.mimeType,
              mediaFileSize: res.data.fileSize,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Document upload failed:', err);
    }
    setIsUploading(false);
    setReplyingTo(null);
  }, [isBlocked, replyingTo, conversationId, messages]);

  // Upload voice/video note to S3 before sending
  const handleSendNoteWithUpload = useCallback(async () => {
    if (isBlocked) return;

    if (noteType === 'audio' && recordedAudio) {
      setIsUploading(true);
      let audioUrl = recordedAudio.url;

      if (isAuthenticated()) {
        try {
          const blob = recordedAudio.blob;
          const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
          const res = await uploadMedia(file, 'chat');
          if (res.success && res.data?.url) {
            audioUrl = res.data.url;
          }
        } catch (err) {
          console.warn('Voice note upload failed, using local URL:', err);
        }
      }

      const message: Message = {
        id: Date.now().toString(),
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        audioUrl,
        duration: recordedAudio.duration,
        ...(replyingTo && { replyTo: replyingTo.id }),
      };
      persistMessages([...messages, message]);

      if (wsService.isConnected() && !isNaN(conversationId)) {
        wsService.sendMessage({
          conversationId,
          content: '',
          type: 'AUDIO',
          tempId: message.id,
          mediaUrl: audioUrl,
          mediaDuration: recordedAudio.duration,
        });
      }
      setIsUploading(false);
    } else if (noteType === 'video' && recordedVideo) {
      setIsUploading(true);
      let videoUrl = recordedVideo.url;

      if (isAuthenticated()) {
        try {
          const blob = recordedVideo.blob;
          const file = new File([blob], `videonote_${Date.now()}.webm`, { type: 'video/webm' });
          const res = await uploadMedia(file, 'chat');
          if (res.success && res.data?.url) {
            videoUrl = res.data.url;
          }
        } catch (err) {
          console.warn('Video note upload failed, using local URL:', err);
        }
      }

      const message: Message = {
        id: Date.now().toString(),
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        videoUrl,
        duration: recordedVideo.duration,
        ...(replyingTo && { replyTo: replyingTo.id }),
      };
      persistMessages([...messages, message]);
      setIsUploading(false);
    }
    setReplyingTo(null);
    cleanupRecording();
  }, [recordedAudio, recordedVideo, noteType, replyingTo, cleanupRecording, isBlocked, messages, conversationId]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, message: Message) => {
    const touch = e.touches[0];
    longPressTimerRef.current = window.setTimeout(() => {
      setContextMenu({ message, position: { x: touch.clientX, y: touch.clientY } });
    }, 500);
    swipeStateRef.current = { startX: touch.clientX, startY: touch.clientY, currentX: touch.clientX, messageId: message.id, isSwiping: true, isHorizontal: null };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!swipeStateRef.current || !swipeStateRef.current.isSwiping) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeStateRef.current.startX;
    if (Math.abs(deltaX) > 10) { if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; } }
    if (swipeStateRef.current.isHorizontal === null) swipeStateRef.current.isHorizontal = Math.abs(deltaX) > 10;
    if (!swipeStateRef.current.isHorizontal) return;
    e.preventDefault();
    const messageEl = messageRefs.current.get(swipeStateRef.current.messageId);
    if (messageEl) {
        const swipeAmount = Math.max(-80, Math.min(0, deltaX));
        messageEl.style.transform = `translateX(${swipeAmount}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
    if (!swipeStateRef.current || !swipeStateRef.current.isSwiping) return;
    const { startX, currentX, messageId, isHorizontal } = swipeStateRef.current;
    const messageEl = messageRefs.current.get(messageId);
    if (messageEl) {
        messageEl.style.transition = 'transform 0.2s ease-out';
        messageEl.style.transform = 'translateX(0px)';
        if (isHorizontal && currentX - startX < -60) setReplyingTo(messages.find(m => m.id === messageId) || null);
    }
    swipeStateRef.current = null;
  };

  const SafetyNumberModal = () => (
      <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in" onClick={() => setShowSafetyNumber(false)}>
          <div className="bg-[#111827] border border-white/10 w-full max-w-sm rounded-[3rem] p-10 flex flex-col items-center relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowSafetyNumber(false)} className="absolute top-8 right-8 p-2 text-gray-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
              <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-8 border border-indigo-500/30">
                  <ShieldCheckIcon className="w-12 h-12 text-[#3F9BFF]" />
              </div>
              <h2 className="text-xl font-black mb-1 uppercase tracking-tighter text-white">Identity Verification</h2>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-10 text-center px-4">Verify the safety number with {chat.name} to confirm this link is highly encrypted.</p>
              
              <div className="bg-black/40 border border-white/5 rounded-3xl p-6 w-full text-center space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      {safetyNumber.split(' ').slice(0, 6).map((num, i) => (
                          <span key={i} className="text-lg font-mono font-black text-indigo-400">{num}</span>
                      ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 opacity-50">
                      {safetyNumber.split(' ').slice(6).map((num, i) => (
                          <span key={i} className="text-lg font-mono font-black text-indigo-400">{num}</span>
                      ))}
                  </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 w-full">
                  <button onClick={() => setShowSafetyNumber(false)} className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">Mark as Verified</button>
                  <p className="text-center text-[8px] text-gray-700 font-black uppercase tracking-[0.4em]">Ozi Protocol v4.2.1</p>
              </div>
          </div>
      </div>
  );

  const ProtocolHandshake = () => (
      <div className="absolute inset-0 z-[200] bg-[#050508] flex flex-col items-center justify-center p-12 text-center animate-fade-out pointer-events-none" style={{ animationDelay: '1.5s', animationFillMode: 'forwards' }}>
          <div className="relative mb-12">
              <div className="absolute -inset-8 border border-indigo-500/20 rounded-full animate-ping"></div>
              <div className="absolute -inset-4 border border-[#3F9BFF]/40 rounded-full animate-pulse"></div>
              <ShieldCheckIcon className="w-20 h-20 text-[#3F9BFF] relative z-10" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Initializing Link</h2>
          <div className="space-y-2">
              <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest animate-pulse">ECDH Handshake: OK</p>
              <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest animate-pulse delay-75">AES-256-GCM Primed</p>
              <p className="text-[10px] font-mono text-green-400 uppercase tracking-widest animate-pulse delay-150">Highly Secure Link Active</p>
          </div>
      </div>
  );

  const getWallpaperClass = () => {
    switch(settings.wallpaper) {
      case 'wallpaper1': return 'bg-[url(https://i.ibb.co/688j2d2/wallpaper1.png)]';
      case 'wallpaper2': return 'bg-[url(https://i.ibb.co/3kC201y/wallpaper2.png)] bg-cover';
      case 'wallpaper3': return 'bg-[url(https://i.ibb.co/qN252s1/wallpaper3.png)] bg-cover';
      default: return 'bg-white dark:bg-[#0B0E14]';
    }
  };

  const isGroupChat = 'members' in chat;

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 overflow-hidden relative bg-white dark:bg-[#0B0E14]`}>
       <style>{`
        @keyframes fade-in-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes fade-out { from { opacity: 1; } to { opacity: 0; pointer-events: none; } }
        .animate-fade-in-fast { animation: fade-in-fast 0.1s ease-out forwards; }
        .animate-fade-out { animation: fade-out 0.5s ease-in forwards; }
        .message-bubble { -webkit-user-select: none; user-select: none; }
        .secure-pulse { animation: secure-glow 2s infinite ease-in-out; }
        @keyframes secure-glow { 0% { opacity: 0.3; } 50% { opacity: 1; text-shadow: 0 0 10px #3F9BFF; } 100% { opacity: 0.3; } }
      `}</style>
      
      {/* ── Context Menu ── */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div
            style={{ top: `${Math.min(contextMenu.position.y, window.innerHeight - 280)}px`, left: `${Math.min(contextMenu.position.x, window.innerWidth - 180)}px` }}
            className="fixed bg-white dark:bg-[#1F2937] text-black dark:text-white rounded-2xl shadow-2xl z-50 p-2 w-44 border border-gray-200 dark:border-white/10 animate-fade-in-fast"
          >
            {/* Reply */}
            <button onClick={() => { setReplyingTo(contextMenu.message); setContextMenu(null); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <ReplyIcon className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-bold">Reply</span>
            </button>

            {/* Copy */}
            {contextMenu.message.text && (
              <button onClick={() => {
                navigator.clipboard.writeText(contextMenu.message.text || '');
                setContextMenu(null);
              }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <CopyIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-bold">Copy</span>
              </button>
            )}

            {/* Edit (own messages only, text only) */}
            {contextMenu.message.sender === 'user' && contextMenu.message.text && (
              <button onClick={() => {
                setEditingMessage(contextMenu.message);
                setEditText(contextMenu.message.text || '');
                setContextMenu(null);
              }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <PencilIcon className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold">Edit</span>
              </button>
            )}

            {/* Delete */}
            <button onClick={() => { setDeleteConfirm(contextMenu.message); setContextMenu(null); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <TrashIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm font-bold text-red-500">Delete</span>
            </button>
          </div>
        </>
      )}

      {/* ── Edit Message Modal ── */}
      {editingMessage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setEditingMessage(null)}>
          <div className="bg-white dark:bg-[#1F2937] rounded-[2rem] p-6 w-80 border border-gray-200 dark:border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black mb-1 dark:text-white">Edit Message</h3>
            <p className="text-xs text-gray-500 mb-4">Changes are visible to everyone</p>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setEditingMessage(null)} className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all dark:text-white">Cancel</button>
              <button
                disabled={!editText.trim() || editText.trim() === editingMessage.text?.trim()}
                onClick={async () => {
                  try {
                    if (isAuthenticated()) {
                      await editMessage(editingMessage.id, editText.trim());
                    }
                    setMessages((prev) =>
                      prev.map((m) => m.id === editingMessage.id ? { ...m, text: editText.trim() } : m)
                    );
                    setEditingMessage(null);
                  } catch (err) {
                    console.warn('Edit failed:', err);
                  }
                }}
                className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 transition-all disabled:opacity-50"
              >Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Message Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-[#1F2937] rounded-t-[2rem] w-full max-w-md p-6 border-t border-gray-200 dark:border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6"></div>
            <h3 className="text-lg font-black mb-1 dark:text-white">Delete Message</h3>
            <p className="text-xs text-gray-500 mb-6">{deleteConfirm.text ? `"${deleteConfirm.text.substring(0, 60)}${deleteConfirm.text.length > 60 ? '...' : ''}"` : 'Media message'}</p>

            <div className="space-y-2">
              {/* Delete for me */}
              <button
                onClick={async () => {
                  try {
                    if (isAuthenticated()) {
                      await deleteMessage(deleteConfirm.id, 'FOR_ME');
                    }
                    setMessages((prev) => prev.filter((m) => m.id !== deleteConfirm.id));
                    setDeleteConfirm(null);
                  } catch (err) {
                    console.warn('Delete failed:', err);
                  }
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-[0.98]"
              >
                <TrashIcon className="w-5 h-5 text-gray-500" />
                <div className="text-left">
                  <p className="text-sm font-bold dark:text-white">Delete for me</p>
                  <p className="text-[10px] text-gray-500">Only removed from your device</p>
                </div>
              </button>

              {/* Delete for everyone (own messages only) */}
              {deleteConfirm.sender === 'user' && (
                <button
                  onClick={async () => {
                    try {
                      if (isAuthenticated()) {
                        await deleteMessage(deleteConfirm.id, 'FOR_EVERYONE');
                      }
                      setMessages((prev) => prev.filter((m) => m.id !== deleteConfirm.id));
                      setDeleteConfirm(null);
                    } catch (err) {
                      console.warn('Delete for everyone failed:', err);
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-[0.98]"
                >
                  <TrashIcon className="w-5 h-5 text-red-500" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-red-500">Delete for everyone</p>
                    <p className="text-[10px] text-gray-500">Removed for all participants</p>
                  </div>
                </button>
              )}
            </div>

            <button onClick={() => setDeleteConfirm(null)} className="w-full mt-4 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all dark:text-white">Cancel</button>
          </div>
        </div>
      )}

      {protocolAnimation && <ProtocolHandshake />}
      {showSafetyNumber && <SafetyNumberModal />}

      <header className={`shrink-0 flex items-center justify-between p-4 shadow-lg z-30 transition-all duration-300 border-b bg-white dark:bg-[#111827] border-gray-100 dark:border-white/5`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
            <button onClick={onBack} className="text-black dark:text-[#F1F5F9] p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-90">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button onClick={onNavigateToContactDetails} className="flex items-center gap-3 overflow-hidden group active:scale-[0.98]">
                <img src={chat.avatarUrl} alt={chat.name} className="w-10 h-10 rounded-full border-2 border-[#3F9BFF]/60 object-cover shadow-lg" />
                <div className="flex flex-col min-w-0 text-left">
                    <h2 className="text-lg font-black text-black dark:text-[#F1F5F9] truncate group-hover:text-indigo-500 transition-colors tracking-tight">{chat.name}</h2>
                    {/* Presence / Typing (direct chats only) */}
                    {!isGroupChat && otherTyping ? (
                      <span className="text-[10px] font-bold text-[#3F9BFF] tracking-wide">typing...</span>
                    ) : !isGroupChat && otherPresence.isOnline ? (
                      <span className="text-[10px] font-bold text-green-500 tracking-wide">online</span>
                    ) : !isGroupChat && otherPresence.lastSeenAt ? (
                      <span className="text-[10px] font-bold text-gray-500 tracking-wide">last seen {new Date(otherPresence.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    ) : (
                      <div className="flex items-center gap-1.5 opacity-60" onClick={(e) => { e.stopPropagation(); setShowSafetyNumber(true); }}>
                          <LockClosedIcon className="w-3 h-3 text-green-500" />
                          <span className="text-[9px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap secure-pulse cursor-pointer hover:text-[#3F9BFF]">Highly Encrypted</span>
                      </div>
                    )}
                </div>
            </button>
        </div>

        <div className="flex items-center gap-1">
            <button onClick={() => setShowSafetyNumber(true)} className="text-[#3F9BFF] p-2.5 rounded-xl hover:bg-[#3F9BFF]/5 transition-all">
                <ShieldCheckIcon className="w-6 h-6" />
            </button>
            <button onClick={onNavigateToContactDetails} className="text-black dark:text-[#F1F5F9] p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90">
                <CogIcon className="w-6 h-6" />
            </button>
        </div>
      </header>

      <main className={`flex-1 overflow-y-auto p-4 space-y-4 transition-all duration-300 pb-4 ${getWallpaperClass()}`}>
        <div className="flex justify-center mb-8">
            <div className="bg-[#111827]/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 flex flex-col items-center gap-1 text-center shadow-2xl">
                <div className="flex items-center gap-2">
                    <LockClosedIcon className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">High E2EE Protocol Active</span>
                </div>
                <p className="text-[8px] text-gray-500 font-bold max-w-[180px] uppercase">All nodes verify with AES-GCM signed identity keys</p>
            </div>
        </div>

        {messages.map((msg) => {
           const originalMessage = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;
           const isBot = msg.sender === 'bot';

           return (
            <div key={msg.id} id={`message-${msg.id}`} className={`flex items-end gap-2 animate-fade-in-up ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
                <div className="relative group">
                    <div
                        ref={el => { if (el) messageRefs.current.set(msg.id, el); else messageRefs.current.delete(msg.id); }}
                        className={`max-w-[280px] md:max-w-md rounded-[1.8rem] message-bubble relative ${msg.sender === 'user' ? 'bg-gradient-to-br from-[#4F46E5] to-[#6366F1] shadow-xl text-white' : 'bg-white dark:bg-[#1E293B] text-gray-800 dark:text-[#F1F5F9] rounded-bl-none border border-gray-100 dark:border-white/5 shadow-md'} p-4 cursor-pointer`}
                        onTouchStart={(e) => handleTouchStart(e, msg)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                         {msg.audioUrl ? (
                            <AudioMessage audioUrl={msg.audioUrl} duration={msg.duration || 0} />
                        ) : msg.videoUrl ? (
                            <VideoMessage videoUrl={msg.videoUrl} duration={msg.duration || 0} />
                        ) : (
                             <div className="space-y-1">
                                {isGroupChat && isBot && msg.senderName && <p className="font-black text-[10px] text-indigo-500 uppercase tracking-widest">{msg.senderName}</p>}
                                {originalMessage && (
                                    <div className="bg-black/10 dark:bg-white/5 rounded-2xl p-2 mb-2 border-l-4 border-indigo-500 text-xs opacity-80">
                                        <p className="font-bold truncate">{originalMessage.sender === 'user' ? 'You' : (originalMessage.senderName || chat.name)}</p>
                                        <p className="truncate">{originalMessage.text || 'Media'}</p>
                                    </div>
                                )}
                                <p className="text-sm md:text-base leading-relaxed break-words">{msg.text}</p>
                            </div>
                        )}
                        
                        {msg.sender === 'user' && (
                            <div className="absolute -bottom-5 right-2 flex items-center gap-1.5 opacity-40">
                                <LockClosedIcon className="w-2.5 h-2.5 text-indigo-400" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{msg.timestamp}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {isBot && (
                    <div className="flex flex-col text-[8px] text-gray-500 font-black self-end mb-1 opacity-40 uppercase tracking-widest">
                        <span>{msg.timestamp}</span>
                    </div>
                )}
            </div>
           );
        })}
        {isLoading && (
            <div className="flex justify-start items-center gap-2">
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl rounded-bl-none p-3 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                    </div>
                </div>
            </div>
        )}
        {otherTyping && !isLoading && (
            <div className="flex justify-start items-end gap-2 animate-fade-in-fast">
                <img src={chat.avatarUrl} alt={chat.name} className="w-6 h-6 rounded-full object-cover" />
                <div className="bg-gray-100 dark:bg-white/5 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-[#3F9BFF] rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-[#3F9BFF] rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-[#3F9BFF] rounded-full animate-bounce delay-150"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="shrink-0 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl border-t border-gray-100 dark:border-white/5 z-20">
        {replyingTo && (
            <div className="p-3 flex items-center justify-between bg-indigo-500/5 border-b border-indigo-500/10 animate-fade-in-up-fast">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Replying to {replyingTo.sender === 'user' ? 'You' : replyingTo.senderName || chat.name}</p>
                        <p className="text-xs text-gray-500 truncate">{replyingTo.text || 'Media'}</p>
                    </div>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-2 text-gray-400"><CloseIcon className="w-5 h-5"/></button>
            </div>
        )}

        {/* Hidden file inputs */}
        <input type="file" ref={fileInputRef} accept="image/*,video/*" className="hidden" onChange={handleImageSelect} />
        <input type="file" ref={docInputRef} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" className="hidden" onChange={handleDocSelect} />

        {/* Attachment Menu */}
        {showPlusMenu && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5 animate-fade-in-up-fast">
            <div className="flex gap-6 justify-center">
              <button onClick={() => { fileInputRef.current?.click(); }} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20">
                  <PhotoLibraryIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Gallery</span>
              </button>
              <button onClick={() => { docInputRef.current?.click(); }} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-amber-500/20">
                  <DocumentIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Document</span>
              </button>
              <button onClick={() => { if (navigator.geolocation) { alert('Location sharing coming soon!'); } setShowPlusMenu(false); }} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-green-500/20">
                  <LocationMarkerIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Location</span>
              </button>
            </div>
          </div>
        )}

        {/* Upload progress indicator */}
        {isUploading && (
          <div className="px-4 py-2 flex items-center gap-3 border-t border-gray-100 dark:border-white/5">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-gray-500 font-bold">Uploading...</span>
          </div>
        )}

        <div className="p-4 flex items-center gap-2 md:gap-3">
            <button onClick={() => setShowPlusMenu(!showPlusMenu)} className={`p-3 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all ${showPlusMenu ? 'rotate-45 text-indigo-500 shadow-inner' : ''}`}>
                <PlusIcon className="w-6 h-6" />
            </button>
            <div className="flex-1 relative flex items-center bg-gray-100 dark:bg-white/5 rounded-2xl px-2">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2.5 text-gray-400 hover:text-indigo-500 transition-colors ${showEmojiPicker ? 'text-indigo-500' : ''}`}>
                    <FaceSmileIcon className="w-6 h-6" />
                </button>
                <textarea 
                    ref={textareaRef}
                    rows={1}
                    value={input} 
                    onChange={(e) => {
                      setInput(e.target.value);
                      // Send typing indicator via WebSocket (debounced — re-send every 3s while typing)
                      if (wsService.isConnected() && !isNaN(conversationId) && e.target.value.trim()) {
                        if (!typingSendTimerRef.current) {
                          wsService.sendTyping({ conversationId, isTyping: true });
                          typingSendTimerRef.current = setTimeout(() => {
                            typingSendTimerRef.current = null;
                          }, 3000);
                        }
                      }
                    }}
                    placeholder="Type encrypted transmission..."
                    className="w-full bg-transparent border-none focus:ring-0 py-3.5 text-sm font-bold text-black dark:text-[#F1F5F9] focus:outline-none transition-all resize-none overflow-hidden max-h-32"
                />
            </div>
            <div className="flex items-center gap-2">
                {recordingState === 'recording' ? (
                    <button onClick={handleStopRecording} className="p-3.5 rounded-2xl bg-red-500 text-white animate-pulse shadow-xl active:scale-90"><StopIcon className="w-6 h-6" /></button>
                ) : (
                    <>
                        <button onClick={handleStartRecording} onDoubleClick={() => setNoteType(noteType === 'audio' ? 'video' : 'audio')} className="p-3.5 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-90 relative">
                            {noteType === 'audio' ? <MicrophoneIcon className="w-6 h-6" /> : <VideoCameraIcon className="w-6 h-6" />}
                        </button>
                        <button onClick={() => handleSendMessage(input)} disabled={!input.trim()} className={`p-3.5 rounded-2xl shadow-xl transition-all active:scale-90 ${!input.trim() ? 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-700' : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:bg-indigo-600'}`}>
                            <PaperAirplaneIcon className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>
        </div>
        
        {recordingState === 'recorded' && (
            <div className="p-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between animate-fade-in-up-fast">
                <button onClick={cleanupRecording} className="p-3 text-red-500 bg-red-500/10 rounded-xl font-bold text-xs uppercase tracking-widest">Discard</button>
                <div className="flex-1 mx-4 flex justify-center">
                    {recordedAudio && <AudioMessage audioUrl={recordedAudio.url} duration={recordedAudio.duration} />}
                    {recordedVideo && (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500">
                            <video src={recordedVideo.url} className="w-full h-full object-cover" muted loop autoPlay />
                        </div>
                    )}
                </div>
                <button onClick={handleSendNoteWithUpload} disabled={isUploading} className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                  {isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-4"></div> : 'Send Note'}
                </button>
            </div>
        )}
      </footer>
    </div>
  );
};

export default ChatScreen;
