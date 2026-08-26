import React from 'react';
import { useWeddingData } from '../context/WeddingContext';
import { Gift, Shirt } from 'lucide-react';

export default function GiftDress() {
  const { weddingData, decor } = useWeddingData();
  const gift = weddingData?.gift || {};
  const dressCode = weddingData?.dressCode || {};

  return (
    <section className="relative w-full py-12 flex flex-col items-center overflow-hidden">
      <div className="w-full flex flex-col items-center px-4 space-y-6 sm:space-y-8 mt-4">
        {/* Gift Card */}
        <div className="wedding-card w-full flex flex-col items-center text-center p-5 sm:p-8">
          <img src={decor.giftRose} alt="" className="decor-img w-10 sm:w-14 mb-3 float-y" />
          <Gift size={20} className="text-[#a9802f] mb-2" />
          <h4 className="font-display italic text-2xl sm:text-3xl text-[#6e521e]">{gift.title}</h4>
          <div className="my-4 mx-auto hairline w-20" />
          <p className="font-body text-[16px] leading-[1.7] text-[#5a4a38] max-w-[320px]">
            {gift.body}
          </p>
        </div>

        {/* Dress Code Card */}
        <div className="wedding-card w-full flex flex-col items-center text-center p-5 sm:p-8">
          <img src={decor.giftRose} alt="" className="decor-img w-10 sm:w-14 mb-3 float-y" />
          <Shirt size={20} className="text-[#a9802f] mb-2" />
          <h4 className="font-display italic text-2xl sm:text-3xl text-[#6e521e]">{dressCode.title}</h4>
          <div className="my-4 mx-auto hairline w-20" />
          <p className="font-body text-[16px] leading-[1.7] text-[#5a4a38] max-w-[320px]">
            {dressCode.body}
          </p>
        </div>
      </div>
    </section>
  );
}
