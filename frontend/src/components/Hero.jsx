import React from 'react';
import { decor, weddingData } from '../mock';

export default function Hero() {
  const { couple } = weddingData;
  return (
    <section className="relative w-full overflow-hidden pt-14 md:pt-20 pb-24 md:pb-32">
      {/* Corner florals */}
      <img
        src={decor.floralLeft}
        alt=""
        className="decor-img absolute -top-6 -left-6 w-[180px] md:w-[260px] lg:w-[310px] opacity-95"
      />
      <img
        src={decor.floralRight}
        alt=""
        className="decor-img absolute -top-6 -right-6 w-[180px] md:w-[260px] lg:w-[320px] opacity-95"
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <p className="fade-up font-elegant text-[11px] md:text-[13px] tracking-[0.5em] uppercase text-ink-soft mt-16">
          Save The Date
        </p>

        <div className="fade-up mt-10 flex flex-col items-center" style={{ animationDelay: '150ms' }}>
          <h1 className="font-script text-[92px] leading-none md:text-[150px] lg:text-[190px] text-ink">
            {couple.groom}
          </h1>
          <div className="my-2 md:my-3 flex items-center gap-6">
            <span className="hairline w-24 md:w-36" />
            <span className="font-display italic text-3xl md:text-5xl text-ink">&amp;</span>
            <span className="hairline w-24 md:w-36" />
          </div>
          <h1 className="font-script text-[92px] leading-none md:text-[150px] lg:text-[190px] text-ink">
            {couple.bride}
          </h1>
        </div>

        <div className="fade-up mt-12 flex flex-col items-center gap-3" style={{ animationDelay: '300ms' }}>
          <p className="font-elegant text-[12px] md:text-[14px] tracking-[0.5em] uppercase text-ink-soft">
            Wedding Day
          </p>
          <p className="font-display text-4xl md:text-6xl text-ink">{couple.weddingDate}</p>
        </div>
      </div>

      {/* Bottom ornament */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <span className="hairline w-20" />
        <img src={decor.rose} alt="" className="decor-img w-8 opacity-90" />
        <span className="hairline w-20" />
      </div>
    </section>
  );
}
