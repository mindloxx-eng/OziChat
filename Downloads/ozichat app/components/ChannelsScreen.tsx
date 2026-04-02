import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import BottomNavBar, { BottomNavBarProps } from './BottomNavBar';
import { HeartIcon } from './icons/HeartIcon';
import { ShareIcon } from './icons/ShareIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { PlusIcon } from './icons/PlusIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SearchIcon } from './icons/SearchIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MapIcon } from './icons/MapIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { SpeakerXMarkIcon } from './icons/SpeakerXMarkIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CameraIcon } from './icons/CameraIcon';
import { PhotoLibraryIcon } from './icons/PhotoLibraryIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { UserIcon } from './icons/UserIcon';
import { BoltIcon } from './icons/BoltIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { UserMinusIcon } from './icons/UserMinusIcon';
import type { VideoPost, GeographicScope, Comment } from '../types';
import * as backend from '../services/backendService';

interface ChannelsScreenProps {
  navProps: BottomNavBarProps;
}

const CATEGORIES = ['Trending', 'Moments', 'News', 'Events', 'Tech', 'Life'];

const SCOPES: { id: GeographicScope; label: string; icon: any }[] = [
    { id: 'city', label: 'City', icon: MapIcon },
    { id: 'state', label: 'State', icon: MapIcon },
    { id: 'region', label: 'Region', icon: MapIcon },
    { id: 'country', label: 'Country', icon: GlobeAltIcon },
    { id: 'continent', label: 'Continent', icon: GlobeAltIcon },
    { id: 'global', label: 'Global', icon: SparklesIcon },
];

const formatCommentTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
};

