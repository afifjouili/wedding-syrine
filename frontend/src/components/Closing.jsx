import React from 'react';
import { decor, weddingData } from '../mock';

export default function Closing() {
  const { closing } = weddingData;
  return (
    <section className="relative w-full pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={decor.closingPhoto}
              alt="Together forever"
              className="w-[320px] md:w-[440px] rounded-sm shadow-[0_25px_50px_rgba(120,90,40,0.25)]"
            />
            <div className="absolute -inset-3 border border-[#b39a63]/50 rounded-sm pointer-events-none" />
          </div>
        </div>

        <p className="mt-14 font-display italic text-3xl md:text-5xl text-ink">
          {closing.line}
        </p>

        <img
          src={decor.finalFloral}
          alt=""
          className="decor-img mx-auto mt-10 w-[360px] md:w-[500px] opacity-90"
        />

        <h2 className="font-script text-6xl md:text-8xl text-ink -mt-2">
          {closing.signature}
        </h2>

        <p className="mt-12 font-elegant text-[10px] tracking-[0.4em] uppercase text-ink-soft">
          The Sacred Garden · An Invitation Crafted With Love
        </p>
      </div>
    </section>
  );
}
