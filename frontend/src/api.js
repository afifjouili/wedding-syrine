import axios from 'axios';

const CLOUD_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a00c4359152fa2';
const RSVP_CLOUD_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a0403268b82c85';

export const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('wedding_custom_api');
    if (custom) return custom.trim().replace(/\/+$/, '');
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8001/api';
    }
  }
  return '/api';
};

export const submitRSVP = async (rsvpData) => {
  const newEntry = {
    id: 'rsvp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: rsvpData.name || 'ضيف مجهول',
    attending: rsvpData.attending || 'yes',
    guests: String(rsvpData.guests || '1'),
    song: rsvpData.song || '',
    children: rsvpData.children || '',
    at: new Date().toISOString()
  };

  // 1. Fetch current RSVPs from cloud storage
  let currentList = [];
  try {
    const res = await axios.get(RSVP_CLOUD_URL, { timeout: 6000 });
    if (res.data?.data?.rsvps && Array.isArray(res.data.data.rsvps)) {
      currentList = res.data.data.rsvps;
    }
  } catch (err) {
    console.warn('Could not fetch existing cloud RSVPs:', err.message);
  }

  // 2. Prepend new RSVP and save to cloud
  const updatedList = [newEntry, ...currentList];
  try {
    await axios.put(
      RSVP_CLOUD_URL,
      {
        name: 'wedding_syrine_rsvps_list',
        data: { rsvps: updatedList }
      },
      { timeout: 8000 }
    );
  } catch (err) {
    console.warn('Cloud RSVP save failed:', err.message);
  }

  // 3. Sync to local storage
  try {
    localStorage.setItem('sg_rsvps', JSON.stringify(updatedList));
  } catch (_) {}

  return { status: 'success', data: newEntry };
};

export const fetchRSVPs = async () => {
  // 1. Fetch from cloud storage
  try {
    const res = await axios.get(RSVP_CLOUD_URL, { timeout: 7000 });
    if (res.data?.data?.rsvps && Array.isArray(res.data.data.rsvps)) {
      try {
        localStorage.setItem('sg_rsvps', JSON.stringify(res.data.data.rsvps));
      } catch (_) {}
      return res.data.data.rsvps;
    }
  } catch (err) {
    console.warn('Cloud fetch RSVPs note:', err.message);
  }

  // 2. Fallback to localStorage
  try {
    const local = JSON.parse(localStorage.getItem('sg_rsvps') || '[]');
    return local;
  } catch (_) {}

  return [];
};

export const saveAllRSVPs = async (list) => {
  try {
    await axios.put(
      RSVP_CLOUD_URL,
      {
        name: 'wedding_syrine_rsvps_list',
        data: { rsvps: list }
      },
      { timeout: 8000 }
    );
  } catch (err) {
    console.warn('Cloud save all RSVPs note:', err.message);
  }

  try {
    localStorage.setItem('sg_rsvps', JSON.stringify(list));
  } catch (_) {}

  return list;
};

// Fetch wedding content from persistent cloud storage
export const getContent = async () => {
  // 1. Try Netlify Serverless API (proxies to persistent cloud)
  try {
    const res = await axios.get(`${getApiBaseUrl()}/content`, { timeout: 6000 });
    if (res.data && typeof res.data === 'object' && res.data.weddingData) {
      return res.data;
    }
  } catch (e) {
    console.warn('Netlify API fetch note:', e.message);
  }

  // 2. Direct fallback to cloud database
  try {
    const cloudRes = await axios.get(CLOUD_URL, { timeout: 6000 });
    if (cloudRes.data?.data) {
      const stored = cloudRes.data.data;
      if (stored.weddingData) {
        return stored;
      }
      if (stored.couple || stored.venue) {
        return {
          weddingData: stored,
          settings: stored.settings || { language: 'ar', direction: 'rtl' }
        };
      }
    }
  } catch (cloudErr) {
    console.warn('Cloud fetch note:', cloudErr.message);
  }

  return null;
};

// Save wedding content to persistent cloud storage
export const saveContent = async (data, password) => {
  let saved = false;

  // 1. Save via Netlify Serverless Function (proxies to persistent cloud)
  try {
    const res = await axios.put(
      `${getApiBaseUrl()}/content`,
      { content: data },
      {
        headers: { 'X-Admin-Password': password },
        timeout: 10000
      }
    );
    if (res.status === 200 && res.data?.persisted) {
      saved = true;
    }
  } catch (err) {
    console.warn('Netlify API save note:', err.message);
  }

  // 2. Direct fallback save to cloud database
  if (!saved) {
    try {
      const cloudRes = await axios.put(
        CLOUD_URL,
        {
          name: 'wedding_syrine_wael_live',
          data: data
        },
        { timeout: 10000 }
      );
      if (cloudRes.status === 200) saved = true;
    } catch (cloudErr) {
      console.warn('Direct cloud save note:', cloudErr.message);
    }
  }

  if (!saved) {
    throw new Error('فشل حفظ التغييرات في السحابة. يرجى المحاولة مرة أخرى. / Cloud save failed.');
  }

  return { success: true, persisted: saved };
};
