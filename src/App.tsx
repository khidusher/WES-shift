/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VisionSection } from './components/VisionSection';
import { PillarsSection } from './components/PillarsSection';
import { MentorshipSection } from './components/MentorshipSection';
import { SpeakersSection } from './components/SpeakersSection';
import { FaithSection } from './components/FaithSection';
import { CountdownSection } from './components/CountdownSection';
import { EventInfoSection } from './components/EventInfoSection';
import { Footer } from './components/Footer';

const RegistrationModal = React.lazy(() =>
  import('./components/RegistrationModal').then((m) => ({ default: m.RegistrationModal }))
);
const ShareModal = React.lazy(() =>
  import('./components/ShareModal').then((m) => ({ default: m.ShareModal }))
);
const DelegatePassModal = React.lazy(() =>
  import('./components/DelegatePassModal').then((m) => ({ default: m.DelegatePassModal }))
);
const SecretariatConsoleModal = React.lazy(() =>
  import('./components/SecretariatConsoleModal').then((m) => ({ default: m.SecretariatConsoleModal }))
);

export default function App() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isSecretariatModalOpen, setIsSecretariatModalOpen] = useState(false);

  const handleOpenRegister = () => {
    setIsRegisterModalOpen(true);
  };

  const handleOpenShare = () => {
    setIsShareModalOpen(true);
  };

  const handleOpenPass = () => {
    setIsPassModalOpen(true);
  };

  const handleOpenSecretariat = () => {
    setIsSecretariatModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-[#7EE647] selection:text-[#050505]">
      {/* Navigation Bar */}
      <Navbar
        onOpenRegister={handleOpenRegister}
        onOpenShare={handleOpenShare}
        onOpenPass={handleOpenPass}
        onOpenSecretariat={handleOpenSecretariat}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        <Hero onOpenRegister={handleOpenRegister} onOpenPass={handleOpenPass} />
        <VisionSection />
        <PillarsSection />
        <MentorshipSection onOpenRegister={handleOpenRegister} />
        <SpeakersSection onOpenRegister={handleOpenRegister} />
        <FaithSection onOpenRegister={handleOpenRegister} />
        <CountdownSection onOpenRegister={handleOpenRegister} />
        <EventInfoSection />
      </main>

      {/* Closing CTA & Footer */}
      <Footer onOpenRegister={handleOpenRegister} />

      {/* Interactive Modals (Loaded only when opened) */}
      {isRegisterModalOpen && (
        <React.Suspense fallback={null}>
          <RegistrationModal
            isOpen={isRegisterModalOpen}
            onClose={() => setIsRegisterModalOpen(false)}
          />
        </React.Suspense>
      )}

      {isShareModalOpen && (
        <React.Suspense fallback={null}>
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
          />
        </React.Suspense>
      )}

      {isPassModalOpen && (
        <React.Suspense fallback={null}>
          <DelegatePassModal
            isOpen={isPassModalOpen}
            onClose={() => setIsPassModalOpen(false)}
          />
        </React.Suspense>
      )}

      {isSecretariatModalOpen && (
        <React.Suspense fallback={null}>
          <SecretariatConsoleModal
            isOpen={isSecretariatModalOpen}
            onClose={() => setIsSecretariatModalOpen(false)}
          />
        </React.Suspense>
      )}
    </div>
  );
}
