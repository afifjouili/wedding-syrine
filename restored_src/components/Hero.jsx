import React from 'react';
import { useWeddingData } from '../context/WeddingContext';

export default function Hero() {
  const { weddingData, decor, settings = {} } = useWeddingData();
  const couple = weddingData?.couple || {};
  const isAr = settings?.language === 'ar' || settings?.direction === 'rtl';

  return (
    <section className="relative w-full overflow-hidden pt-8 pb-14 flex flex-col items-center text-center">
      {/* Corner florals */}
      <img
        src={decor.floralLeft}
        alt=""
        className="decor-img absolute -top-3 -left-3 w-[90px] sm:w-[130px] opacity-75 pointer-events-none"
      />
      <img
        src={decor.floralRight}
        alt=""
        className="decor-img absolute -top-3 -right-3 w-[90px] sm:w-[130px] opacity-75 pointer-events-none"
      />

      <div className="relative z-10 w-full flex flex-col items-center px-4">
        <p className="fade-up font-elegant text-[11px] sm:text-[13px] tracking-[0.25em] uppercase text-[#a9802f] mt-6 sm:mt-8">
          {isAr ? 'دعـوة زفـاف' : 'Save The Date'}
        </p>

        <div className="fade-up mt-10 sm:mt-12 flex flex-col items-center w-full" style={{ animationDelay: '150ms' }}>
          <h1 className="font-script text-[46px] sm:text-[64px] leading-[1.15] text-[#3d2e1e] drop-shadow-[0_1px_8px_rgba(169,128,47,0.2)]">
            {couple.groom}
          </h1>

          <div className="my-2.5 flex items-center justify-center gap-4 w-full">
            <span className="hairline w-14 sm:w-24" />
            <span className="font-display italic text-2xl sm:text-3xl text-[#a9802f]">
              {isAr ? 'و' : '&'}
            </span>
            <span className="hairline w-14 sm:w-24" />
          </div>

          <h1 className="font-script text-[46px] sm:text-[64px] leading-[1.15] text-[#3d2e1e] drop-shadow-[0_1px_8px_rgba(169,128,47,0.2)]">
            {couple.bride}
          </h1>
        </div>

        <div className="fade-up mt-8 flex flex-col items-center gap-2" style={{ animationDelay: '300ms' }}>
          <p className="font-elegant text-[11px] sm:text-[12px] tracking-[0.25em] uppercase text-[#6c513f]">
            {isAr ? 'موعدنـا' : 'Wedding Day'}
          </p>
          <div className="font-display text-3xl sm:text-4xl text-[#a9802f] font-normal tracking-wide">
            {(() => {
              if (!couple.weddingDate) return '';
              const parts = String(couple.weddingDate).trim().split(/[./\-]/);
              if (parts.length === 3) {
                let [day, month, year] = parts;
                if (year && year.length === 2) {
                  year = `20${year}`;
                }
                if (isAr) {
                  return (
                    <span className="inline-flex items-center justify-center gap-1.5" dir="rtl">
                      <span>{day}</span>
                      <span className="text-[#a9802f]/60 font-light text-2xl sm:text-3xl">.</span>
                      <span>{month}</span>
                      <span className="text-[#a9802f]/60 font-light text-2xl sm:text-3xl">.</span>
                      <span>{year}</span>
                    </span>
                  );
                }
                return `${day}.${month}.${year}`;
              }
              return couple.weddingDate;
            })()}
          </div>
        </div>
      </div>

      {/* Bottom ornament */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <span className="hairline w-16" />
        <img src={decor.rose} alt="" className="decor-img w-6 opacity-85" />
        <span className="hairline w-16" />
      </div>
    </section>
  );
}
