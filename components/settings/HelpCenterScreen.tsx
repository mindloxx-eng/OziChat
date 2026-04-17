
import React, { useState } from 'react';
import SettingsHeader from './SettingsHeader';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';

interface HelpCenterScreenProps {
  onBack: () => void;
}

const faqs = [
  { question: "How do I change my privacy settings?", answer: "Go to Settings > Account > Privacy to adjust your Last Seen, Profile Photo, and Read Receipt settings." },
  { question: "Can I use Ozichat on multiple devices?", answer: "Currently, Ozichat is designed for a single device per phone number for maximum security. Multi-device support is coming soon." },
  { question: "How do I block a contact?", answer: "Open the chat with the contact, tap their name at the top to view details, scroll down to the bottom of the profile screen, and tap 'Block'." },
  { question: "Is my data secure?", answer: "Yes, Ozichat uses end-to-end encryption for all messages and calls. No one, including Ozichat, can read your messages." },
  { question: "How do I make a video call?", answer: "Open a chat, and tap the video camera icon at the top right of the screen." },
  { question: "How do I post an advertisement?", answer: "Go to the Marketplace tab, tap the 'Post Ad' button at the top right, fill in the details, and select a plan." },
  { question: "How do I add a new contact?", answer: "Go to the Contacts tab (Chats), tap the user icon with a plus sign (or 'New Contact' in the menu), and enter their name and phone number." }
];

const HelpCenterScreen: React.FC<HelpCenterScreenProps> = ({ onBack }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
      <SettingsHeader title="Help Center" onBack={onBack} />
      <main className="flex-1 overflow-y-auto p-4">
        <h3 className="text-lg font-semibold mb-4 text-[#3F9BFF]">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-[#2a2a46] hover:bg-gray-100 dark:hover:bg-[#3a3a5c] transition-colors text-left"
              >
                <span className="font-medium text-sm md:text-base">{faq.question}</span>
                {openIndex === index ? <ChevronUpIcon className="w-5 h-5 text-gray-500" /> : <ChevronDownIcon className="w-5 h-5 text-gray-500" />}
              </button>
              {openIndex === index && (
                <div className="p-4 bg-white dark:bg-[#1C1C2E] text-gray-600 dark:text-gray-300 text-sm leading-relaxed border-t border-gray-200 dark:border-gray-700">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Can't find what you're looking for?</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Use the "Contact Us" option in the previous menu to reach support.</p>
        </div>
      </main>
    </div>
  );
};

export default HelpCenterScreen;
