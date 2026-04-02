
import React from 'react';
import SettingsHeader from './SettingsHeader';

interface TermsPrivacyScreenProps {
  onBack: () => void;
}

const TermsPrivacyScreen: React.FC<TermsPrivacyScreenProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
      <SettingsHeader title="Terms & Privacy" onBack={onBack} />
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        <section>
            <h3 className="text-xl font-bold mb-4 text-[#3F9BFF]">Terms of Service</h3>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>
                    Welcome to Ozichat. By accessing or using our mobile application and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Services.
                </p>
                <div>
                    <strong className="block text-gray-800 dark:text-gray-100 mb-1">1. Using Ozichat</strong>
                    You must be at least 13 years old to use our Services. You agree to use Ozichat only for lawful purposes and in accordance with these Terms. You are responsible for all activity that occurs under your account.
                </div>
                <div>
                    <strong className="block text-gray-800 dark:text-gray-100 mb-1">2. User Content</strong>
                    You retain ownership of the content (messages, photos, videos) you share on Ozichat. However, by sharing content, you grant us a worldwide, non-exclusive license to transmit and display that content to your intended recipients for the purpose of providing the Service.
                </div>
                <div>
                    <strong className="block text-gray-800 dark:text-gray-100 mb-1">3. Prohibited Conduct</strong>
                    You may not use the Service to:
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Send spam or unsolicited messages.</li>
                        <li>Harass, threaten, or intimidate other users.</li>
                        <li>Share illegal content or content that violates intellectual property rights.</li>
                        <li>Attempt to reverse engineer or hack the application.</li>
                    </ul>
                </div>
                <div>
                    <strong className="block text-gray-800 dark:text-gray-100 mb-1">4. Termination</strong>
                    We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason, with or without notice.
                </div>
            </div>
        </section>
        
        <div className="h-px bg-gray-200 dark:bg-gray-700" />

        <section>
            <h3 className="text-xl font-bold mb-4 text-[#3F9BFF]">Privacy Policy</h3>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>
                    Your privacy is critically important to us. This Privacy Policy explains how we collect, use, and protect your information.
                </p>
                <div>
                    <strong className="block text-gray-800 dark:text-gray-100 mb-1">1. Information We Collect</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li><strong>Account Information:</strong> Your phone number and profile name.</li>
                        <li><strong>Messages:</strong> Your messages are end-to-end encrypted. We cannot read them. They are stored on your device and temporarily on our servers only until delivered.</li>
                        <li><strong>Usage Data:</strong> We may collect anonymous data about how you use the app to improve performance.</li>
                    </ul>
                </div>
                <div>
                    <strong className="block text-gray-800 dark:text-gray-100 mb-1">2. How We Use Information</strong>
                    We use your information to operate, maintain, and improve our Services. We do not sell your personal data to third parties.
                </div>
                <div>
                    <strong className="block text-gray-800 dark:text-gray-100 mb-1">3. Data Security</strong>
                    We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
                </div>
            </div>
        </section>
        
        <div className="pb-8 pt-4 text-center text-xs text-gray-400">
            Last updated: May 20, 2024
        </div>
      </main>
    </div>
  );
};

export default TermsPrivacyScreen;
