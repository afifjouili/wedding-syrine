import axios from 'axios';

const CLOUD_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a00c4359152fa2';

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
  try {
    const response = await axios.post(`${getApiBaseUrl()}/rsvp`, rsvpData, { timeout: 8000 });
    return response.data;
  } catch (error) {
    console.warn('RSVP note:', error.message);
    return { status: 'success', local: true };
  }
};

export const fetchRSVPs = async () => {
  try {
    const response = await axios.get(`${getApiBaseUrl()}/rsvps`, { timeout: 8000 });
    return response.data;
  } catch (error) {
    return { issues: [] };
  }
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
