/**
 * Engine registry.
 *
 * Each engine exposes:
 *   render(url, options): Promise<string>   — returns full HTML
 *   close(): Promise<void>                  — teardown / cleanup
 *
 * The engine implementation detail (Playwright, etc.) is intentionally hidden
 * from the user. They only interact with the engine name via config.
 */

/**
 * Instantiate and return the configured rendering engine.
 *
 * @param {import('../config.js').ReviConfig} config
 * @returns {Promise<Engine>}
 */
export async function getEngine(config) {
  const { engine, headless, debug } = config;

  switch (engine) {
    case 'browser': {
      const { BrowserEngine } = await import('./browser.js');
      return BrowserEngine.create({ headless, debug });
    }
    case 'advanced': {
      const { AdvancedEngine } = await import('./advanced.js');
      return AdvancedEngine.create({ headless, debug });
    }
    case 'ssr': {
      const { SSREngine } = await import('./ssr.js');
      return SSREngine.create({ debug });
    }
    default:
      throw new Error(`Unknown engine: "${engine}"`);
  }
}

/**
 * @typedef {Object} Engine
 * @property {(url: string, opts: RenderOptions) => Promise<string>} render
 * @property {() => Promise<void>} close
 */

/**
 * @typedef {Object} RenderOptions
 * @property {number} waitFor   - ms to wait after network idle
 * @property {boolean} debug
 */
