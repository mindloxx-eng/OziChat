import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../../types';
import { CreditCardIcon } from '../icons/CreditCardIcon';

interface AdminPaymentSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const SettingsToggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#1C1C2E] ${checked ? 'bg-[#3F9BFF]' : 'bg-gray-600'}`}
    >
        <span aria-hidden="true" className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({ settings, onUpdateSettings }) => {
    const [editableSettings, setEditableSettings] = useState<AppSettings>(settings);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setEditableSettings(settings);
    }, [settings]);

    useEffect(() => {
        const newErrors: Record<string, string> = {};
        const { stripe, paypal, googlePay } = editableSettings.paymentGateways;

        if (stripe.enabled) {
            if (!stripe.publicKey.trim()) newErrors.stripePublicKey = 'Public Key is required when Stripe is enabled.';
            if (!stripe.secretKey.trim()) newErrors.stripeSecretKey = 'Secret Key is required when Stripe is enabled.';
        }
        if (paypal.enabled) {
            if (!paypal.clientId.trim()) newErrors.paypalClientId = 'Client ID is required when PayPal is enabled.';
        }
        if (googlePay.enabled) {
            if (!googlePay.merchantId.trim()) newErrors.googlePayMerchantId = 'Merchant ID is required when Google Pay is enabled.';
        }

        setErrors(newErrors);
    }, [editableSettings]);
    
    const handlePaymentGatewayChange = (
        gateway: 'stripe' | 'paypal' | 'googlePay',
        key: 'enabled' | 'publicKey' | 'secretKey' | 'clientId' | 'merchantId',
        value: string | boolean
    ) => {
        setEditableSettings(prev => ({
            ...prev,
            paymentGateways: {
                ...prev.paymentGateways,
                [gateway]: {
                    ...prev.paymentGateways[gateway],
                    [key]: value
                }
            }
        }));
    };

    const handleSave = () => {
        if (Object.keys(errors).length > 0) return;
        onUpdateSettings(editableSettings);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 2000);
    };

    const canSave = Object.keys(errors).length === 0;

    return (
    <div className="p-8 relative">
        {showSuccessToast && (
            <div className="fixed top-8 right-8 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-down">
                Settings saved successfully!
            </div>
        )}

        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
                <CreditCardIcon className="w-8 h-8 text-gray-400" />
                <h1 className="text-3xl font-bold">Payment Gateways</h1>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={handleSave} 
                    disabled={!canSave}
                    className="px-4 py-2 rounded-lg bg-[#3F9BFF] hover:bg-blue-500 transition-colors font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    Save Changes
                </button>
            </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
            {/* Stripe */}
            <div className="p-6 bg-[#1C1C2E] rounded-lg border border-gray-700 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-xl">Stripe</h3>
                    <SettingsToggle 
                        checked={editableSettings.paymentGateways.stripe.enabled} 
                        onChange={(val) => handlePaymentGatewayChange('stripe', 'enabled', val)} 
                    />
                </div>
                <div className={`space-y-4 transition-opacity ${editableSettings.paymentGateways.stripe.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="stripePk" className="text-sm font-medium text-gray-300">Public Key</label>
                        <input
                            id="stripePk"
                            type="text"
                            value={editableSettings.paymentGateways.stripe.publicKey}
                            onChange={(e) => handlePaymentGatewayChange('stripe', 'publicKey', e.target.value)}
                            className={`w-full bg-[#2a2a46] border ${errors.stripePublicKey ? 'border-red-500' : 'border-gray-600'} rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-[#553699]`}
                            placeholder="pk_test_..."
                        />
                        {errors.stripePublicKey && <p className="text-red-500 text-xs mt-1">{errors.stripePublicKey}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="stripeSk" className="text-sm font-medium text-gray-300">Secret Key</label>
                        <input
                            id="stripeSk"
                            type="password"
                            value={editableSettings.paymentGateways.stripe.secretKey}
                            onChange={(e) => handlePaymentGatewayChange('stripe', 'secretKey', e.target.value)}
                            className={`w-full bg-[#2a2a46] border ${errors.stripeSecretKey ? 'border-red-500' : 'border-gray-600'} rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-[#553699]`}
                            placeholder="sk_test_..."
                        />
                        {errors.stripeSecretKey && <p className="text-red-500 text-xs mt-1">{errors.stripeSecretKey}</p>}
                    </div>
                </div>
            </div>
            
            {/* PayPal */}
            <div className="p-6 bg-[#1C1C2E] rounded-lg border border-gray-700 space-y-4">
                 <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-xl">PayPal</h3>
                    <SettingsToggle 
                        checked={editableSettings.paymentGateways.paypal.enabled} 
                        onChange={(val) => handlePaymentGatewayChange('paypal', 'enabled', val)} 
                    />
                </div>
                <div className={`space-y-4 transition-opacity ${editableSettings.paymentGateways.paypal.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="paypalClientId" className="text-sm font-medium text-gray-300">Client ID</label>
                        <input
                            id="paypalClientId"
                            type="text"
                            value={editableSettings.paymentGateways.paypal.clientId}
                            onChange={(e) => handlePaymentGatewayChange('paypal', 'clientId', e.target.value)}
                            className={`w-full bg-[#2a2a46] border ${errors.paypalClientId ? 'border-red-500' : 'border-gray-600'} rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-[#553699]`}
                            placeholder="PayPal Client ID"
                        />
                        {errors.paypalClientId && <p className="text-red-500 text-xs mt-1">{errors.paypalClientId}</p>}
                    </div>
                </div>
            </div>
            
            {/* Google Pay */}
            <div className="p-6 bg-[#1C1C2E] rounded-lg border border-gray-700 space-y-4">
                 <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-xl">Google Pay</h3>
                    <SettingsToggle 
                        checked={editableSettings.paymentGateways.googlePay.enabled} 
                        onChange={(val) => handlePaymentGatewayChange('googlePay', 'enabled', val)} 
                    />
                </div>
                <div className={`space-y-4 transition-opacity ${editableSettings.paymentGateways.googlePay.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="googlePayMerchantId" className="text-sm font-medium text-gray-300">Merchant ID</label>
                        <input
                            id="googlePayMerchantId"
                            type="text"
                            value={editableSettings.paymentGateways.googlePay.merchantId}
                            onChange={(e) => handlePaymentGatewayChange('googlePay', 'merchantId', e.target.value)}
                            className={`w-full bg-[#2a2a46] border ${errors.googlePayMerchantId ? 'border-red-500' : 'border-gray-600'} rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-[#553699]`}
                            placeholder="Google Pay Merchant ID"
                        />
                         {errors.googlePayMerchantId && <p className="text-red-500 text-xs mt-1">{errors.googlePayMerchantId}</p>}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AdminPaymentSettings;