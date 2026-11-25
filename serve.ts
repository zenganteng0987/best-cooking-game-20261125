// serve.ts — server statis kecil untuk memainkan Dapur Pelangi secara lokal.
// Jalankan: node serve.ts  lalu buka http://localhost:8080 di desktop Chrome.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'game');
const port = Number(process.env.PORT || 8080);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    const safePath = normalize(join(root, urlPath === '/' ? 'index.html' : urlPath));
    if (!safePath.startsWith(resolve(root))) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }
    const data = await readFile(safePath);
    res.writeHead(200, { 'content-type': mimeTypes[extname(safePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(port, () => {
  console.log('Dapur Pelangi di http://localhost:' + port);
});
