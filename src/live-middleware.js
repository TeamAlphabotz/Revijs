// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

import { isBot } from './utils/bot-detector.js';
import { getEngine } from './engines/index.js';
import { startServer } from './utils/server.js';
import { injectMeta } from './utils/meta-injector.js';
import path from 'path';

const cache = new Map(); // route -> { html, expiresAt }

export function createLiveMiddleware({
  distDir = 'dist',
  ttl = 30,
  maxPages = 200,
  headless = true,
  waitFor = 1200,
  readyFlag = false,
  waitForSelector = null,
  injectMeta: doMeta = true,
  debug = false,
} = {}) {
  let engine = null;
  let serverUrl = null;
  let starting = false;
  let ready = false;

  async function ensureReady() {
    if (ready) return;
    if (starting) {
      // wait for startup
      await new Promise(resolve => {
        const t = setInterval(() => { if (ready) { clearInterval(t); resolve(); } }, 100);
      });
      return;
    }
    starting = true;
    const { url } = await startServer(path.resolve(process.cwd(), distDir), 4174);
    serverUrl = url;
    engine = await getEngine({ engine: 'browser', headless, debug });
    ready = true;
    if (debug) console.log(`[revijs:live] Server: ${serverUrl}`);
  }

  return async function reviLiveMiddleware(req, res, next) {
    const ua = req.headers['user-agent'] || '';
    if (!isBot(ua)) return next();

    const route = req.path || '/';
    const now = Date.now();

    // Serve from cache if fresh
    const cached = cache.get(route);
    if (cached && cached.expiresAt > now) {
      if (debug) console.log(`[revijs:live] cache hit: ${route}`);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Prerendered-By', 'revijs-live');
      res.setHeader('X-Cache', 'HIT');
      return res.end(cached.html);
    }

    try {
      await ensureReady();

      if (debug) console.log(`[revijs:live] rendering: ${route}`);

      const pageUrl = `${serverUrl}${route === '/' ? '' : route}`;
      let html = await engine.render(pageUrl, { waitFor, readyFlag, waitForSelector, debug });

      if (doMeta) html = injectMeta(html, route);

      // Enforce max cache size
      if (cache.size >= maxPages) {
        const oldest = cache.keys().next().value;
        cache.delete(oldest);
      }

      cache.set(route, {
        html,
        expiresAt: now + ttl * 60 * 1000,
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Prerendered-By', 'revijs-live');
      res.setHeader('X-Cache', 'MISS');
      res.end(html);
    } catch (err) {
      if (debug) console.error(`[revijs:live] error on ${route}:`, err.message);
      next();
    }
  };
}
