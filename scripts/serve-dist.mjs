import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = process.argv[2]; const v = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const global = v.headers.find((h) => h.source === '/(.*)').headers;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  for (const r of v.redirects) if (url === r.source) { res.writeHead(308, { Location: r.destination }); return res.end(); }
  if (url.length > 1 && url.endsWith('/')) { res.writeHead(308, { Location: url.slice(0, -1) }); return res.end(); }
  let f = path.join(root, url); if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
  let status = 200; if (!fs.existsSync(f)) { f = path.join(root, '404.html'); status = 404; }
  const h = { 'Content-Type': types[path.extname(f)] ?? 'application/octet-stream' }; for (const x of global) h[x.key] = x.key === 'Content-Security-Policy' ? x.value.replace(/;\s*upgrade-insecure-requests/, '') : x.value; // local server is plain http; WebKit would upgrade localhost requests to https
  res.writeHead(status, h); fs.createReadStream(f).pipe(res);
}).listen(4400, () => console.log('serving on 4400'));
