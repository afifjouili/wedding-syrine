import React from 'react';
import { decor, weddingData } from '../mock';
import { ChevronDown } from 'lucide-react';

export default function IntroMessage() {
  const { intro } = weddingData;
  return (
    <section className="relative w-full py-24 md:py-36">
      <img
        src={decor.rightElement}
        alt=""
        className="decor-img absolute top-10 right-8 w-[70px] md:w-[100px] opacity-90"
      />
      <img
        src={decor.leftElement}
        alt=""
        className="decor-img absolute top-10 left-8 w-[70px] md:w-[100px] opacity-90"
      />

      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="font-elegant text-[11px] md:text-[13px] tracking-[0.45em] uppercase text-ink-soft">
          Bismillah
        </p>

        <h2 className="mt-8 font-display text-4xl md:text-6xl italic text-ink leading-tight">
          {intro.lineOne}
          <br />
          <span className="font-script text-5xl md:text-7xl not-italic"> {intro.lineTwo}</span>
        </h2>

        <div className="my-8 mx-auto hairline w-40" />

        <p className="font-display text-2xl md:text-3xl text-ink-soft italic">
          {intro.lineThree}
        </p>

        <div className="mt-16">
          <p className="font-elegant text-[11px] md:text-[13px] tracking-[0.45em] uppercase text-ink-soft">
            {intro.salutation}
          </p>
          <p className="mt-6 font-display text-xl md:text-2xl leading-relaxed text-ink max-w-2xl mx-auto">
            {intro.body}
          </p>
        </div>

        <div className="mt-20 flex flex-col items-center gap-2">
          <img src={decor.scrollLeaf} alt="" className="decor-img w-[120px] md:w-[160px] opacity-85" />
          <div className="flex items-center gap-2 text-ink-soft">
            <span className="font-elegant text-[11px] tracking-[0.4em] uppercase">Scroll down</span>
            <ChevronDown size={16} className="animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
