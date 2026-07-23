import React from 'react';
import { decor, weddingData } from '../mock';
import { MapPin, ExternalLink } from 'lucide-react';

export default function Location() {
  const { venue } = weddingData;
  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden">
      <img
        src={decor.locationLeft}
        alt=""
        className="decor-img absolute top-10 left-8 w-[130px] md:w-[190px] opacity-90"
      />
      <img
        src={decor.locationRight}
        alt=""
        className="decor-img absolute top-10 right-8 w-[130px] md:w-[190px] opacity-90"
      />

      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="font-elegant text-[11px] md:text-[13px] tracking-[0.45em] uppercase text-ink-soft mt-16">
          Where We Say I Do
        </p>
        <h3 className="mt-4 font-display italic text-4xl md:text-6xl text-ink">Location</h3>
        <div className="mx-auto my-8 hairline w-40" />

        <div className="mt-6 flex flex-col items-center gap-2">
          <MapPin size={22} className="text-[#a1874a]" />
          <h4 className="font-display text-3xl md:text-4xl text-ink">{venue.name}</h4>
          <p className="font-body text-lg md:text-xl text-ink-soft">Address: {venue.address}</p>
        </div>

        <div className="mt-12 relative mx-auto max-w-3xl">
          <div className="absolute -inset-3 border border-[#b39a63]/40 rounded-sm pointer-events-none" />
          <div className="relative rounded-sm overflow-hidden shadow-[0_20px_50px_rgba(120,90,40,0.15)]">
            <iframe
              title="Venue map"
              src={venue.embedUrl}
              width="100%"
              height="360"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <a
          href={venue.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-10 inline-flex items-center gap-2 px-8 py-3 border border-[#a1874a] text-ink font-elegant tracking-[0.3em] uppercase text-[11px] md:text-[12px] hover:bg-[#a1874a] hover:text-[#f7ecd0] transition-colors duration-300"
        >
          Open in Maps <ExternalLink size={14} />
        </a>
      </div>
    </section>
  );
}
