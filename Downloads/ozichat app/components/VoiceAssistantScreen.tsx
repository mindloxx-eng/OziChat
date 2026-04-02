
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { AIAssistantIcon } from './icons/AIAssistantIcon';
import type { Contact, TranscriptionEntry, VibrationPattern } from '../types';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { CloseIcon } from './icons/CloseIcon';
import { decode, decodeAudioData, createBlob } from '../utils/audio';

// --- Function Declarations for Gemini ---
const summarizeChat: FunctionDeclaration = {
  name: 'summarizeChat',
  parameters: {
    type: Type.OBJECT,
    description: 'Summarizes the most recent message from a given contact.',
    properties: {
      contactName: { type: Type.STRING, description: 'The name of the contact whose chat should be summarized.' },
    },
    required: ['contactName'],
  },
};

const getContactLocation: FunctionDeclaration = {
  name: 'getContactLocation',
  parameters: {
    type: Type.OBJECT,
    description: "Gets the last known location of a given contact.",
    properties: {
      contactName: { type: Type.STRING, description: 'The name of the contact to locate.' },
    },
    required: ['contactName'],
  },
};

const vibrationPatterns: VibrationPattern[] = ['Default', 'Short', 'Long', 'Pulse'];

const setVibrationPattern: FunctionDeclaration = {
  name: 'setVibrationPattern',
  parameters: {
    type: Type.OBJECT,
    description: 'Sets the notification vibration pattern for a specific contact.',
    properties: {
      contactName: { type: Type.STRING, description: 'The name of the contact to modify.' },
      pattern: {
        type: Type.STRING,
        description: `The vibration pattern to set. Available options are: ${vibrationPatterns.join(', ')}.`,
        enum: vibrationPatterns,
      },
    },
    required: ['contactName', 'pattern'],
  },
};

type AssistantState = 'idle' | 'ready' | 'listening' | 'thinking' | 'speaking' | 'error';
type PermissionState = 'prompt' | 'granted' | 'denied';

interface VoiceAssistantScreenProps {
  onBack: () => void;
  contacts: Contact[];
  onUpdateContactSettings: (contactId: string, settings: Partial<Contact>) => void;
}

