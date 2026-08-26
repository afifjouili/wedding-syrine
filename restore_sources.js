const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function restore() {
  const targetDir = path.join(__dirname, 'restored_src');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  console.log('Fetching JS map...');
  const mapPath = path.join(process.env.TEMP, 'wedding_syrine_wael.map');
  let jsMap;
  if (fs.existsSync(mapPath)) {
    jsMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  } else {
    jsMap = await fetchJson('https://wedding-syrine-wael.netlify.app/static/js/main.9bc87c6f.js.map');
  }

  console.log('Restoring JS source files...');
  for (let i = 0; i < jsMap.sources.length; i++) {
    const srcName = jsMap.sources[i];
    // Filter out node_modules and webpack internals
    if (!srcName.includes('node_modules') && !srcName.startsWith('../webpack')) {
      const content = jsMap.sourcesContent[i];
      if (content) {
        const outPath = path.join(targetDir, srcName);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, content, 'utf8');
        console.log('Extracted:', srcName);
      }
    }
  }

  console.log('Fetching CSS map...');
  const cssMap = await fetchJson('https://wedding-syrine-wael.netlify.app/static/css/main.fb6a8952.css.map');
  for (let i = 0; i < cssMap.sources.length; i++) {
    const srcName = cssMap.sources[i];
    const content = cssMap.sourcesContent[i];
    if (content) {
      const outPath = path.join(targetDir, srcName);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, content, 'utf8');
      console.log('Extracted CSS:', srcName);
    }
  }

  console.log('Finished restoring sources!');
}

restore().catch(console.error);
