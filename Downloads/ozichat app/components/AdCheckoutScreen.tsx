import React, { useState } from 'react';
import type { Advertisement, AppSettings } from '../types';
import SettingsHeader from './settings/SettingsHeader';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface AdCheckoutScreenProps {
  adData: Omit<Advertisement, 'id' | 'status' | 'views' | 'postedDate' | 'expiryDate' | 'listingDuration'>;
  plan: { name: string; price: number; duration: number };
  settings: AppSettings;
  onBack: () => void;
  onPaymentSuccess: (newAd: Advertisement) => void;
}

const AdCheckoutScreen: React.FC<AdCheckoutScreenProps> = ({ adData, plan, settings, onBack, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const [formErrors, setFormErrors] = useState({ number: '', expiry: '', cvc: '' });

  const validateForm = () => {
    const errors = { number: '', expiry: '', cvc: '' };
    let isValid = true;

    // Card number validation
    const cardNumber = cardDetails.number.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNumber)) {
      errors.number = 'Enter a valid 16-digit card number.';
      isValid = false;
    }

    // Expiry date validation
    const expiryMatch = cardDetails.expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
    if (!expiryMatch) {
      errors.expiry = 'Use MM/YY format.';
      isValid = false;
    } else {
      const [_, month, year] = expiryMatch;
      const now = new Date();
      const currentYearLastTwoDigits = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1; // 1-12
      const expiryMonth = parseInt(month, 10);
      const expiryYear = parseInt(year, 10);

      if (expiryMonth < 1 || expiryMonth > 12) {
        errors.expiry = 'Invalid month.';
        isValid = false;
      } else if (expiryYear < currentYearLastTwoDigits) {
        errors.expiry = 'Card has expired.';
        isValid = false;
      } else if (expiryYear === currentYearLastTwoDigits && expiryMonth < currentMonth) {
        errors.expiry = 'Card has expired.';
        isValid = false;
      }
    }

    // CVC validation
    if (!/^\d{3,4}$/.test(cardDetails.cvc)) {
      errors.cvc = 'Invalid CVC.';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === 'number') {
        formattedValue = value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim();
    }
    if (name === 'expiry') {
        if (value.length === 2 && cardDetails.expiry.length === 1 && !value.includes('/')) {
            formattedValue = value + ' / ';
        } else if (value.length === 2 && cardDetails.expiry.length === 3) {
            formattedValue = value.slice(0, 1);
        } else {
            formattedValue = value.replace(/[^\d/]/g, '').replace(/(\d{2})(\d)/, '$1 / $2').trim();
        }
    }
     if (name === 'cvc') {
        formattedValue = value.replace(/[^\d]/g, '');
    }

    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    if (formErrors[name as keyof typeof formErrors]) {
        setFormErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(true);

        const now = new Date();
        const expiryDate = new Date(new Date().setDate(now.getDate() + plan.duration)).toISOString();

        const newAd: Advertisement = {
            ...adData,
            id: `ad${Date.now()}`,
            postedDate: new Date().toISOString(),
            expiryDate: expiryDate,
            listingDuration: plan.duration,
            status: 'approved',
            views: 0,
        };
        
        setTimeout(() => {
            onPaymentSuccess(newAd);
        }, 2000);
    }, 1500);
  };
  
  if (paymentSuccess) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-[#1C1C2E] text-white animate-fade-in">
            <CheckCircleIcon className="w-24 h-24 text-green-500 mb-6" />
            <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-300">Your ad "{adData.title}" has been successfully posted and is now live.</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#10101b] text-white">
      <SettingsHeader title="Confirm and Pay" onBack={onBack} />
      <main className="flex-1 overflow-y-auto p-4">
        <div className="bg-[#2a2a46] rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
            <div className="space-y-2 text-sm border-b border-gray-600 pb-2">
                <div className="flex justify-between">
                    <span className="text-gray-400">Ad Title:</span>
                    <span className="font-medium truncate max-w-[60%]">{adData.title}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Plan:</span>
                    <span className="font-medium">{plan.name} ({plan.duration} days)</span>
                </div>
            </div>
            <div className="flex justify-between items-center pt-2 mt-2">
                <span className="font-bold text-lg">Total</span>
                <span className="text-2xl font-bold text-green-400">${plan.price.toFixed(2)}</span>
            </div>
        </div>

        <h3 className="text-lg font-semibold mb-3">Payment Details</h3>
        <form onSubmit={handlePayment} className="space-y-4 animate-fade-in">
            <div>
                <label htmlFor="card-number" className="text-sm font-medium">Card Number</label>
                <input
                    id="card-number"
                    name="number"
                    type="tel"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={cardDetails.number}
                    onChange={handleInputChange}
                    maxLength={19}
                    className={`w-full mt-1 bg-[#10101b] border ${formErrors.number ? 'border-red-500' : 'border-gray-600'} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#553699]`}
                    required
                />
                 {formErrors.number && <p className="text-red-500 text-xs mt-1">{formErrors.number}</p>}
            </div>
             <div className="flex gap-4">
                <div className="w-1/2">
                    <label htmlFor="card-expiry" className="text-sm font-medium">Expiry Date</label>
                    <input
                        id="card-expiry"
                        name="expiry"
                        type="tel"
                        placeholder="MM / YY"
                        value={cardDetails.expiry}
                        onChange={handleInputChange}
                        maxLength={7}
                        className={`w-full mt-1 bg-[#10101b] border ${formErrors.expiry ? 'border-red-500' : 'border-gray-600'} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#553699]`}
                        required
                    />
                     {formErrors.expiry && <p className="text-red-500 text-xs mt-1">{formErrors.expiry}</p>}
                </div>
                <div className="w-1/2">
                    <label htmlFor="card-cvc" className="text-sm font-medium">CVC</label>
                    <input
                        id="card-cvc"
                        name="cvc"
                        type="tel"
                        inputMode="numeric"
                        placeholder="123"
                        value={cardDetails.cvc}
                        onChange={handleInputChange}
                        maxLength={4}
                        className={`w-full mt-1 bg-[#10101b] border ${formErrors.cvc ? 'border-red-500' : 'border-gray-600'} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#553699]`}
                        required
                    />
                     {formErrors.cvc && <p className="text-red-500 text-xs mt-1">{formErrors.cvc}</p>}
                </div>
             </div>
             <button type="submit" disabled={isProcessing} className="w-full mt-4 bg-[#553699] hover:bg-[#6b45bb] text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center disabled:bg-gray-600">
                {isProcessing ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : `Pay & Post Ad`}
             </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-6">
            <LockClosedIcon className="w-4 h-4"/>
            <span>Secure payments powered by Ozichat</span>
        </div>
      </main>
    </div>
  );
};

export default AdCheckoutScreen;