import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getContent, saveContent } from '../api';
import { decor as defaultDecor } from '../mock';

// These defaults are ONLY used as a last resort if cloud AND localStorage both fail.
// The cloud (admin panel saves) is the single source of truth.
export const defaultWeddingData = {
  couple: { groom: 'سيرين', bride: 'وائل', weddingDate: '06-09-2026', weddingDateISO: '2026-09-06T16:00:00' },
  intro: {
    lineOne: 'روحـان',
    lineTwo: 'وقـدرٌ واحـد',
    lineThree: 'ميثاقٌ كُتب عند الله',
    salutation: 'الأهل والأحبّة الكرام',
    body: 'يسعدنا ويشرفنا دعوتكم لمشاركتنا فرحتنا بأجمل ليالي العمر، لتكتمل سعادتنا بحضوركم ودعواتكم الصادقة لنا ببداية حياة مباركة.'
  },
  schedule: [
    { time: '16:00 م', title: 'استقبال الضيوف' },
    { time: '17:00 م', title: 'عقد القران المبارك' },
    { time: '18:00 م', title: 'الاحتفال والزفة' }
  ],
  venue: {
    title: 'الموقع الرئيسي',
    name: 'قاعة أفراح EVASION منوبة',
    address: 'منوبة، تونس (Manouba, Tunisie)',
    mapUrl: 'https://maps.app.goo.gl/keGLD4wndExvC7kG7',
    embedUrl: 'https://maps.google.com/maps?q=36.8082595,10.0789402&z=15&output=embed'
  },
  secondVenue: {
    enabled: false,
    title: 'الموقع الثاني',
    name: '',
    address: '',
    mapUrl: '',
    embedUrl: ''
  },
  gift: {
    title: 'أجمل الهدايا',
    body: 'حضوركم ومشاركتكم فرحتنا هي أغلى وأجمل هدية نتمناها.'
  },
  dressCode: {
    title: 'الزي الرسمي',
    body: 'نتطلع لرؤيتكم بأبهى حلة تليق بهذه المناسبة السعيدة.\nالرجاء الالتزام باللون الوردي بالنسبة الى الفتيات'
  },
  rsvp: {
    heading: 'تأكيد الحضور',
    subheading: 'لتجهيز كل الترتيبات على أكمل وجه، نرجو التكرم بتأكيد حضوركم الكريم.',
    deadline: 'يرجى تأكيد الحضور قبل 09 أوت'
  },
  closing: {
    line: 'نتشرف بحضوركم ونتطلع لرؤيتكم جميعاً!',
    signature: 'سيرين & وائل'
  },
  music: {
    enabled: true,
    url: '/romantic_wedding_song.mp3',
    title: 'Classic Romantic Wedding Melody'
  }
};

const defaultSettings = { language: 'ar', direction: 'rtl' };

const WeddingContext = createContext();

export const useWeddingData = () => useContext(WeddingContext);

// Helper to encode state to shareable URL hash
export const generateShareableUrl = (fullData) => {
  try {
    const compact = {
      w: fullData.weddingData,
      d: fullData.decor,
      s: fullData.settings
    };
    const jsonStr = JSON.stringify(compact);
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/#d=${encoded}`;
  } catch (e) {
    console.error('Failed to generate share URL', e);
    return typeof window !== 'undefined' ? window.location.origin : '';
  }
};

// Helper to decode state from URL hash
const decodeStateFromUrl = () => {
  try {
    if (typeof window !== 'undefined' && window.location.hash) {
      const match = window.location.hash.match(/#d=([^&]+)/);
      if (match && match[1]) {
        const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(match[1]))));
        const parsed = JSON.parse(jsonStr);
        if (parsed) {
          const result = {
            weddingData: parsed.w || parsed.weddingData || defaultWeddingData,
            decor: parsed.d || parsed.decor || defaultDecor,
            settings: parsed.s || parsed.settings || defaultSettings
          };
          localStorage.setItem('wedding_content', JSON.stringify(result));
          return result;
        }
      }
    }
  } catch (e) {
    console.warn('URL hash state parser note:', e);
  }
  return null;
};

