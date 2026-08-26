import React, { useEffect, useState } from 'react';
import { useWeddingData } from '../context/WeddingContext';

export default function IntroSplash({ onOpen }) {
  const { decor = {}, settings = {} } = useWeddingData();
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);
  const isAr = settings?.language === 'ar' || settings?.direction === 'rtl';

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => {
      setHidden(true);
      onOpen && onOpen();
    }, 1100);
  };

  useEffect(() => {
    document.body.style.overflow = hidden ? 'auto' : 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#f8f1e5] p-4 transition-opacity duration-700 ${
        opening ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(169,128,47,0.08)_0%,rgba(248,241,229,0.95)_70%)] pointer-events-none" />

      {/* Button 3: padding 0px */}
      <button
        aria-label={isAr ? 'افتح الدعوة' : 'Open your invitation'}
        onClick={handleOpen}
        className="btn-3 group relative z-10 flex flex-col items-center focus:outline-none cursor-pointer"
        style={{ padding: '0px' }}
      >
        <img
          src={decor.envelope}
          alt={isAr ? 'افتح الدعوة' : 'Open your invitation'}
          className={`w-[260px] sm:w-[320px] max-w-[360px] rounded-[15px] drop-shadow-[0_16px_32px_rgba(108,81,63,0.18)] transition-transform duration-500 ${
            opening ? 'scale-[2.2] opacity-0' : 'group-hover:scale-[1.03]'
          }`}
          style={{ animation: opening ? undefined : 'envelopePulse 3.2s ease-in-out infinite' }}
        />
        <span
          className="mt-6 font-elegant text-[12px] sm:text-[13px] tracking-[0.2em] uppercase text-[#a9802f] group-hover:text-[#6e521e] transition-colors"
          style={{ animation: 'bounceGentle 2.2s ease-in-out infinite' }}
        >
          {isAr ? 'اضغط لفتح الدعوة' : 'Tap to open'}
        </span>
      </button>
    </div>
  );
}
