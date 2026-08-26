import React, { useEffect, useState } from 'react';
import { useWeddingData } from '../context/WeddingContext';

function parseWeddingDate(isoDate, displayDate) {
  const normalizeDigits = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  };

  // 1. Try isoDate first if valid
  if (isoDate) {
    const normISO = normalizeDigits(isoDate).trim();
    const parsed = new Date(normISO);
    if (!isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
  }

  // 2. Try displayDate (e.g. "27.09.2026", "27.09.26", "27/09/2026", "2026-09-27")
  if (displayDate) {
    const norm = normalizeDigits(displayDate).trim();

    // Check DD.MM.YYYY or DD.MM.YY or DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = norm.match(/^(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})/);
    if (dmyMatch) {
      let day = parseInt(dmyMatch[1], 10);
      let month = parseInt(dmyMatch[2], 10) - 1;
      let year = parseInt(dmyMatch[3], 10);
      if (year < 100) year += 2000;
      const d = new Date(year, month, day, 17, 0, 0);
      if (!isNaN(d.getTime())) return d.getTime();
    }

    // Check YYYY-MM-DD
    const ymdMatch = norm.match(/^(\d{4})[./\-](\d{1,2})[./\-](\d{1,2})/);
    if (ymdMatch) {
      let year = parseInt(ymdMatch[1], 10);
      let month = parseInt(ymdMatch[2], 10) - 1;
      let day = parseInt(ymdMatch[3], 10);
      const d = new Date(year, month, day, 17, 0, 0);
      if (!isNaN(d.getTime())) return d.getTime();
    }

    const fallback = new Date(norm);
    if (!isNaN(fallback.getTime())) {
      return fallback.getTime();
    }
  }

  // Fallback default: 2026-09-06 17:00:00
  return new Date(2026, 8, 6, 17, 0, 0).getTime();
}

function useCountdown(targetTimestamp) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetTimestamp]);

  const diff = Math.max(0, (targetTimestamp || 0) - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

const pad = (n) => String(n).padStart(2, '0');

function Cell({ value, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-[8px] bg-[#f0e5d3] border border-[#a9802f]/30 shadow-[0_3px_10px_rgba(108,81,63,0.06)] min-w-[50px] sm:min-w-[68px] flex-1 max-w-[76px]">
      <div className="font-display text-2xl sm:text-3xl md:text-4xl text-[#6e521e] font-normal leading-none">
        {pad(value)}
      </div>
      <div className="font-elegant text-[8px] sm:text-[9px] tracking-[0.12em] uppercase text-[#6c513f] mt-1.5">
        {label}
      </div>
    </div>
  );
}

function Colon() {
  return <div className="font-display text-lg sm:text-2xl text-[#a9802f]/70 pb-2 sm:pb-3 font-light px-0.5">:</div>;
}

export default function Countdown() {
  const { weddingData, decor, settings = {} } = useWeddingData();
  const couple = weddingData?.couple || {};
  const targetTimestamp = parseWeddingDate(couple.weddingDateISO, couple.weddingDate);
  const { days, hours, minutes, seconds } = useCountdown(targetTimestamp);
  const isAr = settings?.language === 'ar' || settings?.direction === 'rtl';

  return (
    <section className="relative w-full py-12 flex flex-col items-center text-center overflow-hidden">
      <img
        src={decor.floralLeft}
        alt=""
        className="decor-img absolute -top-2 -left-4 w-[85px] sm:w-[110px] opacity-30 pointer-events-none scale-x-[-1]"
      />
      <img
        src={decor.floralRight}
        alt=""
        className="decor-img absolute -top-2 -right-4 w-[85px] sm:w-[110px] opacity-30 pointer-events-none scale-x-[-1]"
      />

      <div className="relative z-10 w-full flex flex-col items-center px-4">
        <p className="font-elegant text-[11px] tracking-[0.25em] uppercase text-[#a9802f]">
          {isAr ? 'العد التنازلي للزفاف' : 'Countdown Timer'}
        </p>
        <h3 className="mt-2 font-display italic text-2xl sm:text-3xl text-[#3d2e1e]">
          {isAr ? 'لحظات تفصلنا عن موعدنا' : 'The Celebration Begins In'}
        </h3>

        <div className="my-5 hairline w-28" />

        <div className="mt-4 flex items-center justify-center gap-1 sm:gap-2 w-full max-w-[340px] mx-auto">
          <Cell value={days} label={isAr ? 'يوم' : 'Days'} />
          <Colon />
          <Cell value={hours} label={isAr ? 'ساعة' : 'Hours'} />
          <Colon />
          <Cell value={minutes} label={isAr ? 'دقيقة' : 'Minutes'} />
          <Colon />
          <Cell value={seconds} label={isAr ? 'ثانية' : 'Seconds'} />
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 opacity-80">
          <img src={decor.timerBud1} alt="" className="decor-img w-5" />
          <img src={decor.timerBud2} alt="" className="decor-img w-5" />
          <img src={decor.timerBud3} alt="" className="decor-img w-5" />
          <img src={decor.timerBud4} alt="" className="decor-img w-4" />
          <img src={decor.timerBud5} alt="" className="decor-img w-4" />
          <img src={decor.timerBud6} alt="" className="decor-img w-5" />
        </div>
      </div>
    </section>
  );
}
