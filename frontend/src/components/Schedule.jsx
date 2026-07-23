import React from 'react';
import { decor, weddingData } from '../mock';

export default function Schedule() {
  const { schedule } = weddingData;
  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden">
      <img
        src={decor.acommDecor}
        alt=""
        className="decor-img absolute top-10 left-1/2 -translate-x-1/2 w-[80px] md:w-[110px] opacity-85"
      />

      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="font-elegant text-[11px] md:text-[13px] tracking-[0.45em] uppercase text-ink-soft mt-14">
            Order of the Evening
          </p>
          <h3 className="mt-4 font-display italic text-4xl md:text-6xl text-ink">
            Schedule of Events
          </h3>
          <div className="mx-auto my-8 hairline w-40" />
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div className="order-2 md:order-1 flex justify-center">
            <img
              src={decor.scheduleImg}
              alt="Wedding schedule illustration"
              className="w-[280px] md:w-[420px] drop-shadow-[0_15px_35px_rgba(120,90,40,0.15)] float-y"
            />
          </div>

          <ul className="order-1 md:order-2 space-y-8 md:space-y-10">
            {schedule.map((item, i) => (
              <li key={i} className="flex items-baseline gap-6 group">
                <span className="font-display text-3xl md:text-4xl text-ink w-28 md:w-32 shrink-0">
                  {item.time}
                </span>
                <span className="h-px flex-1 bg-[#b39a63]/40 relative top-[-6px] group-hover:bg-[#b39a63] transition-colors" />
                <span className="font-display italic text-2xl md:text-3xl text-ink-soft group-hover:text-ink transition-colors">
                  {item.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
