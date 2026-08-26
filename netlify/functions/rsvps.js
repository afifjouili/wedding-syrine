const https = require('https');

const GIST_ID = process.env.RSVP_GIST_ID || 'b051ed451577c10b8f68e6e2fb790c1a';
const TOKEN = process.env.RSVP_GH_TOKEN || '';

function fetchGist() {
  return new Promise((resolve) => {
    const req = https.get('https://api.github.com/gists/' + GIST_ID, {
      headers: {
        'User-Agent': 'Wedding-Syrine-Wael-RSVP-App',
        'Authorization': 'Bearer ' + TOKEN,
        'Accept': 'application/vnd.github.v3+json'
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          const file = json.files && json.files['rsvps.json'];
          if (file && file.content) {
            resolve(JSON.parse(file.content));
          } else {
            resolve([]);
          }
        } catch (e) {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
  });
}

function updateGist(rsvps) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      files: {
        'rsvps.json': {
          content: JSON.stringify(rsvps, null, 2)
        }
      }
    });

    const req = https.request('https://api.github.com/gists/' + GIST_ID, {
      method: 'PATCH',
      headers: {
        'User-Agent': 'Wedding-Syrine-Wael-RSVP-App',
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

exports.handler = async function(event, context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 1. GET: Return list of RSVPs
    if (event.httpMethod === 'GET') {
      const list = await fetchGist();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, rsvps: list })
      };
    }

    // 2. POST: Submit a new RSVP
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      const newEntry = {
        id: data.id || ('rsvp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
        name: data.name || 'ضيف مجهول',
        attending: data.attending || 'yes',
        guests: String(data.guests || '1'),
        song: data.song || '',
        children: data.children || '',
        at: data.at || new Date().toISOString()
      };

      const current = await fetchGist();
      const updated = [newEntry, ...current.filter(item => item.id !== newEntry.id)];
      await updateGist(updated);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, entry: newEntry, count: updated.length })
      };
    }

    // 3. PUT: Replace entire list (admin add, edit, or delete)
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body || '{}');
      const list = Array.isArray(data.rsvps) ? data.rsvps : (Array.isArray(data) ? data : []);
      await updateGist(list);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, rsvps: list })
      };
    }

    // 4. DELETE: Clear all RSVPs
    if (event.httpMethod === 'DELETE') {
      await updateGist([]);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, rsvps: [] })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