// Deep merge helper: cloud data fields override defaults, preserving structure
const deepMergeWeddingData = (defaults, cloud) => {
  const merged = { ...defaults };
  for (const key of Object.keys(cloud)) {
    if (Array.isArray(cloud[key])) {
      merged[key] = cloud[key];
    } else if (typeof cloud[key] === 'object' && cloud[key] !== null) {
      merged[key] = { ...(defaults[key] || {}), ...cloud[key] };
    } else {
      merged[key] = cloud[key];
    }
  }
  return merged;
};

export const WeddingProvider = ({ children }) => {
  // loading = true means we haven't fetched cloud data yet.
  // We show a loading screen so visitors NEVER see hardcoded defaults.
  const [loading, setLoading] = useState(true);
  const [weddingData, setWeddingData] = useState(defaultWeddingData);
  const [decor, setDecor] = useState(defaultDecor);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const loadData = async () => {
      // Priority order:
      // 1. URL hash (shareable link)
      // 2. Cloud API (admin panel saves — the REAL source of truth)
      // 3. localStorage cache (offline fallback)
      // 4. Hardcoded defaults (absolute last resort)

      // 1. Try URL hash
      const fromUrl = decodeStateFromUrl();
      if (fromUrl) {
        setWeddingData(prev => deepMergeWeddingData(prev, fromUrl.weddingData || {}));
        if (fromUrl.decor) setDecor(prev => ({ ...prev, ...fromUrl.decor }));
        if (fromUrl.settings) setSettings(prev => ({ ...prev, ...fromUrl.settings }));
        setLoading(false);
        return;
      }

      // 2. Try cloud API (the source of truth for admin changes)
      try {
        const cloudData = await getContent();
        if (cloudData && typeof cloudData === 'object' && cloudData.weddingData) {
          setWeddingData(prev => deepMergeWeddingData(prev, cloudData.weddingData));
          if (cloudData.decor) setDecor(prev => ({ ...prev, ...cloudData.decor }));
          if (cloudData.settings) setSettings(prev => ({ ...prev, ...cloudData.settings }));
          // Cache cloud data to localStorage for offline use
          localStorage.setItem('wedding_content', JSON.stringify(cloudData));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Cloud fetch failed, trying localStorage cache');
      }

      // 3. Try localStorage cache (offline fallback)
      try {
        const local = localStorage.getItem('wedding_content');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed.weddingData) {
            setWeddingData(prev => deepMergeWeddingData(prev, parsed.weddingData));
          }
          if (parsed.decor) setDecor(prev => ({ ...prev, ...parsed.decor }));
          if (parsed.settings) setSettings(prev => ({ ...prev, ...parsed.settings }));
        }
      } catch (e) {
        console.warn('localStorage parse failed');
      }

      // 4. If nothing worked, defaults are already set
      setLoading(false);
    };

    loadData();
  }, []);

  const updateWeddingData = (section, data) => {
    setWeddingData((prev) => ({
      ...prev,
      [section]: Array.isArray(data) ? data : { ...prev[section], ...data }
    }));
  };

  const updateDecor = (key, value) => {
    setDecor((prev) => ({ ...prev, [key]: value }));
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const saveAll = async (password) => {
    const correctPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'Samar43313313*';
    if (!password || password.trim() !== correctPassword) {
      throw new Error('كلمة المرور غير صحيحة. يرجى إدخال كلمة المرور الصحيحة لحفظ التغييرات.\nIncorrect admin password.');
    }

    const fullData = { weddingData, decor, settings };

    // 1. Cache to localStorage immediately
    localStorage.setItem('wedding_content', JSON.stringify(fullData));

    // 2. Save to persistent cloud (critical — this is what all visitors see)
    await saveContent(fullData, password);

    return true;
  };

  const resetToDefaults = () => {
    localStorage.removeItem('wedding_content');
    setWeddingData(defaultWeddingData);
    setDecor(defaultDecor);
    setSettings(defaultSettings);
  };

  return (
    <WeddingContext.Provider value={{
      weddingData,
      decor,
      settings,
      loading,
      updateWeddingData,
      updateDecor,
      updateSettings,
      saveAll,
      resetToDefaults
    }}>
      {children}
    </WeddingContext.Provider>
  );
};
