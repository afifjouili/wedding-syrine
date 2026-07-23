import React, { useEffect, useState } from 'react';
import { decor, weddingData } from '../mock';

function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

const pad = (n) => String(n).padStart(2, '0');

function Cell({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-[70px] md:min-w-[110px]">
      <div className="font-display text-5xl md:text-7xl text-ink">{pad(value)}</div>
      <div className="font-elegant text-[10px] md:text-[12px] tracking-[0.35em] uppercase text-ink-soft mt-2">
        {label}
      </div>
    </div>
  );
}

function Colon() {
  return <div className="font-display text-4xl md:text-6xl text-ink-soft pb-6">:</div>;
}

export default function Countdown() {
  const { couple } = weddingData;
  const { days, hours, minutes, seconds } = useCountdown(couple.weddingDateISO);

  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden">
      <img
        src={decor.floralLeft}
        alt=""
        className="decor-img absolute left-0 top-1/2 -translate-y-1/2 w-[180px] md:w-[280px] opacity-70 scale-x-[-1]"
      />
      <img
        src={decor.floralRight}
        alt=""
        className="decor-img absolute right-0 top-1/2 -translate-y-1/2 w-[180px] md:w-[280px] opacity-70 scale-x-[-1]"
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <p className="font-elegant text-[11px] md:text-[13px] tracking-[0.45em] uppercase text-ink-soft">
          Countdown Timer
        </p>
        <h3 className="mt-6 font-display italic text-3xl md:text-5xl text-ink">
          The Celebration Begins In
        </h3>

        <div className="mx-auto my-8 hairline w-40" />

        <div className="mt-10 flex items-end justify-center gap-3 md:gap-6">
          <Cell value={days} label="Days" />
          <Colon />
          <Cell value={hours} label="Hours" />
          <Colon />
          <Cell value={minutes} label="Minutes" />
          <Colon />
          <Cell value={seconds} label="Seconds" />
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 opacity-90">
          <img src={decor.timerBud1} alt="" className="decor-img w-6" />
          <img src={decor.timerBud2} alt="" className="decor-img w-6" />
          <img src={decor.timerBud3} alt="" className="decor-img w-6" />
          <img src={decor.timerBud4} alt="" className="decor-img w-5" />
          <img src={decor.timerBud5} alt="" className="decor-img w-5" />
          <img src={decor.timerBud6} alt="" className="decor-img w-6" />
        </div>
      </div>
    </section>
  );
}
