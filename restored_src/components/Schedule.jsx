import React from 'react';
import { useWeddingData } from '../context/WeddingContext';

export default function Schedule() {
  const { weddingData, decor, settings = {} } = useWeddingData();
  const schedule = weddingData?.schedule || [];
  const isAr = settings?.language === 'ar' || settings?.direction === 'rtl';

  return (
    <section className="relative w-full py-12 flex flex-col items-center overflow-hidden">
      <div className="w-full flex flex-col items-center px-4 relative z-10">
        <div className="text-center w-full flex flex-col items-center">
          <img
            src={decor.acommDecor}
            alt=""
            className="decor-img w-[60px] sm:w-[75px] opacity-75 mb-2"
          />
          <p className="font-elegant text-[11px] tracking-[0.25em] uppercase text-[#a9802f]">
            {isAr ? 'برنامج الحفل' : 'Order of the Evening'}
          </p>
          <h3 className="mt-2 font-display italic text-3xl sm:text-4xl text-[#3d2e1e]">
            {isAr ? 'جدول المواعيد' : 'Schedule of Events'}
          </h3>
          <div className="my-5 mx-auto hairline w-28" />
        </div>

        {/* Schedule illustration */}
        <div className="my-6 flex justify-center w-full">
          <div className="p-2.5 rounded-[16px] bg-[#f0e5d3] border border-[#a9802f]/30 shadow-[0_8px_24px_rgba(108,81,63,0.08)]">
            <img
              src={decor.scheduleImg}
              alt="Wedding schedule illustration"
              className="w-[240px] sm:w-[280px] rounded-[12px] float-y"
            />
          </div>
        </div>

        {/* Events list */}
        <ul className="w-full mt-6 space-y-5">
          {schedule.map((item, i) => (
            <li key={i} className="flex items-baseline gap-3 group w-full">
              <span className="font-display text-xl sm:text-2xl text-[#6e521e] font-normal w-24 shrink-0">
                {item.time}
              </span>
              <span className="h-[1.5px] flex-1 bg-[#a9802f]/35 relative top-[-4px] group-hover:bg-[#a9802f]/70 transition-colors" />
              <span className="font-display italic text-lg sm:text-xl text-[#3d2e1e] group-hover:text-[#6e521e] transition-colors text-right">
                {item.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
