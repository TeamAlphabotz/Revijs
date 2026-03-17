/**
 * BrowserEngine
 *
 * Standard rendering engine backed by a headless Chromium browser (via Playwright).
 * Navigates to each URL, waits for network idle + optional delay, then returns
 * the full serialised DOM.
 *
 * Playwright is an internal implementation detail — it is never exposed to the user.
 */

export class BrowserEngine {
  #browser = null;
  #debug = false;

  constructor(browser, { debug = false } = {}) {
    this.#browser = browser;
    this.#debug = debug;
  }

  /**
   * Factory — launches the browser and returns a ready-to-use engine instance.
   *
   * @param {{ headless?: boolean, debug?: boolean }} opts
   * @returns {Promise<BrowserEngine>}
   */
  static async create({ headless = true, debug = false } = {}) {
    const { chromium } = await import('playwright');

    const browser = await chromium.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    return new BrowserEngine(browser, { debug });
  }

  /**
   * Render a URL and return its full HTML.
   *
   * @param {string} url
   * @param {{ waitFor?: number, debug?: boolean }} opts
   * @returns {Promise<string>}
   */
  async render(url, { waitFor = 1200, debug = this.#debug } = {}) {
    const context = await this.#browser.newContext({
      userAgent:
        'Mozilla/5.0 (compatible; ReviJs/1.0; +https://github.com/revijs/revijs)',
    });

    const page = await context.newPage();

    if (debug) {
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          console.error(`  [browser] ${msg.text()}`);
        }
      });
    }

    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30_000,
      });

      if (waitFor > 0) {
        await page.waitForTimeout(waitFor);
      }

      const html = await page.evaluate(
        () => document.documentElement.outerHTML
      );

      return `<!DOCTYPE html>\n${html}`;
    } finally {
      await context.close();
    }
  }

  /** Tear down the underlying browser process. */
  async close() {
    if (this.#browser) {
      await this.#browser.close();
      this.#browser = null;
    }
  }
}
