import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { WeddingProvider, useWeddingData } from './context/WeddingContext';
import IntroSplash from './components/IntroSplash';
import Hero from './components/Hero';
import IntroMessage from './components/IntroMessage';
import Countdown from './components/Countdown';
import Schedule from './components/Schedule';
import Location from './components/Location';
import GiftDress from './components/GiftDress';
import RSVP from './components/RSVP';
import Closing from './components/Closing';
import BackgroundMusic from './components/BackgroundMusic';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

function InvitationContent() {
  const [opened, setOpened] = useState(false);
  const { settings, loading } = useWeddingData();

  // Wait for cloud data before showing anything — prevents hardcoded defaults from flashing
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f1e5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#a9802f]/30 border-t-[#a9802f] rounded-full animate-spin mx-auto mb-4" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="App bg-sacred-black grain min-h-screen flex flex-col items-center justify-start text-[#3d2e1e]"
      dir={settings.direction}
    >
      {!opened && <IntroSplash onOpen={() => setOpened(true)} />}
      <BackgroundMusic autoStart={opened} />
      <main className={`w-full max-w-[440px] mx-auto flex flex-col items-center px-4 overflow-x-hidden ${opened ? 'fade-in' : 'opacity-0'}`}>
        <Hero />
        <IntroMessage />
        <Countdown />
        <Schedule />
        <Location />
        <GiftDress />
        <RSVP />
        <Closing />
      </main>
      <Toaster />
    </div>
  );
}

function AdminPage() {
  return (
    <AdminLogin>
      <AdminDashboard />
    </AdminLogin>
  );
}

function App() {
  return (
    <WeddingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<InvitationContent />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </WeddingProvider>
  );
}

export default App;
