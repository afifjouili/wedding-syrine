import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import { useWeddingData } from '../context/WeddingContext';

export default function BackgroundMusic({ autoStart = false }) {
  const { weddingData = {}, settings = {} } = useWeddingData();
  const musicConfig = weddingData?.music || {};
  const musicUrl = musicConfig.url || '/romantic_wedding_song.mp3';
  const isEnabled = musicConfig.enabled !== false;
  const isAr = settings?.language === 'ar' || settings?.direction === 'rtl';

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Play audio safely with gentle volume fade-in
  const playAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.55;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('Autoplay waiting for user gesture:', err.message);
            setIsPlaying(false);
          });
      }
    }
  }, []);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  // Attempt autoplay immediately on page load
  useEffect(() => {
    if (isEnabled) {
      playAudio();
    }
  }, [isEnabled, playAudio]);

  // When envelope is opened
  useEffect(() => {
    if (autoStart && isEnabled) {
      playAudio();
    }
  }, [autoStart, isEnabled, playAudio]);

  // Catch ANY first touch/click/scroll across mobile and desktop
  useEffect(() => {
    const handleImmediateGesture = () => {
      if (isEnabled && audioRef.current && audioRef.current.paused) {
        playAudio();
      }
    };

    window.addEventListener('click', handleImmediateGesture, { passive: true, capture: true });
    window.addEventListener('touchstart', handleImmediateGesture, { passive: true, capture: true });
    window.addEventListener('pointerdown', handleImmediateGesture, { passive: true, capture: true });
    window.addEventListener('scroll', handleImmediateGesture, { passive: true, capture: true });

    return () => {
      window.removeEventListener('click', handleImmediateGesture);
      window.removeEventListener('touchstart', handleImmediateGesture);
      window.removeEventListener('pointerdown', handleImmediateGesture);
      window.removeEventListener('scroll', handleImmediateGesture);
    };
  }, [isEnabled, playAudio]);

  // Handle mobile browser tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab minimized or screen locked
      } else if (isEnabled && isPlaying && audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isEnabled, isPlaying]);

  if (!isEnabled) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={musicUrl}
        loop
        preload="auto"
        autoPlay
        playsInline
        webkit-playsinline="true"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Minimal Luxury Floating Music Button (Mobile & Desktop Optimized) */}
      <div
        className={`fixed z-40 transition-all duration-300 ${
          isAr ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
        }`}
        style={{
          bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? (isAr ? 'إيقاف الموسيقى' : 'Pause Music') : (isAr ? 'تشغيل الموسيقى' : 'Play Music')}
          title={isPlaying ? (isAr ? 'إيقاف الموسيقى' : 'Pause Music') : (isAr ? 'تشغيل الموسيقى' : 'Play Music')}
          className={`group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#a9802f]/60 bg-[rgb(90,15,27)] text-[#f7ecd0] shadow-[0_6px_20px_rgba(90,15,27,0.32)] transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-[rgb(118,20,36)] hover:border-[#a9802f] cursor-pointer select-none touch-manipulation ${
            isPlaying ? 'ring-2 ring-[#a9802f]/50 ring-offset-2 ring-offset-[#f8f1e5]' : 'opacity-85'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {isPlaying ? (
            <div className="relative flex items-center justify-center">
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-[#f7ecd0]" />
              <span className="absolute -inset-1 rounded-full border border-[#a9802f]/40 animate-ping pointer-events-none" />
            </div>
          ) : (
            <Play className="w-4 h-4 sm:w-5 sm:h-5 translate-x-0.5 text-[#f7ecd0]" />
          )}
        </button>
      </div>
    </>
  );
}
