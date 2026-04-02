import React from 'react';
import SettingsHeader from './settings/SettingsHeader';
import { StarIcon } from './icons/StarIcon';

interface AdPaymentScreenProps {
  onBack: () => void;
  onSelectPlan: (plan: { name: string; price: number; duration: number }) => void;
}

const plans = [
  { name: 'Basic', price: 5.00, duration: 7, features: ['7-Day Listing', 'Standard Visibility'] },
  { name: 'Standard', price: 9.00, duration: 14, features: ['14-Day Listing', 'Featured Placement', 'Higher Visibility'], popular: true },
  { name: 'Premium', price: 15.00, duration: 30, features: ['30-Day Listing', 'Top Placement', 'Maximum Visibility'] },
];

const AdPaymentScreen: React.FC<AdPaymentScreenProps> = ({ onBack, onSelectPlan }) => {
  return (
    <div className="flex flex-col h-full bg-[#10101b] text-white">
      <SettingsHeader title="Choose a Plan" onBack={onBack} />
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className="text-center text-gray-400">Select a plan to boost your ad's visibility.</p>
        {plans.map((plan) => (
          <div key={plan.name} className={`relative p-6 rounded-lg border-2 transition-all ${plan.popular ? 'border-[#3F9BFF]' : 'border-gray-700 bg-[#1C1C2E]'}`}>
            {plan.popular && (
              <div className="absolute top-0 right-4 -mt-3 bg-[#3F9BFF] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <StarIcon className="w-3 h-3"/>
                MOST POPULAR
              </div>
            )}
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-2xl font-bold text-green-400">${plan.price.toFixed(2)}</p>
            </div>
            <ul className="mt-4 space-y-2 text-gray-300">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => onSelectPlan(plan)}
              className={`w-full mt-6 font-bold py-3 px-8 rounded-lg transition-colors ${plan.popular ? 'bg-[#3F9BFF] hover:bg-blue-500' : 'bg-[#553699] hover:bg-[#6b45bb]'}`}
            >
              Select {plan.name}
            </button>
          </div>
        ))}
      </main>
    </div>
  );
};

export default AdPaymentScreen;
