
import React, { useState } from 'react';
import SettingsHeader from './SettingsHeader';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';

interface ContactUsScreenProps {
  onBack: () => void;
}

const ContactUsScreen: React.FC<ContactUsScreenProps> = ({ onBack }) => {
  const [message, setMessage] = useState('');
  const [includeLogs, setIncludeLogs] = useState(true);
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSending(true);
    // Simulate sending
    setTimeout(() => {
        setIsSending(false);
        setSent(true);
    }, 1500);
  };

  if (sent) {
      return (
        <div className="flex flex-col h-full bg-white dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
            <SettingsHeader title="Contact Us" onBack={onBack} />
            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <PaperAirplaneIcon className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Message Sent</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Thank you for your feedback. Our support team will review your message and get back to you shortly.</p>
                <button onClick={onBack} className="mt-8 px-8 py-3 bg-[#3F9BFF] text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg">Return to Settings</button>
            </main>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
      <SettingsHeader title="Contact Us" onBack={onBack} />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Have a question, encountered a bug, or just want to say hi? Fill out the form below and we'll help you out.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Message</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your problem or feedback..."
                    rows={6}
                    className="w-full bg-gray-100 dark:bg-[#2a2a46] border border-gray-300 dark:border-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#3F9BFF] resize-none text-black dark:text-white transition-all"
                    required
                />
            </div>
            <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                    <input 
                        type="checkbox" 
                        checked={includeLogs} 
                        onChange={(e) => setIncludeLogs(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-gray-100 transition-all checked:border-[#3F9BFF] checked:bg-[#3F9BFF] dark:border-gray-600 dark:bg-gray-700"
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 select-none">Include device information and logs to help us debug the issue.</span>
            </label>
            <button 
                type="submit" 
                disabled={!message.trim() || isSending}
                className="w-full py-3.5 bg-[#3F9BFF] text-white font-bold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
                {isSending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <span>Send Message</span>
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </>
                )}
            </button>
        </form>
      </main>
    </div>
  );
};

export default ContactUsScreen;
