/* Tiny static file server for local testing of the Quillix web app.
   Usage: node dev-server.mjs [port] [root] */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.argv[2] || 8081);
const root = process.argv[3] || fileURLToPath(new URL('./outputs/', import.meta.url));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    let filePath = join(root, normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, ''));
    try {
      const info = await stat(filePath);
      if (info.isDirectory()) filePath = join(filePath, 'index.html');
    } catch {
      filePath = join(root, 'index.html');
    }
    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(body);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(String(error));
  }
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${port}`));
