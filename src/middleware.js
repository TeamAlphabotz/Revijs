import path from 'path';
import fs from 'fs/promises';
import { isBot, detectBot } from './utils/bot-detector.js';

/**
 * Create a Connect-compatible middleware that serves prerendered HTML to bots
 * and passes all other requests through.
 *
 * Works with Express, Polka, Fastify (via @fastify/express), and any
 * framework that supports Connect-style middleware.
 *
 * Usage (Express):
 *   import express from 'express';
 *   import { createMiddleware } from 'revijs';
 *
 *   const app = express();
 *   app.use(createMiddleware({ prerenderedDir: 'dist-prerendered' }));
 *
 * @param {{ prerenderedDir?: string, debug?: boolean }} opts
 * @returns {(req, res, next) => void}
 */
export function createMiddleware({
  prerenderedDir = 'dist-prerendered',
  debug = false,
} = {}) {
  const absDir = path.resolve(process.cwd(), prerenderedDir);

  return async function reviMiddleware(req, res, next) {
    const ua = req.headers['user-agent'] ?? '';

    if (!isBot(ua)) {
      return next();
    }

    const matched = detectBot(ua);
    const route = req.path ?? req.url?.split('?')[0] ?? '/';

    const filePath =
      route === '/'
        ? path.join(absDir, 'index.html')
        : path.join(absDir, route.replace(/^\//, ''), 'index.html');

    try {
      const html = await fs.readFile(filePath, 'utf8');

      if (debug) {
        console.log(`[revijs] Bot "${matched}" → serving ${filePath}`);
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Prerendered-By', 'revijs');
      res.end(html);
    } catch {
      // No prerendered file — fall through to normal app handler
      if (debug) {
        console.warn(`[revijs] No prerendered file for "${route}" — passing through`);
      }
      next();
    }
  };
}

/**
 * Alias: named handleRequest for direct use in custom servers.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse}  res
 * @param {() => void} next
 */
export const handleRequest = createMiddleware();