const VoiceAssistantScreen: React.FC<VoiceAssistantScreenProps> = ({ onBack, contacts, onUpdateContactSettings }) => {
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [inProgressUserTranscription, setInProgressUserTranscription] = useState('');
  const [inProgressBotTranscription, setInProgressBotTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const isRecordingRef = useRef(isRecording);
  
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const assistantStateRef = useRef(assistantState);
  assistantStateRef.current = assistantState;

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    const checkPermission = async () => {
      if (typeof navigator.permissions?.query !== 'function') {
        console.warn("Permissions API not supported. Relying on getUserMedia prompt.");
        return;
      }
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionState(permissionStatus.state);
        permissionStatus.onchange = () => {
          setPermissionState(permissionStatus.state);
        };
      } catch (error) {
        console.error("Error checking microphone permission:", error);
        setPermissionState('prompt');
      }
    };
    checkPermission();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptions, inProgressUserTranscription, inProgressBotTranscription]);

  const addTranscription = (text: string, sender: 'user' | 'bot') => {
    if (!text.trim()) return;
    setTranscriptions(prev => [...prev, { id: Date.now().toString(), text, sender }]);
  };

  const handleStartSession = useCallback(async () => {
    if (assistantState !== 'idle' || permissionState === 'denied') return;
    
    setTranscriptions([{ id: '1', text: "Ozi Voice Assistant is ready. Talk to me!", sender: 'bot'}]);
    setAssistantState('thinking');
    
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error("Error starting voice session:", error);
      const err = error as Error;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setAssistantState('idle');
      } else {
        setAssistantState('error');
      }
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    outputAudioContextRef.current = outputAudioContext;

    sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => {
                setAssistantState('ready');
                const source = inputAudioContext.createMediaStreamSource(stream);
                const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    if (!isRecordingRef.current) return;
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    sessionPromiseRef.current?.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                if (message.serverContent?.inputTranscription) {
                    const text = message.serverContent.inputTranscription.text;
                    currentInputTranscription.current += text;
                    setInProgressUserTranscription(currentInputTranscription.current);
                }
                if (message.serverContent?.outputTranscription) {
                    if (assistantStateRef.current !== 'speaking') setAssistantState('speaking');
                    const text = message.serverContent.outputTranscription.text;
                    currentOutputTranscription.current += text;
                    setInProgressBotTranscription(currentOutputTranscription.current);
                }
                if (message.serverContent?.turnComplete) {
                   addTranscription(currentInputTranscription.current, 'user');
                   addTranscription(currentOutputTranscription.current, 'bot');
                   currentInputTranscription.current = '';
                   currentOutputTranscription.current = '';
                   setInProgressUserTranscription('');
                   setInProgressBotTranscription('');
                   setAssistantState('ready');
                }

                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio && outputAudioContextRef.current) {
                    const ctx = outputAudioContextRef.current;
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                    const source = ctx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(ctx.destination);
                    source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    audioSourcesRef.current.add(source);
                }
                
                if (message.toolCall) {
                    setAssistantState('thinking');
                    for (const fc of message.toolCall.functionCalls) {
                        let result: string;
                        const contactName = fc.args.contactName as string;
                        const contact = contacts.find(c => c.name.toLowerCase() === contactName.toLowerCase());

                        if (fc.name === 'summarizeChat') {
                            result = contact ? `Summary of last message from ${contact.name}: "${contact.lastMessage}"` : `I couldn't find a contact named ${contactName}.`;
                        } else if (fc.name === 'getContactLocation') {
                            result = contact?.location ? `${contact.name}'s coordinates are ${contact.location.latitude}, ${contact.location.longitude}.` : `I couldn't locate ${contactName}.`;
                        } else if (fc.name === 'setVibrationPattern') {
                            const pattern = fc.args.pattern as VibrationPattern;
                            if (contact && vibrationPatterns.includes(pattern)) {
                                onUpdateContactSettings(contact.id, { vibrationPattern: pattern });
                                result = `Vibration pattern for ${contact.name} updated to ${pattern}.`;
                            } else {
                                result = `Invalid request for ${contactName}.`;
                            }
                        } else {
                            result = `Action ${fc.name} is not implemented.`;
                        }
                        sessionPromiseRef.current?.then(session => {
                            session.sendToolResponse({ functionResponses: [{ id: fc.id, name: fc.name, response: { result } }] });
                        });
                    }
                }
            },
            onerror: (e: ErrorEvent) => {
                console.error('Session error:', e);
                setAssistantState('error');
            },
            onclose: () => {
                stream.getTracks().forEach(track => track.stop());
                inputAudioContext.close();
                outputAudioContext.close();
            },
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            tools: [{ functionDeclarations: [summarizeChat, getContactLocation, setVibrationPattern] }],
            systemInstruction: "You are Ozi Voice Assistant. Be charming and efficient. Use tools to help the user with their contacts.",
        },
    });
  }, [contacts, assistantState, permissionState, onUpdateContactSettings]);

  const handleEndSession = () => {
    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;
    setIsRecording(false);
    setAssistantState('idle');
    setTranscriptions([]);
  };

  const Visualizer = () => {
    let content, pulseClass = '';

    const handlePress = () => {
        if (assistantState === 'ready') {
            setIsRecording(true);
            setAssistantState('listening');
        }
    };
    const handleRelease = () => {
        if (assistantState === 'listening') {
            setIsRecording(false);
            setAssistantState('thinking');
        }
    };

    if (permissionState === 'denied') {
        content = (
            <div className="text-center">
                <CloseIcon className="w-10 h-10 mx-auto text-red-500" />
                <p className="mt-2 font-bold text-xs uppercase tracking-widest">Mic Denied</p>
            </div>
        );
    } else {
        switch (assistantState) {
            case 'ready':
                content = (
                    <div className="text-center">
                        <MicrophoneIcon className="w-12 h-12 mx-auto" />
                        <p className="mt-2 font-bold text-xs uppercase tracking-widest">Hold to Speak</p>
                    </div>
                );
                break;
            case 'listening':
                content = <span className="text-lg font-black uppercase tracking-tighter animate-pulse">LISTENING</span>;
                pulseClass = 'animate-pulse-strong';
                break;
            case 'thinking':
                content = <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>;
                break;
            case 'speaking':
                content = (
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                            <div key={i} className="w-1 bg-white rounded-full animate-wave" style={{ height: `${h * 8}px`, animationDelay: `${i * 100}ms` }} />
                        ))}
                    </div>
                );
                break;
            case 'error':
                 content = <span className="text-xs font-bold text-center">CONNECTION ERROR</span>;
                break;
            case 'idle':
            default:
                content = (
                    <div className="text-center">
                        <AIAssistantIcon className="w-12 h-12" />
                        <p className="mt-2 font-bold text-xs uppercase tracking-widest">Start Voice Mode</p>
                    </div>
                );
        }
    }
    
    const isDisabled = ['speaking', 'thinking', 'error'].includes(assistantState) || permissionState === 'denied';

    return (
        <button 
            disabled={isDisabled}
            onClick={assistantState === 'idle' ? handleStartSession : undefined}
            onMouseDown={handlePress}
            onMouseUp={handleRelease}
            onTouchStart={(e) => { e.preventDefault(); handlePress(); }}
            onTouchEnd={handleRelease}
            className={`relative w-56 h-56 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${
                assistantState !== 'idle' ? 'scale-100' : 'hover:scale-105 active:scale-95'
            } ${
                isDisabled ? 'bg-gray-800 cursor-not-allowed opacity-80' : 'bg-gradient-to-br from-[#3F9BFF] to-[#553699]'
            }`}
        >
           <div className={`absolute inset-0 rounded-full border-4 border-white/20 ${pulseClass}`}></div>
           <div className="relative z-10 p-4">{content}</div>
        </button>
    )
  };

  return (
    <div className="flex flex-col h-full bg-[#10101b] text-white relative">
       <style>{`
            @keyframes pulse-strong {
                0% { transform: scale(1); opacity: 0.2; }
                50% { transform: scale(1.3); opacity: 0; }
                100% { transform: scale(1); opacity: 0.2; }
            }
            .animate-pulse-strong { animation: pulse-strong 1.5s infinite; }
            @keyframes wave {
                0%, 100% { transform: scaleY(0.4); }
                50% { transform: scaleY(1); }
            }
            .animate-wave { animation: wave 0.6s ease-in-out infinite; }
        `}</style>
      <header className="flex items-center justify-between p-4 bg-transparent z-10">
        <button onClick={onBack} className="text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><ChevronLeftIcon /></button>
        <h2 className="text-sm font-bold uppercase tracking-widest opacity-70">Ozi Voice Mode</h2>
        <div className="w-10 h-10 flex justify-end">
          {assistantState !== 'idle' && (
            <button onClick={handleEndSession} className="text-[10px] font-black bg-red-500/20 text-red-400 px-2 py-1 rounded-md border border-red-500/30">END</button>
          )}
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pt-0">
         {transcriptions.length === 0 && assistantState === 'idle' && (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                 <AIAssistantIcon className="w-16 h-16 mb-4" />
                 <p className="text-sm font-medium italic">"Hey Ozi, where is Nina?"</p>
                 <p className="text-xs mt-1 uppercase tracking-widest">Touch the button below to start</p>
             </div>
         )}
         {transcriptions.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-lg border border-white/5 animate-fade-in-up ${msg.sender === 'user' ? 'bg-[#553699] text-white' : 'bg-[#1C1C2E] text-white/90'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {inProgressUserTranscription && (
            <div className="flex items-start gap-3 justify-end opacity-50">
                <div className="max-w-xs px-4 py-2 rounded-2xl bg-[#553699] text-white">
                    <p className="text-sm italic">{inProgressUserTranscription}</p>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-12 flex flex-col items-center justify-center bg-gradient-to-t from-black to-transparent">
        <Visualizer />
      </footer>
    </div>
  );
};

export default VoiceAssistantScreen;
