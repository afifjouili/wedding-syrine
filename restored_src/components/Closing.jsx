import React from 'react';
import { useWeddingData } from '../context/WeddingContext';

export default function Closing() {
  const { weddingData, decor, settings = {} } = useWeddingData();
  const closing = weddingData?.closing || {};
  const isAr = settings?.language === 'ar' || settings?.direction === 'rtl';

  return (
    <section className="relative w-full pt-12 pb-20 flex flex-col items-center overflow-hidden">
      <div className="w-full flex flex-col items-center px-4 text-center">
        {/* Photo with luxury gold border */}
        <div className="flex justify-center w-full">
          <div className="relative p-2 rounded-[16px] bg-[#f0e5d3] border border-[#a9802f]/40 shadow-[0_12px_32px_rgba(108,81,63,0.12)]">
            <img
              src={decor.closingPhoto}
              alt="Together forever"
              className="w-[260px] sm:w-[320px] rounded-[12px] object-cover"
            />
          </div>
        </div>

        <p className="mt-8 font-display italic text-2xl sm:text-3xl text-[#3d2e1e] max-w-[340px]">
          {closing.line}
        </p>

        <img
          src={decor.finalFloral}
          alt=""
          className="decor-img mx-auto mt-6 w-[190px] sm:w-[230px] opacity-75"
        />

        <h2 className="font-script text-5xl sm:text-6xl text-[#6e521e] mt-4 sm:mt-5 drop-shadow-[0_1px_8px_rgba(169,128,47,0.2)]">
          {closing.signature}
        </h2>

        <div className="my-6 hairline w-32" />

        <p className="font-elegant text-[9px] sm:text-[11px] tracking-[0.15em] uppercase text-[#6c513f]">
          {isAr ? 'دعوة زفاف صنعت بكل حب' : 'Wedding Invitation Crafted With Love'}
        </p>
      </div>
    </section>
  );
}
