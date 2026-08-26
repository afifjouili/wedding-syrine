import React from 'react';
import { useWeddingData } from '../context/WeddingContext';
import { ChevronDown } from 'lucide-react';

export default function IntroMessage() {
  const { weddingData, decor, settings = {} } = useWeddingData();
  const intro = weddingData?.intro || {};
  const isAr = settings?.language === 'ar' || settings?.direction === 'rtl';

  return (
    <section className="relative w-full py-12 flex flex-col items-center text-center">
      <div className="w-full flex flex-col items-center px-4 relative z-10">
        {/* Top Bismillah Calligraphy & Flourishes */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <img
            src={decor.leftElement}
            alt=""
            className="decor-img w-8 sm:w-10 opacity-70"
          />
          <img
            src={decor.scrollLeaf}
            alt="Bismillah"
            className="decor-img w-[110px] sm:w-[130px] opacity-85"
          />
          <img
            src={decor.rightElement}
            alt=""
            className="decor-img w-8 sm:w-10 opacity-70"
          />
        </div>

        <h2 className="mt-4 font-display text-3xl sm:text-4xl italic text-[#3d2e1e] leading-tight">
          {intro.lineOne}
          <br />
          <span className="font-script text-4xl sm:text-5xl not-italic text-[#a9802f] block mt-1">
            {intro.lineTwo}
          </span>
        </h2>

        <div className="my-5 hairline w-28" />

        <p className="font-display text-xl sm:text-2xl text-[#6c513f] italic">
          {intro.lineThree}
        </p>

        <div className="mt-8 w-full flex flex-col items-center">
          <p className="font-elegant text-[11px] sm:text-[12px] tracking-[0.3em] uppercase text-[#a9802f]">
            {intro.salutation}
          </p>
          <p className="mt-3 font-body text-[17px] leading-[1.65] text-[#5a4a38] max-w-[380px] mx-auto">
            {intro.body}
          </p>
        </div>

        {/* Scroll Down Action */}
        <div className="mt-10 flex flex-col items-center">
          <button
            onClick={() => window.scrollBy({ top: 380, behavior: 'smooth' })}
            className="btn-1"
            style={{ padding: '0px' }}
          >
            <span className="font-elegant text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#a9802f]">
              {isAr ? 'مرر للأسفل' : 'Scroll down'}
            </span>
            <ChevronDown size={14} className="animate-bounce text-[#a9802f]" />
          </button>
        </div>
      </div>
    </section>
  );
}
