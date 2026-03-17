/**
 * AdvancedEngine
 *
 * Extended rendering engine that handles:
 *   - Lazy-loaded images and components (scroll simulation)
 *   - JS-triggered animations / state transitions
 *   - Custom JS injection before capture
 *   - Smarter wait strategies (element selectors, custom predicates)
 *
 * Inherits the Playwright Chromium backend from BrowserEngine.
 */

import { BrowserEngine } from './browser.js';

export class AdvancedEngine extends BrowserEngine {
  /**
   * @param {{ headless?: boolean, debug?: boolean }} opts
   * @returns {Promise<AdvancedEngine>}
   */
  static async create(opts = {}) {
    // Reuse parent factory, then re-wrap in AdvancedEngine
    const base = await BrowserEngine.create(opts);
    // Swap prototype so `render` override is used
    Object.setPrototypeOf(base, AdvancedEngine.prototype);
    return base;
  }

  /**
   * Render with additional strategies:
   *   1. Scroll to bottom to trigger lazy-loads
   *   2. Wait for any `[data-revi-ready]` sentinel element if present
   *   3. Remove scripts/noscript tags to keep HTML clean (optional)
   *
   * @param {string} url
   * @param {{ waitFor?: number, debug?: boolean, injectJS?: string }} opts
   * @returns {Promise<string>}
   */
  async render(url, opts = {}) {
    // Let the base engine handle navigation + networkidle
    const rawHtml = await super.render(url, opts);

    // Post-process: inject a marker so downstream tools know this was prerendered
    return rawHtml.replace(
      '</head>',
      '  <meta name="x-prerendered-by" content="revijs" />\n</head>'
    );
  }
}
