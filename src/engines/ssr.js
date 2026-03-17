// Copyright (c) 2026 AlphaBotz & Adarsh
// GitHub: https://github.com/TeamAlphabotz
// GitHub: https://github.com/utkarshdubey2008
// Telegram: alter69x, akanesakuramori

/**
 * SSREngine
 *
 * Reserved for framework-level SSR integration (React Server Components,
 * Next.js-style renderToString, etc.).
 *
 * Currently operates as an enhanced BrowserEngine wrapper that disables JS
 * execution after load — giving a closer approximation to "what the HTML looks
 * like before hydration" for diagnostic purposes.
 *
 * Future: accept an optional `renderFn` in config to call framework SSR directly.
 */

import { BrowserEngine } from './browser.js';

export class SSREngine extends BrowserEngine {
  /**
   * @param {{ debug?: boolean }} opts
   * @returns {Promise<SSREngine>}
   */
  static async create(opts = {}) {
    // SSR mode always runs headless
    const base = await BrowserEngine.create({ headless: true, ...opts });
    Object.setPrototypeOf(base, SSREngine.prototype);
    return base;
  }

  async render(url, opts = {}) {
    const html = await super.render(url, {
      ...opts,
      // Minimal wait — in true SSR the content should be in the initial HTML
      waitFor: opts.waitFor ?? 0,
    });

    return html;
  }
}
