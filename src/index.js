/**
 * ReviJs — Public Library API
 *
 * Use this when importing ReviJs programmatically rather than via the CLI.
 *
 * Example:
 *   import { prerender, createMiddleware } from 'revijs';
 *
 *   await prerender({
 *     routes: ['/', '/about'],
 *     outputDir: 'dist-prerendered',
 *   });
 */

export { loadConfig } from './config.js';
export { renderAllPages, renderPage, saveHTML } from './prerender.js';
export { getEngine } from './engines/index.js';
export { startServer } from './utils/server.js';
export { isBot, detectBot } from './utils/bot-detector.js';
export { expandRoutes } from './utils/route-expander.js';
export { createMiddleware } from './middleware.js';

/**
 * High-level convenience function — the quickest way to prerender
 * without touching the CLI.
 *
 * @param {Partial<import('./config.js').ReviConfig>} userConfig
 */
export async function prerender(userConfig = {}) {
  const { loadConfig } = await import('./config.js');
  const { renderAllPages } = await import('./prerender.js');

  const config = await loadConfig(undefined, userConfig);
  await renderAllPages(config);
}
