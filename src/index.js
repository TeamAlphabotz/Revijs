// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

export { loadConfig } from './config.js';
export { renderAllPages, renderPage, saveHTML } from './prerender.js';
export { getEngine } from './engines/index.js';
export { startServer } from './utils/server.js';
export { isBot, detectBot } from './utils/bot-detector.js';
export { expandRoutes } from './utils/route-expander.js';
export { createMiddleware } from './middleware.js';
export { createLiveMiddleware } from './live-middleware.js';
export { injectMeta } from './utils/meta-injector.js';
export { scoreHTML } from './utils/score.js';
export { generateSitemap, routesFromSitemap } from './utils/sitemap.js';
export { discoverRoutes } from './utils/route-discovery.js';
export { deploy } from './deploy.js';
export { reviPlugin } from './vite-plugin.js';
export { watchMode } from './watcher.js';

export async function prerender(userConfig = {}) {
  const { loadConfig } = await import('./config.js');
  const { renderAllPages } = await import('./prerender.js');
  const config = await loadConfig(undefined, userConfig);
  return renderAllPages(config);
}
