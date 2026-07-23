import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import IntroSplash from './components/IntroSplash';
import Hero from './components/Hero';
import IntroMessage from './components/IntroMessage';
import Countdown from './components/Countdown';
import Schedule from './components/Schedule';
import Location from './components/Location';
import GiftDress from './components/GiftDress';
import RSVP from './components/RSVP';
import Closing from './components/Closing';

function Invitation() {
  const [opened, setOpened] = useState(false);
  return (
    <div className="App bg-cream grain min-h-screen">
      {!opened && <IntroSplash onOpen={() => setOpened(true)} />}
      <main className={opened ? 'fade-in' : 'opacity-0'}>
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Invitation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
