import React from 'react';
import { useWeddingData } from '../context/WeddingContext';
import { MapPin, ExternalLink } from 'lucide-react';

export default function Location() {
  const { weddingData, decor, settings = {} } = useWeddingData();
  const venue = weddingData?.venue || {};
  const secondVenue = weddingData?.secondVenue;
  const isAr = settings?.language === 'ar' || settings?.direction === 'rtl';

  const hasSecond = Boolean(secondVenue?.enabled && (secondVenue.name || secondVenue.address));

  const resolveEmbedUrl = (v) => {
    if (v?.embedUrl && (v.embedUrl.includes('output=embed') || v.embedUrl.includes('/embed'))) {
      return v.embedUrl;
    }
    const query = encodeURIComponent([v?.name, v?.address].filter(Boolean).join(', ') || 'Tunis');
    return `https://www.google.com/maps?q=${query}&output=embed`;
  };

  const resolveMapUrl = (v) => {
    if (v?.mapUrl && v.mapUrl.startsWith('http')) {
      return v.mapUrl;
    }
    const query = encodeURIComponent([v?.name, v?.address].filter(Boolean).join(', ') || 'Tunis');
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const venuesList = hasSecond ? [
    { ...venue, title: venue.title || (isAr ? 'الموقع الأول' : 'Location 1') },
    { ...secondVenue, title: secondVenue.title || (isAr ? 'الموقع الثاني' : 'Location 2') }
  ] : [
    { ...venue, title: null }
  ];

  return (
    <section className="relative w-full py-12 flex flex-col items-center text-center overflow-hidden">
      <img
        src={decor.locationLeft}
        alt=""
        className="decor-img absolute top-1 left-1 w-[60px] sm:w-[80px] opacity-75 pointer-events-none"
      />
      <img
        src={decor.locationRight}
        alt=""
        className="decor-img absolute top-1 right-1 w-[60px] sm:w-[80px] opacity-75 pointer-events-none"
      />

      <div className="w-full flex flex-col items-center px-4 relative z-10 pt-2">
        <p className="font-elegant text-[11px] tracking-[0.25em] uppercase text-[#a9802f]">
          {isAr ? 'مـوقع الحفـل' : 'Where We Say I Do'}
        </p>
        <h3 className="mt-2 font-display italic text-3xl sm:text-4xl text-[#3d2e1e]">
          {isAr ? (hasSecond ? 'مواقع الحفل' : 'المـكان والـعنوان') : (hasSecond ? 'Wedding Locations' : 'Location')}
        </h3>
        <div className="my-5 hairline w-28" />

        <div className={`w-full ${hasSecond ? 'space-y-10' : 'space-y-6'}`}>
          {venuesList.map((v, idx) => (
            <div key={idx} className={hasSecond ? "wedding-card p-5 sm:p-7 flex flex-col items-center text-center w-full" : "flex flex-col items-center text-center w-full"}>
              {v.title && (
                <span className="mb-3 inline-block px-4 py-1 rounded-full bg-[#a9802f]/15 border border-[#a9802f]/40 font-elegant text-xs tracking-wider uppercase text-[#a9802f]">
                  {v.title}
                </span>
              )}

              <div className="flex flex-col items-center gap-1.5 w-full">
                <MapPin size={18} className="text-[#a9802f]" />
                <h4 className="font-display text-2xl sm:text-3xl text-[#6e521e]">{v.name}</h4>
                <p className="font-body text-[16px] text-[#5a4a38] leading-[1.6] max-w-[340px]">
                  {isAr ? 'العنوان: ' : 'Address: '}{v.address}
                </p>
              </div>

              {/* Map Frame */}
              <div className="mt-6 w-full relative">
                <div className="p-1 rounded-[15px] bg-[#f0e5d3] border border-[#a9802f]/30 shadow-[0_12px_35px_rgba(0,0,0,0.06)] overflow-hidden">
                  <iframe
                    title={`Venue map ${idx + 1}`}
                    src={resolveEmbedUrl(v)}
                    width="100%"
                    height="240"
                    style={{ border: 0, borderRadius: '12px' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* Button 2 */}
              <a
                href={resolveMapUrl(v)}
                target="_blank"
                rel="noreferrer"
                className="btn-2 mt-6"
              >
                <span>{isAr ? 'فتح في خرائط جوجل' : 'Open in Maps'}</span>
                <ExternalLink size={15} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
