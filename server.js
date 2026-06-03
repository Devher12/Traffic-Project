const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // CORS headers — allow the HTML file to call this server
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);

  // Route: /tomtom?lat=...&lng=...&key=...
  if (parsed.pathname === '/tomtom') {
    const lat = parsed.query.lat;
    const lng = parsed.query.lng;
    const key = parsed.query.key;

    if (!lat || !lng || !key) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing lat, lng or key' }));
      return;
    }

    const tomtomUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lng}&key=${key}`;

    https.get(tomtomUrl, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    }).on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });

  // Route: serve the HTML file
  } else if (parsed.pathname === '/' || parsed.pathname.endsWith('.html')) {
    const filePath = path.join(__dirname, parsed.pathname === '/' ? 'traffic-risk-dashboard-FINAL.html' : parsed.pathname.slice(1));
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });

  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('✅ Smart Traffic Dashboard Server running!');
  console.log('');
  console.log(`👉 Open this in your browser:`);
  console.log(`   http://localhost:${PORT}/traffic-risk-dashboard-FINAL.html`);
  console.log('');
  console.log('Press Ctrl+C to stop the server.');
  console.log('');
});