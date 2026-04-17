import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Message } from '../types';
import { getAIResponse } from '../services/geminiService';
import { PlusIcon } from './icons/PlusIcon';
import { AIAssistantIcon } from './icons/AIAssistantIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { InfoCircleIcon } from './icons/InfoCircleIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import BottomNavBar, { BottomNavBarProps } from './BottomNavBar';


interface AIAssistantScreenProps {
  navProps: BottomNavBarProps;
  onNavigateToVoiceAssistant: () => void;
}

const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({ navProps, onNavigateToVoiceAssistant }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm the Ozichat AI Assistant. I can help you summarize your chats, find your friends on the map, or analyze your messaging activity. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, statusMessage]);
  
  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStatusMessage("Analyzing intent...");

    // Real-time status feedback for tool calls
    const statusTimer = setTimeout(() => setStatusMessage("Accessing device context..."), 1200);

    try {
      const botResponseText = await getAIResponse(messageText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I encountered a synchronization error with the Ozi system. Please try again.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      clearTimeout(statusTimer);
      setIsLoading(false);
      setStatusMessage(null);
    }
  }, [isLoading]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  }

  const promptStarters = [
    { text: "Where is Nina?", icon: LocationMarkerIcon },
    { text: "Summarize Alex's chat", icon: ClipboardDocumentListIcon },
    { text: "Who are my contacts?", icon: InfoCircleIcon },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#10101b] transition-colors duration-300">
        <style>{`
            @keyframes pulse-ring {
                0% { transform: scale(0.95); opacity: 0.8; }
                50% { transform: scale(1.1); opacity: 0.4; }
                100% { transform: scale(0.95); opacity: 0.8; }
            }
            .animate-pulse-ring { animation: pulse-ring 2s infinite ease-in-out; }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(63, 155, 255, 0.2); border-radius: 10px; }
        `}</style>
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-[#1C1C2E] border-b border-gray-200 dark:border-white/5 shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3F9BFF] to-[#553699] flex items-center justify-center text-white shadow-lg">
                <AIAssistantIcon className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-black dark:text-white leading-tight">Ozi AI</h2>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Link</span>
                </div>
            </div>
        </div>
        
        <button 
            onClick={onNavigateToVoiceAssistant}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#3F9BFF] to-[#553699] rounded-full text-white text-xs font-bold shadow-lg hover:scale-105 transition-transform active:scale-95 relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute -inset-1 rounded-full border border-white/30 animate-pulse-ring"></div>
            <MicrophoneIcon className="w-4 h-4" />
            <span>VOICE MODE</span>
        </button>
      </header>

      {/* Messages Viewport */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 animate-fade-in-up ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[#3F9BFF] flex-shrink-0 border border-gray-200 dark:border-white/10">
                    <AIAssistantIcon className="w-5 h-5"/>
                </div>
            )}
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-[#553699] text-white rounded-br-none' : 'bg-gray-100 dark:bg-[#1C1C2E] text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-white/5'}`}>
              {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
              <p className={`text-[9px] mt-1.5 opacity-40 font-mono ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
           <div className="flex flex-col gap-2">
                <div className="flex items-end gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[#3F9BFF] flex-shrink-0 border border-gray-200 dark:border-white/10">
                        <AIAssistantIcon className="w-5 h-5"/>
                    </div>
                    <div className="max-w-[120px] px-4 py-3 rounded-2xl bg-gray-100 dark:bg-[#1C1C2E] rounded-bl-none border border-gray-200 dark:border-white/5">
                        <div className="flex items-center justify-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-[#3F9BFF] rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-[#3F9BFF] rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-[#3F9BFF] rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                </div>
                {statusMessage && (
                    <div className="ml-10 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">
                        <ShieldCheckIcon className="w-3.5 h-3.5 text-[#00FF9D]" />
                        {statusMessage}
                    </div>
                )}
           </div>
        )}

        {messages.length <= 1 && !isLoading && (
            <div className="pt-8 space-y-6 animate-fade-in px-2">
                <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Suggested Interactions</p>
                    <div className="grid grid-cols-1 gap-3">
                        {promptStarters.map((starter) => (
                            <button 
                                key={starter.text}
                                onClick={() => handleSendMessage(starter.text)}
                                className="flex items-center gap-4 text-left text-black dark:text-white bg-gray-50 dark:bg-[#1C1C2E] p-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-[#252542] transition-all border border-gray-200 dark:border-white/10 group shadow-sm active:scale-95"
                            >
                                <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl group-hover:bg-[#3F9BFF]/20 transition-colors border border-transparent group-hover:border-[#3F9BFF]/30">
                                    <starter.icon className="w-5 h-5 text-[#3F9BFF]" />
                                </div>
                                <span className="font-bold text-sm tracking-tight">{starter.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="bg-[#3F9BFF]/5 dark:bg-blue-900/10 p-5 rounded-2xl border border-[#3F9BFF]/10 dark:border-blue-900/30 flex items-start gap-4">
                    <ShieldCheckIcon className="w-6 h-6 text-[#3F9BFF] flex-shrink-0" />
                    <p className="text-xs text-blue-900/70 dark:text-blue-300 leading-relaxed font-medium">
                        Ozichat AI processing is sandboxed. Your identity is verified and shared data remains under the protection of end-to-end encryption protocols.
                    </p>
                </div>
            </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Floating Input Controller */}
      <footer className="absolute bottom-16 left-0 right-0 p-4 bg-transparent pointer-events-none z-30">
        <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto flex items-center bg-white/95 dark:bg-[#1C1C2E]/95 backdrop-blur-2xl rounded-full p-2 shadow-2xl border border-gray-200 dark:border-white/10 pointer-events-auto transition-all focus-within:ring-4 focus-within:ring-[#3F9BFF]/20">
          <button type="button" className="p-3 text-gray-400 hover:text-[#3F9BFF] transition-colors flex-shrink-0 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"><PlusIcon className="w-6 h-6" /></button>
          
          <div className="flex-1 mx-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Talk to Ozi..."
                className="w-full bg-transparent text-black dark:text-white placeholder-gray-500 focus:outline-none font-bold py-2 text-sm"
                disabled={isLoading}
            />
          </div>

          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-4 text-white flex-shrink-0 rounded-full transition-all shadow-xl active:scale-90 ${!input.trim() || isLoading ? 'bg-gray-300 dark:bg-gray-800' : 'bg-gradient-to-br from-[#3F9BFF] to-[#553699] shadow-blue-500/30'}`}
          >
            <PaperAirplaneIcon className="w-5 h-5 translate-x-px translate-y-px" />
          </button>
        </form>
      </footer>

      <BottomNavBar {...navProps} />
    </div>
  );
};

export default AIAssistantScreen;