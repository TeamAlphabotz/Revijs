// Copyright (c) 2026 AlphaBotz & Adarsh
// GitHub: https://github.com/TeamAlphabotz
// GitHub: https://github.com/utkarshdubey2008
// Telegram: @alter69x, @akanesakuramori

import http from 'http';
import path from 'path';
import fs from 'fs';
import { createReadStream } from 'fs';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.eot':  'application/vnd.ms-fontobject',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
  '.mp4':  'video/mp4',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml',
};

/**
 * Serve the built dist directory on a free local port.
 * Falls back to SPA mode: any unknown path returns index.html (for client-side routing).
 *
 * @param {string} distDir  - Absolute path to the built app directory
 * @param {number} port     - Preferred port (will auto-increment if taken)
 * @returns {Promise<{ url: string, close: () => Promise<void> }>}
 */
export async function startServer(distDir, port = 4173) {
  const actualPort = await findFreePort(port);

  const server = http.createServer((req, res) => {
    // Strip query strings and decode URI
    let urlPath = decodeURIComponent(req.url.split('?')[0]);

    // Default to index.html
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

    let filePath = path.join(distDir, urlPath);

    // SPA fallback: serve index.html for unknown paths
    if (!fs.existsSync(filePath)) {
      filePath = path.join(distDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const stat = fs.statSync(filePath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache',
      });
      createReadStream(filePath).pipe(res);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  await new Promise((resolve) => server.listen(actualPort, '127.0.0.1', resolve));

  const url = `http://127.0.0.1:${actualPort}`;

  const close = () =>
    new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );

  return { url, close };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Find a free TCP port starting from `preferred`.
 * Tries up to 20 consecutive ports before giving up.
 */
function findFreePort(preferred, attempts = 20) {
  return new Promise((resolve, reject) => {
    let tried = 0;

    const tryPort = (port) => {
      const server = http.createServer();
      server.listen(port, '127.0.0.1');
      server.on('listening', () => {
        server.close(() => resolve(port));
      });
      server.on('error', () => {
        tried++;
        if (tried >= attempts) {
          reject(new Error(`Could not find a free port near ${preferred}`));
        } else {
          tryPort(port + 1);
        }
      });
    };

    tryPort(preferred);
  });
}
