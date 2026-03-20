// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pc from 'picocolors';
import { renderAllPages } from '../prerender.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function startDashboard(config) {
  let renderResults = null;
  let status = 'idle'; // idle | running | done | error

  const uiHtml = await fs.readFile(path.join(__dirname, 'ui.html'), 'utf8');

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(uiHtml);
      return;
    }

    if (url.pathname === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status, results: renderResults, config: {
        routes: config.routes,
        engine: config.engine,
        outputDir: config.outputDir,
        waitFor: config.waitFor,
      }}));
      return;
    }

    if (url.pathname === '/api/render' && req.method === 'POST') {
      if (status === 'running') {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Already running' }));
        return;
      }

      status = 'running';
      renderResults = null;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ started: true }));

      try {
        const results = await renderAllPages({ ...config, score: true });
        renderResults = results;
        status = 'done';
      } catch (err) {
        renderResults = { error: err.message };
        status = 'error';
      }
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  server.listen(4200, '127.0.0.1', () => {
    console.log(pc.cyan('\n  ReviJs Dashboard'));
    console.log(pc.green('  http://localhost:4200\n'));
    // Try to open browser
    const open = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    import('child_process').then(({ execSync }) => {
      try { execSync(`${open} http://localhost:4200`); } catch {}
    });
  });
}
