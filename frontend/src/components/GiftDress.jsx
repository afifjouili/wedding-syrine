import React from 'react';
import { decor, weddingData } from '../mock';
import { Gift, Shirt } from 'lucide-react';

export default function GiftDress() {
  const { gift, dressCode } = weddingData;
  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden">
      <img
        src={decor.acommDecor}
        alt=""
        className="decor-img absolute top-10 left-1/2 -translate-x-1/2 w-[80px] md:w-[110px] opacity-85"
      />

      <div className="mx-auto max-w-5xl px-6">
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          <div className="flex flex-col items-center text-center">
            <img src={decor.giftRose} alt="" className="decor-img w-16 md:w-24 mb-6 float-y" />
            <Gift size={22} className="text-[#a1874a] mb-3" />
            <h4 className="font-display italic text-3xl md:text-5xl text-ink">{gift.title}</h4>
            <div className="mx-auto my-6 hairline w-24" />
            <p className="font-body text-lg md:text-xl text-ink-soft max-w-sm">{gift.body}</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <img src={decor.giftRose} alt="" className="decor-img w-16 md:w-24 mb-6 float-y" />
            <Shirt size={22} className="text-[#a1874a] mb-3" />
            <h4 className="font-display italic text-3xl md:text-5xl text-ink">{dressCode.title}</h4>
            <div className="mx-auto my-6 hairline w-24" />
            <p className="font-body text-lg md:text-xl text-ink-soft max-w-sm">{dressCode.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
