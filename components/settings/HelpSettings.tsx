
import React from 'react';
import SettingsHeader from './SettingsHeader';
import SettingsListItem from './SettingsListItem';
import { QuestionMarkCircleIcon } from '../icons/QuestionMarkCircleIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { OzichatLogo } from '../icons/NestfingerLogo';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { InfoCircleIcon } from '../icons/InfoCircleIcon';

interface HelpSettingsProps {
  onBack: () => void;
  onNavigateToHelpCenter: () => void;
  onNavigateToContactUs: () => void;
  onNavigateToTerms: () => void;
  onNavigateToAppInfo: () => void;
}

const HelpSettings: React.FC<HelpSettingsProps> = ({ onBack, onNavigateToHelpCenter, onNavigateToContactUs, onNavigateToTerms, onNavigateToAppInfo }) => {
  const helpItems = [
    { icon: QuestionMarkCircleIcon, label: 'Help Center', description: 'FAQs, tutorials, and guides', action: onNavigateToHelpCenter },
    { icon: EnvelopeIcon, label: 'Contact Us', description: 'Report a problem or send feedback', action: onNavigateToContactUs },
    { icon: ShieldCheckIcon, label: 'Terms and Privacy Policy', description: 'Our legal documents and data policies', action: onNavigateToTerms },
    { icon: InfoCircleIcon, label: 'App Info', description: 'Version, licenses, and acknowledgements', action: onNavigateToAppInfo },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-[#10101b] text-black dark:text-white transition-colors duration-300">
      <SettingsHeader title="Help" onBack={onBack} />
      
      <main className="flex-1 overflow-y-auto">
        {helpItems.map(item => (
          <SettingsListItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            description={item.description}
            onClick={item.action}
            hasChevron
          />
        ))}
        <div className="absolute bottom-0 left-0 right-0 py-8 text-center text-gray-500 dark:text-gray-400">
            <OzichatLogo className="w-32 mx-auto" />
            <p className="text-sm mt-2">Version 1.0.0</p>
        </div>
      </main>
    </div>
  );
};

export default HelpSettings;
