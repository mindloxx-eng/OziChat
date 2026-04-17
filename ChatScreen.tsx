

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, Contact, Group, ChatListItem, AppSettings } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { getConversationById, getGroup, getGroupPinnedMessages, pinGroupMessage, unpinGroupMessage, type ConversationDetail, type GroupData, type PinnedMessageData } from '../services/apiService';
import { isAuthenticated } from '../services/tokenService';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { VideoIcon } from './icons/VideoIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import AudioMessage from './AudioMessage';
import { UserIcon } from './icons/UserIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DoubleCheckIcon } from './icons/DoubleCheckIcon';
import { CogIcon } from './icons/CogIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
// FIX: Removed unused imports that were causing a Blob type conflict.
import { CopyIcon } from './icons/CopyIcon';
import { ReplyIcon } from './icons/ReplyIcon';
import { CloseIcon } from './icons/CloseIcon';
import { StopIcon } from './icons/StopIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';

interface ChatScreenProps {
  chat: ChatListItem;
  contacts: Contact[];
  onBack: () => void;
  onNavigateToProfile: () => void;
  onNavigateToContactDetails: () => void;
  settings: AppSettings;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ chat, contacts, onBack, onNavigateToProfile, onNavigateToContactDetails, settings }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Let's catch up this weekend!",
      sender: 'bot',
      timestamp: '11:36 AM',
      senderName: 'members' in chat ? chat.name : undefined
    },
     {
      id: '2',
      text: "Sounds great! Saturday or Sunday?",
      sender: 'user',
      timestamp: '11:36 AM',
      status: 'read',
    },
     {
      id: '3',
      text: "Saturday works for me 😄",
      sender: 'bot',
      timestamp: '11:37 AM',
      replyTo: '2',
      senderName: 'members' in chat ? chat.name : undefined
    },
    {
      id: '4',
      text: "Perfect, see you then!",
      sender: 'user',
      timestamp: '11:37 AM',
      status: 'read',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(true);

  // State for context menu
  const [contextMenu, setContextMenu] = useState<{
    message: Message;
    position: { x: number; y: number };
  } | null>(null);
  
  // State for replying to a message
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // State for voice note recording
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded'>('idle');
  // FIX: Use the global Blob type instead of window.Blob.
  const [recordedAudio, setRecordedAudio] = useState<{ url: string; blob: Blob; duration: number } | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<number | null>(null);
  
  // Refs for swipe-to-reply gesture
  const swipeStateRef = useRef<{ startX: number; startY: number; currentX: number; messageId: string; isSwiping: boolean; isHorizontal: boolean | null; } | null>(null);
  const messageRefs = useRef(new Map<string, HTMLDivElement>());

  // Refs for voice recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // FIX: Use the global Blob type instead of window.Blob.
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const createdBlobUrls = useRef<Set<string>>(new Set());
  
  // Ref for image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real conversation detail from API
  const [convDetail, setConvDetail] = useState<ConversationDetail | null>(null);
  // Group-specific data
  const [groupInfo, setGroupInfo] = useState<GroupData | null>(null);
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessageData[]>([]);

  // Fetch full conversation details on mount
  useEffect(() => {
    if (isAuthenticated() && chat.id) {
      const convId = Number(chat.id);
      if (!isNaN(convId)) {
        // Load conversation detail
        getConversationById(convId)
          .then((res) => {
            if (res.success) {
              setConvDetail(res.data);
              console.log('🟢 Conversation detail loaded:', res.data);
            }
          })
          .catch((err) => console.warn('Failed to load conversation details:', err));

        // If group chat, load group info + pinned messages
        const isGroupChat = 'members' in chat || chat.name?.includes('group');
        if (isGroupChat) {
          getGroup(convId)
            .then((res) => {
              if (res.success) {
                setGroupInfo(res.data);
                console.log('🟢 Group info loaded:', res.data);
              }
            })
            .catch((err) => console.warn('Failed to load group info:', err));

          getGroupPinnedMessages(convId)
            .then((res) => {
              if (res.success) {
                setPinnedMessages(res.data || []);
                console.log('🟢 Pinned messages loaded:', res.data);
              }
            })
            .catch((err) => console.warn('Failed to load pinned messages:', err));
        }
      }
    }
  }, [chat.id]);

  useEffect(() => {
    // On component unmount, revoke all created URLs to prevent memory leaks
    return () => {
      createdBlobUrls.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    // Function to load profile data
    const loadProfileData = () => {
      const savedAvatar = localStorage.getItem('ozichat_profile_picture');
      setUserAvatar(savedAvatar);
    };
    loadProfileData();
    window.addEventListener('storage', loadProfileData);
    
    return () => {
      window.removeEventListener('storage', loadProfileData);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to simulate read receipts
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'bot') {
        const timer = setTimeout(() => {
            setMessages(currentMessages => 
                currentMessages.map(msg => 
                    msg.sender === 'user' && msg.status !== 'read' 
                        ? { ...msg, status: settings.readReceipts ? 'read' : 'delivered' } 
                        : msg
                )
            );
        }, 1200);
        return () => clearTimeout(timer);
    }
  }, [messages, settings.readReceipts]);
  
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      ...(replyingTo && { replyTo: replyingTo.id }),
    };
    setMessages(prev => [...prev, userMessage]);
    setReplyingTo(null);
    
    // Simulate delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg));
    }, 500);

    setIsLoading(true);

    // Differentiate between group and individual chat
    const isGroupChat = 'members' in chat;

    if (isGroupChat) {
      // Simulate a reply from another group member
      setTimeout(() => {
        const otherMembers = (chat as Group).members.map(id => contacts.find(c => c.id === id)).filter(Boolean) as Contact[];
        if (otherMembers.length > 0) {
          const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `Hey, ${randomMember.name} here. Got your message!`,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderName: randomMember.name,
          };
          setMessages(prev => [...prev, botMessage]);
        }
        setIsLoading(false);
      }, 1500 + Math.random() * 1000);
    } else {
      // It's a one-on-one chat, call Gemini
      try {
        const botResponseText = await sendMessageToGemini(text, chat.name);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error("Error fetching Gemini response:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I'm having trouble connecting. Please try again later.",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [chat, replyingTo, contacts]);


  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
    setInput('');
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const imageMessage: Message = {
          id: Date.now().toString(),
          sender: 'user',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
          imageUrl,
        };
        setMessages(prev => [...prev, imageMessage]);
        
        setTimeout(() => {
          setMessages(prev => prev.map(msg => msg.id === imageMessage.id ? { ...msg, status: 'delivered' } : msg));
        }, 500);

        setIsLoading(true);
        setTimeout(async () => {
          try {
            const botResponseText = await sendMessageToGemini("Wow, cool picture!", chat.name);
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponseText,
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, botMessage]);
          } catch (error) {
            console.error("Error fetching Gemini response for image:", error);
          } finally {
            setIsLoading(false);
          }
        }, 1500);

      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
        event.target.value = '';
    }
  };
  
  // --- Voice Note Recording Handlers ---
  const cleanupRecording = useCallback(() => {
    if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
    }
    audioChunksRef.current = [];
    setRecordingState('idle');
    setRecordedAudio(null);
    setRecordingTime(0);
  }, []);

  const handleStartRecording = useCallback(async () => {
    if (isLoading) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            // FIX: Use the global Blob type instead of window.Blob.
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            createdBlobUrls.current.add(audioUrl);
            
            const audioEl = document.createElement('audio');
            audioEl.src = audioUrl;
            audioEl.onloadedmetadata = () => {
                setRecordedAudio({ url: audioUrl, blob: audioBlob, duration: audioEl.duration });
            };
            setRecordingState('recorded');
        };
        
        mediaRecorderRef.current.start();
        setRecordingState('recording');
        setRecordingTime(0);
        recordingTimerRef.current = window.setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);

    } catch (err) {
        console.error("Error starting recording:", err);
        cleanupRecording();
    }
  }, [isLoading, cleanupRecording]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
    }
  }, []);

  const handleSendAudio = useCallback(() => {
    if (!recordedAudio) return;

    const audioMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        audioUrl: recordedAudio.url,
        duration: recordedAudio.duration,
        ...(replyingTo && { replyTo: replyingTo.id }),
    };
    setMessages(prev => [...prev, audioMessage]);
    setReplyingTo(null);
    cleanupRecording();

    setTimeout(() => {
        setMessages(prev => prev.map(msg => msg.id === audioMessage.id ? { ...msg, status: 'delivered' } : msg));
    }, 500);

    setIsLoading(true);
    setTimeout(async () => {
      try {
        const botResponseText = await sendMessageToGemini("I received your voice note.", chat.name);
        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponseText,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error("Error fetching Gemini response for audio:", error);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  }, [recordedAudio, replyingTo, chat.name, cleanupRecording]);

  useEffect(() => {
      return () => cleanupRecording();
  }, [cleanupRecording]);


  // --- Swipe and Long Press Handlers ---
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, message: Message) => {
    const touch = e.touches[0];
    
    // Start long-press timer
    longPressTimerRef.current = window.setTimeout(() => {
      if (swipeStateRef.current && swipeStateRef.current.isHorizontal !== true) {
        setContextMenu({
          message,
          position: { x: touch.clientX, y: touch.clientY },
        });
        swipeStateRef.current = null; // Prevent swipe from continuing
      }
    }, 500);

    // Existing swipe logic setup
    swipeStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        messageId: message.id,
        isSwiping: true,
        isHorizontal: null,
    };
    const messageEl = messageRefs.current.get(message.id);
    if (messageEl) {
        messageEl.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!swipeStateRef.current || !swipeStateRef.current.isSwiping) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeStateRef.current.startX;
    const deltaY = touch.clientY - swipeStateRef.current.startY;
    
    // Cancel long press if user moves finger too much
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    if (swipeStateRef.current.isHorizontal === null) {
      swipeStateRef.current.isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    }
    
    if (!swipeStateRef.current.isHorizontal) return;

    e.preventDefault();
    swipeStateRef.current.currentX = touch.clientX;

    const messageEl = messageRefs.current.get(swipeStateRef.current.messageId);
    if (messageEl) {
        const constrainedDeltaX = Math.min(0, deltaX);
        const swipeAmount = Math.max(-80, constrainedDeltaX); 
        messageEl.style.transform = `translateX(${swipeAmount}px)`;
        
        const replyIcon = messageEl.nextElementSibling as HTMLElement;
        if (replyIcon) {
            const opacity = Math.min(1, Math.abs(swipeAmount) / 60);
            replyIcon.style.opacity = `${opacity}`;
        }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    }

    if (!swipeStateRef.current || !swipeStateRef.current.isSwiping) return;

    const { startX, currentX, messageId, isHorizontal } = swipeStateRef.current;
    const deltaX = currentX - startX;
    
    const messageEl = messageRefs.current.get(messageId);
    if (messageEl) {
        messageEl.style.transition = 'transform 0.2s ease-out';
        messageEl.style.transform = 'translateX(0px)';
        
        const replyIcon = messageEl.nextElementSibling as HTMLElement;
        if (replyIcon) {
            replyIcon.style.opacity = '0';
        }

        if (isHorizontal && deltaX < -60) {
            const messageToReply = messages.find(m => m.id === messageId);
            if (messageToReply) {
                setReplyingTo(messageToReply);
            }
        }
    }
    
    swipeStateRef.current = null;
  };
  
  // --- Context Menu Handler for Desktop ---
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>, message: Message) => {
    e.preventDefault();
    setContextMenu({
        message,
        position: { x: e.clientX, y: e.clientY },
    });
  }, []);

  const UserAvatar = () => (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
      {userAvatar ? (
        <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
      ) : (
        <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
      )}
    </div>
  );
  
  const MessageContextMenu = () => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    const [transform, setTransform] = useState('');
    
    useEffect(() => {
        if (contextMenu && menuRef.current) {
            const menuRect = menuRef.current.getBoundingClientRect();
            let newTransform = '';
            if (contextMenu.position.x + menuRect.width > window.innerWidth) {
                newTransform += ' translateX(-100%)';
            }
            if (contextMenu.position.y + menuRect.height > window.innerHeight) {
                newTransform += ' translateY(-100%)';
            }
            setTransform(newTransform.trim());
        }
    }, [contextMenu]);
    
    if (!contextMenu) return null;

    const handleCopy = () => {
        if (contextMenu.message.text) {
            navigator.clipboard.writeText(contextMenu.message.text)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setContextMenu(null), 1000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    setContextMenu(null);
                });
        } else {
            setContextMenu(null);
        }
    };

    const handleReply = () => {
      setReplyingTo(contextMenu.message);
      setContextMenu(null);
    };

    const isPinned = pinnedMessages.some((p) => p.messageId === contextMenu.message.id);
    const showPinOption = isGroup && isAuthenticated();

    const handlePin = async () => {
      const convId = Number(chat.id);
      if (isNaN(convId)) return;
      try {
        if (isPinned) {
          await unpinGroupMessage(convId, contextMenu.message.id);
          setPinnedMessages((prev) => prev.filter((p) => p.messageId !== contextMenu.message.id));
        } else {
          const res = await pinGroupMessage(convId, contextMenu.message.id);
          if (res.success && res.data) {
            setPinnedMessages((prev) => [...prev, res.data]);
          }
        }
      } catch (err) {
        console.warn('Pin/unpin failed:', err);
      }
      setContextMenu(null);
    };

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
            <div
                ref={menuRef}
                style={{
                    top: `${contextMenu.position.y}px`,
                    left: `${contextMenu.position.x}px`,
                    transform: transform
                }}
                className="fixed bg-gray-100 dark:bg-[#2a2a46] text-black dark:text-white rounded-lg shadow-xl z-50 p-2 w-40 border border-gray-300 dark:border-gray-600 animate-fade-in-fast"
            >
                <button
                    onClick={handleReply}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#553699] transition-colors"
                >
                    <ReplyIcon className="w-5 h-5" />
                    <span>Reply</span>
                </button>
                {contextMenu.message.text && (
                  <button
                      onClick={handleCopy}
                      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#553699] transition-colors disabled:opacity-50"
                      disabled={copied}
                  >
                      {copied ? (
                          <>
                              <CheckIcon className="w-5 h-5 text-green-500" />
                              <span>Copied!</span>
                          </>
                      ) : (
                          <>
                              <CopyIcon className="w-5 h-5" />
                              <span>Copy Text</span>
                          </>
                      )}
                  </button>
                )}
                {showPinOption && (
                  <button
                      onClick={handlePin}
                      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#553699] transition-colors"
                  >
                      <span className="w-5 h-5 flex items-center justify-center text-sm">{isPinned ? '📌' : '📌'}</span>
                      <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                  </button>
                )}
            </div>
        </>
    );
  };
  
  const ReplyPreview = () => {
    if (!replyingTo) return null;
    const senderName = replyingTo.sender === 'user' ? 'You' : (replyingTo.senderName || chat.name);
    const isUserReply = replyingTo.sender === 'user';
    return (
        <div 
            className="px-4 py-2 bg-gray-100 dark:bg-[#2a2a46] flex items-center gap-3 animate-fade-in-up-fast border-t border-gray-200 dark:border-gray-700"
            role="region"
            aria-label={`Replying to message from ${senderName}`}
        >
            <div className={`w-1 flex-shrink-0 self-stretch rounded-full ${isUserReply ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
            <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${isUserReply ? 'text-purple-500 dark:text-purple-400' : 'text-blue-500 dark:text-blue-400'}`}>{senderName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{replyingTo.text || replyingTo.imageUrl ? 'Image' : 'Audio message'}</p>
            </div>
            <button 
                onClick={() => setReplyingTo(null)} 
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
                aria-label="Cancel reply"
            >
                <CloseIcon className="w-5 h-5"/>
            </button>
        </div>
    );
  };
  
  const getWallpaperClass = () => {
    switch(settings.wallpaper) {
      case 'wallpaper1': return 'bg-[url(https://i.ibb.co/688j2d2/wallpaper1.png)]';
      case 'wallpaper2': return 'bg-[url(https://i.ibb.co/3kC201y/wallpaper2.png)] bg-cover';
      case 'wallpaper3': return 'bg-[url(https://i.ibb.co/qN252s1/wallpaper3.png)] bg-cover';
      default: return 'bg-gray-100 dark:bg-[#0D1117]';
    }
  }

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'medium':
      default:
        return 'text-base';
    }
  };
  
  const PlaybackPreview: React.FC<{ audioUrl: string; duration: number }> = ({ audioUrl, duration }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handlePlaybackEnd = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handlePlaybackEnd);
        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handlePlaybackEnd);
        };
    }, []);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) audio.pause();
        else audio.play().catch(console.error);
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex items-center gap-3 w-full">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
            <button onClick={togglePlay} className="text-gray-700 dark:text-gray-200 flex-shrink-0">
                {isPlaying ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
            </button>
            <div className="relative flex-grow h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
                <div className="absolute h-full bg-[#3F9BFF] rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">
                {new Date(currentTime * 1000).toISOString().substr(14, 5)}
            </span>
        </div>
    );
  };
  
  const isGroup = 'members' in chat || convDetail?.type === 'GROUP' || groupInfo !== null;
  const memberCount = groupInfo?.currentMemberCount ?? groupInfo?.members?.length ?? convDetail?.members?.length ?? 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1C1C2E] transition-colors duration-300">
       <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in-up-fast {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-fast { animation: fade-in-fast 0.1s ease-out forwards; }
        .animate-fade-in-up-fast { animation: fade-in-up-fast 0.2s ease-out forwards; }
        .message-bubble {
            -webkit-user-select: none; /* Safari */
            -ms-user-select: none; /* IE 10+ */
            user-select: none; /* Standard syntax */
        }
      `}</style>
      <MessageContextMenu />

      {/* Header */}
      <header className="grid grid-cols-3 items-center p-4 bg-white dark:bg-[#1C1C2E] shadow-md z-10 transition-colors duration-300">
        <div className="flex justify-start">
            <button onClick={onBack} className="text-black dark:text-white p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"><ChevronLeftIcon /></button>
        </div>
        
        <div className="flex flex-col justify-center items-center gap-0">
            <button 
              onClick={onNavigateToContactDetails} 
              className="text-center rounded-lg px-2 py-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1C1C2E] focus:ring-gray-500 dark:focus:ring-white disabled:cursor-default disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
            >
              <h2 className="text-xl font-bold text-black dark:text-white truncate">{chat.name}</h2>
              {isGroup && memberCount > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{memberCount} members</p>
              )}
            </button>
            <div className="relative group mt-1">
                <ShieldCheckIcon className={`w-4 h-4 ${isEncrypted ? 'text-green-500 dark:text-green-400' : 'text-red-500'}`} />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                    {isEncrypted ? 'End-to-end encrypted' : 'Connection not secure'}
                </div>
            </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
            <button onClick={() => alert('Video call feature is coming soon!')} className="text-black dark:text-white p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"><VideoIcon className="w-6 h-6" /></button>
            <button onClick={onNavigateToContactDetails} className="text-black dark:text-white p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" aria-label="Contact settings">
                <CogIcon className="w-6 h-6" />
            </button>
            <button onClick={onNavigateToProfile} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1C1C2E] focus:ring-gray-500 dark:focus:ring-white rounded-full" aria-label="View your profile">
                <UserAvatar />
            </button>
        </div>
      </header>

      {/* Group Announcement Banner */}
      {isGroup && groupInfo?.announcementText && (
        <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-100 dark:border-indigo-800/30 flex items-center gap-3 shrink-0">
          <span className="text-indigo-500 text-lg">📢</span>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium flex-1 truncate">{groupInfo.announcementText}</p>
        </div>
      )}

      {/* Pinned Messages Indicator */}
      {isGroup && pinnedMessages.length > 0 && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/20 flex items-center gap-2 shrink-0">
          <span className="text-amber-500 text-sm">📌</span>
          <p className="text-xs text-amber-700 dark:text-amber-300 font-bold">{pinnedMessages.length} pinned message{pinnedMessages.length > 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Messages */}
      <main className={`flex-1 overflow-y-auto p-4 space-y-2 transition-all duration-300 ${getWallpaperClass()}`}>
        {messages.map((msg) => {
           const originalMessage = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;

           return (
            <div key={msg.id} id={`message-${msg.id}`} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && <img src={chat.avatarUrl} alt={chat.name} className="w-8 h-8 rounded-full self-end mb-1"/>}
                
                {msg.sender === 'user' && (
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 self-end mb-1">
                        <span>{msg.timestamp}</span>
                        {msg.status && (
                            <span className="ml-1.5 flex-shrink-0 relative group">
                                {msg.status === 'read' ? (
                                    <DoubleCheckIcon className="w-4 h-4 text-[#4da6ff]" />
                                ) : msg.status === 'delivered' ? (
                                    <DoubleCheckIcon className="w-4 h-4 text-gray-500" />
                                ) : ( // sent
                                    <CheckIcon className="w-4 h-4 text-gray-400" />
                                )}
                                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 capitalize">
                                    {msg.status}
                                </div>
                            </span>
                        )}
                    </div>
                )}
                <div className="relative">
                    <div
                        ref={el => {
                          if (el) {
                            messageRefs.current.set(msg.id, el);
                          } else {
                            messageRefs.current.delete(msg.id);
                          }
                        }}
                        className={`max-w-xs md:max-w-md rounded-2xl message-bubble ${msg.sender === 'user' ? 'bg-[#553699] text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none dark:bg-[#2a2a46] dark:text-white'} cursor-pointer ${getFontSizeClass()} z-10 relative p-1`}
                        onTouchStart={(e) => handleTouchStart(e, msg)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onContextMenu={(e) => handleContextMenu(e, msg)}
                    >
                         {msg.imageUrl ? (
                            <img src={msg.imageUrl} alt="Sent attachment" className="max-w-xs md:max-w-md rounded-xl block" style={{ maxHeight: '300px' }} />
                        ) : (
                             <div className="px-3 py-1">
                                {isGroup && msg.sender === 'bot' && msg.senderName && <p className="font-bold text-sm text-blue-400 mb-1">{msg.senderName}</p>}
                                {originalMessage && (
                                    <button 
                                        onClick={() => document.getElementById(`message-${originalMessage.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                        className="mb-2 p-2 bg-black/10 dark:bg-black/20 rounded-lg text-left w-full hover:bg-black/20 dark:hover:bg-black/30 transition-colors"
                                    >
                                        <p className={`font-bold text-sm ${originalMessage.sender === 'user' ? 'text-purple-300' : 'text-blue-500 dark:text-blue-400'}`}>
                                            {originalMessage.sender === 'user' ? 'You' : (originalMessage.senderName || chat.name)}
                                        </p>
                                        <p className="text-sm opacity-80 line-clamp-2">{originalMessage.text || (originalMessage.imageUrl ? 'Image' : 'Audio message')}</p>
                                    </button>
                                )}
                                {msg.text && <p className="break-words">{msg.text}</p>}
                                {msg.audioUrl && msg.duration != null && <AudioMessage audioUrl={msg.audioUrl} duration={msg.duration} />}
                            </div>
                        )}
                    </div>
                    {msg.sender === 'user' && (
                        <div className="absolute inset-y-0 right-full flex items-center pr-3 opacity-0 transition-opacity">
                            <ReplyIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                    )}
                </div>
                
                {msg.sender === 'bot' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 self-end mb-1">
                        {msg.timestamp}
                    </div>
                )}

                {msg.sender === 'user' && <UserAvatar />}
            </div>
           )
        })}
        {isLoading && (
           <div className="flex items-end gap-2 justify-start">
             <img src={chat.avatarUrl} alt={chat.name} className="w-8 h-8 rounded-full"/>
             <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl bg-gray-200 dark:bg-[#2a2a46] rounded-bl-none">
                <div className="flex items-center justify-center space-x-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="bg-white dark:bg-[#1C1C2E] transition-colors duration-300">
        <ReplyPreview />
        <div className="px-4 pb-4 pt-2">
            {recordingState === 'idle' && (
                <div className="flex items-center bg-gray-100 dark:bg-black rounded-full p-2 shadow-md">
                    <button type="button" onClick={handleImageUploadClick} className="p-2 text-white bg-[#553699] rounded-full hover:bg-[#6b45bb] transition-colors flex-shrink-0"><PlusIcon /></button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <div className="flex-1 mx-2">
                        <form onSubmit={handleFormSubmit} className="w-full">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Send a message..."
                                className="w-full bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none"
                                disabled={isLoading}
                            />
                        </form>
                    </div>
                    <button 
                        type="button"
                        onClick={handleStartRecording}
                        className="p-2 text-white bg-[#3F9BFF] rounded-full hover:bg-opacity-80 transition-all duration-200 transform hover:scale-110"
                        aria-label="Record voice message"
                    >
                        <MicrophoneIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
            
            {recordingState === 'recording' && (
                <div className="flex items-center bg-gray-100 dark:bg-black rounded-full p-2 shadow-md animate-fade-in-fast">
                    <button onClick={cleanupRecording} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"><TrashIcon className="w-6 h-6" /></button>
                    <div className="flex-1 mx-4 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-mono tabular-nums">{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>
                    </div>
                    <button onClick={handleStopRecording} className="p-3 bg-red-500 text-white rounded-full transition-colors transform hover:scale-105">
                        <StopIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {recordingState === 'recorded' && recordedAudio && (
                <div className="flex items-center bg-gray-100 dark:bg-black rounded-full p-2 shadow-md animate-fade-in-fast">
                    <button onClick={cleanupRecording} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"><TrashIcon className="w-6 h-6" /></button>
                    <div className="flex-1 mx-2">
                        <PlaybackPreview audioUrl={recordedAudio.url} duration={recordedAudio.duration} />
                    </div>
                    <button onClick={handleSendAudio} className="p-3 bg-green-500 text-white rounded-full transition-colors transform hover:scale-105">
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {recordingState === 'idle' && (
                <div className="flex justify-center items-center mt-3 text-gray-400 dark:text-gray-500 text-xs">
                    <span>Powered by Ozichat</span>
                </div>
            )}
        </div>
      </footer>
    </div>
  );
};

export default ChatScreen;
