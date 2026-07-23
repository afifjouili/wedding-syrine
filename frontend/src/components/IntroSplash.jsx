import React, { useEffect, useState } from 'react';
import { decor } from '../mock';

export default function IntroSplash({ onOpen }) {
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => {
      setHidden(true);
      onOpen && onOpen();
    }, 1100);
  };

  useEffect(() => {
    // Ensure body scroll is locked while splash is up
    document.body.style.overflow = hidden ? 'auto' : 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-[#f7ecd0] transition-opacity duration-700 ${
        opening ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <button
        aria-label="Open your invitation"
        onClick={handleOpen}
        className="group flex flex-col items-center focus:outline-none"
      >
        <img
          src={decor.envelope}
          alt="Open your invitation"
          className={`w-[260px] md:w-[360px] lg:w-[420px] drop-shadow-[0_10px_25px_rgba(120,90,40,0.25)] transition-transform duration-500 ${
            opening ? 'scale-[2.2] opacity-0' : 'group-hover:scale-[1.03]'
          }`}
          style={{ animation: opening ? undefined : 'envelopePulse 3.2s ease-in-out infinite' }}
        />
        <span
          className="mt-6 font-elegant text-[13px] md:text-[14px] tracking-[0.35em] uppercase text-ink-soft"
          style={{ animation: 'bounceGentle 2.2s ease-in-out infinite' }}
        >
          Tap to open
        </span>
      </button>
    </div>
  );
}
