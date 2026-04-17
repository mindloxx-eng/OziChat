
import React, { useState, useRef } from 'react';
import type { Advertisement } from '../types';
import SettingsHeader from './settings/SettingsHeader';
import { CameraIcon } from './icons/CameraIcon';

interface PostAdScreenProps {
  onBack: () => void;
  onNext: (adData: Omit<Advertisement, 'id' | 'status' | 'views' | 'postedDate' | 'expiryDate' | 'listingDuration'>) => void;
}

const PostAdScreen: React.FC<PostAdScreenProps> = ({ onBack, onNext }) => {
  // State for the ad details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  
  // State for targeting
  const [targetingType, setTargetingType] = useState<'global' | 'country' | 'region' | 'state' | 'city'>('global');
  const [targetingValue, setTargetingValue] = useState('');
  
  // State for form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (file.type.startsWith('image/')) {
          setImageSrc(e.target?.result as string);
          setVideoSrc(null);
        } else if (file.type.startsWith('video/')) {
          setVideoSrc(e.target?.result as string);
          setImageSrc(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required.';
    if (!description.trim()) errors.description = 'Description is required.';
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) errors.price = 'Enter a valid price.';
    if (!phone.trim()) errors.phone = 'Contact phone is required.';
    if (!imageSrc && !videoSrc) errors.image = 'An image or video is required.';
    if (targetingType !== 'global' && !targetingValue.trim()) errors.targeting = 'Location value is required for this targeting type.';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const adData = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      advertiserPhone: phone.trim(),
      website: website.trim() || undefined,
      imageUrls: imageSrc ? [imageSrc] : undefined,
      videoUrl: videoSrc || undefined,
      targeting: {
        type: targetingType,
        value: targetingType !== 'global' ? targetingValue.trim() : undefined,
      },
    };
    
    onNext(adData);
  };
  
  const targetingOptions = ['global', 'country', 'region', 'state', 'city'];

  return (
    <div className="flex flex-col h-full bg-[#10101b] text-white">
      <SettingsHeader title="Post New Advertisement" onBack={onBack} />
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Ad Details */}
          <section className="bg-[#1C1C2E] p-4 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-lg mb-4">Ad Details</h3>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <button type="button" onClick={handleImageUploadClick} className="w-24 h-24 rounded-lg bg-[#2a2a46] flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors overflow-hidden">
                  {imageSrc ? (
                    <img src={imageSrc} alt="Ad preview" className="w-full h-full object-cover" />
                  ) : videoSrc ? (
                    <video src={videoSrc} className="w-full h-full object-cover" />
                  ) : (
                    <CameraIcon className="w-8 h-8"/>
                  )}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden"/>
                {formErrors.image && <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>}
              </div>
              <div className="flex-grow space-y-3">
                 <div>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ad Title" className={`w-full bg-[#2a2a46] border ${formErrors.title ? 'border-red-500' : 'border-gray-600'} rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#553699]`}/>
                    {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                </div>
                <div>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className={`w-full bg-[#2a2a46] border ${formErrors.description ? 'border-red-500' : 'border-gray-600'} rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#553699]`}></textarea>
                    {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                </div>
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price ($)" className={`w-full bg-[#2a2a46] border ${formErrors.price ? 'border-red-500' : 'border-gray-600'} rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#553699]`}/>
                    {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
                </div>
                 <div>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contact Phone" className={`w-full bg-[#2a2a46] border ${formErrors.phone ? 'border-red-500' : 'border-gray-600'} rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#553699]`}/>
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>
            </div>
            <div className="mt-4">
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website (optional)" className="w-full bg-[#2a2a46] border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#553699]"/>
            </div>
          </section>

          {/* Section 2: Targeting */}
          <section className="bg-[#1C1C2E] p-4 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-lg mb-4">Ad Targeting</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {targetingOptions.map(opt => (
                <button key={opt} type="button" onClick={() => setTargetingType(opt as any)} className={`px-3 py-1 text-sm rounded-full border-2 transition-colors ${targetingType === opt ? 'bg-[#3F9BFF] border-[#3F9BFF]' : 'bg-transparent border-gray-600 hover:bg-gray-700'}`}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
            {targetingType !== 'global' && (
              <div>
                <input type="text" value={targetingValue} onChange={(e) => setTargetingValue(e.target.value)} placeholder={`Enter ${targetingType}`} className={`w-full bg-[#2a2a46] border ${formErrors.targeting ? 'border-red-500' : 'border-gray-600'} rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#553699]`}/>
                {formErrors.targeting && <p className="text-red-500 text-xs mt-1">{formErrors.targeting}</p>}
              </div>
            )}
          </section>

          {/* Submit Button */}
          <button type="submit" className="w-full bg-[#553699] hover:bg-[#6b45bb] text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center">
            Next
          </button>
        </form>
      </main>
    </div>
  );
};

export default PostAdScreen;
