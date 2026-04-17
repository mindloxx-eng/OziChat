
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Contact, Advertisement } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ShareIcon } from './icons/ShareIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';
import { UserIcon } from './icons/UserIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { VideoIcon } from './icons/VideoIcon';
import { SunIcon } from './icons/SunIcon';
import { LayersIcon } from './icons/LayersIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ClockIcon } from './icons/ClockIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BoltIcon } from './icons/BoltIcon';
import { WifiIcon } from './icons/WifiIcon';
import { StoreIcon } from './icons/StoreIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { getAIBriefing } from '../services/geminiService';

interface AugmentedAd extends Advertisement {
    mapLocation: {
        latitude: number;
        longitude: number;
    };
}

const MAP_BOUNDS = {
  lat: { min: 37.7, max: 37.82 },
  lng: { min: -122.5, max: -122.35 },
};

type MapLayer = 'tactical' | 'satellite';
type RadarFilter = 'all' | 'friends' | 'marketplace';

interface AtmosphericData {
    city: string;
    condition: string;
    temp: number;
    feelsLike: number;
    humidity: number;
    wind: number;
    pressure: string;
    visibility: string;
    uvIndex: number;
    cloudCover: number;
    stability: string;
    briefing?: string;
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

interface MapScreenProps {
  contacts: Contact[];
  advertisements: Advertisement[];
  onBack: () => void;
  onSelectContact: (contact: Contact) => void;
  onInitiateCall: (target: Contact | Contact[], type: 'audio' | 'video') => void;
  onAddContact: (contact: Contact) => void;
  onNavigateToAd: (ad: Advertisement) => void;
}

const MapScreen: React.FC<MapScreenProps> = ({ contacts, advertisements, onBack, onSelectContact, onInitiateCall, onAddContact, onNavigateToAd }) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number, altitude: number } | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedAd, setSelectedAd] = useState<AugmentedAd | null>(null);
  const [zoom, setZoom] = useState(1.2);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeLayer, setActiveLayer] = useState<MapLayer>('tactical');
  const [showLayerSelector, setShowLayerSelector] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [showWeatherHub, setShowWeatherHub] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [radarEnabled, setRadarEnabled] = useState(true);
  const [radarFilter, setRadarFilter] = useState<RadarFilter>('all');
  const [radarRotation, setRadarRotation] = useState(0);
  const [detectedIds, setDetectedIds] = useState<Set<string>>(new Set());

  const [atmosphericData, setAtmosphericData] = useState<AtmosphericData>({
      city: 'San Francisco',
      condition: 'Optimal',
      temp: 72,
      feelsLike: 70,
      humidity: 42,
      wind: 8,
      pressure: '1012 hPa',
      visibility: '12.5 mi',
      uvIndex: 4,
      cloudCover: 15,
      stability: 'Class A'
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const adLocations = useMemo<AugmentedAd[]>(() => {
      return advertisements.map((ad, i) => ({
          ...ad,
          mapLocation: {
              latitude: MAP_BOUNDS.lat.min + (MAP_BOUNDS.lat.max - MAP_BOUNDS.lat.min) * (0.2 + (i * 0.15) % 0.6),
              longitude: MAP_BOUNDS.lng.min + (MAP_BOUNDS.lng.max - MAP_BOUNDS.lng.min) * (0.3 + (i * 0.2) % 0.5)
          }
      }));
  }, [advertisements]);

  useEffect(() => {
    setUserAvatar(localStorage.getItem('ozichat_profile_picture'));
  }, []);

  useEffect(() => {
    const geo = navigator.geolocation;
    if (!geo) return;
    const watcher = geo.watchPosition(
      (pos) => {
          setUserLocation({ 
              latitude: pos.coords.latitude, 
              longitude: pos.coords.longitude, 
              altitude: pos.coords.altitude || 32.4 
          });
      },
      () => {
          setUserLocation({ latitude: 37.774929, longitude: -122.419416, altitude: 45.2 });
      },
      { enableHighAccuracy: true }
    );
    return () => geo.clearWatch(watcher);
  }, []);

  useEffect(() => {
    if (!radarEnabled || !userLocation) return;
    
    let frame: number;
    const animate = () => {
        setRadarRotation(prev => (prev + 1.5) % 360);
        frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [radarEnabled, userLocation]);

  useEffect(() => {
      if (!radarEnabled || !userLocation) return;

      const userPos = project(userLocation.latitude, userLocation.longitude);
      
      const checkDetection = (lat: number, lng: number, id: string) => {
          const pos = project(lat, lng);
          const angle = Math.atan2(pos.y - userPos.y, pos.x - userPos.x) * (180 / Math.PI) + 180;
          const diff = Math.abs((radarRotation % 360) - angle);
          if (diff < 10 || diff > 350) {
              setDetectedIds(prev => {
                  if (prev.has(id)) return prev;
                  const next = new Set(prev);
                  next.add(id);
                  return next;
              });
              setTimeout(() => {
                  setDetectedIds(prev => {
                      const next = new Set(prev);
                      next.delete(id);
                      return next;
                  });
              }, 1200);
          }
      };

      if (radarFilter === 'all' || radarFilter === 'friends') {
          contacts.forEach(c => c.location && checkDetection(c.location.latitude, c.location.longitude, c.id));
      }
      if (radarFilter === 'all' || radarFilter === 'marketplace') {
          adLocations.forEach(ad => checkDetection(ad.mapLocation.latitude, ad.mapLocation.longitude, ad.id));
      }

  }, [radarRotation, radarEnabled, userLocation, contacts, adLocations, radarFilter]);

  const project = (lat: number, lng: number) => {
    const latRange = MAP_BOUNDS.lat.max - MAP_BOUNDS.lat.min;
    const lngRange = MAP_BOUNDS.lng.max - MAP_BOUNDS.lng.min;
    const y = 100 - ((lat - MAP_BOUNDS.lat.min) / latRange) * 100;
    const x = ((lng - MAP_BOUNDS.lng.min) / lngRange) * 100;
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handlePointerUp = () => {
      isDragging.current = false;
  };

  const handleBroadcastToggle = () => {
      setIsBroadcasting(prev => !prev);
  };

  const handleSOSToggle = () => {
      setIsSOSActive(prev => !prev);
  };

  const handleGenerateBriefing = async () => {
      setIsAnalyzing(true);
      const briefing = await getAIBriefing(atmosphericData);
      setAtmosphericData(prev => ({ ...prev, briefing }));
      setIsAnalyzing(false);
  };

  const distanceToSelected = useMemo(() => {
      if (!userLocation || !selectedContact || !selectedContact.location) return null;
      return calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          selectedContact.location.latitude,
          selectedContact.location.longitude
      );
  }, [userLocation, selectedContact]);

  const WeatherHubModal = () => (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in" onClick={() => setShowWeatherHub(false)}>
          <div className="bg-[#0f172a]/90 border-2 border-[#3F9BFF]/30 w-full max-w-lg rounded-[3rem] p-8 shadow-[0_0_80px_rgba(63,155,255,0.2)] relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_bottom,transparent_50%,rgba(63,155,255,0.1)_50%)] bg-[length:100%_4px] animate-pulse" />
              <button onClick={() => setShowWeatherHub(false)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors z-20">
                  <CloseIcon className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                      <SunIcon className="w-10 h-10 text-[#3F9BFF] animate-spin-slow" />
                  </div>
                  <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Atmospheric Analysis</h2>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">{atmosphericData.city} // LOCAL GRID</p>
                  </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Temp</span>
                      <span className="text-2xl font-bold">{atmosphericData.temp}°</span>
                  </div>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Wind</span>
                      <span className="text-xl font-bold">{atmosphericData.wind} <span className="text-[10px]">mph</span></span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">UV Index</span>
                      <span className="text-xl font-bold">{atmosphericData.uvIndex}</span>
                  </div>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Visibility</span>
                      <span className="text-xl font-bold">Clear</span>
                  </div>
              </div>
              <div className="bg-[#1e293b]/40 rounded-3xl p-6 border border-[#3F9BFF]/10 relative min-h-[120px] flex flex-col items-center justify-center text-center">
                  {atmosphericData.briefing ? (
                      <div className="animate-fade-in">
                          <p className="text-[10px] font-black text-[#3F9BFF] uppercase tracking-[0.3em] mb-3">Tactical Briefing Received</p>
                          <p className="text-sm text-slate-200 leading-relaxed italic">"{atmosphericData.briefing}"</p>
                      </div>
                  ) : (
                      <button 
                        onClick={handleGenerateBriefing}
                        disabled={isAnalyzing}
                        className="flex flex-col items-center gap-3 group"
                      >
                          <div className={`p-4 bg-[#3F9BFF]/10 rounded-full transition-all ${isAnalyzing ? 'animate-ping' : 'group-hover:scale-110'}`}>
                              <SparklesIcon className="w-8 h-8 text-[#3F9BFF]" />
                          </div>
                          <span className="text-xs font-black text-white uppercase tracking-widest">
                              {isAnalyzing ? 'Analyzing Grid Conditions...' : 'Generate AI Briefing'}
                          </span>
                      </button>
                  )}
              </div>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#020205] text-white overflow-hidden relative font-mono select-none">
      <style>{`
        .grid-background {
            background-image: linear-gradient(rgba(99, 102, 241, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.08) 1px, transparent 1px);
            background-size: 60px 60px;
            mask-image: radial-gradient(circle at center, black 30%, transparent 95%);
        }
        .satellite-texture { background: url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop'); background-size: cover; background-position: center; filter: contrast(1.2) brightness(0.6) saturate(1.1); }
        .hud-scanline { background: linear-gradient(to bottom, transparent 50%, rgba(255, 255, 255, 0.02) 50%); background-size: 100% 4px; }
        .sidebar-hud-btn { @apply w-14 h-14 bg-black/60 backdrop-blur-xl border border-white/10 rounded-[1.4rem] flex items-center justify-center transition-all shadow-2xl active:scale-90 hover:bg-white/5; }
        @keyframes ping-glow { 0% { box-shadow: 0 0 0px 0px rgba(63, 155, 255, 0.5); } 100% { box-shadow: 0 0 20px 15px rgba(63, 155, 255, 0); } }
        .marker-ping { animation: ping-glow 1s ease-out; }
        .radar-sweep {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 2000px;
            height: 2000px;
            margin-left: -1000px;
            margin-top: -1000px;
            background: conic-gradient(from 0deg, rgba(63, 155, 255, 0.3) 0deg, rgba(63, 155, 255, 0.1) 15deg, transparent 35deg);
            pointer-events: none;
            z-index: 5;
            mask-image: radial-gradient(circle at center, black 10%, transparent 40%);
        }
        @keyframes radar-pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
        .radar-wave { position: absolute; width: 100px; height: 100px; border: 2px solid #3F9BFF; border-radius: 50%; margin-left: -50px; margin-top: -50px; animation: radar-pulse 3s infinite; }
        
        @keyframes sos-pulse { 0% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { transform: scale(1.4); opacity: 0; box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); } 100% { transform: scale(1); opacity: 0; } }
        .animate-sos-ring { animation: sos-pulse 1.5s infinite; }
        .emergency-hud { background: radial-gradient(circle at center, transparent 40%, rgba(239, 68, 68, 0.15) 100%); pointer-events: none; }
      `}</style>

      {showWeatherHub && <WeatherHubModal />}
      
      {isSOSActive && <div className="absolute inset-0 z-[45] emergency-hud animate-pulse" />}

      <div className="absolute inset-0 hud-scanline pointer-events-none z-10 opacity-30"></div>

      <header className="absolute left-0 right-0 p-6 z-40 flex items-start justify-between pointer-events-none top-0">
        <div className="flex gap-3 pointer-events-auto">
            <button onClick={onBack} className="bg-black/60 p-3 rounded-2xl border border-white/10 text-white backdrop-blur-xl shadow-2xl active:scale-90 hover:bg-white/5 transition-all">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="flex flex-col items-end gap-3 pointer-events-auto">
            {isSOSActive && (
                <div className="bg-red-600/90 px-4 py-2 rounded-xl border border-red-400 flex items-center gap-2 animate-bounce shadow-2xl">
                    <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">SOS PROTOCOL ENGAGED</span>
                </div>
            )}
            <div className="bg-black/60 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-xl flex flex-col items-end gap-1 shadow-xl min-w-[240px]">
                 <div className="flex items-center gap-2 w-full justify-between">
                     <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${radarEnabled ? 'bg-[#00FF9D]' : 'bg-blue-500'}`}></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {radarEnabled ? 'RADAR: SCANNING' : 'LINK: SECURE'}
                        </span>
                     </div>
                     <span className="text-[8px] font-black text-[#00FF9D] uppercase tracking-tighter">GPS HD-ACTIVE</span>
                 </div>
                 <div className="w-full h-px bg-white/10 my-1"></div>
                 <div className="flex flex-col items-end text-blue-400 font-mono text-[9px] leading-tight font-bold">
                     <div className="flex gap-2">
                        <span className="text-slate-500">LAT:</span>
                        <span>{userLocation?.latitude.toFixed(6) || '---.------'}</span>
                     </div>
                     <div className="flex gap-2">
                        <span className="text-slate-500">LNG:</span>
                        <span>{userLocation?.longitude.toFixed(6) || '---.------'}</span>
                     </div>
                     <div className="flex gap-2 mt-1 pt-1 border-t border-white/5 w-full justify-end">
                        <span className="text-slate-500">ALT:</span>
                        <span className="text-[#00FF9D]">{userLocation?.altitude?.toFixed(1) || '0.0'}m</span>
                     </div>
                 </div>
            </div>
            <button 
                onClick={() => setShowWeatherHub(true)}
                className="bg-black/60 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-xl flex items-center gap-3 shadow-xl hover:bg-white/10 transition-colors"
            >
                <SunIcon className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">{atmosphericData.temp}° / {atmosphericData.condition}</span>
            </button>
        </div>
      </header>

      <main 
        ref={mapRef}
        className="flex-1 relative overflow-hidden bg-[#020205]"
        onPointerDown={handlePointerDown} 
        onPointerMove={handlePointerMove} 
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="absolute inset-[-200%] w-[500%] h-[500%] transition-transform duration-75" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
            {activeLayer === 'tactical' ? (
                <div className="w-full h-full grid-background opacity-100"></div>
            ) : (
                <div className="w-full h-full satellite-texture shadow-inner"></div>
            )}
        </div>

        <div className="absolute inset-0 w-full h-full transition-transform duration-75" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
            {radarEnabled && userLocation && !isSOSActive && (
                <div 
                    className="radar-sweep" 
                    style={{ 
                        left: `${project(userLocation.latitude, userLocation.longitude).x}%`, 
                        top: `${project(userLocation.latitude, userLocation.longitude).y}%`,
                        transform: `rotate(${radarRotation}deg)`
                    }} 
                />
            )}

            {userLocation && (() => {
                const pos = project(userLocation.latitude, userLocation.longitude);
                return (
                    <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
                        {isSOSActive ? (
                            <>
                                <div className="absolute inset-0 rounded-full border-[6px] border-red-600 animate-sos-ring" style={{ width: '120px', height: '120px', marginLeft: '-60px', marginTop: '-60px' }} />
                                <div className="absolute inset-0 rounded-full border-[2px] border-red-500 animate-sos-ring delay-700" style={{ width: '200px', height: '200px', marginLeft: '-100px', marginTop: '-100px' }} />
                                <div className={`relative w-24 h-24 rounded-[2.8rem] p-1.5 overflow-hidden transition-all duration-300 shadow-[0_0_40px_rgba(220,38,38,0.8)] bg-red-600 ring-4 ring-white animate-pulse`}>
                                    <div className="w-full h-full rounded-[2.4rem] overflow-hidden bg-red-950 border-2 border-white/20 flex items-center justify-center">
                                        {userAvatar ? (
                                            <img src={userAvatar} className="w-full h-full object-cover grayscale opacity-50" alt="SOS" />
                                        ) : (
                                            <UserIcon className="w-10 h-10 text-white/50" />
                                        )}
                                        <ExclamationTriangleIcon className="absolute w-12 h-12 text-white animate-ping" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="radar-wave" style={{ animationDelay: '0s' }}></div>
                                <div className="radar-wave" style={{ animationDelay: '1s' }}></div>
                                <div className={`relative w-20 h-20 rounded-[2.5rem] p-1 overflow-hidden transition-all duration-500 shadow-2xl ${radarEnabled ? 'bg-[#00FF9D]' : 'bg-[#3F9BFF]'}`}>
                                    <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-[#1C1C2E] border-2 border-white/20">
                                        {userAvatar ? (
                                            <img src={userAvatar} className="w-full h-full object-cover" alt="Me" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-900/40">
                                                <UserIcon className="w-8 h-8 text-white/50" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            })()}

            {(radarFilter === 'all' || radarFilter === 'friends') && contacts.map(contact => {
                if (!contact.location) return null;
                const pos = project(contact.location.latitude, contact.location.longitude);
                const isSelected = selectedContact?.id === contact.id;
                const isDetected = detectedIds.has(contact.id);

                return (
                    <button 
                        key={contact.id} 
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 focus:outline-none transition-all duration-1000 ${isDetected ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`} 
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }} 
                        onClick={() => { setSelectedContact(contact); setSelectedAd(null); }}
                    >
                        <div className={`relative w-14 h-14 rounded-3xl border-2 overflow-hidden bg-black transition-all ${isSelected ? 'border-[#3F9BFF] scale-125 shadow-[0_0_25px_#3F9BFF]' : isDetected ? 'border-indigo-400 marker-ping' : 'border-slate-700'}`}>
                            <img src={contact.avatarUrl} alt={contact.name} className="w-full h-full object-cover" />
                        </div>
                    </button>
                );
            })}

            {(radarFilter === 'all' || radarFilter === 'marketplace') && adLocations.map(ad => {
                const pos = project(ad.mapLocation.latitude, ad.mapLocation.longitude);
                const isSelected = selectedAd?.id === ad.id;
                const isDetected = detectedIds.has(ad.id);

                return (
                    <button 
                        key={ad.id} 
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 focus:outline-none transition-all duration-1000 ${isDetected ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`} 
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }} 
                        onClick={() => { setSelectedAd(ad); setSelectedContact(null); }}
                    >
                        <div className={`relative w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#3F9BFF] border-white scale-125' : isDetected ? 'bg-amber-500/80 border-amber-400 marker-ping' : 'bg-gray-800 border-gray-600'}`}>
                            <StoreIcon className={`w-6 h-6 ${isSelected || isDetected ? 'text-white' : 'text-gray-500'}`} />
                            <div className="absolute -top-3 bg-green-600 px-1.5 py-0.5 rounded text-[7px] font-black text-white border border-white/20">${ad.price}</div>
                        </div>
                    </button>
                );
            })}
        </div>

        <div className="absolute right-6 bottom-10 flex flex-col gap-3 z-50 pointer-events-auto">
            <button 
                onClick={handleSOSToggle}
                className={`sidebar-hud-btn transition-all duration-500 ${isSOSActive ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.6)] border-white scale-110' : 'text-red-500 hover:bg-red-500/10'}`}
                title="SOS Distress Signal"
            >
                <ExclamationTriangleIcon className={`w-7 h-7 ${isSOSActive ? 'animate-pulse' : ''}`} />
            </button>

            <button 
                onClick={() => setRadarEnabled(!radarEnabled)}
                className={`sidebar-hud-btn ${radarEnabled ? 'text-[#00FF9D] border-[#00FF9D]/40 shadow-[#00FF9D]/20' : 'text-slate-400'}`}
                title="Toggle Radar"
            >
                <BoltIcon className={`w-7 h-7 ${radarEnabled ? 'animate-pulse' : ''}`} />
            </button>

            <div className="relative group/layers">
                <button 
                    onClick={() => setShowLayerSelector(!showLayerSelector)}
                    className={`sidebar-hud-btn ${activeLayer === 'satellite' ? 'text-[#3F9BFF]' : 'text-slate-400'}`}
                >
                    <LayersIcon className="w-7 h-7" />
                </button>
                {showLayerSelector && (
                    <div className="absolute bottom-0 right-full mr-4 flex gap-2 animate-fade-in-right">
                        <button onClick={() => { setActiveLayer('tactical'); setShowLayerSelector(false); }} className={`px-6 py-3 rounded-2xl backdrop-blur-2xl border border-white/10 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl ${activeLayer === 'tactical' ? 'bg-[#3F9BFF] text-white' : 'bg-black/60 text-slate-500 hover:text-white'}`}>Tactical</button>
                        <button onClick={() => { setActiveLayer('satellite'); setShowLayerSelector(false); }} className={`px-6 py-3 rounded-2xl backdrop-blur-2xl border border-white/10 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl ${activeLayer === 'satellite' ? 'bg-[#3F9BFF] text-white' : 'bg-black/60 text-slate-500 hover:text-white'}`}>Satellite</button>
                    </div>
                )}
            </div>

            <button onClick={() => setZoom(z => Math.min(10, z + 0.5))} className="sidebar-hud-btn text-white"><PlusIcon className="w-7 h-7" /></button>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.5))} className="sidebar-hud-btn text-white"><MinusIcon className="w-7 h-7" /></button>

            <button 
                onClick={handleBroadcastToggle} 
                className={`sidebar-hud-btn ${isBroadcasting ? 'bg-[#00FF9D] text-black shadow-[0_0_20px_rgba(0,255,157,0.4)]' : 'text-slate-400'}`}
                title={isBroadcasting ? "Stop Sharing" : "Share Location"}
            >
                {isBroadcasting ? <CheckIcon className="w-6 h-6" /> : <ShareIcon className="w-6 h-6" />}
            </button>
        </div>

        <div className="absolute left-6 bottom-10 flex gap-2 z-50">
            {(['all', 'friends', 'marketplace'] as RadarFilter[]).map(f => (
                <button 
                    key={f}
                    onClick={() => setRadarFilter(f)}
                    className={`px-4 py-2 rounded-xl backdrop-blur-md border font-black text-[9px] uppercase tracking-widest transition-all ${radarFilter === f ? 'bg-[#3F9BFF] border-white text-white shadow-xl' : 'bg-black/60 border-white/10 text-slate-500 hover:text-white'}`}
                >
                    {f}
                </button>
            ))}
        </div>
      </main>

      {selectedContact && (
          <div className={`absolute bottom-32 left-6 right-6 backdrop-blur-3xl border p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-fade-in-up transition-all duration-500 bg-[#111827]/95 border-[#3F9BFF]/30`}>
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-5">
                      <img src={selectedContact.avatarUrl} className="w-16 h-16 rounded-3xl border-4 object-cover border-[#3F9BFF]/50" alt="" />
                      <div className="min-w-0 text-left">
                          <h3 className="text-xl font-black tracking-tight truncate text-white">{selectedContact.name}</h3>
                          <div className="flex flex-col gap-1 mt-1.5">
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] truncate text-slate-400">
                                        {selectedContact.status}
                                    </p>
                                    {distanceToSelected !== null && (
                                        <>
                                            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                            <span className="text-[10px] font-black text-[#00FF9D] uppercase tracking-widest">{distanceToSelected.toFixed(2)} km Away</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-[9px] font-mono text-blue-400 bg-white/5 px-2 py-1 rounded-lg w-max">
                                    <span>{selectedContact.location?.latitude.toFixed(6)}, {selectedContact.location?.longitude.toFixed(6)}</span>
                                    <span className="text-slate-500">|</span>
                                    <span className="text-[#00FF9D]">ALT: {selectedContact.location?.altitude?.toFixed(1) || '0.0'}m</span>
                                </div>
                          </div>
                      </div>
                  </div>
                  <button onClick={() => setSelectedContact(null)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white border border-white/5"><CloseIcon className="w-6 h-6" /></button>
              </div>

              <div className="flex gap-3">
                  <button onClick={() => onSelectContact(selectedContact)} className="flex-1 py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 bg-[#3F9BFF] hover:bg-blue-500"><ChatBubbleIcon className="w-5 h-5" /><span>Message</span></button>
                  <button onClick={() => onInitiateCall(selectedContact, 'audio')} className="p-5 bg-white/5 border border-white/10 rounded-3xl text-[#00FF9D] hover:bg-[#00FF9D]/10 active:scale-95 transition-all shadow-xl"><PhoneIcon className="w-7 h-7" /></button>
                  <button onClick={() => onInitiateCall(selectedContact, 'video')} className="p-5 bg-white/5 border border-white/10 rounded-3xl text-purple-400 hover:bg-purple-400/10 active:scale-95 transition-all shadow-xl"><VideoIcon className="w-7 h-7" /></button>
              </div>
          </div>
      )}

      {selectedAd && (
          <div className={`absolute bottom-32 left-6 right-6 backdrop-blur-3xl border p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-fade-in-up transition-all duration-500 bg-[#1e293b]/95 border-amber-400/30`}>
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center">
                          <StoreIcon className="w-8 h-8 text-amber-400" />
                      </div>
                      <div className="min-w-0 text-left">
                          <h3 className="text-xl font-black tracking-tight truncate text-white">{selectedAd.title}</h3>
                          <div className="flex flex-col gap-1 mt-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Marketplace Transmission</p>
                            <div className="text-[9px] font-mono text-slate-500 bg-black/20 px-2 py-0.5 rounded w-max">
                                {selectedAd.mapLocation.latitude.toFixed(6)}, {selectedAd.mapLocation.longitude.toFixed(6)}
                            </div>
                          </div>
                      </div>
                  </div>
                  <button onClick={() => setSelectedAd(null)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white border border-white/5"><CloseIcon className="w-6 h-6" /></button>
              </div>
              <p className="text-sm text-slate-300 mb-6 line-clamp-2 italic">"{selectedAd.description}"</p>
              <div className="flex gap-3">
                  <button onClick={() => onNavigateToAd(selectedAd)} className="flex-1 py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-white border border-amber-400/40"><StoreIcon className="w-5 h-5" /><span>View Hub</span></button>
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl text-green-400 flex flex-col items-center justify-center">
                      <span className="text-[8px] font-black uppercase mb-1">Price</span>
                      <span className="text-lg font-bold">${selectedAd.price}</span>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default MapScreen;
