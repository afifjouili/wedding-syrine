const fs = require('fs');
const path = require('path');
const https = require('https');

function download(url, dest) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            console.log('Downloaded:', url, '->', dest);
            resolve(true);
          });
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        console.log('Not found (status ' + res.statusCode + '):', url);
        resolve(false);
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      console.log('Error downloading:', url, err.message);
      resolve(false);
    });
  });
}

async function run() {
  const publicDir = path.join(__dirname, 'frontend', 'public');
  const files = [
    'wax_seal_wc.jpg',
    'closing_photo.jpg',
    'envelope_wc.jpg',
    'romantic_wedding_song.mp3',
    'manifest.json'
  ];

  for (const f of files) {
    const url = 'https://wedding-syrine-wael.netlify.app/' + f;
    const dest = path.join(publicDir, f);
    await download(url, dest);
  }
}

run();
