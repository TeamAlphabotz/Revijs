// Copyright (c) 2026 AlphaBotz & Adarsh
// GitHub: https://github.com/TeamAlphabotz
// GitHub: https://github.com/utkarshdubey2008
// Telegram: @alter69x, @akanesakuramori

import path from 'path';
import fs from 'fs/promises';
import { pathToFileURL } from 'url';
import pc from 'picocolors';

/** Default configuration values */
const DEFAULTS = {
  routes: ['/'],
  engine: 'browser',
  outputDir: 'dist-prerendered',
  distDir: 'dist',
  waitFor: 1200,
  headless: true,
  port: 4173,
  debug: false,
};

/**
 * Load revi.config.js from cwd and merge with defaults + CLI overrides.
 *
 * @param {string} configPath  - Relative path to config file
 * @param {object} overrides   - Values from CLI flags
 * @returns {Promise<ReviConfig>}
 */
export async function loadConfig(configPath = 'revi.config.js', overrides = {}) {
  const absPath = path.resolve(process.cwd(), configPath);

  let userConfig = {};

  try {
    await fs.access(absPath);
    const fileUrl = pathToFileURL(absPath).href;
    const mod = await import(fileUrl);
    userConfig = mod.default ?? mod;
    console.log(pc.dim(`  Loaded config: ${configPath}`));
  } catch {
    console.warn(
      pc.yellow(`  Warning: No config found at "${configPath}". Using defaults.`)
    );
  }

  const config = {
    ...DEFAULTS,
    ...userConfig,
    ...filterDefined(overrides),
  };

  validateConfig(config);

  // Resolve absolute paths relative to cwd
  config.outputDir = path.resolve(process.cwd(), config.outputDir);
  config.distDir = path.resolve(process.cwd(), config.distDir);

  return config;
}

/**
 * Write a starter revi.config.js into the current working directory.
 */
export async function scaffoldConfig() {
  const dest = path.resolve(process.cwd(), 'revi.config.js');

  try {
    await fs.access(dest);
    console.log(pc.yellow('  revi.config.js already exists — skipping.'));
    return;
  } catch {
    // file doesn't exist, safe to create
  }

  const template = `// revi.config.js
export default {
  // Routes to prerender
  routes: ['/', '/about', '/blog/post-1'],

  // Rendering engine: 'browser' (default) | 'advanced' | 'ssr'
  engine: 'browser',

  // Where to write the prerendered HTML files
  outputDir: 'dist-prerendered',

  // Where your built SPA lives (output of npm run build)
  distDir: 'dist',

  // Milliseconds to wait after network idle before capturing HTML
  waitFor: 1200,

  // Run headless (true in CI/production, false to watch the browser)
  headless: true,

  // Local port used by the temporary static server
  port: 4173,
};
`;

  await fs.writeFile(dest, template, 'utf8');
  console.log(pc.green('  ✔ Created revi.config.js'));
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function validateConfig(config) {
  if (!Array.isArray(config.routes) || config.routes.length === 0) {
    throw new Error('config.routes must be a non-empty array of route strings.');
  }

  const validEngines = ['browser', 'advanced', 'ssr'];
  if (!validEngines.includes(config.engine)) {
    throw new Error(
      `config.engine must be one of: ${validEngines.join(', ')}. Got: "${config.engine}"`
    );
  }

  if (typeof config.waitFor !== 'number' || config.waitFor < 0) {
    throw new Error('config.waitFor must be a non-negative number (milliseconds).');
  }
}

/** Remove undefined/null values so they don't overwrite defaults */
function filterDefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  );
}

/**
 * @typedef {Object} ReviConfig
 * @property {string[]} routes
 * @property {'browser'|'advanced'|'ssr'} engine
 * @property {string} outputDir
 * @property {string} distDir
 * @property {number} waitFor
 * @property {boolean} headless
 * @property {number} port
 * @property {boolean} debug
 */
