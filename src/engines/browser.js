// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

export class BrowserEngine {
  #browser = null;
  #debug = false;

  constructor(browser, { debug = false } = {}) {
    this.#browser = browser;
    this.#debug = debug;
  }

  static async create({ headless = true, debug = false } = {}) {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    return new BrowserEngine(browser, { debug });
  }

  async render(url, { waitFor = 1200, readyFlag = false, waitForSelector = null, debug = this.#debug } = {}) {
    const context = await this.#browser.newContext({
      userAgent: 'Mozilla/5.0 (compatible; ReviJs/1.0; +https://github.com/TeamAlphabotz/Revijs)',
    });
    const page = await context.newPage();

    if (debug) {
      page.on('console', msg => {
        if (msg.type() === 'error') console.error(`  [browser] ${msg.text()}`);
      });
    }

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });

      if (readyFlag) {
        // Wait for app to set window.__REVI_READY__ = true
        await page.waitForFunction(() => window.__REVI_READY__ === true, { timeout: 15_000 })
          .catch(() => debug && console.warn('  [warn] __REVI_READY__ flag never set, falling back to waitFor'));
      }

      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout: 10_000 })
          .catch(() => debug && console.warn(`  [warn] selector "${waitForSelector}" not found`));
      }

      if (!readyFlag && !waitForSelector && waitFor > 0) {
        await page.waitForTimeout(waitFor);
      }

      const html = await page.evaluate(() => document.documentElement.outerHTML);
      return `<!DOCTYPE html>\n${html}`;
    } finally {
      await context.close();
    }
  }

  async close() {
    if (this.#browser) {
      await this.#browser.close();
      this.#browser = null;
    }
  }
}