const ChannelsScreen: React.FC<ChannelsScreenProps> = ({ navProps }) => {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [subscribedHandles, setSubscribedHandles] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const [activeCategory, setActiveCategory] = useState('Trending');
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showComments, setShowComments] = useState<VideoPost | null>(null);
  const [viewingAuthor, setViewingAuthor] = useState<VideoPost | null>(null);
  const [newComment, setNewComment] = useState('');
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [showAIInsight, setShowAIInsight] = useState<string | null>(null);
  const [sharedVideoId, setSharedVideoId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // --- Feed Filtering Logic ---
  const displayVideos = useMemo(() => {
    let filtered = videos;
    
    // 1. Tab Filtering: Following only shows subscribed handles
    if (activeTab === 'following') {
      filtered = filtered.filter(v => subscribedHandles.has(v.authorHandle));
    }
    
    // 2. Category Filtering: Exclude 'Trending' which acts as 'All'
    if (activeCategory !== 'Trending') {
      filtered = filtered.filter(v => v.category.toUpperCase() === activeCategory.toUpperCase());
    }
    
    return filtered;
  }, [videos, activeTab, subscribedHandles, activeCategory]);

  // Reset video index when feed changes
  useEffect(() => {
    setActiveVideoIndex(0);
  }, [activeTab, activeCategory]);

  // --- Posting State ---
  const [uploadVideoUrl, setUploadVideoUrl] = useState<string | null>(null);
  const [uploadScope, setUploadScope] = useState<GeographicScope>('global');
  const [uploadCategory, setUploadCategory] = useState('Moments');
  const [uploadDesc, setUploadDesc] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);

  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('ozichat_v_muted');
    return saved === null ? true : saved === 'true';
  });

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
        const next = !prev;
        localStorage.setItem('ozichat_v_muted', String(next));
        return next;
    });
  }, []);

  useEffect(() => {
      const posts = backend.getChannelPosts();
      setVideos(posts);
      setSubscribedHandles(new Set(backend.getSubscribedHandles()));
  }, []);

  // FIX: Explicitly typed the updater's prev parameter and the new Set constructor to ensure correct type inference.
  // This prevents the Array.from(next) result from being typed as unknown[] on line 135 (or nearby depending on formatting).
  const handleSubscribeToggle = (handle: string) => {
      setSubscribedHandles((prev: Set<string>) => {
          const next = new Set<string>(prev);
          if (next.has(handle)) {
              next.delete(handle);
          } else {
              next.add(handle);
          }
          backend.saveSubscribedHandles(Array.from(next) as string[]);
          return next;
      });
  };

  // --- Upload Handlers ---
  const handleStartRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 }, audio: true });
          streamRef.current = stream;
          if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
          
          const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
          const chunks: Blob[] = [];
          recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
          recorder.onstop = () => {
              const blob = new Blob(chunks, { type: 'video/webm' });
              const url = URL.createObjectURL(blob);
              setUploadVideoUrl(url);
              if (videoPreviewRef.current) {
                  videoPreviewRef.current.srcObject = null;
              }
          };

          mediaRecorderRef.current = recorder;
          recorder.start();
          setIsRecording(true);
          setRecordingTime(0);
          recordingIntervalRef.current = window.setInterval(() => setRecordingTime(p => p + 1), 1000);
      } catch (err) {
          console.error("Recording error:", err);
          alert("Camera access denied or high-quality capture unavailable.");
      }
  };

  const handleStopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          if (recordingIntervalRef.current) {
              clearInterval(recordingIntervalRef.current);
              recordingIntervalRef.current = null;
          }
          if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
          }
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('video/')) {
          setUploadVideoUrl(URL.createObjectURL(file));
      }
  };

  const handlePublish = async () => {
      if (!uploadDesc.trim() || !uploadVideoUrl) return;
      setIsPublishing(true);
      setPublishProgress(0);

      const processingSteps = [20, 45, 70, 95, 100];
      for (const progress of processingSteps) {
          await new Promise(r => setTimeout(r, 600));
          setPublishProgress(progress);
      }

      const name = localStorage.getItem('ozichat_display_name') || 'User';
      const handle = localStorage.getItem('ozichat_channel_handle') || '@user';
      const avatar = localStorage.getItem('ozichat_profile_picture') || '';

      const newPost: VideoPost = {
          id: `v-${Date.now()}`,
          videoUrl: uploadVideoUrl, 
          author: name,
          authorHandle: handle,
          authorAvatar: avatar,
          description: uploadDesc,
          likes: '0',
          comments: '0',
          commentList: [],
          category: uploadCategory.toUpperCase(),
          tags: [uploadCategory, 'OziHD'],
          postedAt: Date.now(),
          targeting: {
              scope: uploadScope
          }
      };

      backend.saveChannelPost(newPost);
      setVideos(prev => [newPost, ...prev]);
      
      setTimeout(() => {
          setIsPublishing(false);
          setShowUpload(false);
          setUploadDesc('');
          setUploadVideoUrl(null);
          setActiveVideoIndex(0);
          setActiveCategory(uploadCategory);
      }, 500);
  };

  const handlePostComment = () => {
      if (!newComment.trim() || !showComments) return;
      
      const author = localStorage.getItem('ozichat_display_name') || 'User';
      const handle = localStorage.getItem('ozichat_channel_handle') || '@user';
      const avatar = localStorage.getItem('ozichat_profile_picture') || '';

      const comment: Comment = {
          id: `c-${Date.now()}`,
          author,
          authorHandle: handle,
          authorAvatar: avatar,
          text: newComment,
          timestamp: Date.now()
      };

      backend.saveCommentToPost(showComments.id, comment);
      
      setVideos(prev => prev.map(v => {
          if (v.id === showComments.id) {
              const newList = [comment, ...(v.commentList || [])];
              return { ...v, commentList: newList, comments: newList.length.toString() };
          }
          return v;
      }));
      
      setShowComments(prev => {
          if (!prev) return null;
          const newList = [comment, ...(prev.commentList || [])];
          return { ...prev, commentList: newList, comments: newList.length.toString() };
      });
      
      setNewComment('');
  };

  const handleShare = async (video: VideoPost) => {
    const shareLink = `https://ozi.chat/v/${video.id}`;
    if (navigator.share) {
        try { await navigator.share({ title: 'Ozi Video', url: shareLink }); } catch (err) {}
    } else {
        await navigator.clipboard.writeText(shareLink);
        setSharedVideoId(video.id);
        setTimeout(() => setSharedVideoId(null), 2000);
    }
  };

  const VideoCard: React.FC<{ video: VideoPost, isActive: boolean, globalMuted: boolean, onToggleMute: () => void, onAuthorClick: (v: VideoPost) => void }> = ({ video, isActive, globalMuted, onToggleMute, onAuthorClick }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [progress, setProgress] = useState(0);
    const [showHeart, setShowHeart] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [statusIconType, setStatusIconType] = useState<'play' | 'pause' | 'volume' | 'mute' | null>(null);
    const lastTap = useRef<number>(0);

    useEffect(() => {
        if (isActive && !hasError) {
            videoRef.current?.play().catch(() => {
                if (videoRef.current) videoRef.current.muted = true;
                videoRef.current?.play().catch(() => setHasError(true));
            });
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    }, [isActive, hasError]);

    useEffect(() => {
        if (videoRef.current) videoRef.current.muted = globalMuted;
    }, [globalMuted]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(currentProgress);
        }
    };

    const handleInteraction = (e: React.MouseEvent) => {
        if (hasError) return;
        const now = Date.now();
        if (now - lastTap.current < 300) {
            setLikedVideos(prev => new Set(prev).add(video.id));
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 800);
        } else {
            if (globalMuted) {
                onToggleMute();
                setStatusIconType('volume');
                setTimeout(() => setStatusIconType(null), 800);
            } else {
                if (videoRef.current) {
                    if (isPlaying) {
                        videoRef.current.pause();
                        setIsPlaying(false);
                        setStatusIconType('pause');
                    } else {
                        videoRef.current.play().catch(() => {});
                        setIsPlaying(true);
                        setStatusIconType('play');
                    }
                    setTimeout(() => setStatusIconType(null), 800);
                }
            }
        }
        lastTap.current = now;
    };

    const CategoryBadge = () => {
        const cat = video.category.toUpperCase();
        let colors = 'bg-slate-500/20 text-slate-400';
        if (cat === 'NEWS') colors = 'bg-red-500/20 text-red-400 border-red-500/30';
        if (cat === 'EVENTS') colors = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        if (cat === 'MOMENTS') colors = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
        
        return (
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${colors}`}>
                {video.category}
            </span>
        );
    };

    return (
        <div className="relative h-full w-full bg-[#050505] snap-start overflow-hidden group" onClick={handleInteraction}>
            {hasError ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-600 gap-4">
                  <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl scale-110" style={{ backgroundImage: `url(https://picsum.photos/seed/${video.id}/800/1200)` }}></div>
                  <VideoCameraIcon className="w-16 h-16 opacity-30" />
                  <p className="text-[10px] font-black tracking-widest uppercase opacity-40">Media Temporarily Unavailable</p>
                </div>
            ) : (
                <video 
                    ref={videoRef}
                    src={video.videoUrl} 
                    loop playsInline muted={globalMuted}
                    onTimeUpdate={handleTimeUpdate}
                    onError={() => setHasError(true)}
                    className="w-full h-full object-cover" 
                />
            )}
            
            {showHeart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <HeartIcon className="w-32 h-32 text-red-500/80 fill-current animate-heart-pop" />
                </div>
            )}
            
            {statusIconType && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <div className="bg-black/30 p-8 rounded-full backdrop-blur-md animate-status-pop">
                        {statusIconType === 'play' && <PlayIcon className="w-12 h-12 text-white/80" />}
                        {statusIconType === 'pause' && <PauseIcon className="w-12 h-12 text-white/80" />}
                        {statusIconType === 'volume' && <SpeakerWaveIcon className="w-12 h-12 text-indigo-400/80" />}
                        {statusIconType === 'mute' && <SpeakerXMarkIcon className="w-12 h-12 text-white/80" />}
                    </div>
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/40 flex flex-col justify-end p-6 pb-24">
                <div className="flex items-end justify-between gap-4">
                    <div className="flex-1 space-y-4 max-w-[82%] animate-fade-in-up">
                        <div className="flex items-center gap-3">
                            <button onClick={(e) => { e.stopPropagation(); onAuthorClick(video); }} className="relative group/avatar active:scale-95 transition-transform">
                                <img src={video.authorAvatar || `https://ui-avatars.com/api/?name=${video.author}&background=6366F1&color=fff`} className="w-11 h-11 rounded-2xl border-2 border-indigo-500/60 shadow-lg group-hover/avatar:border-white transition-colors" alt="" />
                                <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-0.5 border border-black">
                                    <PlusIcon className="w-2.5 h-2.5 text-white" />
                                </div>
                            </button>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); onAuthorClick(video); }} className="font-black text-[#F1F5F9] text-base tracking-tight drop-shadow-lg text-left hover:text-indigo-400 transition-colors">
                                        @{video.authorHandle.replace('@','')}
                                    </button>
                                    <ShieldCheckIcon className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_8px_#6366f1]" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <CategoryBadge />
                                    <span className="text-[8px] text-white/60 font-black uppercase tracking-[0.2em] bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Ultra HD</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-100 line-clamp-2 leading-relaxed font-medium drop-shadow-lg">{video.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {video.tags?.map(t => <span key={t} className="text-[9px] font-black text-indigo-400/90 tracking-widest uppercase">#{t}</span>)}
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-6 mb-4">
                        <button onClick={(e) => { e.stopPropagation(); likedVideos.has(video.id) ? setLikedVideos(prev => { const n = new Set(prev); n.delete(video.id); return n; }) : setLikedVideos(prev => new Set(prev).add(video.id)); }} className="flex flex-col items-center gap-1 group">
                            <div className={`p-3.5 rounded-2xl backdrop-blur-xl transition-all duration-300 ${likedVideos.has(video.id) ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/10 text-white border border-white/10 group-hover:bg-white/20'}`}>
                                <HeartIcon className={`w-6 h-6 ${likedVideos.has(video.id) ? 'fill-current' : ''}`} />
                            </div>
                            <span className="text-[10px] font-black text-white/80">{video.likes}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShowComments(video); }} className="flex flex-col items-center gap-1 group">
                            <div className="p-3.5 bg-white/10 border border-white/10 rounded-2xl backdrop-blur-xl text-white group-hover:bg-white/20 transition-all">
                                <ChatBubbleIcon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-white/80">{video.comments}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleShare(video); }} className="flex flex-col items-center gap-1 group">
                            <div className={`p-3.5 rounded-2xl backdrop-blur-xl transition-all duration-300 ${sharedVideoId === video.id ? 'bg-green-500 text-white' : 'bg-white/10 text-white border border-white/10 group-hover:bg-white/20'}`}>
                                {sharedVideoId === video.id ? <CheckIcon className="w-6 h-6" /> : <ShareIcon className="w-6 h-6" />}
                            </div>
                            <span className="text-[10px] font-black text-white/80">{sharedVideoId === video.id ? 'Copied' : 'Share'}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShowAIInsight(video.id); }} className="flex flex-col items-center gap-1 group">
                            <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-violet-700 rounded-2xl shadow-xl hover:scale-110 transition-all border border-white/10">
                                <SparklesIcon className="w-6 h-6 text-white" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-20 left-0 right-0 h-0.5 bg-white/5">
                <div className="h-full bg-indigo-500 shadow-[0_0_8px_#6366f1] transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
  };

  const AuthorDetailsModal = ({ author }: { author: VideoPost }) => {
      const isSubscribed = subscribedHandles.has(author.authorHandle);

      return (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl animate-fade-in" onClick={() => setViewingAuthor(null)}>
              <div className="bg-[#0f172a] border-2 border-[#3F9BFF]/20 w-full max-w-sm rounded-[3rem] p-10 shadow-[0_0_80px_rgba(63,155,255,0.15)] relative overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                  
                  <button onClick={() => setViewingAuthor(null)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors z-20">
                      <CloseIcon className="w-6 h-6" />
                  </button>

                  <div className="flex flex-col items-center gap-6 relative z-10">
                      <div className="relative">
                          <div className="absolute -inset-4 border border-[#3F9BFF]/30 rounded-full animate-spin-slow border-dashed"></div>
                          <img src={author.authorAvatar || `https://ui-avatars.com/api/?name=${author.author}&background=6366F1&color=fff`} className="w-32 h-32 rounded-[2.5rem] border-4 border-[#3F9BFF] shadow-2xl object-cover" alt="" />
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-600 px-4 py-1 rounded-full text-[9px] font-black border-2 border-slate-900 shadow-xl tracking-[0.2em] uppercase">
                              Channel
                          </div>
                      </div>

                      <div className="text-center space-y-1.5 mt-4">
                          <h2 className="text-3xl font-black text-white tracking-tight uppercase">{author.author}</h2>
                          <div className="flex items-center justify-center gap-3">
                              <span className="text-indigo-400 font-bold text-sm tracking-tight">@{author.authorHandle.replace('@','')}</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                              <span className="text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                                  Identity Verified
                              </span>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full py-6 border-y border-white/5 my-2">
                          <div className="text-center">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Subscribers</p>
                              <p className="text-lg font-bold text-white tracking-tight">4.2M</p>
                          </div>
                          <div className="text-center">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Network Rank</p>
                              <p className="text-lg font-bold text-white tracking-tight">Top 1%</p>
                          </div>
                      </div>

                      <div className="w-full space-y-3">
                          <button 
                            className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border-2 ${isSubscribed ? 'bg-transparent border-indigo-500/40 text-indigo-400' : 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-600/20'}`}
                            onClick={() => handleSubscribeToggle(author.authorHandle)}
                          >
                              {isSubscribed ? <UserMinusIcon className="w-5 h-5" /> : <UserPlusIcon className="w-5 h-5" />}
                              {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                          </button>
                      </div>

                      <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em] mt-2">
                          Ozi Protocol Encrypted Identity
                      </p>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-[#F1F5F9] relative overflow-hidden transition-colors duration-300">
      <style>{`
        @keyframes heart-pop { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.3); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
        .animate-heart-pop { animation: heart-pop 0.8s forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes status-pop { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
        .animate-status-pop { animation: status-pop 0.8s ease-out forwards; }
        .upload-hud-glass { background: rgba(5, 5, 10, 0.98); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.05); }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        @keyframes scan { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
        .animate-scan { animation: scan 3s linear infinite; }
      `}</style>

      {/* Futuristic Sticky Header */}
      <header className="absolute top-0 left-0 right-0 z-[60] bg-gradient-to-b from-black/80 to-transparent backdrop-blur-xl pt-10 pb-4">
          <div className="flex items-center justify-between px-6 mb-8">
              <div className="flex items-center gap-3">
                  <h1 className="text-xl font-black tracking-tighter text-indigo-400">CHANNELS</h1>
              </div>
              <div className="flex gap-4">
                  <button onClick={() => setIsSearching(true)} className="p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-indigo-500/10 transition-all shadow-xl">
                      <SearchIcon className="w-5 h-5 text-slate-300" />
                  </button>
                  <button onClick={() => setShowUpload(true)} className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/30 hover:bg-indigo-500/20 transition-all group">
                      <PlusIcon className="w-5 h-5 text-indigo-400" />
                  </button>
              </div>
          </div>

          <div className="flex justify-center gap-10 mb-4">
              {['FOR YOU', 'FOLLOWING'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase() as any)}
                    className="relative px-2 py-1 group"
                  >
                      <span className={`text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === tab.toLowerCase() ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                          {tab}
                      </span>
                      {activeTab === tab.toLowerCase() && (
                          <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_12px_#6366f1] rounded-full" />
                      )}
                  </button>
              ))}
          </div>

          <div className="flex overflow-x-auto px-6 gap-3 scrollbar-hide no-scrollbar pb-2">
              {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-indigo-500/10 border-indigo-500/40 text-[#F1F5F9] shadow-sm' : 'bg-white/5 border-white/5 text-slate-400 hover:border-slate-700'}`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
      </header>

      {/* Main Video Feed */}
      <div className="flex-1 overflow-y-auto snap-y snap-mandatory h-full scrollbar-hide" onScroll={(e) => {
        const index = Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight);
        if (index !== activeVideoIndex) setActiveVideoIndex(index);
      }}>
        {displayVideos.length > 0 ? displayVideos.map((v, i) => (
            <VideoCard 
                key={v.id} 
                video={v} 
                isActive={i === activeVideoIndex} 
                globalMuted={isMuted} 
                onToggleMute={toggleMute} 
                onAuthorClick={(auth) => setViewingAuthor(auth)}
            />
        )) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-6 bg-[#050505] p-10 text-center animate-fade-in">
                {activeTab === 'following' ? (
                  <>
                    <div className="p-8 bg-indigo-500/5 rounded-full border border-indigo-500/10"><UserPlusIcon className="w-16 h-16 opacity-20 text-indigo-400" /></div>
                    <div className="space-y-2">
                      <p className="text-xl font-black text-white/80 uppercase tracking-tighter">Your following feed is quiet</p>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">Subscribe to channels in the <span className="text-indigo-400 font-bold">For You</span> tab to see their latest transmissions here.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('for-you')}
                      className="px-8 py-4 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                      Start Exploring
                    </button>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-16 h-16 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">No transmissions available in {activeCategory}</p>
                  </>
                )}
            </div>
        )}
      </div>

      {/* Author/Channel Profile Modal */}
      {viewingAuthor && <AuthorDetailsModal author={viewingAuthor} />}

      {/* Search Overlay */}
      {isSearching && (
          <div className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-3xl p-8 animate-fade-in flex flex-col text-[#F1F5F9]">
              <div className="flex justify-between items-center mb-12">
                  <h2 className="text-2xl font-black text-indigo-400 tracking-tight">SEARCH</h2>
                  <button onClick={() => setIsSearching(false)} className="p-3 bg-white/5 rounded-full"><CloseIcon className="w-6 h-6 text-white/60" /></button>
              </div>
              <input 
                autoFocus
                placeholder="Channels, Tags, or IDs..."
                className="bg-transparent border-b border-slate-800 focus:border-indigo-500 text-3xl font-black text-[#F1F5F9] focus:outline-none p-4 placeholder-white/5 transition-all mb-12"
              />
              <div className="grid grid-cols-2 gap-4 opacity-50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Current Trends</p>
                  <div className="col-span-2 space-y-4">
                      {['#Moments', '#BreakingNews', '#EventsNearMe', '#OziFuture'].map(tag => (
                          <button key={tag} className="block text-xl font-bold text-slate-400 hover:text-white transition-colors">{tag}</button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* AI Insight Modal */}
      {showAIInsight && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-xl animate-fade-in" onClick={() => setShowAIInsight(null)}>
              <div className="bg-[#1F2937] border border-white/10 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                  <button onClick={() => setShowAIInsight(null)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-slate-300"><CloseIcon className="w-5 h-5" /></button>
                  <div className="flex flex-col items-center gap-6">
                      <div className="p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20"><SparklesIcon className="w-10 h-10 text-indigo-400" /></div>
                      <h3 className="text-2xl font-black text-[#F1F5F9] text-center uppercase tracking-tighter">OZI VISION</h3>
                      <p className="text-sm text-slate-300 leading-relaxed italic text-center p-4 bg-white/5 rounded-2xl border border-white/5">"Ozi Vision engine has verified this transmission. This content aligns with your encrypted preferences and network status."</p>
                  </div>
              </div>
          </div>
      )}

      {/* Comments Slide Tray */}
      {showComments && (
          <div className="fixed inset-0 z-110 bg-slate-950/60 backdrop-blur-md flex items-end animate-fade-in" onClick={() => setShowComments(null)}>
              <div className="bg-[#111827] w-full rounded-t-[3rem] h-[82vh] flex flex-col shadow-2xl animate-fade-in-up border-t border-white/5" onClick={e => e.stopPropagation()}>
                  <div className="p-6 flex flex-col items-center">
                      <div className="w-12 h-1.5 bg-slate-800 rounded-full mb-6"></div>
                      <div className="flex items-center justify-between w-full px-2 mb-4 text-[#F1F5F9]">
                          <h3 className="font-black text-2xl tracking-tighter uppercase text-indigo-400">{showComments.comments} Community Notes</h3>
                          <button onClick={() => setShowComments(null)} className="p-3 bg-white/5 rounded-full text-white/50"><CloseIcon className="w-6 h-6" /> </button>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-8 space-y-8 pb-8 custom-scrollbar">
                      {showComments.commentList?.map(comment => (
                          <div key={comment.id} className="flex gap-4 items-start animate-fade-in">
                              <img src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${comment.author}&background=random`} className="w-11 h-11 rounded-2xl flex-shrink-0 border border-white/5" alt="" />
                              <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                      <span className="font-black text-sm text-indigo-400">@{comment.authorHandle.replace('@','')}</span>
                                      <span className="text-[10px] text-slate-600 font-bold uppercase">{formatCommentTime(comment.timestamp)}</span>
                                  </div>
                                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-3xl rounded-tl-none border border-white/5">{comment.text}</p>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="p-6 bg-slate-900/50 border-t border-white/5 pb-12">
                      <div className="bg-[#1F2937] rounded-[2rem] p-1.5 flex items-center gap-3 border border-white/5 shadow-inner transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
                          <input 
                            value={newComment} onChange={e => setNewComment(e.target.value)}
                            placeholder="Add to the conversation..."
                            className="flex-1 bg-transparent px-5 py-3 text-sm focus:outline-none placeholder-slate-600 font-bold text-[#F1F5F9]"
                            onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                          />
                          <button onClick={handlePostComment} disabled={!newComment.trim()} className="bg-indigo-600 p-4 rounded-full shadow-lg shadow-indigo-500/20 active:scale-90 transition-all disabled:opacity-20">
                              <PaperAirplaneIcon className="w-5 h-5 text-white" />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Upload View */}
      {showUpload && (
          <div className="fixed inset-0 z-[100] upload-hud-glass flex flex-col animate-fade-in text-[#F1F5F9] overflow-y-auto custom-scrollbar">
              <header className="p-6 pt-10 flex items-center justify-between border-b border-white/5 sticky top-0 bg-slate-900/90 backdrop-blur-2xl z-30">
                  <button onClick={() => { setShowUpload(false); handleStopRecording(); setUploadVideoUrl(null); }} className="p-2 hover:bg-white/5 rounded-full transition-colors"><CloseIcon className="w-6 h-6 text-slate-400" /></button>
                  <h2 className="font-black text-xl tracking-[0.1em] uppercase text-[#F1F5F9]">Deploy Transmission</h2>
                  <button 
                    onClick={handlePublish} disabled={isPublishing || !uploadVideoUrl}
                    className="bg-indigo-600 px-8 py-2.5 rounded-full font-black text-[11px] shadow-2xl shadow-indigo-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-20 transition-all"
                  >
                      {isPublishing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'POST NOW'}
                  </button>
              </header>
              
              <div className="p-6 space-y-8">
                  <div className="relative aspect-[9/16] rounded-[2.5rem] bg-black/40 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-4 overflow-hidden shadow-2xl">
                      {isRecording ? (
                          <>
                              <video ref={videoPreviewRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                              <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
                                  <div className="bg-red-600/60 px-4 py-1.5 rounded-full flex items-center gap-2 animate-pulse backdrop-blur-md border border-white/10">
                                      <div className="w-2 h-2 rounded-full bg-white" />
                                      <span className="font-mono text-[10px] font-bold tracking-widest uppercase">HD REC: {recordingTime}s</span>
                                  </div>
                                  <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[8px] font-black uppercase tracking-widest">
                                      720p // 60fps
                                  </div>
                              </div>
                              <div className="absolute inset-0 pointer-events-none border border-white/5 flex flex-col">
                                  <div className="h-1/3 border-b border-white/5 w-full"></div>
                                  <div className="h-1/3 border-b border-white/5 w-full"></div>
                              </div>
                              <button onClick={handleStopRecording} className="absolute bottom-10 p-5 bg-red-600 rounded-full shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 transition-all z-20 border-4 border-white/20">
                                  <PauseIcon className="w-8 h-8 text-white" />
                              </button>
                          </>
                      ) : uploadVideoUrl ? (
                          <>
                              <video src={uploadVideoUrl} loop autoPlay playsInline className="w-full h-full object-cover" />
                              <div className="absolute top-4 left-4 bg-indigo-500/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black border border-white/20">HD SIGNAL READY</div>
                              <button onClick={() => setUploadVideoUrl(null)} className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-red-600 rounded-full transition-colors backdrop-blur-md border border-white/10">
                                  <TrashIcon className="w-5 h-5 text-white" />
                              </button>
                          </>
                      ) : (
                          <div className="flex flex-col items-center gap-8 animate-fade-in opacity-80">
                              <div className="flex flex-col items-center gap-4 text-center">
                                  <div className="p-8 bg-indigo-500/5 rounded-full border border-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.05)] relative">
                                      <VideoCameraIcon className="w-16 h-16 text-indigo-500/40" />
                                      <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-ping opacity-20"></div>
                                  </div>
                                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">High-Quality Transcoder</p>
                              </div>
                              <div className="flex gap-4">
                                  <button onClick={handleStartRecording} className="flex flex-col items-center justify-center p-5 bg-white/5 rounded-[2.5rem] gap-3 hover:bg-indigo-500/10 transition-all active:scale-95 border border-white/5 hover:border-indigo-500/20 shadow-xl">
                                      <CameraIcon className="w-8 h-8 text-indigo-400" />
                                      <span className="font-black text-[9px] uppercase tracking-widest text-white/60">Record HD</span>
                                  </button>
                                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-5 bg-white/5 rounded-[2.5rem] gap-3 hover:bg-indigo-500/10 transition-all active:scale-95 border border-white/5 hover:border-indigo-500/20 shadow-xl">
                                      <PhotoLibraryIcon className="w-8 h-8 text-purple-400" />
                                      <span className="font-black text-[9px] uppercase tracking-widest text-white/60">Data Vault</span>
                                  </button>
                              </div>
                              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="video/*" className="hidden" />
                          </div>
                      )}

                      {/* Publishing Overlay */}
                      {isPublishing && (
                          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                              <div className="w-24 h-24 relative mb-8">
                                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                                  <div 
                                    className="absolute inset-0 border-4 border-indigo-500 rounded-full transition-all duration-300"
                                    style={{ clipPath: `inset(0 0 ${100 - publishProgress}% 0)` }}
                                  ></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <SparklesIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
                                  </div>
                                  <div className="absolute -inset-4 border border-white/5 rounded-full animate-spin-slow"></div>
                              </div>
                              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Refining Signal</h3>
                              <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Processing High-Fidelity Ozi Protocol Transmission</p>
                              
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-2">
                                  <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${publishProgress}%` }}></div>
                              </div>
                              <span className="text-[10px] font-mono text-indigo-400">{publishProgress}% UPLOADED</span>
                              
                              <div className="absolute inset-x-0 top-0 h-20 bg-indigo-500/20 blur-[100px] pointer-events-none"></div>
                              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                                  <div className="w-full h-px bg-white animate-scan"></div>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Description</label>
                        <textarea 
                            value={uploadDesc} onChange={e => setUploadDesc(e.target.value)}
                            placeholder="What's happening? Use #tags for global discovery..." 
                            className="w-full bg-[#0a0a14] rounded-[2rem] p-6 text-base font-bold focus:outline-none border border-white/5 h-32 resize-none shadow-inner focus:border-indigo-500/20 transition-all text-[#F1F5F9] placeholder-white/10"
                        />
                      </div>

                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Transmission Category</label>
                          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                              {['Moments', 'News', 'Events', 'Life', 'Tech'].map(cat => (
                                  <button 
                                      key={cat} onClick={() => setUploadCategory(cat)}
                                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${uploadCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:border-slate-700'}`}
                                  >
                                      {cat}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Discovery Range</label>
                          <div className="grid grid-cols-3 gap-3">
                              {SCOPES.map(scope => {
                                  const Icon = scope.icon;
                                  return (
                                    <button 
                                        key={scope.id} onClick={() => setUploadScope(scope.id)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 transition-all gap-2 ${uploadScope === scope.id ? 'bg-indigo-500/10 border-indigo-500/40 shadow-xl' : 'bg-white/5 border-white/5 text-slate-600 hover:border-slate-800'}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">{scope.label}</span>
                                    </button>
                                  );
                              })}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <BottomNavBar {...navProps} />
    </div>
  );
};

export default ChannelsScreen;