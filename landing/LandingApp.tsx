import React from 'react';
import Hero from './sections/Hero';
import PowerOfFour from './sections/PowerOfFour';
import Showcases from './sections/Showcases';
import ImmersiveContent from './sections/ImmersiveContent';
import MoreGoodness from './sections/MoreGoodness';
import TrustAndFooter from './sections/TrustAndFooter';

const LandingApp: React.FC = () => (
  <div className="min-h-screen bg-[#050714] text-white antialiased">
    <Hero />
    <PowerOfFour />
    <Showcases />
    <ImmersiveContent />
    <MoreGoodness />
    <TrustAndFooter />
  </div>
);

export default LandingApp;
